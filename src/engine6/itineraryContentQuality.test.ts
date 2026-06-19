import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import {
  buildEngine6ItineraryForProduct,
  mapViatorToEngine6Tour,
} from "./mapViatorToEngine6Tour";
import {
  descriptionAddsInformationBeyondTitle,
  engine6DescriptionTitleTokenOverlapExceedsThreshold,
  isEngine6LowQualityItineraryDescription,
  rewriteEngine6ItineraryDescriptionToSingleSentence,
} from "./normalizeEngine6Itinerary";
import { ENGINE6_PARAGON_PRODUCT_CODE, ENGINE6_PARAGON_ROUTE } from "./routes";

const buildParagonTour = () => {
  const rawPayload = JSON.parse(
    readFileSync("data/engine6/viator/5119P13.exact-product.json", "utf8")
  ) as Record<string, unknown>;
  const extraction = extractEngine6Product(rawPayload);

  return mapViatorToEngine6Tour({
    source: "bundled-fallback",
    rawProductCode: ENGINE6_PARAGON_PRODUCT_CODE,
    rawProduct: extraction.product,
    diagnostics: {
      source: "bundled-fallback",
      hasViatorApiKey: false,
      attemptedLiveFetch: false,
      upstreamStatus: null,
      upstreamContentType: null,
      upstreamOk: null,
      usedBundledFallbackBecause: "content-quality-test",
      ...extraction.diagnostics,
      bookingUrlSource:
        extraction.diagnostics.productUrlFieldPath ??
        "generated:viator-search-product-code",
      fieldLevelFallbackUsed: false,
      fallbackFieldNames: [],
    },
    extracted: extraction.extracted,
  });
};

