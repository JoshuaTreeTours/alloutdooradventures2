import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  applyMerchantFeedLiveRuntimeParityBaselinePolicy,
  buildMerchantFeedBranchScopedGovernanceByProductCode,
  buildMerchantFeedPublishedBaselineCatalog,
  classifyMerchantFeedGovernanceTier,
  evaluateMerchantFeedLiveRuntimeParityForBuild,
  isMerchantFeedCommercialModifiedFromBaseline,
  merchantFeedCommercialSnapshotsEqual,
  passesMerchantFeedLiveCommercialGuardForBuild,
  reconcileMerchantFeedRowsWithBaselineGovernance,
  requiresStrictMerchantFeedLiveCommercialGuard,
  requiresStrictMerchantFeedRuntimeParity,
  snapshotMerchantFeedCommercial,
} from "./merchantFeedBaselineGovernance";
import {
  passesMerchantFeedLiveCommercialGuard,
  type Engine6ViatorProductCommercialDiagnostic,
} from "./resolveEngine6ViatorProductCommercialExtract";
import { validateMerchantFeedRows } from "../../scripts/generate-merchant-feed";

const baselineRow = {
  id: "191303P1",
  price: "89.00 USD",
  average_rating: "5.0",
  rating_count: "54",
  review_count: "54",
};

const bundledFallbackDiagnostic = (
  productCode: string,
  overrides: Partial<Engine6ViatorProductCommercialDiagnostic> = {}
): Engine6ViatorProductCommercialDiagnostic => ({
  productCode,
  commercial: {
    priceAmount: 89,
    priceFormatted: "From $89.00",
    aggregateRating: 5,
    reviewCount: 54,
    source: "bundled-fallback",
  },
  hasViatorApiKey: true,
  attemptedLiveFetch: true,
  upstreamStatus: 200,
  upstreamOk: true,
  failureReason: "live-price-missing-or-zero",
  pricingAvailable: true,
  ratingAvailable: true,
  reviewCountAvailable: true,
  ratingMetadataPresent: true,
  ...overrides,
});

