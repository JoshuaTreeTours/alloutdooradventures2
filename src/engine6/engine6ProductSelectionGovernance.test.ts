import { describe, expect, it } from "vitest";

import {
  assertEngine6BuildStageOrder,
  assertEngine6FixturesBuildGate,
  assertEngine6MerchantFeedBuildGate,
  assertEngine6RoutesBuildGate,
  assertEngine6SitemapBuildGate,
  auditEngine6ProductSelectionPortfolioDiversity,
  buildEngine6PortfolioMixSummary,
  Engine6BuildOrderViolationError,
  ENGINE6_DETERMINISTIC_BUILD_STAGES,
  formatEngine6ProductSelectionGovernanceReport,
  inferEngine6CommercialTier,
  isEngine6ProductSelectionBlocklisted,
  resolveEngine6ProductSelectionCommercialFieldGap,
  selectEngine6DestinationPortfolio,
} from "./engine6ProductSelectionGovernance";
import type { Engine6LiveViatorValidationResult } from "./engine6LiveViatorProductionValidation";

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

describe("engine6ProductSelectionGovernance", () => {
  it("reuses the known-unavailable blocklist without duplicating validation logic", () => {
    expect(isEngine6ProductSelectionBlocklisted("3454P41")).toBe(true);
    expect(isEngine6ProductSelectionBlocklisted("199627P12")).toBe(false);
  });

  it("infers premium and standard commercial tiers from product signals", () => {
    expect(
      inferEngine6CommercialTier({
        title: "Private Yellowstone Wildlife Safari",
        priceFrom: 899,
      })
    ).toBe("premium");

    expect(
      inferEngine6CommercialTier({
        title: "Small-Group Yosemite Day Tour",
        priceFrom: 149,
      })
    ).toBe("standard");
  });

  it("rejects candidates missing required commercial fields before live validation", () => {
    expect(
      resolveEngine6ProductSelectionCommercialFieldGap({
        productCode: "TESTP1",
        sourceUrl: "https://example.com",
        title: "",
        experienceType: "day-tour",
        priceFrom: 99,
      })
    ).toBe("missing title");
  });

  it("preserves deterministic build order gates for downstream artifacts", () => {
    expect(() =>
      assertEngine6FixturesBuildGate(["live-validation"])
    ).not.toThrow();

    expect(() => assertEngine6FixturesBuildGate([])).toThrow(
      Engine6BuildOrderViolationError
    );

    expect(() =>
      assertEngine6MerchantFeedBuildGate(["live-validation", "fixtures"])
    ).not.toThrow();

    expect(() =>
      assertEngine6RoutesBuildGate([
        "live-validation",
        "fixtures",
        "merchant-feed",
      ])
    ).not.toThrow();

    expect(() =>
      assertEngine6SitemapBuildGate([
        "live-validation",
        "fixtures",
        "merchant-feed",
        "routes",
      ])
    ).not.toThrow();

    expect(ENGINE6_DETERMINISTIC_BUILD_STAGES).toEqual([
      "live-validation",
      "fixtures",
      "merchant-feed",
      "routes",
      "sitemap",
    ]);
  });

  it("selects valid ranked candidates and replaces failed primary picks", async () => {
    const report = await selectEngine6DestinationPortfolio({
      destinationLabel: "Example National Park",
      mode: "strict",
      scopedProductCodes: [],
      slots: [
        {
          experienceType: "private-tour",
          desiredCount: 1,
          candidates: [
            {
              productCode: "FAILP1",
              sourceUrl: "https://www.viator.com/tours/Example/d1-FAILP1",
              title: "Private Canyon Tour",
              experienceType: "private-tour",
              priceFrom: 799,
              priority: 1,
            },
            {
              productCode: "GOODP1",
              sourceUrl: "https://www.viator.com/tours/Example/d1-GOODP1",
              title: "Private Luxury Canyon Tour",
              experienceType: "private-tour",
              priceFrom: 899,
              priority: 2,
            },
          ],
        },
        {
          experienceType: "day-tour",
          desiredCount: 1,
          candidates: [
            {
              productCode: "DAYP1",
              sourceUrl: "https://www.viator.com/tours/Example/d1-DAYP1",
              title: "Small-Group Day Tour",
              experienceType: "day-tour",
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
          passed: args.productCode !== "FAILP1",
          reason:
            args.productCode === "FAILP1" ? "product is not currently bookable" : null,
          bookable: args.productCode !== "FAILP1",
        }),
      generatedAt: "2026-07-01T00:00:00.000Z",
    });

    expect(report.productsAccepted).toBe(2);
    expect(report.productsRejected).toBe(1);
    expect(report.replacementProductsSelected).toBe(1);
    expect(report.candidatesEvaluated).toBe(3);
    expect(report.buildOrderPreserved).toBe(true);
    expect(report.duplicateValidationLogicIntroduced).toBe(false);
    expect(report.accepted.map(entry => entry.productCode)).toEqual([
      "GOODP1",
      "DAYP1",
    ]);
    expect(report.portfolioMix.premiumCount).toBe(1);
    expect(report.portfolioMix.standardCount).toBe(1);
    expect(report.replacements).toEqual([
      {
        experienceType: "private-tour",
        rejectedProductCode: "FAILP1",
        selectedProductCode: "GOODP1",
      },
    ]);
  });

  it("blocks only scoped products in pr-scoped mode", async () => {
    const report = await selectEngine6DestinationPortfolio({
      destinationLabel: "Example National Park",
      mode: "pr-scoped",
      scopedProductCodes: ["NEWP1"],
      slots: [
        {
          experienceType: "day-tour",
          desiredCount: 1,
          candidates: [
            {
              productCode: "NEWP1",
              sourceUrl: "https://www.viator.com/tours/Example/d1-NEWP1",
              title: "Small-Group Day Tour",
              experienceType: "day-tour",
              priceFrom: 149,
            },
            {
              productCode: "LEGACYP1",
              sourceUrl: "https://www.viator.com/tours/Example/d1-LEGACYP1",
              title: "Legacy Day Tour",
              experienceType: "day-tour",
              priceFrom: 129,
            },
          ],
        },
      ],
      validateCandidate: async args =>
        buildValidationResult({
          productCode: args.productCode,
          sourceUrl: args.sourceUrl,
          passed: false,
          bookable: false,
          reason: "live validation failed",
        }),
    });

    expect(report.onlyNewProductsCouldBlock).toBe(true);
    expect(report.blockingPassed).toBe(false);
    expect(report.blockingFailures.map(entry => entry.productCode)).toEqual([
      "NEWP1",
    ]);
    expect(
      report.rejected.some(
        entry =>
          entry.productCode === "LEGACYP1" &&
          entry.reason === "live-validation-failed"
      )
    ).toBe(true);
  });

  it("formats a completion report with portfolio and reuse confirmation", async () => {
    const report = await selectEngine6DestinationPortfolio({
      destinationLabel: "Zion National Park",
      mode: "strict",
      scopedProductCodes: [],
      slots: [
        {
          experienceType: "hiking-tour",
          desiredCount: 1,
          candidates: [
            {
              productCode: "HIKEP1",
              sourceUrl: "https://www.viator.com/tours/Example/d1-HIKEP1",
              title: "Private Guided Hike",
              experienceType: "hiking-tour",
              priceFrom: 850,
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

    const formatted = formatEngine6ProductSelectionGovernanceReport(report);

    expect(formatted).toContain("Candidate products evaluated:");
    expect(formatted).toContain("Replacement products selected:");
    expect(formatted).toContain("Duplicate validation logic introduced: false");
    expect(formatted).toContain("Reused modules:");
    expect(
      auditEngine6ProductSelectionPortfolioDiversity({
        accepted: report.accepted,
      }).mix.acceptedCount
    ).toBe(1);
    expect(
      buildEngine6PortfolioMixSummary({
        accepted: report.accepted,
      }).premiumCount
    ).toBe(1);
  });

  it("rejects blocklisted products before live validation", async () => {
    const report = await selectEngine6DestinationPortfolio({
      destinationLabel: "Yosemite National Park",
      mode: "strict",
      scopedProductCodes: [],
      slots: [
        {
          experienceType: "day-tour",
          desiredCount: 1,
          candidates: [
            {
              productCode: "3454P41",
              sourceUrl:
                "https://www.viator.com/tours/Yosemite-National-Park/Best-of-Yosemite-Tour-Giant-Sequoias-and-Glacier-Point/d5265-3454P41",
              title: "Blocked Yosemite Tour",
              experienceType: "day-tour",
              priceFrom: 199,
            },
          ],
        },
      ],
      validateCandidate: async () => {
        throw new Error("live validation should not run for blocklisted products");
      },
    });

    expect(report.productsAccepted).toBe(0);
    expect(report.productsRejected).toBe(1);
    expect(report.rejected[0]?.reason).toBe("blocklisted");
    expect(report.unfilledSlots).toHaveLength(1);
  });
});

describe("assertEngine6BuildStageOrder", () => {
  it("throws when a required upstream stage is missing", () => {
    expect(() =>
      assertEngine6BuildStageOrder({
        completedStage: "merchant-feed",
        priorCompletedStages: ["live-validation"],
      })
    ).toThrow(Engine6BuildOrderViolationError);

    expect(() =>
      assertEngine6BuildStageOrder({
        completedStage: "merchant-feed",
        priorCompletedStages: ["live-validation", "fixtures"],
      })
    ).not.toThrow();
  });
});
