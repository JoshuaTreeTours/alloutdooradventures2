import { afterEach, describe, expect, it, vi } from "vitest";

import {
  assessEngine6ProductCodeExclusivity,
  buildEngine6ProductCodeExclusivityReportFromSelection,
  buildEngine6ProductCodeRegistry,
  ENGINE6_PRODUCT_CODE_ALLOWLIST_ENV,
  formatEngine6ProductCodeExclusivityGovernanceReport,
  readEngine6ProductCodeAllowlist,
  resetEngine6ProductCodeRegistryCacheForTests,
  resolveEngine6ProductCodeOwner,
} from "./engine6ProductCodeExclusivityGovernance";
import { selectEngine6DestinationPortfolio } from "./engine6ProductSelectionGovernance";
import type { Engine6LiveViatorValidationResult } from "./engine6LiveViatorProductionValidation";
import {
  validateEngine6ParagonBuildScope,
  validateEngine6SitemapAppendOnlyScope,
} from "./engine6ParagonBuildScopeGovernance";
import {
  ENGINE6_BOSTON_3283BWW_PRODUCT_CODE,
  ENGINE6_BOSTON_5042BOSDIN_PRODUCT_CODE,
  ENGINE6_BOSTON_7812P131_PRODUCT_CODE,
  ENGINE6_CHICAGO_7812P19_PRODUCT_CODE,
} from "./routes";

const buildValidationResult = (
  overrides: Partial<Engine6LiveViatorValidationResult> = {}
): Engine6LiveViatorValidationResult => ({
  productCode: "TESTP1",
  sourceUrl: "https://www.viator.com/tours/Example/d1-TESTP1",
  passed: true,
  publicPageAvailable: true,
  apiConfirmedActive: true,
  canonicalProductCodeMatches: true,
  merchantUrlMatches: true,
  bookable: true,
  knownUnavailableBlocklistHit: false,
  reason: null,
  ...overrides,
});

