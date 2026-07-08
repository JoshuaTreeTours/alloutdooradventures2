import { describe, expect, it } from "vitest";

import { isExcludedProductCode } from "../../src/data/excludedProductCodes";
import {
  merchantFeedEligibleTours,
  isMerchantFeedEligibleTour,
} from "../../src/engine6/merchantFeedEligibility";
import { engine6ListingTours } from "../../src/engine6/listing";
import { engine6ResolvedTours } from "../../src/engine6/registry";

import { isEngine6SurfaceEligibleTour } from "../../src/engine6/surfacingEligibility";

const NO_RATING_OR_REVIEW_AUDIT_PRODUCT_CODES = [
  "3454P57",
  "447486P8",
  "463268P4",
  "52661P41",
  "5603847P4",
  "5639875P7",
] as const;

describe("merchant feed eligibility", () => {
  it("excludes retired legacy Viator products from resolved tours and merchant feed", () => {
    expect(isExcludedProductCode("5765P7")).toBe(true);
    expect(
      engine6ResolvedTours.some(tour => tour.productCode === "5765P7")
    ).toBe(false);
    expect(
      merchantFeedEligibleTours.some(tour => tour.productCode === "5765P7")
    ).toBe(false);
  });

  it("does not surface Engine6 tours missing governed rating or review count", () => {
    for (const productCode of NO_RATING_OR_REVIEW_AUDIT_PRODUCT_CODES) {
      const resolvedTour = engine6ResolvedTours.find(
        tour => tour.productCode === productCode
      );

      expect(
        resolvedTour,
        `${productCode} remains route-resolved`
      ).toBeDefined();
      expect(isEngine6SurfaceEligibleTour(resolvedTour!)).toBe(false);
      expect(
        engine6ListingTours.some(tour => tour.productCode === productCode),
        `${productCode} is absent from public Engine6 listings`
      ).toBe(false);
      expect(
        merchantFeedEligibleTours.some(
          tour => tour.productCode === productCode
        ),
        `${productCode} is absent from merchant feed inventory`
      ).toBe(false);
    }
  });

  it("removes unrated Engine6 tours without inserting replacements", () => {
    const resolvedEligibleCount = engine6ResolvedTours.filter(
      isEngine6SurfaceEligibleTour
    ).length;
    const excludedResolvedCount =
      engine6ResolvedTours.length - resolvedEligibleCount;

    expect(excludedResolvedCount).toBeGreaterThanOrEqual(
      NO_RATING_OR_REVIEW_AUDIT_PRODUCT_CODES.length
    );
    expect(engine6ListingTours).toHaveLength(resolvedEligibleCount);
  });

  it("keeps active products merchant-feed eligible", () => {
    const activeTour = engine6ResolvedTours.find(
      tour => tour.productCode === "5765MTHOOD"
    );
    expect(activeTour).toBeDefined();
    expect(isEngine6SurfaceEligibleTour(activeTour!)).toBe(true);
    expect(isMerchantFeedEligibleTour(activeTour!)).toBe(true);
    expect(
      engine6ListingTours.some(
        tour => tour.productCode === activeTour!.productCode
      )
    ).toBe(true);
  });
});
