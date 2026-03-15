import { describe, expect, it } from "vitest";

import { mapViatorToEngine6PageData } from "./mapViatorToEngine6PageData";

describe("mapViatorToEngine6PageData", () => {
  it("uses pricingInfo.summary.fromPrice when present", () => {
    const page = mapViatorToEngine6PageData({
      title: "Private Tour: Hawaii Volcanoes National Park Eco Tour",
      pricingInfo: {
        summary: {
          fromPrice: 311.04,
          currencyCode: "USD",
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

    expect(page.fromPrice).toBe(311.04);
    expect(page.currency).toBe("USD");
    expect(page.fieldPathAudit.pricePath).toBe("pricingInfo.summary.fromPrice");
    expect(page.fieldPathAudit.ratingPath).toBe("reviews.combinedAverageRating");
    expect(page.fieldPathAudit.reviewCountPath).toBe("reviews.totalReviews");
    expect(page.fieldPathAudit.itineraryPath).toBe("itinerary.itineraryItems");
  });

  it("falls back to nested pricingInfo commercial retail price when summary is zero", () => {
    const page = mapViatorToEngine6PageData({
      pricingInfo: {
        summary: {
          fromPrice: 0,
          currencyCode: "USD",
        },
        pricingDetails: [
          {
            pricingPackage: {
              ageBandPrices: [
                {
                  ageBand: "ADULT",
                  price: {
                    recommendedRetailPrice: 259,
                    partnerNetPrice: 205,
                  },
                },
              ],
            },
          },
        ],
      },
      description: "Overview",
    });

    expect(page.fromPrice).toBe(259);
    expect(page.fieldPathAudit.pricePath).toBe(
      "pricingInfo.pricingDetails.0.pricingPackage.ageBandPrices.0.price.recommendedRetailPrice"
    );
  });

  it("throws when only zero-priced fields are present", () => {
    expect(() =>
      mapViatorToEngine6PageData({
        title: "Private Tour: Hawaii Volcanoes National Park Eco Tour",
        pricingInfo: {
          summary: {
            fromPrice: 0,
          },
        },
        fromPrice: 0,
      })
    ).toThrow("Unable to resolve a non-zero commercial price from Viator payload.");
  });
});