describe("engine6ProductCodeExclusivityGovernance", () => {
  afterEach(() => {
    delete process.env[ENGINE6_PRODUCT_CODE_ALLOWLIST_ENV];
    resetEngine6ProductCodeRegistryCacheForTests();
  });

  it("builds an authoritative registry from routes and validation fixtures", () => {
    const registry = buildEngine6ProductCodeRegistry();
    const chicagoOwner = resolveEngine6ProductCodeOwner(
      ENGINE6_CHICAGO_7812P19_PRODUCT_CODE,
      registry
    );
    const bostonOwner = resolveEngine6ProductCodeOwner(
      ENGINE6_BOSTON_3283BWW_PRODUCT_CODE,
      registry
    );

    expect(chicagoOwner?.destinationLabel).toBe("Chicago");
    expect(chicagoOwner?.destinationCitySlug).toBe("chicago");
    expect(chicagoOwner?.sources).toEqual(
      expect.arrayContaining(["routes", "validation-fixtures"])
    );
    expect(bostonOwner?.destinationLabel).toBe("Boston");
    expect(bostonOwner?.destinationCitySlug).toBe("boston");
  });

  it("rejects duplicate product ownership in another destination", () => {
    const assessment = assessEngine6ProductCodeExclusivity({
      productCode: ENGINE6_CHICAGO_7812P19_PRODUCT_CODE,
      destinationCitySlug: "boston",
      viatorDestinationSlug: "Boston",
      destinationLabel: "Boston",
    });

    expect(assessment.accepted).toBe(false);
    expect(assessment.violation).toBe("duplicate-engine6-assignment");
    expect(assessment.detail).toContain("Chicago");
    expect(assessment.existingOwner?.destinationCitySlug).toBe("chicago");
  });

  it("allows duplicate ownership during same-destination regeneration", () => {
    const assessment = assessEngine6ProductCodeExclusivity({
      productCode: ENGINE6_BOSTON_3283BWW_PRODUCT_CODE,
      destinationCitySlug: "boston",
      viatorDestinationSlug: "Boston",
      destinationLabel: "Boston",
    });

    expect(assessment.accepted).toBe(true);
    expect(assessment.violation).toBeNull();
    expect(assessment.existingOwner?.destinationCitySlug).toBe("boston");
  });

  it("allows allowlisted duplicate ownership across destinations", () => {
    const allowlist = new Set([ENGINE6_CHICAGO_7812P19_PRODUCT_CODE]);
    const assessment = assessEngine6ProductCodeExclusivity({
      productCode: ENGINE6_CHICAGO_7812P19_PRODUCT_CODE,
      destinationCitySlug: "boston",
      viatorDestinationSlug: "Boston",
      destinationLabel: "Boston",
      allowlist,
    });

    expect(assessment.accepted).toBe(true);
    expect(assessment.allowlisted).toBe(true);
    expect(assessment.violation).toBeNull();
  });

  it("reads allowlist entries from ENGINE6_PRODUCT_CODE_ALLOWLIST", () => {
    process.env[ENGINE6_PRODUCT_CODE_ALLOWLIST_ENV] = "7812P19, 3283BWW , ,";

    expect(readEngine6ProductCodeAllowlist().has("7812P19")).toBe(true);
    expect(readEngine6ProductCodeAllowlist().has("3283BWW")).toBe(true);
    expect(readEngine6ProductCodeAllowlist().size).toBe(2);
  });

  it("formats governance diagnostics with rejections and replacements", () => {
    const formatted = formatEngine6ProductCodeExclusivityGovernanceReport({
      destinationLabel: "Boston",
      entries: [
        { productCode: "3283BWW", status: "unique" },
        {
          productCode: "7812P19",
          status: "rejected",
          existingOwnerLabel: "Chicago",
          replacementProductCode: "7812P131",
        },
      ],
    });

    expect(formatted).toContain("✓ Product 3283BWW unique");
    expect(formatted).toContain("✗ Product 7812P19 already owned by Chicago");
    expect(formatted).toContain("→ rejected");
    expect(formatted).toContain("→ replacement: 7812P131");
  });

  it("automatically selects the next ranked candidate when ownership conflicts", async () => {
    const report = await selectEngine6DestinationPortfolio({
      destinationLabel: "Boston",
      destinationCitySlug: "boston",
      viatorDestinationSlug: "Boston",
      mode: "strict",
      scopedProductCodes: [],
      slots: [
        {
          experienceType: "food-tour",
          desiredCount: 1,
          candidates: [
            {
              productCode: ENGINE6_CHICAGO_7812P19_PRODUCT_CODE,
              sourceUrl:
                "https://www.viator.com/tours/Chicago/Small-Group-Chicago-Loop-Food-Walking-Tour/d673-7812P19",
              title: "Chicago Loop Food Tour",
              experienceType: "food-tour",
              priceFrom: 99,
              priority: 1,
            },
            {
              productCode: ENGINE6_BOSTON_7812P131_PRODUCT_CODE,
              sourceUrl:
                "https://www.viator.com/tours/Boston/Private-Tour-Secret-Food-Tours-Boston-North-End/d678-7812P131",
              title: "Secret Food Tours Boston North End",
              experienceType: "food-tour",
              priceFrom: 129,
              priority: 2,
            },
          ],
        },
      ],
      validateCandidate: async args =>
        buildValidationResult({
          productCode: args.productCode,
          sourceUrl: args.sourceUrl,
        }),
      generatedAt: "2026-07-04T00:00:00.000Z",
    });

    expect(report.accepted.map(entry => entry.productCode)).toEqual([
      ENGINE6_BOSTON_7812P131_PRODUCT_CODE,
    ]);
    expect(
      report.rejected.some(
        entry =>
          entry.productCode === ENGINE6_CHICAGO_7812P19_PRODUCT_CODE &&
          entry.reason === "duplicate-engine6-assignment"
      )
    ).toBe(true);
    expect(report.replacements).toEqual([
      {
        experienceType: "food-tour",
        rejectedProductCode: ENGINE6_CHICAGO_7812P19_PRODUCT_CODE,
        selectedProductCode: ENGINE6_BOSTON_7812P131_PRODUCT_CODE,
      },
    ]);
    expect(report.productCodeExclusivityReport).toContain(
      "✗ Product 7812P19 already owned by Chicago"
    );
    expect(report.productCodeExclusivityReport).toContain(
      "→ replacement: 7812P131"
    );
  });

  it("does not mutate unrelated destination registry entries during selection", async () => {
    const registryBefore = buildEngine6ProductCodeRegistry();
    const chicagoBefore = registryBefore.get(ENGINE6_CHICAGO_7812P19_PRODUCT_CODE);
    const sedonaBefore = registryBefore.get("130651P13");

    await selectEngine6DestinationPortfolio({
      destinationLabel: "Boston",
      destinationCitySlug: "boston",
      viatorDestinationSlug: "Boston",
      mode: "strict",
      scopedProductCodes: [],
      slots: [
        {
          experienceType: "cruise",
          desiredCount: 1,
          candidates: [
            {
              productCode: ENGINE6_BOSTON_5042BOSDIN_PRODUCT_CODE,
              sourceUrl:
                "https://www.viator.com/tours/Boston/Boston-Dinner-Cruise/d678-5042BOSDIN",
              title: "Boston Dinner Cruise",
              experienceType: "cruise",
              priceFrom: 149,
              priority: 1,
            },
          ],
        },
      ],
      validateCandidate: async args =>
        buildValidationResult({
          productCode: args.productCode,
          sourceUrl: args.sourceUrl,
        }),
    });

    const registryAfter = buildEngine6ProductCodeRegistry();
    expect(registryAfter.get(ENGINE6_CHICAGO_7812P19_PRODUCT_CODE)).toEqual(
      chicagoBefore
    );
    if (sedonaBefore) {
      expect(registryAfter.get("130651P13")).toEqual(sedonaBefore);
    }
  });

  it("keeps merchant feed append-only governance passing for scoped additions", () => {
    const baselineRows = [
      {
        id: "LEGACYP1",
        title: "Legacy",
        description: "desc",
        link: "https://example.com/legacy",
        image_link: "https://example.com/a.jpg",
        availability: "in stock",
        price: "100 USD",
        condition: "new",
        brand: "Outdoor Adventures",
        average_rating: "5.0",
        rating_count: "10",
        review_count: "10",
      },
    ];
    const proposedRows = [
      ...baselineRows,
      {
        id: ENGINE6_BOSTON_3283BWW_PRODUCT_CODE,
        title: "Boston Whale Watching",
        description: "desc",
        link: "https://example.com/boston",
        image_link: "https://example.com/b.jpg",
        availability: "in stock",
        price: "120 USD",
        condition: "new",
        brand: "Outdoor Adventures",
        average_rating: "5.0",
        rating_count: "1",
        review_count: "1",
      },
    ];

    const report = validateEngine6ParagonBuildScope({
      changedFiles: [{ status: "M", path: "data/merchantFeed.csv" }],
      branchScopedProductCodes: new Set([ENGINE6_BOSTON_3283BWW_PRODUCT_CODE]),
      baselineMerchantFeedRows: baselineRows,
      proposedMerchantFeedRows: proposedRows,
    });

    expect(report.merchantFeed.pass).toBe(true);
    expect(report.merchantFeed.appendedProductCodes).toEqual([
      ENGINE6_BOSTON_3283BWW_PRODUCT_CODE,
    ]);
  });

  it("keeps sitemap append-only governance passing for scoped additions", () => {
    const baselineXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.alloutdooradventures.com/destinations/massachusetts/boston/tours/existing-tour</loc></url>
</urlset>`;
    const proposedXml = `${baselineXml.replace(
      "</urlset>",
      `  <url><loc>https://www.alloutdooradventures.com/destinations/massachusetts/boston/tours/new-tour-3283BWW</loc></url>\n</urlset>`
    )}`;

    const result = validateEngine6SitemapAppendOnlyScope({
      baselineXml,
      proposedXml,
      branchScopedProductCodes: new Set([ENGINE6_BOSTON_3283BWW_PRODUCT_CODE]),
    });

    expect(result.pass).toBe(true);
  });

  it("keeps deploy-scope governance passing for branch-scoped fixture changes", () => {
    const report = validateEngine6ParagonBuildScope({
      changedFiles: [
        {
          status: "A",
          path: `data/engine6/viator/${ENGINE6_BOSTON_3283BWW_PRODUCT_CODE}.exact-product.json`,
        },
      ],
      branchScopedProductCodes: new Set([ENGINE6_BOSTON_3283BWW_PRODUCT_CODE]),
    });

    expect(report.pass).toBe(true);
    expect(
      report.blockedFiles.some(
        entry => entry.kind === "unrelated-generated-catalog"
      )
    ).toBe(false);
  });

  it("builds selection exclusivity reports from evaluated candidates", () => {
    const formatted = buildEngine6ProductCodeExclusivityReportFromSelection({
      destinationLabel: "Boston",
      destinationCitySlug: "boston",
      viatorDestinationSlug: "Boston",
      evaluatedProductCodes: ["3283BWW", "7812P19", "7812P131"],
      rejected: [
        {
          productCode: "7812P19",
          reason: "duplicate-engine6-assignment",
        },
      ],
      replacements: [
        {
          rejectedProductCode: "7812P19",
          selectedProductCode: "7812P131",
        },
      ],
    });

    expect(formatted).toContain(
      "✓ Product 3283BWW already owned by Boston (regeneration allowed)"
    );
    expect(formatted).toContain("✗ Product 7812P19 already owned by Chicago");
    expect(formatted).toContain("→ replacement: 7812P131");
    expect(formatted).toContain(
      "✓ Product 7812P131 already owned by Boston (regeneration allowed)"
    );
  });
});

describe("engine6ProductCodeExclusivityGovernance allowlist env integration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetEngine6ProductCodeRegistryCacheForTests();
  });

  it("accepts allowlisted cross-destination candidates during portfolio selection", async () => {
    vi.stubEnv(ENGINE6_PRODUCT_CODE_ALLOWLIST_ENV, ENGINE6_CHICAGO_7812P19_PRODUCT_CODE);

    const report = await selectEngine6DestinationPortfolio({
      destinationLabel: "Boston",
      destinationCitySlug: "boston",
      viatorDestinationSlug: "Boston",
      mode: "strict",
      scopedProductCodes: [],
      slots: [
        {
          experienceType: "food-tour",
          desiredCount: 1,
          candidates: [
            {
              productCode: ENGINE6_CHICAGO_7812P19_PRODUCT_CODE,
              sourceUrl:
                "https://www.viator.com/tours/Chicago/Small-Group-Chicago-Loop-Food-Walking-Tour/d673-7812P19",
              title: "Chicago Loop Food Tour",
              experienceType: "food-tour",
              priceFrom: 99,
              priority: 1,
            },
          ],
        },
      ],
      validateCandidate: async args =>
        buildValidationResult({
          productCode: args.productCode,
          sourceUrl: args.sourceUrl,
        }),
    });

    expect(report.accepted.map(entry => entry.productCode)).toEqual([
      ENGINE6_CHICAGO_7812P19_PRODUCT_CODE,
    ]);
    expect(report.productCodeExclusivityReport).toContain(
      "✓ Product 7812P19 allowlisted duplicate"
    );
  });
});
