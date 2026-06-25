import { describe, expect, it } from "vitest";

import { isMerchantFeedExcludedProductCode } from "../../src/data/excludedProductCodes";
import {
  merchantFeedEligibleTours,
  isMerchantFeedEligibleTour,
} from "../../src/engine6/merchantFeedEligibility";
import { engine6ResolvedTours } from "../../src/engine6/registry";

describe("merchant feed eligibility", () => {
  it("excludes retired Viator product 5765P7 from merchant feed generation", () => {
    expect(isMerchantFeedExcludedProductCode("5765P7")).toBe(true);
    expect(
      engine6ResolvedTours.some(tour => tour.productCode === "5765P7")
    ).toBe(true);
    expect(
      merchantFeedEligibleTours.some(tour => tour.productCode === "5765P7")
    ).toBe(false);
    expect(merchantFeedEligibleTours.length).toBe(
      engine6ResolvedTours.length - 1
    );
  });

  it("keeps active products merchant-feed eligible", () => {
    const activeTour = engine6ResolvedTours.find(
      tour => tour.productCode === "5765MTHOOD"
    );
    expect(activeTour).toBeDefined();
    expect(isMerchantFeedEligibleTour(activeTour!)).toBe(true);
  });
});
