import { describe, expect, it, vi } from "vitest";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import specimen233384p2Payload from "../../data/engine6/viator/233384P2.exact-product.json";
import * as bundledRawProductLookup from "./bundledRawProductLookup";
import {
  getEngine6ItineraryMergeMode,
  mergeEngine6NativeItineraryWithLive,
  type Engine6LiveItineraryItem,
} from "./mergeEngine6LiveItinerary";

const EXPLICIT_BUNDLED_RAW_PRODUCT = extractEngine6Product(
  specimen233384p2Payload
).product as Record<string, unknown>;

const BUNDLED_233384P2_POSITIONAL_TITLES = (
  specimen233384p2Payload as {
    product: { itineraryItems: Array<{ title: string }> };
  }
).product.itineraryItems.map(item => item.title);

const PRODUCTION_LIVE_PROSE_BY_INDEX: Record<number, string> = {
  0: "Historic park where General George Washington read the Declaration of Independence, surrounded by City Hall",
  1: "John Augustus Roebling's masterpiece combines engineering and art",
  2: "The Promenade of Brooklyn Heights is bar none one of the most scenic walkways in NYC",
  3: "NYC's newest park sits beneath the bridge",
  4: "DUMBO was once a bustling hub of industry along the East River",
  5: "Brooklyn Navy Yard working waterfront history",
};

const buildNeutralNativeItinerary = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    title: `Itinerary Stop ${index + 1}`,
    titleSource: "explicit" as const,
    description: `Native bundled description for stop ${index + 1}.`,
  }));

const buildDescriptionInferredLiveItinerary = (
  count: number,
  proseByIndex: Record<number, string> = PRODUCTION_LIVE_PROSE_BY_INDEX
): Engine6LiveItineraryItem[] =>
  Array.from({ length: count }, (_, index) => ({
    title:
      proseByIndex[index] ??
      `Discover supplier prose stop ${index + 1} with guided commentary`,
    titleSource: "description-inferred" as const,
    description: `Live refreshed description for stop ${index + 1}.`,
  }));

const buildPartialLiveRawProduct = () => ({
  itineraryItems: [
    { title: "City Hall Area" },
    { title: "Brooklyn Bridge" },
  ],
});

describe("mergeEngine6NativeItineraryWithLive 233384P2 title guard", () => {
  it("uses explicit bundledRawProduct from the render path over live prose", () => {
    const lookupSpy = vi
      .spyOn(bundledRawProductLookup, "getEngine6BundledRawProductByProductCode")
      .mockReturnValue(null);

    const nativeItinerary = buildNeutralNativeItinerary(
      BUNDLED_233384P2_POSITIONAL_TITLES.length
    );
    const liveItinerary = buildDescriptionInferredLiveItinerary(8);

    const merged = mergeEngine6NativeItineraryWithLive(
      nativeItinerary,
      liveItinerary,
      {
        productCode: "233384P2",
        rawProduct: buildPartialLiveRawProduct(),
        bundledRawProduct: EXPLICIT_BUNDLED_RAW_PRODUCT,
      }
    );

    expect(lookupSpy).not.toHaveBeenCalled();
    expect(
      merged
        .slice(0, BUNDLED_233384P2_POSITIONAL_TITLES.length)
        .map(item => item.title)
    ).toEqual(BUNDLED_233384P2_POSITIONAL_TITLES);

    lookupSpy.mockRestore();
  });

  it("uses every bundled positional POI title over description-only live rows", () => {
    const nativeItinerary = buildNeutralNativeItinerary(
      BUNDLED_233384P2_POSITIONAL_TITLES.length
    );
    const liveItinerary = buildDescriptionInferredLiveItinerary(8);

    expect(getEngine6ItineraryMergeMode(nativeItinerary, liveItinerary)).toBe(
      "diverged"
    );

    const merged = mergeEngine6NativeItineraryWithLive(
      nativeItinerary,
      liveItinerary,
      {
        productCode: "233384P2",
        rawProduct: buildPartialLiveRawProduct(),
      }
    );

    expect(
      merged
        .slice(0, BUNDLED_233384P2_POSITIONAL_TITLES.length)
        .map(item => item.title)
    ).toEqual(BUNDLED_233384P2_POSITIONAL_TITLES);

    expect(
      merged
        .slice(0, BUNDLED_233384P2_POSITIONAL_TITLES.length)
        .some(item => /^Itinerary Stop \d+$/.test(item.title))
    ).toBe(false);

    expect(
      merged
        .slice(0, BUNDLED_233384P2_POSITIONAL_TITLES.length)
        .some(item =>
          BUNDLED_233384P2_POSITIONAL_TITLES.every(
            bundledTitle => bundledTitle !== item.title
          )
        )
    ).toBe(false);
  });

  it("uses bundled positional titles in aligned merge when live rows are description-only", () => {
    const nativeItinerary = buildNeutralNativeItinerary(
      BUNDLED_233384P2_POSITIONAL_TITLES.length
    );
    const liveItinerary = buildDescriptionInferredLiveItinerary(
      BUNDLED_233384P2_POSITIONAL_TITLES.length
    );

    expect(getEngine6ItineraryMergeMode(nativeItinerary, liveItinerary)).toBe(
      "aligned"
    );

    const merged = mergeEngine6NativeItineraryWithLive(
      nativeItinerary,
      liveItinerary,
      {
        productCode: "233384P2",
        rawProduct: buildPartialLiveRawProduct(),
      }
    );

    expect(merged.map(item => item.title)).toEqual(
      BUNDLED_233384P2_POSITIONAL_TITLES
    );
  });

  it("keeps bundled positional titles when native registry already extracted POI names", () => {
    const nativeItinerary = extractEngine6Product(
      specimen233384p2Payload
    ).extracted.itinerary;
    const liveItinerary = buildDescriptionInferredLiveItinerary(8);

    const merged = mergeEngine6NativeItineraryWithLive(
      nativeItinerary,
      liveItinerary,
      { productCode: "233384P2" }
    );

    expect(
      merged
        .slice(0, BUNDLED_233384P2_POSITIONAL_TITLES.length)
        .map(item => item.title)
    ).toEqual(BUNDLED_233384P2_POSITIONAL_TITLES);
  });
});
