import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import specimen233384p2Payload from "../../data/engine6/viator/233384P2.exact-product.json";
import {
  getEngine6ItineraryMergeMode,
  mergeEngine6NativeItineraryWithLive,
  type Engine6LiveItineraryItem,
} from "./mergeEngine6LiveItinerary";

const EXPECTED_233384P2_RENDERED_TITLES = [
  "City Hall Area",
  "Brooklyn Bridge",
  "Brooklyn Heights Promenade",
  "Brooklyn Bridge Park",
  "DUMBO",
] as const;

const toNative233384P2Itinerary = () =>
  extractEngine6Product(specimen233384p2Payload).extracted.itinerary;

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
  it("resolves bundled positional titles when hydration only passes productCode", () => {
    const nativeItinerary = buildNeutralNativeItinerary(6);
    const liveItinerary = buildDescriptionInferredLiveItinerary(8, {
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

    expect(merged.slice(0, 5).map(item => item.title)).toEqual([
      ...EXPECTED_233384P2_RENDERED_TITLES,
    ]);
    expect(
      merged
        .slice(0, 5)
        .some(item => /^Itinerary Stop \d+$/.test(item.title))
    ).toBe(false);
  });

  it("keeps native Brooklyn Bridge Park over description-inferred live title", () => {
    const nativeItinerary = toNative233384P2Itinerary();
    const liveItinerary = nativeItinerary.map((item, index) => ({
      ...item,
      title:
        index === 3 ? "NYC's newest park sits beneath the bridge" : item.title,
      titleSource: "description-inferred" as const,
      description: `Live refreshed description for stop ${index + 1}.`,
    }));

    const merged = mergeEngine6NativeItineraryWithLive(
      nativeItinerary,
      liveItinerary
    );

    expect(nativeItinerary[3]).toMatchObject({
      title: "Brooklyn Bridge Park",
      titleSource: "explicit",
    });
    expect(merged[3]).toMatchObject({
      title: "Brooklyn Bridge Park",
      description: "Live refreshed description for stop 4.",
    });
  });

  it("keeps native DUMBO over description-inferred live title", () => {
    const nativeItinerary = toNative233384P2Itinerary();
    const liveItinerary = nativeItinerary.map((item, index) => ({
      ...item,
      title: index === 4 ? "DUMBO was once a bustling hub..." : item.title,
      titleSource: "description-inferred" as const,
      description: `Live refreshed description for stop ${index + 1}.`,
    }));

    const merged = mergeEngine6NativeItineraryWithLive(
      nativeItinerary,
      liveItinerary
    );

    expect(nativeItinerary[4]).toMatchObject({
      title: "DUMBO",
      titleSource: "explicit",
    });
    expect(merged[4]).toMatchObject({
      title: "DUMBO",
      description: "Live refreshed description for stop 5.",
    });
  });
});
