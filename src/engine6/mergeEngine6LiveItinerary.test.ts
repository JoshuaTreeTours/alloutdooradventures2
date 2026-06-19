import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import specimen276551p2Payload from "../../data/engine6/viator/276551P2.exact-product.json";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import {
  mergeEngine6NativeItineraryWithLive,
  resolveEngine6MergedItineraryTitle,
} from "./mergeEngine6LiveItinerary";
import type { Engine6ApiResponse } from "./types";

const EXPECTED_276551P2_TITLES = [
  "French Quarter",
  "St. Louis Cathedral",
  "Jackson Square",
  "Royal Street",
  "Lafitte's Blacksmith Shop Bar",
  "Central Business District",
  "Congo Square",
  "Treme",
  "Frenchmen Street",
  "Mississippi River",
  "Garden District",
  "Lafayette Cemetery No. 1",
] as const;

const toNative276551P2Tour = () => {
  const extraction = extractEngine6Product(specimen276551p2Payload);
  const payload: Engine6ApiResponse = {
    source: "bundled-fallback",
    rawProductCode: "276551P2",
    rawProduct: extraction.product,
    diagnostics: {
      source: "bundled-fallback",
      hasViatorApiKey: false,
      attemptedLiveFetch: false,
      upstreamStatus: null,
      upstreamContentType: "application/json fixture",
      upstreamOk: null,
      usedBundledFallbackBecause: "merge-engine6-live-itinerary-test",
      ...extraction.diagnostics,
      bookingUrlSource:
        extraction.diagnostics.productUrlFieldPath ??
        "generated:viator-search-product-code",
      fieldLevelFallbackUsed: false,
      fallbackFieldNames: [],
    },
    extracted: extraction.extracted,
  };

  return mapViatorToEngine6Tour(payload);
};

describe("resolveEngine6MergedItineraryTitle", () => {
  it("keeps bundled/native titles over description-inferred live titles", () => {
    expect(
      resolveEngine6MergedItineraryTitle(
        { title: "Lafitte's Blacksmith Shop Bar" },
        {
          title: "One of the oldest bars in the US",
          titleSource: "description-inferred",
        }
      )
    ).toBe("Lafitte's Blacksmith Shop Bar");
  });

  it("uses live explicit titles only when native title is missing", () => {
    expect(
      resolveEngine6MergedItineraryTitle(undefined, {
        title: "Royal Street",
        titleSource: "explicit",
      })
    ).toBe("Royal Street");
  });
});

describe("mergeEngine6NativeItineraryWithLive", () => {
  it("preserves 276551P2 bundled titles while allowing live metadata updates", () => {
    const nativeTour = toNative276551P2Tour();
    expect(nativeTour.itinerary.map(item => item.title)).toEqual([
      ...EXPECTED_276551P2_TITLES,
    ]);

    const liveItinerary = nativeTour.itinerary.map((item, index) => ({
      ...item,
      title:
        [
          "This",
          "Filled with the city's best restaurants, shops, and art galleries",
          "Jackson Square is the historic center of New Orleans",
          "Filled with the city's best restaurants, shops, and art galleries",
          "One of the oldest bars in the US",
          "Central Business District",
          "Congo Square is a historic gathering place",
          "Treme is a historic neighborhood",
          "Frenchmen Street is known for live music",
          "Mississippi River",
          "Garden District",
          "Lafayette Cemetery No. 1",
        ][index] ?? item.title,
      titleSource: "description-inferred" as const,
      description: `Live refreshed description for stop ${index + 1}.`,
      duration: item.duration ?? "5 minutes",
    }));

    const merged = mergeEngine6NativeItineraryWithLive(
      nativeTour.itinerary,
      liveItinerary
    );

    expect(merged.map(item => item.title)).toEqual([...EXPECTED_276551P2_TITLES]);
    expect(merged[4]?.description).toBe("Live refreshed description for stop 5.");
    expect(merged[3]?.description).toBe("Live refreshed description for stop 4.");
  });

  it("marks live Partner API rows as description-inferred when no explicit title exists", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "276551P2",
        title: "New Orleans City Bike Tour",
        itinerary: {
          itineraryItems: [
            {
              description:
                "One of the oldest bars in the US is located in the French Quarter.",
            },
          ],
        },
      },
    } as Record<string, unknown>);

    expect(result.extracted.itinerary[0]).toMatchObject({
      title: "One of the oldest bars in the US",
      titleSource: "description-inferred",
    });
  });
});
