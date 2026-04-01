import { describe, expect, it } from "vitest";

import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures";
import { suppressLegacyFareHarborTour } from "./replacementMode";
import { engine6OverlapReplacementConfigs } from "./routes";
import { toursGenerated } from "../data/tours.generated";

describe("engine6 overlap replacement policy", () => {

  it("always uses native Viator booking links for overlap replacements", () => {
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
        heroImageFieldPath: "product.media.images[0].variants[\"FULL\"].url",
        heroVariantFieldPath: "product.media.images[0].variants[\"FULL\"]",
        selectedHeroWidth: 720,
        selectedHeroHeight: 480,
        imageSourceUsed: "api-primary",
        heroSourceType: "api-primary",
        heroQualityClassification: "product-media",
        finalHeroUrl:
          "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/12/34/56/78.jpg",
        heroFallbackTriggered: false,
        heroCandidatesPresent: true,
        heroCandidateCount: 1,
        heroCandidateCountBeforeFiltering: 1,
        heroCandidateCountAfterFiltering: 1,
        heroPlaceholderFallbackReason: null,
        rejectedForeignHeroCandidates: [],
        captionPrecedenceApplied: false,
        candidateFamilyIdentityDeterminable: false,
        heroSurfaceParity: {
          page: false,
          card: false,
          schema: false,
        },
        heroSourceProductCode: "414460P1",
        heroSourceProductUrl:
          "https://www.viator.com/tours/New-York-City/Vip-Central-Park-Pedicab-Guided-Tours/d687-414460P1",
        heroSourceFieldPath: "product.media.images[0].variants[\"FULL\"].url",
        heroHost: "media-cdn.tripadvisor.com",
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
        heroImageUrl:
          "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/12/34/56/78.jpg",
        productUrl:
          "https://www.viator.com/tours/New-York-City/Vip-Central-Park-Pedicab-Guided-Tours/d687-414460P1",
        priceAmount: 50,
        priceFormatted: "From $50",
        aggregateRating: 4.8,
        reviewCount: 10,
        meetingPointText: "10 Central Park S, New York, NY 10019, USA",
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
    expect(mapped.ownership.ctaOwner).toBe("viator");
  });

  it("suppresses only FareHarbor legacy tours that have overlap replacement coverage", () => {
    const legacyPedicab = toursGenerated.find(
      tour => tour.slug === "1-hour-central-park-pedicab-tour-27491"
    )!;
    const nonReplacementTour = toursGenerated.find(
      tour => tour.slug === "velo-n-vino-tour-29277"
    )!;

    expect(
      suppressLegacyFareHarborTour(
        legacyPedicab,
        engine6OverlapReplacementConfigs.map(config => config.canonicalPath)
      )
    ).toBe(true);
    expect(
      suppressLegacyFareHarborTour(
        nonReplacementTour,
        engine6OverlapReplacementConfigs.map(config => config.canonicalPath)
      )
    ).toBe(false);
  });
});
