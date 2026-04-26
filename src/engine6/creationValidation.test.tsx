import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import type { Engine6ApiResponse } from "./types";
import { validateEngine6CreationContract } from "./creationValidation";
import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

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

describe("engine6 creation contract validator", () => {
  const validHeroFixtures = ENGINE6_VALIDATION_FIXTURES.filter(fixture => {
    const extraction = extractEngine6Product(fixture.rawPayload);
    return (
      Boolean(extraction.extracted.heroImageUrl?.trim()) &&
      fixture.productCode !== "5865P8" &&
      fixture.productCode !== "6331BAHA"
    );
  });

  it.each(validHeroFixtures)(
    "validates hardened contract for %s",
    fixture => {
      const payload = toPayload(fixture);
      const tour = mapViatorToEngine6Tour(payload);
      const report = validateEngine6CreationContract({
        tour,
        rawPayload: fixture.rawPayload,
      });

      expect(report.violations).toEqual([]);
    }
  );

  it("fails validation when no exact-product media hero survives", () => {
    const fixture = ENGINE6_VALIDATION_FIXTURES.find(
      entry => entry.productCode === "36001P1"
    );
    expect(fixture).toBeDefined();
    const payload = toPayload(fixture!);

    expect(() => mapViatorToEngine6Tour(payload)).toThrow(
      /strict hero contract violation/i
    );
  });

  it("fails loudly when hero/card parity drifts", () => {
    const payload = toPayload(ENGINE6_VALIDATION_FIXTURES[0]!);
    const tour = mapViatorToEngine6Tour(payload);
    const report = validateEngine6CreationContract({
      tour: { ...tour, heroImageUrl: "https://cdn.example.com/different.jpg" },
      rawPayload: ENGINE6_VALIDATION_FIXTURES[0]!.rawPayload,
    });

      expect(report.violations).toEqual(
        expect.arrayContaining([
          "unified listing hero differs from detail hero",
        ])
      );
  });

  it("fails loudly when Offer.url and route ownership drift", () => {
    const payload = toPayload(ENGINE6_VALIDATION_FIXTURES[1]!);
    const tour = mapViatorToEngine6Tour(payload);
    const report = validateEngine6CreationContract({
      tour: {
        ...tour,
        bookingUrl: "https://www.viator.com/search/invalid",
        canonicalPath: "/destinations/nevada/las-vegas/tours/changed-slug",
      },
      rawPayload: ENGINE6_VALIDATION_FIXTURES[1]!.rawPayload,
    });

      expect(report.violations).toEqual(
        expect.arrayContaining([
          "route ownership drifted from product-code contract",
          "product is wired to non-canonical alternate path despite explicit canonical route",
          "booking CTA lost required Viator monetization parameters",
          "schema Offer.url drifted from resolved booking target",
        ])
      );
  });
  it("fails loudly when structured itinerary stops are dropped", () => {
    const fixture = ENGINE6_VALIDATION_FIXTURES.find(
      entry => entry.productCode === "411138P3"
    );
    expect(fixture).toBeDefined();

    const payload = toPayload(fixture!);
    const tour = mapViatorToEngine6Tour(payload);
    expect(tour.itinerary.length).toBeGreaterThanOrEqual(2);

    const report = validateEngine6CreationContract({
      tour: { ...tour, itinerary: [] },
      rawPayload: fixture!.rawPayload,
    });

    expect(report.violations).toEqual(
      expect.arrayContaining([
        "structured itinerary was dropped despite reliable source stop data",
      ])
    );
  });

  it("passes itinerary validation when source structured stops are absent and itinerary is absent", () => {
    const payload = toPayload(ENGINE6_VALIDATION_FIXTURES[0]!);
    const tour = mapViatorToEngine6Tour(payload);
    const fixtureRaw = ENGINE6_VALIDATION_FIXTURES[0]!.rawPayload as {
      product?: Record<string, unknown>;
      [key: string]: unknown;
    };

    const rawWithoutStops = {
      ...fixtureRaw,
      itineraryItems: [],
      itinerary: { itineraryItems: [] },
      whatToExpect: { items: [], stops: [] },
      product: {
        ...(fixtureRaw.product ?? {}),
        itineraryItems: [],
        itinerary: { itineraryItems: [] },
        whatToExpect: { items: [], stops: [] },
      },
    };

    const report = validateEngine6CreationContract({
      tour: { ...tour, itinerary: [], itinerarySummaryText: null },
      rawPayload: rawWithoutStops,
    });

    expect(report.violations).not.toEqual(
      expect.arrayContaining([
        "structured itinerary was dropped despite reliable source stop data",
      ])
    );
  });

  it("fails when canonical route leaks to /destinations/united-states/... alternate path", () => {
    const payload = toPayload(ENGINE6_VALIDATION_FIXTURES[0]!);
    const tour = mapViatorToEngine6Tour(payload);
    const report = validateEngine6CreationContract({
      tour: {
        ...tour,
        canonicalPath: "/destinations/united-states/california/santa-barbara/tours/santa-barbara-vineyard-to-table-taste-tour-by-e-bike",
        pagePath:
          "/destinations/united-states/california/santa-barbara/tours/santa-barbara-vineyard-to-table-taste-tour-by-e-bike",
      },
      rawPayload: ENGINE6_VALIDATION_FIXTURES[0]!.rawPayload,
    });

    expect(report.violations).toEqual(
      expect.arrayContaining([
        "canonical path leaked to non-canonical /destinations/united-states/... route",
        "canonical path must use /destinations/{state}/{city}/tours/{slug}",
      ])
    );
  });

  it("fails when parent city route is not derivable from canonical path", () => {
    const payload = toPayload(ENGINE6_VALIDATION_FIXTURES[0]!);
    const tour = mapViatorToEngine6Tour(payload);
    const report = validateEngine6CreationContract({
      tour: {
        ...tour,
        canonicalPath: "/destinations/california/santa-barbara",
        pagePath: "/destinations/california/santa-barbara",
      },
      rawPayload: ENGINE6_VALIDATION_FIXTURES[0]!.rawPayload,
    });

    expect(report.violations).toEqual(
      expect.arrayContaining([
        "canonical path must use /destinations/{state}/{city}/tours/{slug}",
        "parent city tours route could not be derived from canonical path",
      ])
    );
  });

  it("allows compact simple-itinerary products to pass without rich multi-stop requirements", () => {
    const fixture = ENGINE6_VALIDATION_FIXTURES.find(
      entry => entry.productCode === "6400P7"
    );
    expect(fixture).toBeDefined();
    const payload = toPayload(fixture!);
    const tour = mapViatorToEngine6Tour(payload);
    const report = validateEngine6CreationContract({
      tour,
      rawPayload: fixture!.rawPayload,
    });

    expect(report.violations).not.toEqual(
      expect.arrayContaining([
        "timeline rendered without sufficient structured stop data",
        "summary-only itinerary missing explicit summary rendering",
      ])
    );
    expect((report as { diagnostics?: { simpleItineraryAcceptanceApplied?: boolean } }).diagnostics?.simpleItineraryAcceptanceApplied).toBe(true);
  });


  it("enforces hardened title and itinerary rules for productCode 5598628P3", () => {
    const fixture = ENGINE6_VALIDATION_FIXTURES.find(
      entry => entry.productCode === "5598628P3"
    );
    expect(fixture).toBeDefined();

    const payload = toPayload(fixture!);
    const tour = mapViatorToEngine6Tour(payload);
    const report = validateEngine6CreationContract({
      tour,
      rawPayload: fixture!.rawPayload,
    });

    expect(tour.title.length).toBeLessThanOrEqual(90);
    expect(tour.title.toLowerCase()).toContain("san diego");
    expect(tour.itinerary.length).toBeGreaterThan(0);
    expect(tour.itinerary.every(item => Boolean(item.title?.trim()))).toBe(true);
    expect(tour.itinerary.every(item => Boolean(item.description?.trim()))).toBe(true);
    expect(report.violations).toEqual([]);
  });

  it("enforces title context for a day trip tour fixture", () => {
    const fixture = ENGINE6_VALIDATION_FIXTURES.find(
      entry => entry.productCode === "190492P3"
    );
    expect(fixture).toBeDefined();

    const payload = toPayload(fixture!);
    const tour = mapViatorToEngine6Tour(payload);
    const report = validateEngine6CreationContract({
      tour,
      rawPayload: fixture!.rawPayload,
    });

    expect(tour.title.length).toBeLessThanOrEqual(90);
    expect(/from\s+las\s+vegas|las\s+vegas/i.test(tour.title)).toBe(true);
    expect(report.violations).toEqual([]);
  });

  it("enforces title context for an existing city tour fixture", () => {
    const fixture = ENGINE6_VALIDATION_FIXTURES.find(
      entry => entry.productCode === "474891P3"
    );
    expect(fixture).toBeDefined();

    const payload = toPayload(fixture!);
    const tour = mapViatorToEngine6Tour(payload);
    const report = validateEngine6CreationContract({
      tour,
      rawPayload: fixture!.rawPayload,
    });

    expect(tour.title.length).toBeLessThanOrEqual(90);
    expect(/new\s+york\s+city|from\s+/i.test(tour.title)).toBe(true);
    expect(report.violations).toEqual([]);
  });

});