describe("merchant feed baseline governance", () => {
  const baseline = buildMerchantFeedPublishedBaselineCatalog([baselineRow]);

  it("classifies published baseline, modified, and new products", () => {
    expect(
      classifyMerchantFeedGovernanceTier(
        "191303P1",
        snapshotMerchantFeedCommercial(baselineRow),
        baseline
      )
    ).toBe("unchanged-legacy-baseline");

    expect(
      classifyMerchantFeedGovernanceTier(
        "191303P1",
        snapshotMerchantFeedCommercial({
          ...baselineRow,
          price: "99.00 USD",
        }),
        baseline
      )
    ).toBe("unchanged-legacy-baseline");

    expect(
      classifyMerchantFeedGovernanceTier(
        "191303P1",
        snapshotMerchantFeedCommercial({
          ...baselineRow,
          price: "99.00 USD",
        }),
        baseline,
        new Set(["191303P1"])
      )
    ).toBe("modified-commercial");

    expect(
      classifyMerchantFeedGovernanceTier(
        "NEWTOUR1",
        snapshotMerchantFeedCommercial({
          id: "NEWTOUR1",
          price: "45.00 USD",
          average_rating: "4.8",
          rating_count: "10",
          review_count: "10",
        }),
        baseline
      )
    ).toBe("new-product");
  });

  it("requires strict live API and runtime parity governance for new and modified products", () => {
    expect(
      requiresStrictMerchantFeedLiveCommercialGuard("unchanged-legacy-baseline")
    ).toBe(false);
    expect(
      requiresStrictMerchantFeedLiveCommercialGuard("modified-commercial")
    ).toBe(true);
    expect(requiresStrictMerchantFeedLiveCommercialGuard("new-product")).toBe(
      true
    );
    expect(
      requiresStrictMerchantFeedRuntimeParity("unchanged-legacy-baseline")
    ).toBe(false);
    expect(requiresStrictMerchantFeedRuntimeParity("modified-commercial")).toBe(
      true
    );
    expect(requiresStrictMerchantFeedRuntimeParity("new-product")).toBe(true);
  });

  it("allows bundled-fallback for unchanged published baseline products with baseline price", () => {
    const diagnostic = bundledFallbackDiagnostic("191303P1");
    const strict = passesMerchantFeedLiveCommercialGuard(diagnostic);
    const build = passesMerchantFeedLiveCommercialGuardForBuild(diagnostic, {
      tier: "unchanged-legacy-baseline",
      baselineCommercial: snapshotMerchantFeedCommercial(baselineRow),
    });

    expect(strict.pass).toBe(false);
    expect(build.pass).toBe(true);
    expect(build.reason).toContain("published-baseline-legacy-commercial");
  });

  it("rejects bundled-fallback for new products", () => {
    const build = passesMerchantFeedLiveCommercialGuardForBuild(
      bundledFallbackDiagnostic("NEWTOUR1"),
      { tier: "new-product" }
    );

    expect(build.pass).toBe(false);
    expect(build.reason).toContain("bundled commercial fallback forbidden");
  });

  it("treats unchanged legacy runtime drift as informational while branch-modified and new-product drift blocks", () => {
    const governanceByProductCode = new Map([
      ["191303P1", "unchanged-legacy-baseline" as const],
      ["44152P18", "modified-commercial" as const],
      ["NEWTOUR1", "new-product" as const],
    ]);

    const evaluation = evaluateMerchantFeedLiveRuntimeParityForBuild(
      {
        drifts: [
          { productCode: "191303P1" },
          { productCode: "44152P18" },
          { productCode: "NEWTOUR1" },
        ],
      },
      governanceByProductCode
    );

    expect(evaluation.pass).toBe(false);
    expect(evaluation.blockingDriftCount).toBe(2);
    expect(evaluation.informationalLegacyProductCodes).toEqual(["191303P1"]);
  });

  it("passes runtime parity when only unchanged baseline products drift", () => {
    const governanceByProductCode = new Map([
      ["191303P1", "unchanged-legacy-baseline" as const],
      ["44152P18", "unchanged-legacy-baseline" as const],
    ]);

    const report = applyMerchantFeedLiveRuntimeParityBaselinePolicy(
      {
        pass: false,
        drifts: [{ productCode: "191303P1" }, { productCode: "44152P18" }],
      },
      governanceByProductCode
    );

    expect(report.pass).toBe(true);
    expect(report.informationalLegacyProductCodes).toEqual([
      "191303P1",
      "44152P18",
    ]);
  });

  it("compares commercial snapshots exactly", () => {
    expect(
      merchantFeedCommercialSnapshotsEqual(
        snapshotMerchantFeedCommercial(baselineRow),
        snapshotMerchantFeedCommercial(baselineRow)
      )
    ).toBe(true);
    expect(
      isMerchantFeedCommercialModifiedFromBaseline(
        snapshotMerchantFeedCommercial(baselineRow),
        snapshotMerchantFeedCommercial({ ...baselineRow, price: "90.00 USD" })
      )
    ).toBe(true);
  });

  it("treats regeneration drift without live proof as unchanged baseline, not modified", async () => {
    const baseline = buildMerchantFeedPublishedBaselineCatalog([baselineRow]);
    const generatedRow = {
      id: "191303P1",
      price: "99.00 USD",
      average_rating: "5.0",
      rating_count: "54",
      review_count: "54",
    };

    const reconciliation =
      await reconcileMerchantFeedRowsWithBaselineGovernance(
        [generatedRow],
        baseline,
        async () => bundledFallbackDiagnostic("191303P1")
      );

    expect(reconciliation.governanceByProductCode.get("191303P1")).toBe(
      "unchanged-legacy-baseline"
    );
    expect(reconciliation.rows[0]?.price).toBe("89.00 USD");
    expect(reconciliation.liveCommercialFailures).toEqual([]);
  });

  it("treats branch-scoped commercial changes with live proof as modified", async () => {
    const baseline = buildMerchantFeedPublishedBaselineCatalog([baselineRow]);
    const generatedRow = {
      id: "191303P1",
      price: "99.00 USD",
      average_rating: "5.0",
      rating_count: "54",
      review_count: "54",
    };

    const reconciliation =
      await reconcileMerchantFeedRowsWithBaselineGovernance(
        [generatedRow],
        baseline,
        async () => ({
          ...bundledFallbackDiagnostic("191303P1"),
          commercial: {
            priceAmount: 99,
            priceFormatted: "From $99.00",
            aggregateRating: 5,
            reviewCount: 54,
            source: "live-api" as const,
          },
          failureReason: "live-api-success" as const,
        }),
        new Set(["191303P1"])
      );

    expect(reconciliation.governanceByProductCode.get("191303P1")).toBe(
      "modified-commercial"
    );
    expect(reconciliation.rows[0]?.price).toBe("99.00 USD");
  });

  it("preserves baseline when legacy live commercial values drift during regeneration", async () => {
    const baseline = buildMerchantFeedPublishedBaselineCatalog([baselineRow]);
    const generatedRow = {
      id: "191303P1",
      price: "99.00 USD",
      average_rating: "5.0",
      rating_count: "54",
      review_count: "54",
    };

    const reconciliation =
      await reconcileMerchantFeedRowsWithBaselineGovernance(
        [generatedRow],
        baseline,
        async () => ({
          ...bundledFallbackDiagnostic("191303P1"),
          commercial: {
            priceAmount: 99,
            priceFormatted: "From $99.00",
            aggregateRating: 5,
            reviewCount: 54,
            source: "live-api" as const,
          },
          failureReason: "live-api-success" as const,
        })
      );

    expect(reconciliation.governanceByProductCode.get("191303P1")).toBe(
      "unchanged-legacy-baseline"
    );
    expect(reconciliation.rows[0]?.price).toBe("89.00 USD");
    expect(reconciliation.liveCommercialFailures).toEqual([]);
  });
});

