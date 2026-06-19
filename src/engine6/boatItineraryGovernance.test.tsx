import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import { toEngine6Card } from "./cards";
import Engine6TourPage from "./components/Engine6TourPage";
import {
  isEngine6ItinerarySectionSuppressed,
  mapViatorToEngine6Tour,
} from "./mapViatorToEngine6Tour";
import { resolveEngine6ProductCodeForPath } from "./routes";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import type { Engine6ApiResponse } from "./types";
import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures";

(globalThis as { location?: { pathname: string; search?: string } }).location =
  {
    pathname: "/",
    search: "",
  };

const toPayload = (
  fixture: (typeof ENGINE6_VALIDATION_FIXTURES)[number]
): Engine6ApiResponse => {
  const extraction = extractEngine6Product(fixture.rawPayload);

  return {
    source: "bundled-fallback",
    rawProductCode: fixture.productCode,
    rawProduct: extraction.product,
    diagnostics: {
      source: "bundled-fallback",
      hasViatorApiKey: false,
      attemptedLiveFetch: false,
      upstreamStatus: null,
      upstreamContentType: "application/json fixture",
      upstreamOk: null,
      usedBundledFallbackBecause: "boat-itinerary-governance-test",
      ...extraction.diagnostics,
      bookingUrlSource:
        extraction.diagnostics.productUrlFieldPath ??
        "generated:viator-search-product-code",
      fieldLevelFallbackUsed: false,
      fallbackFieldNames: [],
    },
    extracted: extraction.extracted,
  };
};

const sentenceCount = (value: string) =>
  value
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map(part => part.trim())
    .filter(Boolean).length || 1;

describe("Engine6 boat itinerary governance", () => {
  it("preserves route-based sightseeing cruise itineraries for 2630SUN", () => {
    const fixture = ENGINE6_VALIDATION_FIXTURES.find(
      entry => entry.productCode === "2630SUN"
    );
    expect(fixture).toBeDefined();
    expect(isEngine6ItinerarySectionSuppressed("2630SUN")).toBe(false);

    const tour = mapViatorToEngine6Tour(toPayload(fixture!));
    const pageHtml = renderToString(<Engine6TourPage tour={tour} />);
    const card = toEngine6Card(tour);
    const schema = buildEngine6SchemaGraph(tour);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const trip = graph.find(node => node["@type"] === "TouristTrip") as
      | {
          itinerary?: { itemListElement?: Array<{ item?: { name?: string } }> };
        }
      | undefined;

    expect(resolveEngine6ProductCodeForPath(tour.canonicalPath)).toBe(
      "2630SUN"
    );
    expect(tour.itinerary.map(item => item.title)).toEqual([
      "Pier 43½",
      "Golden Gate Bridge",
      "San Francisco Bay",
      "Marina District",
      "Fort Mason",
      "Coit Tower",
      "Bay Bridge",
      "Yerba Buena Island",
      "Treasure Island",
    ]);
    expect(pageHtml).toContain('data-testid="engine6-itinerary-timeline"');
    expect(
      pageHtml.match(/data-testid="engine6-itinerary-item"/g)
    ).toHaveLength(tour.itinerary.length);

    for (const item of tour.itinerary) {
      expect(item.description).toBeTruthy();
      expect(sentenceCount(item.description!)).toBe(1);
      expect(item.description).not.toMatch(
        /best|iconic|must-see|unforgettable|you(?:'ll| will)|our|we(?:'ll| will)|this stop provides|visit this location/i
      );
    }

    expect(card.imageUrl).toBe(tour.heroImageUrl);
    expect(card.href).toBe(tour.canonicalPath);
    expect(
      (graph.find(node => node["@type"] === "Product") as { image?: string })
        .image
    ).toBe(tour.heroImageUrl);
    expect(
      trip?.itinerary?.itemListElement?.map(item => item.item?.name)
    ).toEqual(tour.itinerary.map(item => item.title));
  });

  it("uses New Orleans source itinerary titles for visible cards and JSON-LD names", () => {
    const fixture = ENGINE6_VALIDATION_FIXTURES.find(
      entry => entry.productCode === "276551P2"
    );
    expect(fixture).toBeDefined();

    const tour = mapViatorToEngine6Tour(toPayload(fixture!));
    const pageHtml = renderToString(<Engine6TourPage tour={tour} />);
    const schema = buildEngine6SchemaGraph(tour);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const trip = graph.find(node => node["@type"] === "TouristTrip") as
      | {
          itinerary?: { itemListElement?: Array<{ item?: { name?: string } }> };
        }
      | undefined;
    const expectedSourceTitles = [
      "French Quarter",
      "St. Louis Cathedral",
      "Jackson Square",
      "Royal Street",
      "Lafitte's Blacksmith Shop Bar",
      "Central Business District",
      "Congo Square",
    ];

    expect(tour.itinerary.map(item => item.title).slice(0, 7)).toEqual(
      expectedSourceTitles
    );
    expect(
      pageHtml.match(/data-testid="engine6-itinerary-item"/g)
    ).toHaveLength(tour.itinerary.length);
    expect(
      trip?.itinerary?.itemListElement?.map(item => item.item?.name).slice(0, 7)
    ).toEqual(expectedSourceTitles);
    expect(tour.itinerary[0].description).toBeTruthy();
  });
});
