import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import specimen233384p2Payload from "../../data/engine6/viator/233384P2.exact-product.json";
import { mergeEngine6NativeItineraryWithLive } from "./mergeEngine6LiveItinerary";

const toNative233384P2Itinerary = () =>
  extractEngine6Product(specimen233384p2Payload).extracted.itinerary;

describe("mergeEngine6NativeItineraryWithLive 233384P2 title guard", () => {
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
