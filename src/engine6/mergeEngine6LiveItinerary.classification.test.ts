import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import {
  getEngine6ItineraryMergeMode,
  type Engine6LiveItineraryItem,
} from "./mergeEngine6LiveItinerary";
import type { Engine6ApiResponse } from "./types";

const FLORIDA_ALASKA_PRODUCT_CODES = [
  "411138P3",
  "100569P5",
  "53474P8",
  "383300P6",
  "89173P8",
  "76145P2",
  "5559561P1",
  "118958P8",
  "6331BAHA",
  "57834P1",
  "89173P10",
  "5503P10",
  "231628P7",
  "438341P2",
  "8836P2",
  "10150P16",
  "7943P1",
  "214880P12",
  "44152P18",
  "402171P1",
  "408277P4",
  "5503P21",
  "342209P4",
] as const;

type LiveScenario = {
  liveCount: number;
  authoritativeTitles?: Array<string | null>;
};

const LIVE_SCENARIOS: Record<
  (typeof FLORIDA_ALASKA_PRODUCT_CODES)[number],
  LiveScenario
> = {
  "411138P3": { liveCount: 9 },
  "100569P5": { liveCount: 0 },
  "53474P8": {
    liveCount: 7,
    authoritativeTitles: [
      "Campbell Creek Trail",
      "Chester Creek Trail",
      "Westchester Lagoon",
      "Earthquake Park",
      null,
      null,
      null,
    ],
  },
  "383300P6": { liveCount: 9 },
  "89173P8": { liveCount: 0 },
  "76145P2": {
    liveCount: 1,
    authoritativeTitles: ["Everglades Launch Area"],
  },
  "5559561P1": {
    liveCount: 2,
    authoritativeTitles: ["Check in and safety orientation", "JetCar rental ride"],
  },
  "118958P8": { liveCount: 0 },
  "6331BAHA": { liveCount: 0 },
  "57834P1": { liveCount: 4 },
  "89173P10": {
    liveCount: 1,
    authoritativeTitles: [
      "Kayakers will take a tour out through Wilton Manors to the beautiful hidden mangroves that only the locals know!",
    ],
  },
  "5503P10": { liveCount: 0 },
  "231628P7": { liveCount: 8 },
  "438341P2": { liveCount: 0 },
  "8836P2": { liveCount: 8 },
  "10150P16": { liveCount: 5 },
  "7943P1": { liveCount: 0 },
  "214880P12": { liveCount: 9 },
  "44152P18": {
    liveCount: 3,
    authoritativeTitles: ["Miami", "Everglades Region", "Florida Keys"],
  },
  "402171P1": { liveCount: 4 },
  "408277P4": { liveCount: 1 },
  "5503P21": { liveCount: 1 },
  "342209P4": { liveCount: 1 },
};

const fixtureDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../data/engine6/viator"
);

const loadNativeItinerary = (productCode: string) => {
  const fixturePath = path.join(fixtureDir, `${productCode}.exact-product.json`);
  const fixture = JSON.parse(readFileSync(fixturePath, "utf8")) as Record<
    string,
    unknown
  >;
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
      usedBundledFallbackBecause: "merge-engine6-classification-test",
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

const buildLiveItinerary = (scenario: LiveScenario): Engine6LiveItineraryItem[] => {
  if (scenario.liveCount === 0) {
    return [];
  }

  return Array.from({ length: scenario.liveCount }, (_, index) => {
    const authoritativeTitle = scenario.authoritativeTitles?.[index] ?? null;

    if (authoritativeTitle) {
      return {
        title: authoritativeTitle,
        titleSource: "product-override" as const,
      };
    }

    return {
      title: `Live inferred stop ${index + 1}`,
      titleSource: "description-inferred" as const,
    };
  });
};

describe("Florida/Alaska itinerary merge classification", () => {
  it("classifies audit products under the composition divergence detector", () => {
    const classifications = FLORIDA_ALASKA_PRODUCT_CODES.map(productCode => {
      const nativeItinerary = loadNativeItinerary(productCode);
      const liveItinerary = buildLiveItinerary(LIVE_SCENARIOS[productCode]);
      const mergeMode = getEngine6ItineraryMergeMode(
        nativeItinerary,
        liveItinerary
      );

      return {
        productCode,
        nativeCount: nativeItinerary.length,
        liveCount: liveItinerary.length,
        mergeMode,
      };
    });

    expect(
      classifications.find(entry => entry.productCode === "411138P3")?.mergeMode
    ).toBe("diverged");
    expect(
      classifications.find(entry => entry.productCode === "53474P8")?.mergeMode
    ).toBe("aligned");

    const divergedProducts = classifications
      .filter(entry => entry.mergeMode === "diverged")
      .map(entry => entry.productCode);

    expect(divergedProducts).toEqual([
      "411138P3",
      "383300P6",
      "76145P2",
      "89173P10",
      "231628P7",
      "8836P2",
      "10150P16",
      "214880P12",
      "402171P1",
      "408277P4",
      "5503P21",
      "342209P4",
    ]);
  });

  it("only classifies products with bundled fixtures in the viator directory", () => {
    const bundledProductCodes = new Set(
      readdirSync(fixtureDir)
        .filter(fileName => fileName.endsWith(".exact-product.json"))
        .map(fileName => fileName.replace(".exact-product.json", ""))
    );

    for (const productCode of FLORIDA_ALASKA_PRODUCT_CODES) {
      expect(bundledProductCodes.has(productCode)).toBe(true);
    }
  });
});
