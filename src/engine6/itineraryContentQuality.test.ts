import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import {
  buildEngine6ItineraryForProduct,
  mapViatorToEngine6Tour,
} from "./mapViatorToEngine6Tour";
import {
  isEngine6BannedItineraryPlaceholder,
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
  it("rejects banned placeholder descriptions", () => {
    expect(
      isEngine6BannedItineraryPlaceholder(
        "Grand Canyon West",
        "Visit Grand Canyon West during the 4 hours stop."
      )
    ).toBe(true);
    expect(
      isEngine6BannedItineraryPlaceholder(
        "Stearns Wharf",
        "Pass Stearns Wharf as part of the route."
      )
    ).toBe(true);
    expect(isEngine6BannedItineraryPlaceholder("Midtown", "By.")).toBe(true);
    expect(
      isEngine6BannedItineraryPlaceholder("Stop A", "Historic context")
    ).toBe(true);
    expect(
      isEngine6BannedItineraryPlaceholder("Stop B", "Scenic pass-by segment")
    ).toBe(true);
  });

  it("preserves original supplier descriptions without rewriting factual prose", () => {
    expect(
      rewriteEngine6ItineraryDescriptionToSingleSentence({
        productCode: "58347P1",
        index: 2,
        item: {
          title: "Jackson Square",
          stopType: "stop",
          duration: "15 minutes",
          description:
            "Visit Jackson Square during a 15-minute stop in the French Quarter area.",
        },
      })
    ).toBe(
      "Visit Jackson Square during a 15-minute stop in the French Quarter area."
    );

    expect(
      rewriteEngine6ItineraryDescriptionToSingleSentence({
        productCode: "5119P13",
        index: 0,
        item: {
          title: "Hoover Dam",
          stopType: "stop",
          duration: "20 minutes",
          description: "Photo stop and guide commentary",
        },
      })
    ).toBe("Photo stop and guide commentary.");

    expect(
      rewriteEngine6ItineraryDescriptionToSingleSentence({
        productCode: "5119P13",
        index: 1,
        item: {
          title: "Grand Canyon West",
          stopType: "stop",
          duration: "4 hours",
          description: "Admission included",
        },
      })
    ).toBe("Admission included.");
  });

  it("omits only banned placeholder descriptions", () => {
    expect(
      rewriteEngine6ItineraryDescriptionToSingleSentence({
        productCode: "5119P13",
        index: 1,
        item: {
          title: "Grand Canyon West",
          stopType: "stop",
          duration: "4 hours",
          description: "Visit Grand Canyon West during the 4 hours stop.",
        },
      })
    ).toBe("");
  });

  it("maps the paragon preview tour without banned placeholder descriptions", () => {
    const tour = buildParagonTour();

    expect(tour.canonicalPath).toBe(ENGINE6_PARAGON_ROUTE);
    for (const stop of tour.itinerary) {
      const description = stop.description?.trim() ?? "";
      if (!description) {
        continue;
      }

      expect(
        isEngine6LowQualityItineraryDescription(stop.title, description)
      ).toBe(false);
      expect(description).not.toMatch(/^Pass\s+.+\s+as part of the route\.?$/i);
      expect(description).not.toMatch(
        /^This portion is viewed from the route without a scheduled stop\.?$/i
      );
      expect(description).not.toMatch(/^This scheduled stop includes about\b/i);
    }
  });

  it("preserves pass-by supplier prose unchanged", () => {
    expect(
      rewriteEngine6ItineraryDescriptionToSingleSentence({
        productCode: "447486P2",
        index: 1,
        item: {
          title: "Stearns Wharf",
          stopType: "pass-by",
          duration: "15 minutes",
          description: "Cruise past the wharf for waterfront views.",
        },
      })
    ).toBe("Cruise past the wharf for waterfront views.");

    expect(
      rewriteEngine6ItineraryDescriptionToSingleSentence({
        productCode: "23068P2",
        index: 0,
        item: {
          title: "Lombard Street",
          stopType: "pass-by",
          duration: "Pass by",
          description: "Pass by the curved hill section of Lombard Street.",
        },
      })
    ).toBe("Pass by the curved hill section of Lombard Street.");
  });

  it("builds shared product itinerary output with supplier descriptions preserved", () => {
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
    expect(itinerary[1]?.description).toBe("Admission included.");
  });

  it("preserves supplier descriptions even when they repeat the title", () => {
    const title =
      "Iconic carousel in Central Park built in 1908 & featuring over 50 hand-carved horses";

    expect(
      rewriteEngine6ItineraryDescriptionToSingleSentence({
        productCode: "TESTCAROUSEL1",
        index: 0,
        item: {
          title,
          stopType: "pass-by",
          description: title,
        },
      })
    ).toBe(title);
  });

  it("preserves short supplier labels such as Pass By", () => {
    expect(
      rewriteEngine6ItineraryDescriptionToSingleSentence({
        productCode: "122012P17",
        index: 0,
        item: {
          title: "Midtown",
          stopType: "pass-by",
          description: "Pass By",
        },
      })
    ).toBe("Pass By.");
  });
});
