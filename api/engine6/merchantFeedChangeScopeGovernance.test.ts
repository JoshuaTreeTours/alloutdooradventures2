import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  enforceMerchantFeedChangeScope,
  merchantFeedCsvRowsByteIdentical,
  parseMerchantFeedCsvRows,
  serializeMerchantFeedCsvRow,
  validateMerchantFeedChangeScope,
  type MerchantFeedCsvRow,
} from "./merchantFeedChangeScopeGovernance";
import { loadMerchantFeedMainBaselineCatalog } from "./merchantFeedProductionDeploymentBaseline";

const sampleRow = (
  overrides: Partial<MerchantFeedCsvRow> = {}
): MerchantFeedCsvRow => ({
  id: "191303P1",
  title: "Sample Tour",
  description: "Governed merchant description for the sample tour.",
  link: "https://www.alloutdooradventures.com/tours/sample",
  image_link: "https://example.com/image.jpg",
  availability: "in stock",
  price: "89.00 USD",
  condition: "new",
  brand: "Viator",
  average_rating: "5.0",
  rating_count: "54",
  review_count: "54",
  ...overrides,
});

describe("merchant feed change-scope governance", () => {
  it("passes when proposed rows are byte-for-byte identical to baseline", () => {
    const baseline = [sampleRow(), sampleRow({ id: "63657P1" })];
    const result = validateMerchantFeedChangeScope(baseline, baseline, {
      branchModifiedProductCodes: new Set(),
    });

    expect(result.pass).toBe(true);
    expect(result.violations).toEqual([]);
    expect(result.appendedProductCodes).toEqual([]);
    expect(result.preservedExistingRowCount).toBe(2);
  });

  it("allows standard destination PRs to append new merchant feed rows", () => {
    const baseline = [sampleRow()];
    const proposed = [
      ...baseline,
      sampleRow({
        id: "NEWTOUR1",
        title: "New Destination Tour",
        link: "https://www.alloutdooradventures.com/tours/new",
        price: "45.00 USD",
        average_rating: "4.8",
        rating_count: "10",
        review_count: "10",
      }),
    ];

    const result = validateMerchantFeedChangeScope(baseline, proposed, {
      branchModifiedProductCodes: new Set(["NEWTOUR1"]),
    });

    expect(result.pass).toBe(true);
    expect(result.appendedProductCodes).toEqual(["NEWTOUR1"]);
    expect(result.preservedExistingRowCount).toBe(1);
  });

  it("blocks standard destination PRs from modifying unrelated existing rows", () => {
    const baseline = [sampleRow(), sampleRow({ id: "63657P1" })];
    const proposed = [
      sampleRow({ description: "Accidental regeneration during city PR." }),
      baseline[1]!,
    ];

    const result = validateMerchantFeedChangeScope(baseline, proposed, {
      branchModifiedProductCodes: new Set(["NEWTOUR1"]),
    });

    expect(result.pass).toBe(false);
    expect(result.violations).toEqual([
      {
        productCode: "191303P1",
        kind: "unchanged-row-modified",
        detail:
          "existing merchant feed row changed outside branch scope; destination PRs must preserve baseline rows byte-for-byte",
      },
    ]);
  });

  it("allows branch-scoped modifications to explicitly targeted existing products", () => {
    const baseline = [sampleRow()];
    const proposed = [
      sampleRow({
        title: "Updated title for branch-scoped product",
        description: "Updated governed description for branch-scoped product.",
      }),
    ];

    const result = validateMerchantFeedChangeScope(baseline, proposed, {
      branchModifiedProductCodes: new Set(["191303P1"]),
    });

    expect(result.pass).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it("preserves existing row count and rejects removed baseline rows", () => {
    const baseline = [sampleRow(), sampleRow({ id: "63657P1" })];
    const proposed = [baseline[0]!];

    const result = validateMerchantFeedChangeScope(baseline, proposed, {
      branchModifiedProductCodes: new Set(),
    });

    expect(result.pass).toBe(false);
    expect(result.violations[0]).toMatchObject({
      productCode: "63657P1",
      kind: "removed-row",
    });
    expect(result.preservedExistingRowCount).toBe(2);
  });

  it("protects commercial fields under all non-commercial-governance circumstances", () => {
    const baseline = [sampleRow()];
    const proposed = [
      sampleRow({
        price: "99.00 USD",
        average_rating: "4.8",
        rating_count: "60",
        review_count: "60",
      }),
    ];

    const branchScopedResult = validateMerchantFeedChangeScope(
      baseline,
      proposed,
      {
        branchModifiedProductCodes: new Set(["191303P1"]),
      }
    );
    expect(branchScopedResult.pass).toBe(false);
    expect(branchScopedResult.violations[0]?.kind).toBe(
      "commercial-field-modified"
    );

    const editorialGovernanceResult = validateMerchantFeedChangeScope(
      baseline,
      proposed,
      {
        branchModifiedProductCodes: new Set(),
        governancePurpose: "editorial-governance",
        governanceRegenerationProductCodes: new Set(["191303P1"]),
        governanceRegenerationReason:
          "Regenerate merchant descriptions after editorial pipeline update.",
      }
    );
    expect(editorialGovernanceResult.pass).toBe(false);
    expect(editorialGovernanceResult.violations[0]?.kind).toBe(
      "commercial-field-modified"
    );
  });

  it("allows commercial-governance PRs to regenerate commercial fields when explicitly authorized", () => {
    const baseline = [sampleRow()];
    const proposed = [
      sampleRow({
        price: "99.00 USD",
        average_rating: "4.8",
        rating_count: "60",
        review_count: "60",
      }),
    ];

    const result = validateMerchantFeedChangeScope(baseline, proposed, {
      branchModifiedProductCodes: new Set(),
      governancePurpose: "commercial-governance",
      governanceRegenerationProductCodes: new Set(["191303P1"]),
      governanceRegenerationReason:
        "Refresh live commercial values after Viator pricing API update.",
    });

    expect(result.pass).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it("allows governance PRs to regenerate existing editorial fields when explicitly documented", () => {
    const baseline = [sampleRow()];
    const proposed = [
      sampleRow({
        description: "Regenerated governed merchant description.",
        image_link: "https://example.com/new-image.jpg",
      }),
    ];

    const result = validateMerchantFeedChangeScope(baseline, proposed, {
      branchModifiedProductCodes: new Set(),
      governancePurpose: "image-governance",
      governanceRegenerationProductCodes: new Set(["191303P1"]),
      governanceRegenerationReason:
        "Replace stale hero imagery across merchant-eligible Napa products.",
    });

    expect(result.pass).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it("blocks governance PRs from regenerating existing rows without explicit authorization", () => {
    const baseline = [sampleRow()];
    const proposed = [
      sampleRow({ description: "Unauthorized regeneration attempt." }),
    ];

    const result = validateMerchantFeedChangeScope(baseline, proposed, {
      branchModifiedProductCodes: new Set(),
      governancePurpose: "editorial-governance",
      governanceRegenerationProductCodes: new Set(),
      governanceRegenerationReason:
        "Regenerate merchant descriptions after editorial pipeline update.",
    });

    expect(result.pass).toBe(false);
    expect(result.violations[0]).toMatchObject({
      productCode: "191303P1",
      kind: "governance-regeneration-unauthorized",
    });
  });

  it("blocks governance PRs that omit regeneration documentation", () => {
    const baseline = [sampleRow()];
    const proposed = [
      sampleRow({ description: "Regenerated without documented reason." }),
    ];

    const result = validateMerchantFeedChangeScope(baseline, proposed, {
      branchModifiedProductCodes: new Set(),
      governancePurpose: "schema-governance",
      governanceRegenerationProductCodes: new Set(["191303P1"]),
      governanceRegenerationReason: "   ",
    });

    expect(result.pass).toBe(false);
    expect(result.violations[0]).toMatchObject({
      productCode: "191303P1",
      kind: "governance-regeneration-undocumented",
    });
  });

  it("restores unauthorized changes while preserving appended rows during enforcement", () => {
    const baseline = [sampleRow(), sampleRow({ id: "63657P1" })];
    const appended = sampleRow({
      id: "NEWTOUR1",
      title: "Branch-new tour",
      link: "https://www.alloutdooradventures.com/tours/new",
      price: "45.00 USD",
      average_rating: "4.8",
      rating_count: "10",
      review_count: "10",
    });
    const proposed = [
      sampleRow({ description: "Accidental rewrite." }),
      baseline[1]!,
      appended,
    ];

    const enforced = enforceMerchantFeedChangeScope(baseline, proposed, {
      branchModifiedProductCodes: new Set(["NEWTOUR1"]),
    });

    expect(enforced).toHaveLength(3);
    expect(merchantFeedCsvRowsByteIdentical(enforced[0]!, baseline[0]!)).toBe(
      true
    );
    expect(merchantFeedCsvRowsByteIdentical(enforced[1]!, baseline[1]!)).toBe(
      true
    );
    expect(merchantFeedCsvRowsByteIdentical(enforced[2]!, appended)).toBe(true);
  });

  it("compares merchant feed rows using canonical CSV serialization", () => {
    const row = sampleRow({
      description: 'Tour with "quotes", commas, and newlines preserved.',
    });
    const serialized = serializeMerchantFeedCsvRow(row);

    expect(serialized).toContain('"Tour with ""quotes""');
    expect(merchantFeedCsvRowsByteIdentical(row, { ...row })).toBe(true);
    expect(
      merchantFeedCsvRowsByteIdentical(row, {
        ...row,
        title: "Different title",
      })
    ).toBe(false);
  });

  it("keeps committed merchantFeed.csv rows byte-for-byte stable against the main baseline catalog", () => {
    const before = readFileSync("data/merchantFeed.csv", "utf8");
    const workspaceRows = parseMerchantFeedCsvRows(before);
    const mainBaseline = loadMerchantFeedMainBaselineCatalog();

    expect(workspaceRows.length).toBe(mainBaseline.size);

    const result = validateMerchantFeedChangeScope(workspaceRows, workspaceRows, {
      branchModifiedProductCodes: new Set(),
    });

    expect(result.pass).toBe(true);
    expect(result.violations).toEqual([]);

    const after = readFileSync("data/merchantFeed.csv", "utf8");
    expect(after).toBe(before);
  });
});
