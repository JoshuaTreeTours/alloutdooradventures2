import { describe, expect, it, vi } from "vitest";

import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";

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
        productUrl: "https://www.viator.com/tours/Zurich/Mount-Titlis-Day-Tour-from-Zurich/d577-3885SW303BS",
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
        heroSourceProductUrl: "https://www.viator.com/tours/Zurich/Mount-Titlis-Day-Tour-from-Zurich/d577-3885SW303BS",
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
});

describe("mapViatorToEngine6Tour overview quality guardrails", () => {
  it("avoids blocked filler phrases and generates 100-150 words", () => {
    const hero =
      "https://dynamic-media.tacdn.com/media/photo-o/2f/08/ca/5b/caption.jpg?w=1100&h=800&s=1";

    const tour = mapViatorToEngine6Tour({
      source: "bundled-fallback",
      rawProductCode: "QAOVERVIEW1",
      rawProduct: null,
      extracted: {
        title: "Central Park and Midtown Walking Tour",
        seoTitle: null,
        seoDescription: null,
        city: "New York",
        state: "New York",
        heroImageUrl: hero,
        productUrl: "https://www.viator.com/tours/New-York-City/fake/d687-QAOVERVIEW1",
        priceAmount: null,
        priceFormatted: null,
        durationText: "4 hours",
        aggregateRating: null,
        reviewCount: null,
        meetingPointText: "Midtown Manhattan",
        overviewText:
          "Walk iconic New York areas with a guide and clear pacing for first-time visitors.",
        highlights: ["Central Park", "Times Square", "Rockefeller Center"],
        itinerary: [{ title: "Bethesda Terrace", description: "Landmark stop." }],
        itinerarySummaryText: null,
        faqs: [],
        included: [],
        requirements: [],
        primaryCategory: "Walking Tour",
        categories: ["Walking Tour"],
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
        activeProductCode: "QAOVERVIEW1",
        resolvedHeroUrl: hero,
        rejectedForeignCandidateCount: 0,
        rejectedForeignCandidateExamples: [],
        rejectedForeignHeroCandidates: [],
        heroSourceProductCode: "QAOVERVIEW1",
        heroSourceProductUrl: "https://www.viator.com/tours/New-York-City/fake/d687-QAOVERVIEW1",
        heroSourceFieldPath: "product.media.images[0].variants.FULL.url",
        heroHost: "dynamic-media.tacdn.com",
        productUrlFieldPath: null,
        bookingUrlSource: "generated:viator-search-product-code",
        ratingFieldPath: null,
        reviewCountFieldPath: null,
        overviewFieldPath: null,
        highlightsFieldPath: null,
        itineraryFieldPath: null,
        itineraryItemCount: 1,
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

    const words = (tour.overviewText ?? "").trim().split(/\s+/).filter(Boolean).length;
    expect(words).toBeGreaterThanOrEqual(100);
    expect(words).toBeLessThanOrEqual(150);
    expect(tour.overviewText).not.toMatch(/activities such as|scheduled stops such as/i);
  });
});
