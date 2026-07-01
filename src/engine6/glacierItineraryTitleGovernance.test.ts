import { describe, expect, it } from "vitest";

import { ENGINE6_GLACIER_CANONICAL_CITY_HERO_URL } from "./displayHero";
import { engine6ListingTours } from "./listing";
import { engine6ResolvedTours } from "./registry";

export const ENGINE6_GLACIER_PRODUCT_CODES = [
  "123783P1",
  "70248P3",
  "70248P2",
  "299521P2",
  "299521P8",
  "86727P7",
  "487722P4",
] as const;

const glacierListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "montana" &&
    tour.destination.citySlug === "glacier-national-park"
);

const glacierResolvedTours = engine6ResolvedTours.filter(tour =>
  tour.canonicalPath.includes("glacier-national-park")
);

describe("Glacier Engine6 itinerary title governance", () => {
  it("audits all 7 Glacier listing products", () => {
    expect(glacierListingTours).toHaveLength(7);
    expect(glacierResolvedTours).toHaveLength(7);
    expect(
      glacierResolvedTours.map(tour => tour.productCode).sort()
    ).toEqual([...ENGINE6_GLACIER_PRODUCT_CODES].sort());
  });

  it.each(ENGINE6_GLACIER_PRODUCT_CODES)(
    "uses verified POI titles for resolved tour %s",
    productCode => {
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );
      expect(tour, `missing resolved tour for ${productCode}`).toBeDefined();

      const titles = tour!.itinerary.map(item => item.title);
      expect(titles.length).toBeGreaterThan(0);
      titles.forEach(title => {
        expect(title.trim().length).toBeGreaterThan(2);
        expect(title).not.toMatch(/^(This|These|That|It|They)$/i);
      });
    }
  );
});

describe("Glacier Engine6 hero diversity governance", () => {
  it("uses unique listing-card heroes across all 7 Glacier products", () => {
    expect(glacierListingTours).toHaveLength(7);

    const heroCounts = glacierListingTours.reduce<Map<string, number>>(
      (counts, tour) => {
        counts.set(tour.heroImage, (counts.get(tour.heroImage) ?? 0) + 1);
        return counts;
      },
      new Map()
    );

    expect(
      heroCounts.get(ENGINE6_GLACIER_CANONICAL_CITY_HERO_URL) ?? 0
    ).toBeLessThanOrEqual(1);
    expect(heroCounts.size).toBe(glacierListingTours.length);
  });
});
