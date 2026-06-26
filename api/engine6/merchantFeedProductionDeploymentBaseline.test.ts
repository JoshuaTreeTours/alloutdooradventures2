import { describe, expect, it, vi } from "vitest";

import {
  isMerchantFeedProductionRuntimeNotYetPublishedError,
  shouldDeferMerchantFeedProductionRuntimeParityFetch,
} from "./merchantFeedBaselineGovernance";
import {
  DEFAULT_MERCHANT_FEED_MAIN_BASELINE_GIT_REF,
  DEFAULT_MERCHANT_FEED_PRODUCTION_DEPLOYMENT_GIT_REF,
  extractBranchNewEngine6ProductCodesFromRoutesDiff,
  extractEngine6ProductCodesFromRoutesSource,
  loadMerchantFeedMainBaselineCatalog,
  loadMerchantFeedNotYetPublishedOnProductionProductCodes,
} from "./merchantFeedProductionDeploymentBaseline";
import { validateMerchantFeedRows } from "../../scripts/generate-merchant-feed";
import { merchantFeedEligibleTours } from "../../src/engine6/merchantFeedEligibility";
import { auditMerchantFeedLiveRuntimeParity } from "../../scripts/audit-merchant-feed-live-runtime-parity";

describe("merchant feed production deployment baseline", () => {
  it("extracts Engine6 product codes from routes source", () => {
    const codes = extractEngine6ProductCodesFromRoutesSource(`
      export const ENGINE6_FOO_PRODUCT_CODE = "111P1";
      export const ENGINE6_BAR_PRODUCT_CODE = "222P2";
    `);

    expect([...codes]).toEqual(["111P1", "222P2"]);
  });

  it("extracts branch-new product codes from a routes diff", () => {
    const codes = extractBranchNewEngine6ProductCodesFromRoutesDiff(`
      unchanged line
      +export const ENGINE6_MONTEREY_17_MILE_EBIKE_PRODUCT_CODE = "70275P1";
      +export const ENGINE6_MONTEREY_WHALE_WATCHING_4HR_PRODUCT_CODE = "53254P1";
    `);

    expect([...codes]).toEqual(["70275P1", "53254P1"]);
  });

  it("identifies Monterey catalog products as not yet published on production", () => {
    const notYetPublished = loadMerchantFeedNotYetPublishedOnProductionProductCodes([
      "70275P1",
      "53254P1",
      "63657P1",
    ]);

    expect(notYetPublished.has("70275P1")).toBe(true);
    expect(notYetPublished.has("53254P1")).toBe(true);
    expect(notYetPublished.has("63657P1")).toBe(false);
    expect(DEFAULT_MERCHANT_FEED_PRODUCTION_DEPLOYMENT_GIT_REF).toBe("cd7906a9");
  });

  it("loads the main branch merchant feed baseline catalog", () => {
    const mainBaseline = loadMerchantFeedMainBaselineCatalog();

    expect(DEFAULT_MERCHANT_FEED_MAIN_BASELINE_GIT_REF).toBe("origin/main");
    expect(mainBaseline.size).toBeGreaterThan(0);
    expect(mainBaseline.get("63657P1")?.price).toBeTruthy();
  });

  it("keeps merchant feed row count aligned with the eligible Engine6 catalog", () => {
    const mainBaseline = loadMerchantFeedMainBaselineCatalog();
    expect(mainBaseline.size).toBe(merchantFeedEligibleTours.length);
  });
});

describe("merchant feed scoped runtime parity build guards", () => {
  it("still blocks rows with missing required merchant feed fields", () => {
    const validation = validateMerchantFeedRows([
      {
        id: "191303P1",
        title: "",
        description: "desc",
        link: "https://example.com",
        image_link: "https://example.com/image.jpg",
        availability: "in stock",
        price: "89.00 USD",
        condition: "new",
        brand: "Outdoor Adventures",
        average_rating: "5.0",
        rating_count: "54",
        review_count: "54",
      },
    ]);

    expect(validation.pass).toBe(false);
    expect(validation.failures.some(failure => failure.includes("title"))).toBe(
      true
    );
  });
});

describe("merchant feed production runtime parity fetch deferral", () => {
  const notYetPublished = new Set(["70275P1"]);

  it("detects production runtime 422 as a not-yet-published fetch error", () => {
    expect(
      isMerchantFeedProductionRuntimeNotYetPublishedError(
        new Error("Live runtime commercial fetch failed for 70275P1: HTTP 422")
      )
    ).toBe(true);
    expect(
      isMerchantFeedProductionRuntimeNotYetPublishedError(
        new Error("Live runtime commercial fetch failed for 63657P1: HTTP 500")
      )
    ).toBe(false);
  });

  it("defers production runtime fetch failures for not-yet-published new products", () => {
    expect(
      shouldDeferMerchantFeedProductionRuntimeParityFetch({
        tier: "new-product",
        productCode: "70275P1",
        error: new Error(
          "Live runtime commercial fetch failed for 70275P1: HTTP 422"
        ),
        notYetPublishedOnProductionProductCodes: notYetPublished,
      })
    ).toBe(true);
  });

  it("does not defer production runtime fetch failures for already-published products", () => {
    expect(
      shouldDeferMerchantFeedProductionRuntimeParityFetch({
        tier: "modified-commercial",
        productCode: "63657P1",
        error: new Error(
          "Live runtime commercial fetch failed for 63657P1: HTTP 422"
        ),
        notYetPublishedOnProductionProductCodes: notYetPublished,
      })
    ).toBe(false);

    expect(
      shouldDeferMerchantFeedProductionRuntimeParityFetch({
        tier: "modified-commercial",
        productCode: "63657P1",
        error: new Error(
          "Live runtime commercial fetch failed for 63657P1: HTTP 500"
        ),
        notYetPublishedOnProductionProductCodes: notYetPublished,
      })
    ).toBe(false);
  });

  it("does not fail runtime audit solely because a not-yet-published product returns HTTP 422", async () => {
    const fetchMock = vi.fn(async () =>
      new Response("not published yet", { status: 422 })
    );

    vi.stubGlobal("fetch", fetchMock);

    try {
      const governanceByProductCode = new Map(
        merchantFeedEligibleTours.map(tour => [
          tour.productCode.trim().toUpperCase(),
          tour.productCode === "70275P1"
            ? ("new-product" as const)
            : ("unchanged-legacy-baseline" as const),
        ])
      );

      const report = await auditMerchantFeedLiveRuntimeParity(
        [
          {
            id: "70275P1",
            price: "55 USD",
            average_rating: "4.9",
            review_count: "767",
          },
        ],
        governanceByProductCode,
        notYetPublished
      );

      expect(report.pass).toBe(true);
      expect(report.deferredNotYetPublishedProductCodes).toContain("70275P1");
      expect(fetchMock).toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
