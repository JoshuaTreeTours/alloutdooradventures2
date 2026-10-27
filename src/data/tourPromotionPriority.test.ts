import { describe, expect, it } from "vitest";
import { getFareHarborProofProducts } from "./fareharborLeadToGoldProof";
import type { Tour } from "./tours.types";
import {
  getTourPromotionRank,
  isEnhancedFareHarborTour,
  prioritizeTourPromotionEntries,
  selectFeaturedTourPreview,
} from "./tourPromotionPriority";

const sampleProof = getFareHarborProofProducts()[0];

const mockTour = (
  id: string,
  engine: Tour["engine"],
  bookingProvider: Tour["bookingProvider"] = "fareharbor"
): Tour => ({
  id,
  engine,
  bookingProvider,
  bookingUrl: `https://fareharbor.com/embeds/book/example/items/${id}/`,
  slug: `test-${id}`,
  title: `Test ${id}`,
  destination: {
    state: "California",
    stateSlug: "california",
    city: "Santa Barbara",
    citySlug: "santa-barbara",
  },
  heroImage: "/images/test.jpg",
  badges: {},
  activitySlugs: ["sightseeing"],
  longDescription: "Test",
});

describe("Engine6 / Lead-to-Gold ordering", () => {
  it("uses registry membership rather than promoting all FareHarbor", () => {
    expect(sampleProof).toBeDefined();
    const migrated = mockTour(sampleProof.itemId, "engine1");
    const legacy = mockTour("987654321", "engine1");
    const viator = mockTour("viator", "engine6", "viator");
    const engine4 = mockTour("engine4", "engine4");

    expect(isEnhancedFareHarborTour(migrated)).toBe(true);
    expect(isEnhancedFareHarborTour(legacy)).toBe(false);
    expect(getTourPromotionRank(viator)).toBeGreaterThan(
      getTourPromotionRank(migrated)
    );
    expect(getTourPromotionRank(migrated)).toBeGreaterThan(
      getTourPromotionRank(engine4)
    );

    const ranked = prioritizeTourPromotionEntries(
      [legacy, migrated, engine4, viator],
      tour => tour
    );
    expect(ranked).toEqual([viator, migrated, engine4, legacy]);
  });

  it("reserves two upgraded FH cards in a short Engine6-heavy guide preview", () => {
    const engine6 = Array.from({ length: 12 }, (_, i) =>
      mockTour(`engine6-${i}`, "engine6", "viator")
    );
    const migrated = mockTour(sampleProof.itemId, "engine1");
    const ordered = prioritizeTourPromotionEntries(
      [...engine6, migrated],
      tour => tour
    );
    const featured = selectFeaturedTourPreview(ordered, 12);

    expect(featured).toHaveLength(12);
    expect(featured.slice(0, 10).every(tour => tour.engine === "engine6")).toBe(true);
    expect(featured[11]).toBe(migrated);
  });

  it("preserves the entire Engine6 block in an uncapped catalog", () => {
    const engine6 = Array.from({ length: 15 }, (_, i) =>
      mockTour(`engine6-${i}`, "engine6", "viator")
    );
    const migrated = mockTour(sampleProof.itemId, "engine1");
    const ranked = prioritizeTourPromotionEntries(
      [migrated, ...engine6],
      tour => tour
    );
    expect(ranked.slice(0, 15).every(tour => tour.engine === "engine6")).toBe(true);
    expect(ranked[15]).toBe(migrated);
  });
});
