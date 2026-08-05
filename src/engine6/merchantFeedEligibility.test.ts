import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { isExcludedProductCode } from "../../src/data/excludedProductCodes";
import {
  merchantFeedEligibleTours,
  isMerchantFeedEligibleTour,
} from "../../src/engine6/merchantFeedEligibility";
import { engine6ListingTours } from "../../src/engine6/listing";
import { engine6ResolvedTours } from "../../src/engine6/registry";
import { resolveEngine6PathForProductCode } from "../../src/engine6/routes";

const engine6InventoryCleanupProductCodes = [
  "3454P57",
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

  it("excludes the Engine6 inventory cleanup products from surfaced listings and merchant feed eligibility", () => {
    for (const productCode of engine6InventoryCleanupProductCodes) {
      expect(isExcludedProductCode(productCode)).toBe(true);
      expect(resolveEngine6PathForProductCode(productCode)).toBeNull();
      expect(
        engine6ResolvedTours.some(tour => tour.productCode === productCode)
      ).toBe(false);
      expect(
        engine6ListingTours.some(tour => tour.productCode === productCode)
      ).toBe(false);
      expect(
        merchantFeedEligibleTours.some(tour => tour.productCode === productCode)
      ).toBe(false);
    }
  });

  it("does not insert replacement products for the Engine6 inventory cleanup", () => {
    const surfacedProductCodes = new Set(
      engine6ListingTours
        .filter(tour => tour.engine === "engine6")
        .map(tour => tour.productCode)
    );
    const resolvedProductCodes = new Set(
      engine6ResolvedTours.map(tour => tour.productCode)
    );

    expect(surfacedProductCodes.size).toBe(resolvedProductCodes.size);
    for (const productCode of surfacedProductCodes) {
      expect(resolvedProductCodes.has(productCode)).toBe(true);
    }
  });

  it("keeps 447486P8 merchant-feed eligible with governed commercial ratings", () => {
    const activeTour = engine6ResolvedTours.find(
      tour => tour.productCode === "447486P8"
    );
    const merchantFeedCsv = readFileSync("data/merchantFeed.csv", "utf8");
    const merchantFeedRow = merchantFeedCsv
      .split(/\r?\n/)
      .find(row => row.startsWith("447486P8,"));

    expect(isExcludedProductCode("447486P8")).toBe(false);
    expect(activeTour).toBeDefined();
    expect(isMerchantFeedEligibleTour(activeTour!)).toBe(true);
    const listingTour = engine6ListingTours.find(
      tour => tour.productCode === "447486P8"
    );

    expect(listingTour?.badges.rating).toBe(4.6);
    expect(listingTour?.badges.reviewCount).toBe(38);
    expect(merchantFeedRow).toBeDefined();
    expect(merchantFeedRow?.endsWith(",4.6,38,38")).toBe(true);
  });

  it("keeps active rated and reviewed products merchant-feed eligible", () => {
    const activeTour = engine6ResolvedTours.find(
      tour => tour.productCode === "5765MTHOOD"
    );

    expect(activeTour).toBeDefined();
    expect(activeTour?.aggregateRating).toBeGreaterThan(0);
    expect(activeTour?.reviewCount).toBeGreaterThan(0);
    expect(isMerchantFeedEligibleTour(activeTour!)).toBe(true);
  });

  it("omits Engine6 inventory cleanup products from the checked-in merchant feed", () => {
    const merchantFeedCsv = readFileSync("data/merchantFeed.csv", "utf8");

    for (const productCode of engine6InventoryCleanupProductCodes) {
      expect(merchantFeedCsv).not.toContain(productCode);
    }
  });
});
