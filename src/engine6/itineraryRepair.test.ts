import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import Engine6TourPage from "./components/Engine6TourPage";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import {
  buildEngine6ItineraryForProduct,
  mapViatorToEngine6Tour,
} from "./mapViatorToEngine6Tour";
import {
  buildEngine6ItineraryFromExtracted,
  dedupeEngine6ItineraryDescriptions,
  isEngine6StructuredItineraryUsable,
  isEngine6TitleDescriptionMismatch,
  resolveEngine6ItineraryForRender,
  rewriteEngine6ItineraryDescriptionToSingleSentence,
} from "./normalizeEngine6Itinerary";
import { normalizeEngine6ItineraryComparisonText } from "./itineraryGovernance";
import { engine6ResolvedTours } from "./registry";
import { ENGINE6_PARAGON_PRODUCT_CODE } from "./routes";
import { engine6ListingTours } from "./listing";

const loadParagonFixture = () =>
  JSON.parse(
    readFileSync("data/engine6/viator/5119P13.exact-product.json", "utf8")
  ) as Record<string, unknown>;

const buildParagonApiPayload = () => {
  const rawPayload = loadParagonFixture();
  const extraction = extractEngine6Product(rawPayload);

  return {
    source: "bundled-fallback" as const,
    rawProductCode: ENGINE6_PARAGON_PRODUCT_CODE,
    rawProduct: extraction.product,
    diagnostics: {
      source: "bundled-fallback" as const,
      hasViatorApiKey: false,
      attemptedLiveFetch: false,
      upstreamStatus: null,
      upstreamContentType: "application/json fixture",
      upstreamOk: null,
      usedBundledFallbackBecause: "itinerary-repair-test",
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

describe("Engine6 itinerary repair", () => {
  it("maps the paragon fixture to four usable timeline stops", () => {
    const tour = mapViatorToEngine6Tour(buildParagonApiPayload());

    expect(tour.productCode).toBe("5119P13");
    expect(tour.itinerary).toHaveLength(4);
    expect(isEngine6StructuredItineraryUsable(tour.itinerary)).toBe(true);
    expect(tour.itinerary.map(stop => stop.title)).toEqual([
      "Hoover Dam",
      "Grand Canyon West",
      "Eagle Point and Guano Point",
      "Colorado River Helicopter Landing",
    ]);
  });

  it("keeps title and description distinct when a description is present", () => {
    const tour = mapViatorToEngine6Tour(buildParagonApiPayload());

    for (const stop of tour.itinerary) {
      const description = stop.description?.trim() ?? "";
      if (!description) {
        continue;
      }

      expect(
        isEngine6TitleDescriptionMismatch(stop.title, description)
      ).toBe(false);
      expect(
        normalizeEngine6ItineraryComparisonText(stop.title)
      ).not.toBe(normalizeEngine6ItineraryComparisonText(description));
    }
  });

  it("preserves duplicate supplier descriptions without rewriting", () => {
    const normalized = dedupeEngine6ItineraryDescriptions(
      [
        {
          title: "Stop A",
          description: "Photo stop and guide commentary.",
        },
        {
          title: "Stop B",
          description: "Photo stop and guide commentary.",
        },
      ],
      { productCode: "TESTDUP1" }
    );

    expect(normalized[0]?.description).toBe("Photo stop and guide commentary.");
    expect(normalized[1]?.description).toBe("Photo stop and guide commentary.");
  });

  it("omits description when source itinerary prose is unusable", () => {
    const fallback = rewriteEngine6ItineraryDescriptionToSingleSentence({
      productCode: "TESTEMPTY1",
      index: 0,
      item: {
        title: "Hoover Dam",
        stopType: "stop",
        duration: "20 minutes",
        description: "",
      },
    });

    expect(fallback).toBe("");
    expect(fallback).not.toMatch(/^Visit\s+/i);
    expect(fallback).not.toMatch(/\bguided route\b/i);
    expect(fallback).not.toMatch(/Yosemite|Tunnel View|Glacier Point/i);
  });

  it("preserves admission-only supplier descriptions", () => {
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

    expect(rewritten).toBe("Admission included.");
  });

  it("preserves valid source itinerary prose when it is distinct from the title", () => {
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
  });

  it("aligns fixture-first registry output with API-first mapper output", () => {
    const registryTour = engine6ResolvedTours.find(
      tour => tour.productCode === "5119P13"
    );
    const mappedTour = mapViatorToEngine6Tour(buildParagonApiPayload());

    expect(registryTour).toBeDefined();
    expect(registryTour?.itinerary).toHaveLength(mappedTour.itinerary.length);
    expect(registryTour?.itinerary.map(stop => stop.title)).toEqual(
      mappedTour.itinerary.map(stop => stop.title)
    );
    expect(registryTour?.itinerary.map(stop => stop.description)).toEqual(
      mappedTour.itinerary.map(stop => stop.description)
    );
  });

  it("keeps valid fixture itinerary during live enrichment merge", () => {
    const baseline = buildEngine6ItineraryForProduct("5119P13", [
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
    const liveCandidate = buildEngine6ItineraryFromExtracted("5119P13", [
      {
        title: "Hoover Dam",
        description: "Different live-only description for the same stop.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Canyon West",
        description: "Another live-only description for the same stop.",
        duration: "4 hours",
        stopType: "stop",
      },
    ]);

    const merged = resolveEngine6ItineraryForRender(baseline, liveCandidate);

    expect(merged).toEqual(baseline);
  });

  it("accepts live candidate itinerary only when baseline is missing or unusable", () => {
    const liveCandidate = buildEngine6ItineraryForProduct("5119P13", [
      {
        title: "Hoover Dam",
        description: "Photo stop and guide commentary",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Canyon West",
        description: "Viewpoint exploration",
        duration: "4 hours",
        stopType: "stop",
      },
    ]);

    expect(resolveEngine6ItineraryForRender([], liveCandidate)).toEqual(
      liveCandidate
    );
  });

  it("renders paragon timeline structure and keeps schema itinerary aligned", () => {
    const tour = engine6ResolvedTours.find(
      item => item.productCode === "5119P13"
    );
    expect(tour).toBeDefined();

    const html = renderToString(createElement(Engine6TourPage, { tour: tour! }));
    expect(html).toContain('data-testid="engine6-itinerary-timeline"');
    expect(html.match(/data-testid="engine6-itinerary-item"/g)?.length).toBe(4);

    const graph = buildEngine6SchemaGraph(tour!)["@graph"] as Array<
      Record<string, unknown>
    >;
    const tripNode = graph.find(node => node["@type"] === "TouristTrip");
    expect(tripNode?.itinerary).toBeTruthy();
  });

  it("leaves listing integration unchanged for the paragon product", () => {
    const listingTour = engine6ListingTours.find(
      tour => tour.productCode === "5119P13"
    );
    const resolvedTour = engine6ResolvedTours.find(
      tour => tour.productCode === "5119P13"
    );

    expect(listingTour).toBeDefined();
    expect(resolvedTour).toBeDefined();
    expect(listingTour?.engine).toBe("engine6");
    expect(listingTour?.heroImage).toBe(resolvedTour?.heroImageUrl);
    expect(listingTour?.activitySlugs?.length).toBeGreaterThan(0);
  });
});
