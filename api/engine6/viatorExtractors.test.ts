import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "./viatorExtractors";

describe("extractEngine6Product itinerary fidelity", () => {
  it("prefers granular structured stops over generic itinerary titles", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "5614063P8",
        title: "Washington D.C. Tour from New York",
        location: { city: "New York", state: "New York" },
        itinerary: {
          days: [
            {
              items: [
                {
                  title: "Washington, D.C. Landmarks",
                  pointOfInterestLocation: {
                    locationName: "Delaware Memorial Bridge (Pass By)",
                  },
                  isPassBy: true,
                  duration: "10 minutes",
                  admissionIncluded: true,
                },
                {
                  title: "Washington, D.C. Landmarks",
                  pointOfInterestLocation: { locationName: "White House" },
                  description: "Photo stop and exterior views.",
                  duration: "20 minutes",
                  admissionNote: "Admission Ticket Free",
                },
              ],
            },
          ],
        },
        itinerarySummary: "Generic summary that should not override stops.",
      },
    });

    expect(result.extracted.itinerary).toHaveLength(2);
    expect(result.extracted.itinerary[0]).toEqual(
      expect.objectContaining({
        title: "Delaware Memorial Bridge",
        stopType: "pass-by",
        duration: "10 minutes",
        admissionNote: "Admission Included",
      })
    );
    expect(result.extracted.itinerary[1]).toEqual(
      expect.objectContaining({
        title: "White House",
        stopType: "stop",
        description: "Photo stop and exterior views.",
        duration: "20 minutes",
        admissionNote: "Admission Ticket Free",
      })
    );
    expect(result.diagnostics.itinerarySourceUsed).toBe("product.itinerary.days");
  });

  it("normalizes alternate Viator price and duration shapes", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "ALT6400",
        title: "Short Scenic Cruise",
        location: { city: "Lucerne", state: "Switzerland" },
        pricingInfo: {
          type: "PER_PERSON",
          productPrice: { amount: 39.5 },
        },
        itinerary: {
          duration: { fixedDurationInMinutes: 60 },
          itineraryItems: [
            {
              title: "Lake Lucerne",
              description: "Short scenic catamaran route.",
            },
          ],
        },
      },
    });

    expect(result.extracted.priceAmount).toBe(39.5);
    expect(result.extracted.priceFormatted).toBe("Starting at $39.50");
    expect(result.diagnostics.commercialPriceFieldPath).toContain(
      "product.pricingInfo"
    );
    expect(result.extracted.durationText).toBe("1 hour");
  });
});
