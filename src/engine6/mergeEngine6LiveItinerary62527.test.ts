import { describe, expect, it } from "vitest";

import {
  getEngine6ItineraryMergeMode,
  mergeEngine6NativeItineraryWithLive,
  type Engine6LiveItineraryItem,
} from "./mergeEngine6LiveItinerary";

const EXPECTED_62527P11_VIATOR_PUBLIC_JSON_LD_TITLES = [
  "Midtown Manhattan Departure",
  "Niagara Falls State Park",
  "Maid of the Mist",
  "Niagara Falls Observation Tower",
  "Prospect Point",
  "Luna Island",
  "Bridal Veil Falls",
  "Goat Island",
  "Horseshoe Falls",
] as const;

const buildBundledNativeItinerary = () => [
  {
    title: "Midtown Manhattan Departure",
    titleSource: "explicit" as const,
    description: "Depart Midtown Manhattan for the day trip north.",
  },
  {
    title: "Niagara Falls",
    titleSource: "explicit" as const,
    description: "Spend time at the falls and surrounding viewpoints.",
  },
];

const buildDescriptionInferredLiveItinerary = (): Engine6LiveItineraryItem[] =>
  [
    "You will travel on a comfortable motor coach, with your bilingual tour guide, enjoying the scenic landscape of upstate New York",
    "If you have selected the tour that includes this option, you will board the historic the Maid of the Mist boat to go on a ride through the waters of Niagara Falls",
    "Once the boat ride is over, your guide will head to the Observation Tower, as it is the unique way of exiting, from which you will be able to admire beautiful view of the falls",
    "This is the nearest lookout from which the American Falls can be seen",
    "Then you will visit this small island, which is located in between The American and Bridal Falls",
    "It is the smallest of the three waterfalls that make up Niagara Falls",
    "This island is considered the natural border between Canada and the United States, and here we can find a terrasse built to comfortably see Horseshoe Fall",
    "From here you can clearly see the Horseshoe Falls from the USA side of Niagara Falls",
    "Horseshoe Falls is considered the most impressive of the three falls",
  ].map(description => ({
    title: description.split(/(?<=[.!?])\s+/)[0]?.replace(/[.!?]+$/, "").trim() ?? description,
    titleSource: "description-inferred" as const,
    description,
  }));

describe("mergeEngine6NativeItineraryWithLive 62527P11 title guard", () => {
  it("uses reviewed Viator public JSON-LD stop names over description-only live rows", () => {
    const nativeItinerary = buildBundledNativeItinerary();
    const liveItinerary = buildDescriptionInferredLiveItinerary();

    expect(getEngine6ItineraryMergeMode(nativeItinerary, liveItinerary)).toBe(
      "diverged"
    );

    const merged = mergeEngine6NativeItineraryWithLive(
      nativeItinerary,
      liveItinerary,
      { productCode: "62527P11" }
    );

    expect(merged.map(item => item.title)).toEqual([
      ...EXPECTED_62527P11_VIATOR_PUBLIC_JSON_LD_TITLES,
    ]);
    expect(
      merged.some(item => /^(This|Once the boat ride is over)/i.test(item.title))
    ).toBe(false);
  });
});