describe("Engine6 itinerary content quality", () => {
  it("rejects Visit-title and Pass-route placeholder descriptions", () => {
    expect(
      isEngine6LowQualityItineraryDescription(
        "Grand Canyon West",
        "Visit Grand Canyon West during the 4 hours stop."
      )
    ).toBe(true);
    expect(
      isEngine6LowQualityItineraryDescription(
        "Stearns Wharf",
        "Pass Stearns Wharf as part of the route."
      )
    ).toBe(true);
  });

  it("preserves valid API descriptions that add detail beyond the title", () => {
    const preserved = rewriteEngine6ItineraryDescriptionToSingleSentence({
      productCode: "5119P13",
      index: 0,
      item: {
        title: "Hoover Dam",
        stopType: "stop",
        duration: "20 minutes",
        description: "Photo stop and guide commentary",
      },
    });

    expect(preserved).toBe("Photo stop and guide commentary.");
    expect(
      descriptionAddsInformationBeyondTitle("Hoover Dam", preserved)
    ).toBe(true);
  });

  it("replaces admission-only source lines with duration-based factual copy", () => {
    const rewritten = rewriteEngine6ItineraryDescriptionToSingleSentence({
      productCode: "5119P13",
      index: 1,
      item: {
        title: "Grand Canyon West",
        stopType: "stop",
        duration: "4 hours",
        description: "Admission included",
      },
    });

    expect(rewritten).toBe(
      "This scheduled stop includes about 4 hours in the itinerary."
    );
    expect(rewritten).not.toMatch(/^Visit\s+/i);
    expect(rewritten).not.toMatch(/Grand Canyon West/i);
    expect(rewritten).not.toMatch(/admission included/i);
    expect(rewritten).not.toMatch(/\bguided route\b/i);
  });

  it("uses non-duplicative copy when source prose is empty", () => {
    const rewritten = rewriteEngine6ItineraryDescriptionToSingleSentence({
      productCode: "5119P13",
      index: 0,
      item: {
        title: "Hoover Dam",
        stopType: "stop",
        duration: "20 minutes",
        description: "",
      },
    });

    expect(rewritten).toBe(
      "This scheduled stop includes about 20 minutes in the itinerary."
    );
    expect(rewritten).not.toMatch(/^Visit\s+/i);
    expect(rewritten).not.toMatch(/\bguided route\b/i);
    expect(rewritten).not.toMatch(/\bscenic pass-by segment\b/i);
  });

  it("maps the paragon preview tour without Visit/Pass placeholder descriptions", () => {
    const tour = buildParagonTour();

    expect(tour.canonicalPath).toBe(ENGINE6_PARAGON_ROUTE);
    for (const stop of tour.itinerary) {
      expect(stop.description?.trim()).toBeTruthy();
      expect(
        isEngine6LowQualityItineraryDescription(
          stop.title,
          stop.description ?? ""
        )
      ).toBe(false);
      expect(
        descriptionAddsInformationBeyondTitle(stop.title, stop.description ?? "")
      ).toBe(true);
      expect(stop.description).not.toMatch(/^Visit\s+/i);
      expect(stop.description).not.toMatch(
        /^Pass\s+.+\s+as part of the route\.?$/i
      );
    }
  });

  it("derives pass-by copy from source context without repeating the title", () => {
    const rewritten = rewriteEngine6ItineraryDescriptionToSingleSentence({
      productCode: "447486P2",
      index: 1,
      item: {
        title: "Stearns Wharf",
        stopType: "pass-by",
        duration: "15 minutes",
        description: "Cruise past the wharf for waterfront views.",
      },
    });

    expect(rewritten).toBe("Cruise past the wharf for waterfront views.");
    expect(rewritten).not.toMatch(/Stearns Wharf/i);
  });

  it("builds shared product itinerary output with the same quality rules", () => {
    const itinerary = buildEngine6ItineraryForProduct("5119P13", [
      {
        title: "Hoover Dam",
        description: "Photo stop and guide commentary",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Canyon West",
        description: "Admission included",
        duration: "4 hours",
        stopType: "stop",
      },
    ]);

    expect(itinerary[0]?.description).toBe("Photo stop and guide commentary.");
    expect(itinerary[1]?.description).toBe(
      "This scheduled stop includes about 4 hours in the itinerary."
    );
  });

  it("rejects descriptions with more than 70% title token overlap", () => {
    const title =
      "Iconic carousel in Central Park built in 1908 & featuring over 50 hand-carved horses";
    const restated = `Route passes ${title}.`;

    expect(
      engine6DescriptionTitleTokenOverlapExceedsThreshold(title, restated)
    ).toBe(true);
    expect(isEngine6LowQualityItineraryDescription(title, restated)).toBe(true);
  });

  it("uses non-duplicative pass-by copy when source restates the title", () => {
    const title =
      "Iconic carousel in Central Park built in 1908 & featuring over 50 hand-carved horses";
    const rewritten = rewriteEngine6ItineraryDescriptionToSingleSentence({
      productCode: "TESTCAROUSEL1",
      index: 0,
      item: {
        title,
        stopType: "pass-by",
        description: title,
      },
    });

    expect(rewritten).toBe(
      "This portion is viewed from the route without a scheduled stop."
    );
    expect(
      engine6DescriptionTitleTokenOverlapExceedsThreshold(title, rewritten)
    ).toBe(false);
  });

  it("uses non-duplicative pass-by copy when source has no factual context", () => {
    const rewritten = rewriteEngine6ItineraryDescriptionToSingleSentence({
      productCode: "122012P17",
      index: 0,
      item: {
        title: "Midtown",
        stopType: "pass-by",
        description: "Pass By",
      },
    });

    expect(rewritten).toBe(
      "This portion is viewed from the route without a scheduled stop."
    );
    expect(rewritten).not.toMatch(/\bscenic pass-by segment\b/i);
    expect(rewritten).not.toMatch(/\bguided route\b/i);
  });

  it("builds pass-by fallback copy from source context without invalid durations", () => {
    const rewritten = rewriteEngine6ItineraryDescriptionToSingleSentence({
      productCode: "23068P2",
      index: 0,
      item: {
        title: "Lombard Street",
        stopType: "pass-by",
        duration: "Pass by",
        description: "Pass by the curved hill section of Lombard Street.",
      },
    });

    expect(rewritten).toBe("Passes by the curved hill section.");
    expect(rewritten).not.toMatch(/over about Pass by/i);
  });

  it("builds timed stop fallback copy with includes-style phrasing", () => {
    const rewritten = rewriteEngine6ItineraryDescriptionToSingleSentence({
      productCode: "58347P1",
      index: 2,
      item: {
        title: "Jackson Square",
        stopType: "stop",
        duration: "15 minutes",
        description:
          "Visit Jackson Square during a 15-minute stop in the French Quarter area.",
      },
    });

    expect(rewritten).toBe(
      "Includes about 15 minutes at Jackson Square in the French Quarter area."
    );
    expect(rewritten).not.toMatch(/15-minute stop.*15 minutes/i);
  });
});
