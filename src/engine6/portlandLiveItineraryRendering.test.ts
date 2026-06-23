import { describe, expect, it } from "vitest";

import {
  getEngine6ItineraryMergeMode,
  mergeEngine6NativeItineraryWithLive,
  type Engine6LiveItineraryItem,
} from "./mergeEngine6LiveItinerary";
import {
  ENGINE6_PORTLAND_CITY_OF_ROSES_ROUTE,
  isEngine6PortlandTourCanonicalPath,
} from "./routes";
import { engine6ResolvedTours } from "./registry";

const buildMisalignedLiveItinerary = (): Engine6LiveItineraryItem[] => [
  {
    title: "Downtown hotel pickup",
    description: "Board the Sprinter van from a downtown Portland hotel.",
    stopType: "stop",
    titleSource: "explicit",
  },
  {
    title:
      "Washington Park is home to several major Portland attractions including the zoo and museums.",
    description:
      "Walk among rose varieties in Washington Park when blooms are in season.",
    stopType: "stop",
    titleSource: "description-inferred",
  },
  {
    title:
      "The International Rose Test Garden features more than 550 rose varieties.",
    description:
      "Loading docks and cobblestone streets hint at this former warehouse district's past.",
    stopType: "pass-by",
    titleSource: "description-inferred",
  },
  {
    title: "Pearl District",
    description:
      "Whether you're looking to splash in Salmon Street Springs, Waterfront Park is the perfect place to take in the city.",
    stopType: "pass-by",
    titleSource: "explicit",
  },
  {
    title:
      "This 12-block greenspace stretches north through the heart of the city, intersected by the Portland Streetcar.",
    description:
      "Drive through one of Portland's popular shopping and dining corridors on NW 23rd Avenue.",
    stopType: "pass-by",
    titleSource: "description-inferred",
  },
  {
    title: "Return to downtown Portland",
    description:
      "Finish with drop-off at the original hotel pickup location in downtown Portland.",
    stopType: "pass-by",
    titleSource: "explicit",
  },
  {
    title:
      "Once a bustling highway, Tom McCall Waterfront Park now offers riverfront paths and skyline views.",
    description:
      "A very charming town and highly desirable neighborhood on the south shore of Oswego Lake.",
    stopType: "pass-by",
    titleSource: "description-inferred",
  },
];

describe("Portland Engine6 live itinerary rendering", () => {
  it("identifies the City of Roses route as a Portland tour path", () => {
    expect(isEngine6PortlandTourCanonicalPath(ENGINE6_PORTLAND_CITY_OF_ROSES_ROUTE)).toBe(
      true
    );
  });

  it("documents diverged live merge misalignment for 378720P1", () => {
    const nativeTour = engine6ResolvedTours.find(
      tour => tour.productCode === "378720P1"
    );
    expect(nativeTour).toBeDefined();

    const liveItinerary = buildMisalignedLiveItinerary();
    expect(getEngine6ItineraryMergeMode(nativeTour!.itinerary, liveItinerary)).toBe(
      "diverged"
    );

    const merged = mergeEngine6NativeItineraryWithLive(
      nativeTour!.itinerary,
      liveItinerary,
      { productCode: "378720P1" }
    );

    expect(merged[1]?.title).toBe("Old Town");
    expect(merged[1]?.description).toMatch(/Washington Park/i);
    expect(merged[2]?.title).toBe("Willamette River bridge crossing");
    expect(merged[2]?.description).not.toMatch(/Willamette River/i);
    expect(merged[4]?.title).toBe("International Rose Test Garden");
    expect(merged[4]?.description).toMatch(/NW 23rd/i);
    expect(
      merged.some(
        row =>
          row.title === "International Rose Test Garden" &&
          /NW 23rd/i.test(row.description ?? "")
      )
    ).toBe(true);
  });

  it("keeps fixture-native itinerary rows aligned when Portland merge is bypassed", () => {
    const nativeTour = engine6ResolvedTours.find(
      tour => tour.productCode === "378720P1"
    );
    expect(nativeTour).toBeDefined();

    for (const item of nativeTour!.itinerary) {
      if (item.title === "Old Town") {
        expect(item.description).toMatch(/historic district/i);
      }
      if (item.title === "Willamette River bridge crossing") {
        expect(item.description).toMatch(/Willamette River/i);
      }
      if (item.title === "International Rose Test Garden") {
        expect(item.description).toMatch(/rose varieties/i);
      }
    }
  });
});
