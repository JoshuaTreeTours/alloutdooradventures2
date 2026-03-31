import { describe, expect, it } from "vitest";

import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures";
import {
  evaluateEngine6ReplacementEligibility,
  suppressLegacyFareHarborTour,
} from "./replacementMode";
import { engine6ReplacementModeConfigs } from "./routes";
import { toursGenerated } from "../data/tours.generated";

describe("engine6 replacement mode eligibility", () => {
  const pedicabConfig = engine6ReplacementModeConfigs.find(
    config => config.productCode === "414460P1"
  )!;

  it("requires title, price, and meeting point to all pass", () => {
    const pass = evaluateEngine6ReplacementEligibility({
      title: "VIP Central Park Pedicab Guided Tour",
      priceAmount: 50,
      meetingPointText: "10 Central Park S, New York, NY 10019, USA",
      config: pedicabConfig,
    });
    expect(pass.eligible).toBe(true);

    const titleOnly = evaluateEngine6ReplacementEligibility({
      title: "VIP Central Park Pedicab Guided Tour",
      priceAmount: 190,
      meetingPointText: "Dock 99, Miami, Florida",
      config: pedicabConfig,
    });
    expect(titleOnly.titlePassed).toBe(true);
    expect(titleOnly.pricePassed).toBe(false);
    expect(titleOnly.meetingPointPassed).toBe(false);
    expect(titleOnly.eligible).toBe(false);
  });

  it("falls back to native Viator booking when replacement eligibility is ambiguous", () => {
    const fixture = ENGINE6_VALIDATION_FIXTURES.find(
      item => item.productCode === "414460P1"
    )!;

    const mapped = mapViatorToEngine6Tour({
      source: "bundled-fallback",
      rawProductCode: fixture.productCode,
      rawProduct: fixture.rawPayload,
      diagnostics: {
        source: "bundled-fallback",
        hasViatorApiKey: false,
        attemptedLiveFetch: false,
        upstreamStatus: null,
        upstreamContentType: "application/json fixture",
        upstreamOk: null,
        usedBundledFallbackBecause: "test",
        commercialPriceFieldPath: "test",
        commercialPriceRawValue: "$50",
        priceSourceUsed: "live-price",
        heroImageFieldPath: "test",
        heroVariantFieldPath: "test",
        selectedHeroWidth: 1,
        selectedHeroHeight: 1,
        imageSourceUsed: "api-primary",
        heroSourceType: "api-primary",
        finalHeroUrl: null,
        heroFallbackTriggered: false,
        rejectedForeignHeroCandidates: [],
        productUrlFieldPath: "test",
        bookingUrlSource: "test",
        ratingFieldPath: "test",
        reviewCountFieldPath: "test",
        overviewFieldPath: "test",
        highlightsFieldPath: "test",
        meetingPointFieldPath: "test",
        itineraryFieldPath: "test",
        itineraryItemCount: 0,
        itinerarySourceUsed: null,
        faqsFieldPath: "test",
        faqFieldPath: "test",
        faqCount: 0,
        faqSourceUsed: null,
        requirementsFieldPath: "test",
        highlightClassificationReason: null,
        classificationFieldPath: "test",
        fieldLevelFallbackUsed: false,
        fallbackFieldNames: [],
      },
      extracted: {
        title: "VIP Central Park Pedicab Guided Tour",
        seoTitle: null,
        seoDescription: null,
        city: "New York",
        state: "New York",
        heroImageUrl: null,
        productUrl:
          "https://www.viator.com/tours/New-York-City/Vip-Central-Park-Pedicab-Guided-Tours/d687-414460P1",
        priceAmount: 500,
        priceFormatted: "From $500",
        aggregateRating: 4.8,
        reviewCount: 10,
        meetingPointText: "Different meeting location in Brooklyn",
        overviewText: "overview",
        highlights: [],
        itinerary: [],
        itinerarySummaryText: null,
        faqs: [],
        included: [],
        requirements: [],
        primaryCategory: "bike-tour",
        categories: ["bike-tour"],
      },
    });

    expect(mapped.bookingUrl).toContain("viator.com");
    expect(mapped.bookingUrl.endsWith("/book")).toBe(false);
  });

  it("suppresses only FareHarbor legacy tours that have replacement-mode coverage", () => {
    const legacyPedicab = toursGenerated.find(
      tour => tour.slug === "1-hour-central-park-pedicab-tour-27491"
    )!;
    const nonReplacementTour = toursGenerated.find(
      tour => tour.slug === "velo-n-vino-tour-29277"
    )!;

    expect(
      suppressLegacyFareHarborTour(
        legacyPedicab,
        engine6ReplacementModeConfigs.map(config => config.canonicalPath)
      )
    ).toBe(true);
    expect(
      suppressLegacyFareHarborTour(
        nonReplacementTour,
        engine6ReplacementModeConfigs.map(config => config.canonicalPath)
      )
    ).toBe(false);
  });
});
