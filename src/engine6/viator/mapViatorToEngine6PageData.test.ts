import { describe, expect, it } from "vitest";

import { mapViatorToEngine6PageData } from "./mapViatorToEngine6PageData";

describe("mapViatorToEngine6PageData", () => {
  it("prefers first non-zero price path and captures field-path audit", () => {
    const page = mapViatorToEngine6PageData({
      title: "Private Tour: Hawaii Volcanoes National Park Eco Tour",
      pricing: {
        summary: {
          fromPrice: 245,
          currency: "USD",
        },
      },
      reviews: {
        combinedAverageRating: 4.8,
        totalReviews: 137,
      },
      itinerary: {
        itineraryItems: [
          {
            title: "Volcanoes National Park",
            description: "Explore craters and lava fields.",
          },
        ],
      },
      description: "A private eco tour on Hawaii island.",
      meetingPoint: {
        description: "Hotel pickup in Hilo.",
        name: "Hilo Hotel Pickup",
      },
      cancellationPolicy: {
        description: "Free cancellation up to 24 hours before start time.",
      },
      duration: "8 hours",
    });

    expect(page.fromPrice).toBe(245);
    expect(page.fieldPathAudit.pricePath).toBe("pricing.summary.fromPrice");
    expect(page.fieldPathAudit.ratingPath).toBe("reviews.combinedAverageRating");
    expect(page.fieldPathAudit.reviewCountPath).toBe("reviews.totalReviews");
    expect(page.fieldPathAudit.itineraryPath).toBe("itinerary.itineraryItems");
  });

  it("throws when only zero-priced fields are present", () => {
    expect(() =>
      mapViatorToEngine6PageData({
        title: "Private Tour: Hawaii Volcanoes National Park Eco Tour",
        pricing: {
          summary: {
            fromPrice: 0,
          },
        },
        fromPrice: 0,
      })
    ).toThrow("Unable to resolve a non-zero commercial price from Viator payload.");
  });
});
