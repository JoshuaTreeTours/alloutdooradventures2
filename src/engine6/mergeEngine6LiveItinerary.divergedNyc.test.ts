import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { resolveEngine6DivergedItineraryTitle } from "../../api/engine6/itineraryTitlePolicy";
import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import specimen233384p2Payload from "../../data/engine6/viator/233384P2.exact-product.json";
import specimen474891p3Payload from "../../data/engine6/viator/474891P3.exact-product.json";
import {
  ENGINE6_NYC_BROOKLYN_BRIDGE_PRODUCT_CODE,
  ENGINE6_NYC_BROOKLYN_BRIDGE_ROUTE,
} from "./routes";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import {
  getEngine6ItineraryMergeMode,
  mergeEngine6NativeItineraryWithLive,
  type Engine6LiveItineraryItem,
} from "./mergeEngine6LiveItinerary";
import type { Engine6ApiResponse } from "./types";

const DIVERGED_NYC_PRODUCT_CODES = [
  "233384P2",
  "7081NYCDAY",
  "62527P11",
  "5250LIBERTYELLIS",
  "5614063P8",
  "3857PHI",
  "3156P13",
  "5024MANSKY",
] as const;

const EXPECTED_233384P2_NATIVE_TITLES = [
  "City Hall Area",
  "Brooklyn Bridge",
  "Brooklyn Heights Promenade",
  "Brooklyn Bridge Park",
  "DUMBO",
  "Brooklyn Navy Yard",
] as const;

const fixtureDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../data/engine6/viator"
);

const loadNativeItinerary = (productCode: string) => {
  const fixture = JSON.parse(
    readFileSync(path.join(fixtureDir, `${productCode}.exact-product.json`), "utf8")
  ) as Record<string, unknown>;
  const extraction = extractEngine6Product(fixture);
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
      usedBundledFallbackBecause: "diverged-nyc-title-report-test",
      ...extraction.diagnostics,
      bookingUrlSource:
        extraction.diagnostics.productUrlFieldPath ??
        "generated:viator-search-product-code",
      fieldLevelFallbackUsed: false,
      fallbackFieldNames: [],
    },
    extracted: extraction.extracted,
  };

  return mapViatorToEngine6Tour(payload).itinerary;
};

const loadBundledRawProduct = (productCode: string) => {
  const fixture = JSON.parse(
    readFileSync(path.join(fixtureDir, `${productCode}.exact-product.json`), "utf8")
  ) as Record<string, unknown>;
  return extractEngine6Product(fixture).product as Record<string, unknown>;
};

const buildDescriptionInferredLiveItinerary = (
  count: number,
  proseByIndex: Record<number, string> = {}
): Engine6LiveItineraryItem[] =>
  Array.from({ length: count }, (_, index) => ({
    title:
      proseByIndex[index] ??
      `Discover the charm of supplier prose stop ${index + 1} with guided commentary`,
    titleSource: "description-inferred" as const,
    description: `Live refreshed description for stop ${index + 1}.`,
  }));

const buildNeutralExplicitLiveItinerary = (
  count: number,
  proseByIndex: Record<number, string> = {}
): Engine6LiveItineraryItem[] =>
  Array.from({ length: count }, (_, index) => ({
    title:
      proseByIndex[index] ??
      `Itinerary Stop ${index + 1}`,
    titleSource: "explicit" as const,
    description: `Live refreshed description for stop ${index + 1}.`,
  }));

