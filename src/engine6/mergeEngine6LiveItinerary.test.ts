import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import specimen276551p2Payload from "../../data/engine6/viator/276551P2.exact-product.json";
import specimen411138p3Payload from "../../data/engine6/viator/411138P3.exact-product.json";
import specimen53474p8Payload from "../../data/engine6/viator/53474P8.exact-product.json";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import {
  detectEngine6ItineraryCompositionDivergence,
  fuzzyMatchEngine6ItineraryStopTitles,
  getEngine6ItineraryMergeMode,
  mergeEngine6NativeItineraryWithLive,
  resolveEngine6DivergedMergedItineraryTitle,
  resolveEngine6MergedItineraryTitle,
} from "./mergeEngine6LiveItinerary";
import type { Engine6ApiResponse, Engine6ItineraryItem } from "./types";
import type { Engine6LiveItineraryItem } from "./mergeEngine6LiveItinerary";

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

const toNativeTourFromFixture = (fixture: Record<string, unknown>) => {
  const extraction = extractEngine6Product(fixture);
  const productCode =
    typeof extraction.product?.productCode === "string"
      ? extraction.product.productCode
      : "UNKNOWN";

  const payload: Engine6ApiResponse = {
    source: "bundled-fallback",
    rawProductCode: productCode,
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

const toNative276551P2Tour = () =>
  toNativeTourFromFixture(specimen276551p2Payload as Record<string, unknown>);

const toNative411138P3Tour = () =>
  toNativeTourFromFixture(specimen411138p3Payload as Record<string, unknown>);

const toNative53474P8Tour = () =>
  toNativeTourFromFixture(specimen53474p8Payload as Record<string, unknown>);

describe("fuzzyMatchEngine6ItineraryStopTitles", () => {
  it("matches related greenbelt and trail names at the same stop", () => {
    expect(
      fuzzyMatchEngine6ItineraryStopTitles(
        "Campbell Creek Greenbelt",
        "Campbell Creek Trail"
      )
    ).toBe(true);
  });

  it("does not match unrelated stops", () => {
    expect(
      fuzzyMatchEngine6ItineraryStopTitles(
        "Turnagain Arm Drive",
        "Explorer Glacier"
      )
    ).toBe(false);
  });
});

describe("detectEngine6ItineraryCompositionDivergence", () => {
  it("detects length mismatch as diverged", () => {
    const native: Engine6ItineraryItem[] = [
      { title: "Anchorage" },
      { title: "Earthquake Park" },
    ];
    const live: Engine6LiveItineraryItem[] = [
      { title: "Anchorage", titleSource: "description-inferred" },
      { title: "Beluga Point", titleSource: "description-inferred" },
      { title: "AWCC", titleSource: "description-inferred" },
    ];

    expect(
      detectEngine6ItineraryCompositionDivergence(native, live)
    ).toEqual({
      diverged: true,
      reasons: ["itinerary-length-mismatch:native=2,live=3"],
    });
  });

  it("keeps same-length description-inferred live rows aligned", () => {
    const native: Engine6ItineraryItem[] = [
      { title: "French Quarter" },
      { title: "Royal Street" },
    ];
    const live: Engine6LiveItineraryItem[] = [
      { title: "This", titleSource: "description-inferred" },
      { title: "Filled with shops", titleSource: "description-inferred" },
    ];

    expect(getEngine6ItineraryMergeMode(native, live)).toBe("aligned");
  });

  it("keeps 53474P8 aligned when authoritative live titles fuzzy-match native", () => {
    const native = toNative53474P8Tour().itinerary;
    const live: Engine6LiveItineraryItem[] = native.map((item, index) => ({
      ...item,
      title:
        [
          "Campbell Creek Trail",
          "Chester Creek Trail",
          "Westchester Lagoon",
          "Earthquake Park",
          "Jutting out into Cook Inlet on the western tip of Anchorage, Kincaid Park is one of the largest in the city",
          "Point Woronzof overlook",
          "The Tony Knowles Coastal Trail follows the shore of Cook Inlet",
        ][index] ?? item.title,
      titleSource:
        index <= 3 ? ("product-override" as const) : ("description-inferred" as const),
    }));

    expect(getEngine6ItineraryMergeMode(native, live)).toBe("aligned");
  });

  it("marks 411138P3 as diverged when live adds rows", () => {
    const native = toNative411138P3Tour().itinerary;
    const live: Engine6LiveItineraryItem[] = Array.from({ length: 9 }, (_, index) => ({
      title: `Live stop ${index + 1}`,
      titleSource: "description-inferred" as const,
    }));

    expect(getEngine6ItineraryMergeMode(native, live)).toBe("diverged");
  });
});

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

describe("resolveEngine6DivergedMergedItineraryTitle", () => {
  it("prefers live titles when native and live refer to different stops", () => {
    expect(
      resolveEngine6DivergedMergedItineraryTitle(
        { title: "Turnagain Arm Drive" },
        {
          title: "Explorer Glacier",
          titleSource: "description-inferred",
        }
      )
    ).toBe("Explorer Glacier");
  });

  it("keeps native titles when the stop clearly matches", () => {
    expect(
      resolveEngine6DivergedMergedItineraryTitle(
        { title: "Girdwood" },
        {
          title: "Girdwood",
          titleSource: "product-override",
        }
      )
    ).toBe("Girdwood");
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

    expect(getEngine6ItineraryMergeMode(nativeTour.itinerary, liveItinerary)).toBe(
      "aligned"
    );

    const merged = mergeEngine6NativeItineraryWithLive(
      nativeTour.itinerary,
      liveItinerary
    );

    expect(merged.map(item => item.title)).toEqual([...EXPECTED_276551P2_TITLES]);
    expect(merged[4]?.description).toBe("Live refreshed description for stop 5.");
    expect(merged[3]?.description).toBe("Live refreshed description for stop 4.");
  });

  it("uses diverged mode for 411138P3 and stops native titles from blocking new live rows", () => {
    const native = toNative411138P3Tour().itinerary;
    const live: Engine6LiveItineraryItem[] = [
      {
        title: "Downtown Anchorage",
        titleSource: "description-inferred",
        description: "Pickup in Anchorage.",
      },
      {
        title: "Beluga point is just south of Anchorage on the Turnagain Arm",
        titleSource: "description-inferred",
      },
      {
        title:
          "After Beluga Point, we stop at the Alaska Wildlife Conservation Center",
        titleSource: "description-inferred",
      },
      {
        title: "Turnagain Arm",
        titleSource: "description-inferred",
      },
      {
        title: "Girdwood",
        titleSource: "product-override",
      },
      {
        title: "Explorer Glacier",
        titleSource: "description-inferred",
      },
      {
        title: "Seasonal Self-Guided walk to the foot of the stunning Byron Glacier",
        titleSource: "description-inferred",
      },
      {
        title:
          "Enjoy selective viewpoints and stops to experience and photograph eagles, mountain goats, whales and beautiful scenery",
        titleSource: "description-inferred",
      },
      {
        title: "Home to 130 bird species",
        titleSource: "description-inferred",
      },
    ];

    expect(getEngine6ItineraryMergeMode(native, live)).toBe("diverged");

    const merged = mergeEngine6NativeItineraryWithLive(native, live);

    expect(merged).toHaveLength(9);
    expect(merged[4]?.title).toBe("Girdwood");
    expect(merged[5]?.title).toBe("Explorer Glacier");
    expect(merged[5]?.title).not.toBe("Turnagain Arm Drive");
    expect(merged[6]?.title).toContain("Byron Glacier");
  });

  it("keeps 53474P8 in aligned mode and preserves native titles over inferred live prose", () => {
    const native = toNative53474P8Tour().itinerary;
    const live: Engine6LiveItineraryItem[] = native.map((item, index) => ({
      ...item,
      title:
        [
          "Campbell Creek Trail",
          "Chester Creek Trail",
          "Westchester Lagoon",
          "Earthquake Park",
          "Jutting out into Cook Inlet on the western tip of Anchorage, Kincaid Park is one of the largest in the city",
          "There's a good reason why Anchorage was once called Air Crossroads of the World",
          "The Tony Knowles Coastal Trail follows the shore of Cook Inlet from Downtown Anchorage to Kincaid Park",
        ][index] ?? item.title,
      titleSource:
        index <= 3 ? ("product-override" as const) : ("description-inferred" as const),
      description: `Live refreshed description for stop ${index + 1}.`,
    }));

    expect(getEngine6ItineraryMergeMode(native, live)).toBe("aligned");

    const merged = mergeEngine6NativeItineraryWithLive(native, live);

    expect(merged.map(item => item.title)).toEqual([
      "Campbell Creek Greenbelt",
      "Chester Creek Greenbelt",
      "Westchester Lagoon",
      "Earthquake Park",
      "Kincaid Park",
      "Point Woronzof",
      "Tony Knowles Coastal Trail",
    ]);
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
