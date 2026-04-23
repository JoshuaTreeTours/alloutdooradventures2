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
        description: "Stop at White House during the tour.",
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
    expect(result.extracted.priceFormatted).toBe("From $123");
    expect(result.extracted.itinerary.length).toBeGreaterThanOrEqual(3);
    expect(result.extracted.itinerary[0]?.title).toBeTruthy();
    expect(result.extracted.itinerary[1]?.title).toBeTruthy();
    expect(result.extracted.itinerary[2]?.title).toBeTruthy();
    expect(result.extracted.meetingPointText).toContain("Zurich");
    expect(result.diagnostics.meetingPointFieldPath).toBe(
      "product.logistics.start[0].description"
    );
  });

  it("does not truncate inferred itinerary titles derived from long description text", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "LONGTITLE1",
        title: "Long title itinerary test",
        location: { city: "Interlaken", state: "Switzerland" },
        itinerary: {
          itineraryItems: [
            {
              description:
                "Enjoy some leisure time exploring charming lakeside promenades and local cafes before departure.",
            },
          ],
        },
      },
    });

    expect(result.extracted.itinerary[0]?.title).toBe(
      "Enjoy some leisure time exploring charming lakeside promenades and local cafes before departure"
    );
  });

  it("prefers location.country when state is absent and infers city from logistics text", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "3885SW303BS",
        title: "Mount Titlis Day Tour from Zurich",
        location: { country: "Switzerland" },
        logistics: {
          start: [
            {
              description:
                "The official departure point for all tours departing from Zurich is Sihlquai Bus Station.",
            },
          ],
        },
      },
    });

    expect(result.extracted.city).toBe("Zurich");
    expect(result.extracted.state).toBe("Switzerland");
  });

  it("falls back to pricingInfo.price when pricing.summary.fromPrice is missing", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "3885SW303BS",
        title: "Mount Titlis Day Tour from Zurich",
        location: { city: "Zurich", country: "Switzerland" },
        pricingInfo: {
          type: "PER_PERSON",
          price: "$241.82",
        },
      },
    });

    expect(result.extracted.priceAmount).toBe(241.82);
    expect(result.extracted.priceFormatted).toBe("From $241.82");
    expect(result.diagnostics.commercialPriceFieldPath).toBe(
      "product.pricingInfo.price"
    );
  });

  it("keeps primary pricing.summary.fromPrice precedence over fallback fields", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "PRIMARY_PRICE_WINS",
        title: "Primary price precedence test",
        location: { city: "Zurich", country: "Switzerland" },
        pricing: {
          summary: {
            fromPrice: 199,
          },
        },
        pricingInfo: {
          fromPrice: 149,
          price: 129,
          amount: 125,
        },
      },
    });

    expect(result.extracted.priceAmount).toBe(199);
    expect(result.diagnostics.commercialPriceFieldPath).toBe(
      "product.pricing.summary.fromPrice"
    );
  });

  it("removes supplier prose from normalized itinerary descriptions", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "SUPPLIER_PROSE_TEST",
        title: "Supplier prose itinerary test",
        itinerary: {
          itineraryItems: [
            {
              title: "Zurich Main Station",
              description:
                "Your expert guide will take you on a journey and you will discover the city.",
            },
          ],
        },
      },
    });

    const description = result.extracted.itinerary[0]?.description ?? "";
    expect(description).not.toMatch(/expert guide/i);
    expect(description).not.toMatch(/you will/i);
    expect(description).not.toMatch(/take you on a journey/i);
  });

  it("rejects generic filler phrases in itinerary descriptions", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "GENERIC_FILLER_TEST",
        title: "Filler phrase test",
        itinerary: {
          itineraryItems: [
            {
              title: "Lake Zurich",
              description:
                "This stop covers the segment and provides route continuity with location context.",
            },
          ],
        },
      },
    });

    const description = result.extracted.itinerary[0]?.description ?? "";
    expect(description).not.toMatch(/route continuity/i);
    expect(description).not.toMatch(/location context/i);
    expect(description).not.toMatch(/covers the segment/i);
  });

  it("omits malformed itinerary titles built from filler tokens", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "MALFORMED_TITLE_TEST",
        title: "Malformed title itinerary test",
        itinerary: {
          itineraryItems: [
            { title: "Our Waterfront Segment Route Stop", description: "bad title" },
            { title: "With Waterfront Segment Route Stop", description: "bad title" },
            { title: "This Old Town Segment Route Stop", description: "bad title" },
            { title: "Zurich Old Town", description: "good title" },
          ],
        },
      },
    });

    expect(result.extracted.itinerary.map(item => item.title)).toEqual([
      "Zurich Old Town",
    ]);
  });

  it("always emits grounded non-empty itinerary descriptions", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "GROUNDED_DESC_TEST",
        title: "Grounded description test",
        itinerary: {
          itineraryItems: [{ title: "Central Park", passByWithoutStopping: true }],
        },
      },
    });

    const item = result.extracted.itinerary[0];
    expect(item?.description).toBeTruthy();
    expect(item?.description).toMatch(/Central Park/i);
    expect(item?.description).not.toMatch(/^(Pass By|Stop)$/i);
  });

  it("omits weak malformed source rows instead of hallucinating stops", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "WEAK_SIGNAL_TEST",
        title: "Weak signal itinerary test",
        itinerary: {
          itineraryItems: [
            { title: "With Segment Route Stop", description: "artifact" },
            { title: "Our Route Stop", description: "artifact" },
          ],
        },
      },
    });

    expect(result.extracted.itinerary).toEqual([]);
  });
});
