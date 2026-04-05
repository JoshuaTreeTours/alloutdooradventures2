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
    expect(result.diagnostics.itinerarySourceUsed).toBe(
      "product.itinerary.days"
    );
  });
});

describe("extractEngine6Product authoritative hero lock", () => {
  it("locks configured product hero to supplied authoritative URL", () => {
    const authoritativeUrl =
      "https://dynamic-media.tacdn.com/media/photo-o/2e/b8/6a/2d/caption.jpg?w=700&h=500&s=1";

    const result = extractEngine6Product({
      product: {
        productCode: "315439P1",
        productUrl:
          "https://www.viator.com/tours/New-York-City/Horse-and-Carriage-Rides-through-Central-Park-NYC/d687-315439P1",
        media: {
          images: [
            {
              variants: {
                CAPTION: {
                  url: "https://dynamic-media.tacdn.com/media/photo-o/aa/bb/cc/dd/caption.jpg?w=1400&h=900&s=1",
                  width: 1400,
                  height: 900,
                },
              },
            },
            {
              variants: {
                CAPTION: {
                  url: authoritativeUrl,
                  width: 700,
                  height: 500,
                },
              },
            },
          ],
        },
      },
    });

    expect(result.extracted.heroImageUrl).toBe(authoritativeUrl);
    expect(result.diagnostics.finalHeroUrl).toBe(authoritativeUrl);
    expect(result.diagnostics.heroSourceFieldPath).toContain(
      "product.media.images"
    );
  });
});
