import { describe, expect, it } from "vitest";

import {
  getEngine6ItineraryMergeMode,
  mergeEngine6NativeItineraryWithLive,
  type Engine6LiveItineraryItem,
} from "./mergeEngine6LiveItinerary";

const EXPECTED_233384P2_VIATOR_PUBLIC_JSON_LD_TITLES = [
  "City Hall Park",
  "Brooklyn Bridge",
  "Brooklyn Heights",
  "Brooklyn Heights Promenade",
  "Brooklyn Bridge Park",
  "DUMBO",
  "Manhattan Bridge",
  "John V. Lindsay East River Park",
] as const;

const buildNeutralNativeItinerary = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    title: `Itinerary Stop ${index + 1}`,
    titleSource: "explicit" as const,
    description: `Native bundled description for stop ${index + 1}.`,
  }));

const buildDescriptionInferredLiveItinerary = (
  count: number,
  proseByIndex: Record<number, string> = {}
): Engine6LiveItineraryItem[] =>
  Array.from({ length: count }, (_, index) => ({
    title:
      proseByIndex[index] ??
      `Discover supplier prose stop ${index + 1} with guided commentary`,
    titleSource: "description-inferred" as const,
    description: `Live refreshed description for stop ${index + 1}.`,
  }));

describe("mergeEngine6NativeItineraryWithLive 233384P2 title guard", () => {
  it("uses reviewed Viator public JSON-LD stop names over description-only live rows", () => {
    const nativeItinerary = buildNeutralNativeItinerary(6);
    const liveItinerary = buildDescriptionInferredLiveItinerary(8, {
      0: "Historic park where General George Washington read the Declaration of Independence, surrounded by City Hall, Municipal Building, Tweed Courthouse, the Woolworth Building and other icons of the city",
      1: "John Augustus Roebling's masterpiece combines engineering and art",
      4: "NYC's newest park sits beneath the bridge",
    });

    expect(getEngine6ItineraryMergeMode(nativeItinerary, liveItinerary)).toBe(
      "diverged"
    );

    const merged = mergeEngine6NativeItineraryWithLive(
      nativeItinerary,
      liveItinerary,
      { productCode: "233384P2" }
    );

    expect(merged.map(item => item.title)).toEqual([
      ...EXPECTED_233384P2_VIATOR_PUBLIC_JSON_LD_TITLES,
    ]);
    expect(
      merged.some(item => /^Itinerary Stop \d+$/.test(item.title))
    ).toBe(false);
    expect(
      merged.some(item =>
        /General George Washington|masterpiece combines engineering/i.test(
          item.title
        )
      )
    ).toBe(false);
  });
});
