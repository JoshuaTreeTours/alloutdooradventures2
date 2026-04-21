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
    expect(result.extracted.priceFormatted).toBe("From $39.50");
    expect(result.diagnostics.commercialPriceFieldPath).toContain(
      "product.pricingInfo"
    );
    expect(result.extracted.durationText).toBe("1 hour");
  });

  it("extracts price, itinerary stops, and meeting context from logistics-array payloads", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "3885GRINDEL_ZUR",
        title: "Grindelwald, Interlaken & Lauterbrunnen Day Trip from Zurich",
        location: { city: "Zurich", state: "Switzerland" },
        description:
          "Travel from Zurich on a fully guided day trip to the Swiss villages of Grindelwald, Interlaken, and Lauterbrunnen.",
        pricingInfo: {
          summary: { fromPriceFormatted: "From $123.00" },
        },
        logistics: {
          start: [
            {
              description:
                "The official departure point for all tours departing from Zurich is Sihlquai Bus Station, near Zurich main train station.",
            },
          ],
        },
        itinerary: {
          itineraryItems: [
            {
              description:
                "Begin your journey in Zurich as you board a comfortable coach.",
              passByWithoutStopping: true,
            },
            {
              description:
                "Arrive in Interlaken, where you'll enjoy some leisure time.",
              passByWithoutStopping: false,
            },
            {
              description:
                "Next, continue to Grindelwald for alpine free time.",
              passByWithoutStopping: false,
            },
            {
              description:
                "Final stop: Lauterbrunnen with views of the waterfalls.",
              passByWithoutStopping: false,
            },
          ],
        },
      },
    });

    expect(result.extracted.priceAmount).toBe(123);
    expect(result.extracted.priceFormatted).toBe("From $123.00");
    expect(result.extracted.itinerary.length).toBeGreaterThanOrEqual(3);
    expect(result.extracted.itinerary[0]?.title).toBeTruthy();
    expect(result.extracted.meetingPointText).toContain("Zurich");
    expect(result.diagnostics.meetingPointFieldPath).toBe(
      "product.logistics.start[0].description"
    );
  });
});
