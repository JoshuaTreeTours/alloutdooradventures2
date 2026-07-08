import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

import Engine6TourPage from "./components/Engine6TourPage";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

describe("mapViatorToEngine6Tour location normalization", () => {
  it("does not default to USA when Swiss canonical route is configured", () => {
    const hero =
      "https://dynamic-media.tacdn.com/media/photo-o/2f/08/ca/5b/caption.jpg?w=1100&h=800&s=1";

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const tour = mapViatorToEngine6Tour({
      source: "bundled-fallback",
      rawProductCode: "3885SW303BS",
      rawProduct: null,
      extracted: {
        title: "Mount Titlis and Lucerne Day Trip from Zurich",
        seoTitle: null,
        seoDescription: null,
        city: null,
        state: null,
        heroImageUrl: hero,
        productUrl:
          "https://www.viator.com/tours/Zurich/Mount-Titlis-Day-Tour-from-Zurich/d577-3885SW303BS",
        priceAmount: null,
        priceFormatted: null,
        durationText: null,
        aggregateRating: null,
        reviewCount: null,
        meetingPointText: null,
        overviewText: "Swiss Alps day trip",
        highlights: [],
        itinerary: [],
        itinerarySummaryText: null,
        faqs: [],
        included: [],
        requirements: [],
        primaryCategory: null,
        categories: [],
      },
      diagnostics: {
        source: "bundled-fallback",
        hasViatorApiKey: false,
        attemptedLiveFetch: false,
        upstreamStatus: null,
        upstreamContentType: null,
        upstreamOk: null,
        usedBundledFallbackBecause: "test",
        commercialPriceFieldPath: null,
        commercialPriceRawValue: null,
        priceSourceUsed: "fallback",
        heroImageFieldPath: "product.media.images[0].variants.FULL.url",
        heroVariantFieldPath: "product.media.images[0].variants.FULL",
        selectedHeroWidth: 1100,
        selectedHeroHeight: 800,
        imageSourceUsed: "api-primary",
        heroSourceType: "api-primary",
        heroQualityClassification: "photo-o",
        finalHeroUrl: hero,
        heroFallbackTriggered: false,
        heroCandidatesPresent: true,
        heroCandidateCount: 1,
        heroCandidateCountBeforeFiltering: 1,
        heroCandidateCountAfterFiltering: 1,
        heroPlaceholderFallbackReason: null,
        captionPrecedenceApplied: true,
        candidateFamilyIdentityDeterminable: true,
        heroSurfaceParity: { page: true, card: true, schema: true },
        activeProductCode: "3885SW303BS",
        resolvedHeroUrl: hero,
        rejectedForeignCandidateCount: 0,
        rejectedForeignCandidateExamples: [],
        rejectedForeignHeroCandidates: [],
        heroSourceProductCode: "3885SW303BS",
        heroSourceProductUrl:
          "https://www.viator.com/tours/Zurich/Mount-Titlis-Day-Tour-from-Zurich/d577-3885SW303BS",
        heroSourceFieldPath: "product.media.images[0].variants.FULL.url",
        heroHost: "dynamic-media.tacdn.com",
        productUrlFieldPath: null,
        bookingUrlSource: "generated:viator-search-product-code",
        ratingFieldPath: null,
        reviewCountFieldPath: null,
        overviewFieldPath: null,
        highlightsFieldPath: null,
        itineraryFieldPath: null,
        itineraryItemCount: 0,
        itinerarySourceUsed: null,
        itinerarySummaryFieldPath: null,
        meetingPointFieldPath: null,
        meetingPointRawText: null,
        meetingPointSummaryApplied: false,
        meetingPointSummaryReason: null,
        faqsFieldPath: null,
        faqFieldPath: null,
        faqCount: 0,
        faqSourceUsed: null,
        requirementsFieldPath: null,
        highlightClassificationReason: null,
        classificationFieldPath: null,
        fieldLevelFallbackUsed: false,
        fallbackFieldNames: [],
      },
    });

    expect(tour.canonicalPath).toBe(
      "/destinations/switzerland/zurich/tours/mount-titlis-and-lucerne-day-trip-from-zurich"
    );
    expect(tour.state).toBe("Switzerland");
    expect(tour.city).toBe("Zurich");
    expect(tour.state).not.toBe("USA");
    expect(tour.overviewText).toContain("full-day guided excursion");
    expect(tour.overviewText).toContain("Zurich, Switzerland");
    expect(tour.overviewText).toContain("Lucerne");
    expect(tour.overviewText).toContain("Mount Titlis");
    expect(tour.overviewText).not.toContain("USA");
    expect(tour.overviewText).not.toContain("Destination");

    warnSpy.mockRestore();
  });

  it("maps the Santa Barbara narrated coastal yacht replacement route", () => {
    const hero =
      "https://dynamic-media.tacdn.com/media/photo-o/31/49/f0/a5/caption.jpg?w=1400&h=1000&s=1";

    const tour = mapViatorToEngine6Tour({
      source: "live-api",
      rawProductCode: "447486P8",
      rawProduct: null,
      extracted: {
        title: "Discover Santa Barbara Cruise: Narrated Coastal Yacht Experience",
        seoTitle: null,
        seoDescription: null,
        city: "Santa Barbara",
        state: "California",
        heroImageUrl: hero,
        productUrl:
          "https://www.viator.com/tours/Santa-Barbara/Discover-Santa-Barbara-Cruise-Narrated-Coastal-Yacht-Experience/d4372-447486P8",
        priceAmount: 129,
        priceFormatted: null,
        durationText: "1 hour 30 minutes",
        aggregateRating: 4.6,
        reviewCount: 836,
        meetingPointText: "1 Garden St, Santa Barbara, CA",
        overviewText: "Cruise the Santa Barbara waterfront by yacht.",
        highlights: [],
        itinerary: [
          { title: "Santa Barbara Harbor", description: "Depart the harbor." },
          { title: "Stearns Wharf", description: "Cruise past the wharf." },
        ],
        itinerarySummaryText:
          "Harbor departure; waterfront cruise; harbor return.",
        faqs: [],
        included: [],
        requirements: [],
        primaryCategory: "boat-tour",
        categories: ["boat-tour"],
      },
      diagnostics: {
        source: "live-api",
        hasViatorApiKey: false,
        attemptedLiveFetch: false,
        upstreamStatus: null,
        upstreamContentType: null,
        upstreamOk: null,
        usedBundledFallbackBecause: "test",
        commercialPriceFieldPath: "product.priceFrom",
        commercialPriceRawValue: 129,
        priceSourceUsed: "live-price",
        heroImageFieldPath: "product.media.images[0].variants.FULL.url",
        heroVariantFieldPath: "product.media.images[0].variants.FULL",
        selectedHeroWidth: 1400,
        selectedHeroHeight: 1000,
        imageSourceUsed: "api-primary",
        heroSourceType: "api-primary",
        heroQualityClassification: "caption",
        finalHeroUrl: hero,
        heroFallbackTriggered: false,
        heroCandidatesPresent: true,
        heroCandidateCount: 1,
        heroCandidateCountBeforeFiltering: 1,
        heroCandidateCountAfterFiltering: 1,
        heroPlaceholderFallbackReason: null,
        captionPrecedenceApplied: true,
        candidateFamilyIdentityDeterminable: true,
        heroSurfaceParity: { page: true, card: true, schema: true },
        rejectedForeignHeroCandidates: [],
        heroSourceProductCode: "447486P8",
        heroSourceProductUrl:
          "https://www.viator.com/tours/Santa-Barbara/Discover-Santa-Barbara-Cruise-Narrated-Coastal-Yacht-Experience/d4372-447486P8",
        heroSourceFieldPath: "product.media.images[0].variants.FULL.url",
        heroHost: "dynamic-media.tacdn.com",
        productUrlFieldPath: "product.productUrl",
        bookingUrlSource: "product.productUrl",
        ratingFieldPath: "product.reviews.combinedAverageRating",
        reviewCountFieldPath: "product.reviews.totalReviews",
        overviewFieldPath: "product.description",
        highlightsFieldPath: null,
        itineraryFieldPath: "product.itineraryItems",
        itineraryItemCount: 2,
        itinerarySourceUsed: "product.itineraryItems",
        itinerarySummaryFieldPath: "product.itinerarySummary",
        meetingPointFieldPath: "product.logistics.start[0].description",
        meetingPointRawText: "1 Garden St, Santa Barbara, CA",
        meetingPointSummaryApplied: false,
        meetingPointSummaryReason: null,
        faqsFieldPath: null,
        faqFieldPath: null,
        faqCount: 0,
        faqSourceUsed: null,
        requirementsFieldPath: null,
        highlightClassificationReason: null,
        classificationFieldPath: null,
        fieldLevelFallbackUsed: false,
        fallbackFieldNames: [],
      },
    });

    const html = renderToString(createElement(Engine6TourPage, { tour }));

    expect(tour.pagePath).toBe(
      "/destinations/california/santa-barbara/tours/discover-santa-barbara-cruise-narrated-coastal-yacht-experience"
    );
    expect(tour.itinerary).toEqual([]);
    expect(tour.itinerarySummaryText).toBeNull();
    expect(html).not.toContain(">Itinerary<");
    expect(html).not.toContain('data-testid="engine6-itinerary-timeline"');
    expect(html).not.toContain('data-testid="engine6-itinerary-summary-only"');
  });
});
