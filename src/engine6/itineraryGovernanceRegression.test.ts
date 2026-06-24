import { describe, expect, it } from "vitest";

import { isEngine6ProseItineraryTitle } from "../../api/engine6/divergedItineraryTitle";
import {
  auditEngine6ItineraryGovernanceRow,
} from "./itineraryGovernanceAudit";
import {
  ENGINE6_ITINERARY_GOVERNANCE_REGRESSION_PRODUCT_CODES,
} from "./itineraryGovernanceRegressionProducts";
import {
  getEngine6ItineraryMergeMode,
  mergeEngine6NativeItineraryWithLive,
  type Engine6LiveItineraryItem,
} from "./mergeEngine6LiveItinerary";
import { engine6ResolvedTours } from "./registry";

const buildPortlandMisalignedLiveItinerary = (): Engine6LiveItineraryItem[] => [
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

describe("Engine6 itinerary governance regression cohort", () => {
  it("covers the permanent governance product list", () => {
    expect(ENGINE6_ITINERARY_GOVERNANCE_REGRESSION_PRODUCT_CODES).toEqual(
      expect.arrayContaining([
        "411138P3",
        "233384P2",
        "62527P11",
        "3454YE3D",
        "5516ST5",
        "378720P1",
        "5765P14",
      ])
    );
  });

  it.each([
    "233384P2",
    "62527P11",
    "3454YE3D",
    "378720P1",
    "5765P14",
  ] as const)("uses non-prose native titles for %s", productCode => {
    const tour = engine6ResolvedTours.find(
      entry => entry.productCode === productCode
    );
    expect(tour, `missing resolved tour for ${productCode}`).toBeDefined();

    tour!.itinerary.forEach((item, index) => {
      expect(
        isEngine6ProseItineraryTitle(item.title),
        `${productCode}[${index}] prose title: ${item.title}`
      ).toBe(false);
    });
  });

  it("blocks mixed-source diverged merge for 378720P1", () => {
    const nativeTour = engine6ResolvedTours.find(
      tour => tour.productCode === "378720P1"
    );
    expect(nativeTour).toBeDefined();

    const liveItinerary = buildPortlandMisalignedLiveItinerary();
    expect(getEngine6ItineraryMergeMode(nativeTour!.itinerary, liveItinerary)).toBe(
      "diverged"
    );

    const merged = mergeEngine6NativeItineraryWithLive(
      nativeTour!.itinerary,
      liveItinerary,
      { productCode: "378720P1" }
    );

    merged.forEach((item, index) => {
      const findings = auditEngine6ItineraryGovernanceRow({
        item,
        index,
        nativeItem: nativeTour!.itinerary[index],
        liveItem: liveItinerary[index],
      });
      expect(
        findings.map(finding => finding.reason),
        `378720P1[${index}] mixed-source row`
      ).not.toContain("mixed-source-itinerary-row");
    });
  });
});

describe("auditEngine6ItineraryGovernanceRow", () => {
  it("flags title/description semantic mismatch", () => {
    const findings = auditEngine6ItineraryGovernanceRow({
      item: {
        title: "Old Town",
        description: "Walk among rose varieties in Washington Park.",
      },
      index: 0,
    });

    expect(findings.map(finding => finding.reason)).toContain(
      "title-description-semantic-mismatch"
    );
  });
});