describe("diverged New York itinerary title authority", () => {
  it("classifies count-mismatch NYC products as diverged against live prose rows", () => {
    DIVERGED_NYC_PRODUCT_CODES.forEach(productCode => {
      const native = loadNativeItinerary(productCode);
      const live = buildDescriptionInferredLiveItinerary(native.length + 2);

      expect(getEngine6ItineraryMergeMode(native, live)).toBe("diverged");
    });
  });

  it("rejects description-inferred live titles when Partner rows expose structured POI names", () => {
    expect(
      resolveEngine6DivergedItineraryTitle({
        productCode: "233384P2",
        rawProduct: {
          itineraryItems: [
            {
              pointOfInterestLocation: { locationName: "Brooklyn Bridge Park" },
              description:
                "NYC's newest park sits beneath the bridge and offers skyline views.",
            },
          ],
        },
        rowIndex: 0,
        rowCount: 8,
        nativeTitle: "Wrong bundled title",
        liveTitle: "NYC's newest park sits beneath the bridge",
        liveTitleSource: "description-inferred",
      })
    ).toEqual({
      title: "Brooklyn Bridge Park",
      titleSource: "explicit",
    });
  });

  it("233384P2 / 264853 keeps bundled positional titles over live Itinerary Stop rows", () => {
    const native = loadNativeItinerary(ENGINE6_NYC_BROOKLYN_BRIDGE_PRODUCT_CODE);
    const live = buildNeutralExplicitLiveItinerary(8);
    const bundledRawProduct = loadBundledRawProduct(
      ENGINE6_NYC_BROOKLYN_BRIDGE_PRODUCT_CODE
    );

    expect(getEngine6ItineraryMergeMode(native, live)).toBe("diverged");
    expect(
      mergeEngine6NativeItineraryWithLive(native, live, {
        productCode: ENGINE6_NYC_BROOKLYN_BRIDGE_PRODUCT_CODE,
        bundledRawProduct,
      }).map(item => item.title)
    ).toEqual([
      ...EXPECTED_233384P2_NATIVE_TITLES,
      "Itinerary Stop 7",
      "Itinerary Stop 8",
    ]);
    expect(ENGINE6_NYC_BROOKLYN_BRIDGE_ROUTE).toContain("264853");
  });

  it("233384P2 keeps bundled native titles over live description-inferred prose", () => {
    const native = loadNativeItinerary("233384P2");
    const live = buildDescriptionInferredLiveItinerary(8, {
      3: "NYC's newest park sits beneath the bridge and offers skyline views",
      4: "DUMBO was once a bustling hub of industry along the East River",
    });

    expect(getEngine6ItineraryMergeMode(native, live)).toBe("diverged");
    expect(
      mergeEngine6NativeItineraryWithLive(native, live, {
        productCode: "233384P2",
        bundledRawProduct: loadBundledRawProduct("233384P2"),
      }).map(item => item.title)
    ).toEqual([
      ...EXPECTED_233384P2_NATIVE_TITLES,
      "Itinerary Stop 7",
      "Itinerary Stop 8",
    ]);
  });

  it("description-only live rows cannot overwrite bundled positional titles at the same index", () => {
    const native = loadNativeItinerary("7081NYCDAY");
    const live = buildNeutralExplicitLiveItinerary(14);
    const merged = mergeEngine6NativeItineraryWithLive(native, live, {
      productCode: "7081NYCDAY",
      bundledRawProduct: loadBundledRawProduct("7081NYCDAY"),
    });

    expect(merged.slice(0, 6).map(item => item.title)).toEqual([
      "Central Park",
      "Rockefeller Center",
      "Fifth Avenue",
      "Gansevoort Liberty Market",
      "The National 9/11 Memorial & Museum",
      "New York Harbor",
    ]);
    expect(merged[0].description).toBe("Live refreshed description for stop 1.");
    expect(merged[5].description).toBe("Live refreshed description for stop 6.");
  });

  it("preserves bundled native titles for the diverged NYC cohort at shared indices", () => {
    const cases = [
      {
        productCode: "7081NYCDAY",
        liveCount: 14,
        expectedNativePrefix: [
          "Central Park",
          "Rockefeller Center",
          "Fifth Avenue",
          "Gansevoort Liberty Market",
          "The National 9/11 Memorial & Museum",
          "New York Harbor",
        ],
      },
      {
        productCode: "62527P11",
        liveCount: 9,
        expectedNativePrefix: ["Midtown Manhattan Departure", "Niagara Falls"],
      },
      {
        productCode: "5250LIBERTYELLIS",
        liveCount: 5,
        expectedNativePrefix: ["Battery Park", "Liberty Island", "Ellis Island"],
      },
      {
        productCode: "5614063P8",
        liveCount: 12,
        expectedNativePrefix: ["Departure from New York", "Washington, D.C. Landmarks"],
      },
      {
        productCode: "3857PHI",
        liveCount: 5,
        expectedNativePrefix: ["Philadelphia", "Amish Country"],
      },
    ] as const;

    cases.forEach(({ productCode, liveCount, expectedNativePrefix }) => {
      const native = loadNativeItinerary(productCode);
      const live = buildNeutralExplicitLiveItinerary(liveCount);
      const merged = mergeEngine6NativeItineraryWithLive(native, live, {
        productCode,
        bundledRawProduct: loadBundledRawProduct(productCode),
      });

      expect(merged.slice(0, expectedNativePrefix.length).map(item => item.title)).toEqual(
        [...expectedNativePrefix]
      );
      expect(
        merged
          .slice(expectedNativePrefix.length)
          .every(item => /^Itinerary Stop \d+$/.test(item.title))
      ).toBe(true);
    });
  });

  it("474891P3 aligned merge keeps bundled explicit POI titles over live prose", () => {
    const extraction = extractEngine6Product(specimen474891p3Payload);
    const payload: Engine6ApiResponse = {
      source: "bundled-fallback",
      rawProductCode: "474891P3",
      rawProduct: extraction.product,
      diagnostics: {
        source: "bundled-fallback",
        hasViatorApiKey: false,
        attemptedLiveFetch: false,
        upstreamStatus: null,
        upstreamContentType: "application/json fixture",
        upstreamOk: null,
        usedBundledFallbackBecause: "diverged-nyc-aligned-test",
        ...extraction.diagnostics,
        bookingUrlSource:
          extraction.diagnostics.productUrlFieldPath ??
          "generated:viator-search-product-code",
        fieldLevelFallbackUsed: false,
        fallbackFieldNames: [],
      },
      extracted: extraction.extracted,
    };
    const native = mapViatorToEngine6Tour(payload).itinerary;
    const live = native.map((item, index) => ({
      ...item,
      title:
        index === 0
          ? "Times Square is the crossroads of the world and a must-see highlight"
          : `Supplier prose title for stop ${index + 1}`,
      titleSource: "description-inferred" as const,
    }));

    expect(getEngine6ItineraryMergeMode(native, live)).toBe("aligned");
    expect(
      mergeEngine6NativeItineraryWithLive(native, live, {
        productCode: "474891P3",
      }).map(item => item.title)
    ).toEqual([
      "Times Square",
      "Rockefeller Center",
      "St. Patrick's Cathedral",
      "New York Public Library - Stephen A. Schwarzman Building",
      "Bryant Park",
      "Grand Central Terminal",
      "Chrysler Building",
      "Fifth Avenue",
    ]);
  });

  it("233384P2 bundled extraction keeps explicit fixture titles instead of description prose", () => {
    const native = extractEngine6Product(specimen233384p2Payload).extracted.itinerary;

    expect(native.map(item => item.title)).toEqual([
      ...EXPECTED_233384P2_NATIVE_TITLES,
    ]);
    expect(native.every(item => item.titleSource === "explicit")).toBe(true);
    expect(
      native.every(
        item =>
          !item.title.includes("Begin with") &&
          !item.title.includes("Cross the bridge")
      )
    ).toBe(true);
  });
});