describe("merchant feed branch-scoped runtime parity", () => {
  const mainBaselineRow = {
    id: "191303P1",
    price: "89.00 USD",
    average_rating: "5.0",
    rating_count: "54",
    review_count: "54",
  };

  const mainBaseline = buildMerchantFeedPublishedBaselineCatalog([
    mainBaselineRow,
  ]);

  it("blocks branch-changed commercial runtime drift", () => {
    const outputRows = [
      {
        id: "191303P1",
        price: "99.00 USD",
        average_rating: "5.0",
        rating_count: "54",
        review_count: "54",
      },
    ];
    const branchScopedGovernance =
      buildMerchantFeedBranchScopedGovernanceByProductCode(
        outputRows,
        mainBaseline,
        new Set(["191303P1"])
      );

    expect(branchScopedGovernance.get("191303P1")).toBe("modified-commercial");

    const report = applyMerchantFeedLiveRuntimeParityBaselinePolicy(
      {
        pass: false,
        drifts: [{ productCode: "191303P1" }],
      },
      branchScopedGovernance
    );

    expect(report.pass).toBe(false);
    expect(report.informationalLegacyProductCodes).toEqual([]);
  });

  it("reports regenerated legacy commercial drift as informational when the branch did not change the product", () => {
    const outputRows = [
      {
        id: "191303P1",
        price: "99.00 USD",
        average_rating: "5.0",
        rating_count: "54",
        review_count: "54",
      },
    ];
    const branchScopedGovernance =
      buildMerchantFeedBranchScopedGovernanceByProductCode(
        outputRows,
        mainBaseline
      );

    expect(branchScopedGovernance.get("191303P1")).toBe(
      "unchanged-legacy-baseline"
    );

    const report = applyMerchantFeedLiveRuntimeParityBaselinePolicy(
      {
        pass: false,
        drifts: [{ productCode: "191303P1" }],
      },
      branchScopedGovernance
    );

    expect(report.pass).toBe(true);
    expect(report.informationalLegacyProductCodes).toEqual(["191303P1"]);
  });

  it("reports unchanged main-baseline runtime drift as informational only", () => {
    const outputRows = [mainBaselineRow];
    const branchScopedGovernance =
      buildMerchantFeedBranchScopedGovernanceByProductCode(
        outputRows,
        mainBaseline
      );

    expect(branchScopedGovernance.get("191303P1")).toBe(
      "unchanged-legacy-baseline"
    );

    const report = applyMerchantFeedLiveRuntimeParityBaselinePolicy(
      {
        pass: false,
        drifts: [{ productCode: "191303P1" }],
      },
      branchScopedGovernance
    );

    expect(report.pass).toBe(true);
    expect(report.informationalLegacyProductCodes).toEqual(["191303P1"]);
  });

  it("blocks runtime drift for branch-new products not present on main", () => {
    const outputRows = [
      {
        id: "NEWTOUR1",
        price: "45.00 USD",
        average_rating: "4.8",
        rating_count: "10",
        review_count: "10",
      },
    ];
    const branchScopedGovernance =
      buildMerchantFeedBranchScopedGovernanceByProductCode(
        outputRows,
        mainBaseline
      );

    expect(branchScopedGovernance.get("NEWTOUR1")).toBe("new-product");

    const report = applyMerchantFeedLiveRuntimeParityBaselinePolicy(
      {
        pass: false,
        drifts: [{ productCode: "NEWTOUR1" }],
      },
      branchScopedGovernance
    );

    expect(report.pass).toBe(false);
  });

  it("blocks Monterey/new products when required merchant fields are missing", () => {
    const validation = validateMerchantFeedRows([
      {
        id: "70275P1",
        title: "Monterey 17 Mile Drive Guided Electric Bike Tour",
        description: "Monterey product",
        link: "https://example.com/monterey",
        image_link: "",
        availability: "in stock",
        price: "55 USD",
        condition: "new",
        brand: "Viator",
        average_rating: "5.0",
        rating_count: "889",
        review_count: "889",
      },
    ]);

    expect(validation.pass).toBe(false);
    expect(validation.failures).toContain(
      'Required field "image_link" is blank for product 70275P1'
    );
  });

  it("does not mutate merchantFeed.csv while applying runtime parity policy", () => {
    const before = readFileSync("data/merchantFeed.csv", "utf8");

    applyMerchantFeedLiveRuntimeParityBaselinePolicy(
      {
        pass: false,
        drifts: [{ productCode: "191303P1" }, { productCode: "NEWTOUR1" }],
      },
      new Map([
        ["191303P1", "modified-commercial" as const],
        ["NEWTOUR1", "new-product" as const],
      ])
    );

    const after = readFileSync("data/merchantFeed.csv", "utf8");
    const merchantFeedDiff = execFileSync(
      "git",
      ["diff", "--", "data/merchantFeed.csv"],
      { encoding: "utf8" }
    );

    expect(after).toBe(before);
    expect(merchantFeedDiff).toBe("");
  });
});
