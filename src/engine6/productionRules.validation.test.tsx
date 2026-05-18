import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import { toEngine6Card } from "./cards";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import { ENGINE6_CONFIGURED_PRODUCT_CODES } from "./routes";
import type { Engine6ApiResponse } from "./types";
import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures";

const toPayload = (
  fixture: (typeof ENGINE6_VALIDATION_FIXTURES)[number]
): Engine6ApiResponse => {
  const extraction = extractEngine6Product(fixture.rawPayload);
  return {
    source: "live-api",
    rawProductCode: fixture.productCode,
    rawProduct: extraction.product,
    diagnostics: {
      source: "live-api",
      hasViatorApiKey: false,
      attemptedLiveFetch: false,
      upstreamStatus: null,
      upstreamContentType: "text/html fixture derived from public viator page",
      upstreamOk: null,
      usedBundledFallbackBecause: "validation-fixture-from-public-page",
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

describe("engine6 production rules lightweight validations", () => {
  it("requires exact-product fixtures for all configured engine6 products", () => {
    const fixtureCodes = new Set(
      ENGINE6_VALIDATION_FIXTURES.map(entry => entry.productCode)
    );
    for (const productCode of ENGINE6_CONFIGURED_PRODUCT_CODES) {
      expect(fixtureCodes.has(productCode)).toBe(true);
    }
  });

  const fixture = ENGINE6_VALIDATION_FIXTURES.find(
    entry => entry.productCode === "5119P13"
  );

  it("keeps above-fold commercial fields when API provides them", () => {
    expect(fixture).toBeDefined();
    const payload = toPayload(fixture!);
    const tour = mapViatorToEngine6Tour(payload);

    expect(tour.priceFormatted).toBeTruthy();
    expect(typeof tour.aggregateRating).toBe("number");
    expect(typeof tour.reviewCount).toBe("number");
    expect(tour.meetingPointText).toBeTruthy();
  });

  it("preserves itinerary length parity between extracted and mapped tour", () => {
    expect(fixture).toBeDefined();
    const payload = toPayload(fixture!);
    const tour = mapViatorToEngine6Tour(payload);

    expect(tour.itinerary.length).toBe(payload.extracted.itinerary.length);
  });

  it("keeps card parity fields from the same resolved tour object", () => {
    expect(fixture).toBeDefined();
    const payload = toPayload(fixture!);
    const tour = mapViatorToEngine6Tour(payload);
    const card = toEngine6Card(tour);

    expect(card.imageUrl).toBe(tour.resolvedHero?.url);
    expect(card.href).toBe(tour.canonicalPath);
    if (typeof tour.aggregateRating === "number" && typeof tour.reviewCount === "number") {
      expect(card.ratingLabel).toMatch(/^★\s+\d(?:\.\d)?\s+\(\d+\)$/);
    }
    if (typeof tour.priceAmount === "number") {
      expect(card.priceLabel).toMatch(/^From \$/);
    }
  });

  it("keeps hero parity across page/card/schema/og inputs", () => {
    expect(fixture).toBeDefined();
    const payload = toPayload(fixture!);
    const tour = mapViatorToEngine6Tour(payload);
    const card = toEngine6Card(tour);
    const graph = buildEngine6SchemaGraph(tour)["@graph"] as Array<Record<string, unknown>>;
    const product = graph.find(node => node["@type"] === "Product") as
      | Record<string, unknown>
      | undefined;
    const trip = graph.find(node => node["@type"] === "TouristTrip") as
      | Record<string, unknown>
      | undefined;

    expect(tour.resolvedHero?.url).toBeTruthy();
    expect(tour.heroImageUrl).toBe(tour.resolvedHero?.url);
    expect(card.imageUrl).toBe(tour.resolvedHero?.url);
    expect(product?.image).toBe(tour.resolvedHero?.url);
    expect(trip?.image).toBe(tour.resolvedHero?.url);
  });

  it("keeps 2335P1 price/API/schema parity and never falls back to check-latest copy", () => {
    const palmSpringsFixture = ENGINE6_VALIDATION_FIXTURES.find(
      entry => entry.productCode === "2335P1"
    );
    expect(palmSpringsFixture).toBeDefined();

    const payload = toPayload(palmSpringsFixture!);
    const tour = mapViatorToEngine6Tour(payload);
    const graph = buildEngine6SchemaGraph(tour)["@graph"] as Array<Record<string, unknown>>;
    const productNode = graph.find(node => node["@type"] === "Product") as
      | Record<string, unknown>
      | undefined;
    const offerRef = productNode?.offers as Record<string, unknown> | undefined;
    const offerNode = graph.find(
      node => node["@id"] === offerRef?.["@id"] && node["@type"] === "Offer"
    ) as Record<string, unknown> | undefined;

    expect(payload.extracted.priceAmount).toBe(175);
    expect(payload.extracted.priceFormatted).toBe("From $175.00");
    expect(tour.priceAmount).toBe(175);
    expect(tour.priceFormatted).toBe("From $175.00");
    expect(tour.priceFormatted).not.toBe("Check latest price");
    expect(offerNode?.price).toBe(175);
  });
});
