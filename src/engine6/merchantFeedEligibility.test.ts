import { describe, expect, it } from "vitest";

import { isExcludedProductCode } from "../../src/data/excludedProductCodes";
import {
  merchantFeedEligibleTours,
  isMerchantFeedEligibleTour,
} from "../../src/engine6/merchantFeedEligibility";
import { engine6ResolvedTours } from "../../src/engine6/registry";

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

  it("keeps active products merchant-feed eligible", () => {
    const activeTour = engine6ResolvedTours.find(
      tour => tour.productCode === "5765MTHOOD"
    );
    expect(activeTour).toBeDefined();
    expect(isMerchantFeedEligibleTour(activeTour!)).toBe(true);
  });
});
