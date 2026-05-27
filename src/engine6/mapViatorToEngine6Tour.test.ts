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

it("rewrites overview and itinerary prose without reusing raw API sentences", () => {
  const hero = "https://dynamic-media.tacdn.com/media/photo-o/2f/48/81/4f/caption.jpg?w=700&h=500&s=1";
  const rawOverview = "Embark on an exhilarating journey through history with our Alcatraz Highlights Tour! Step foot on the infamous island that once contained America's most notorious criminals.";
  const rawItinerary = "We will start the tour riding the scenic ferry to Alcatraz Island. This ride will take 20-30 minutes.";
  const tour = mapViatorToEngine6Tour({
    source: "bundled-fallback",
    rawProductCode: "304471P122",
    rawProduct: null,
    extracted: {
      title: "San Francisco Alcatraz App Guided Tour with Cruise and Jail House",
      seoTitle: null,
      seoDescription: null,
      city: "San Francisco",
      state: "California",
      heroImageUrl: hero,
      productUrl: "https://www.viator.com/tours/San-Francisco/San-Francisco-Alcatraz-App-Guided-Tour-Cruise-Jail-House-Tour/d651-304471P122",
      priceAmount: 99,
      priceFormatted: "$99",
      durationText: "2 hours",
      aggregateRating: 4,
      reviewCount: 20,
      meetingPointText: "Pier 33",
      overviewText: rawOverview,
      highlights: ["Alcatraz ferry", "App-guided format"],
      itinerary: [{ title: "Alcatraz Island", description: rawItinerary, stopType: "stop", duration: "25 minutes", admissionNote: "Admission included" }],
      itinerarySummaryText: null,
      faqs: [],
      included: [],
      requirements: [],
      primaryCategory: null,
      categories: [],
    },
    diagnostics: {
      source: "bundled-fallback",hasViatorApiKey:false,attemptedLiveFetch:false,upstreamStatus:null,upstreamContentType:null,upstreamOk:null,usedBundledFallbackBecause:"test",
      commercialPriceFieldPath:null,commercialPriceRawValue:null,priceSourceUsed:"fallback",heroImageFieldPath:"product.media.images[0].variants.FULL.url",heroVariantFieldPath:"product.media.images[0].variants.FULL",selectedHeroWidth:700,selectedHeroHeight:500,imageSourceUsed:"api-primary",heroSourceType:"api-primary",heroQualityClassification:"photo-o",finalHeroUrl:hero,heroFallbackTriggered:false,heroCandidatesPresent:true,heroCandidateCount:1,heroCandidateCountBeforeFiltering:1,heroCandidateCountAfterFiltering:1,heroPlaceholderFallbackReason:null,captionPrecedenceApplied:true,candidateFamilyIdentityDeterminable:true,heroSurfaceParity:{page:true,card:true,schema:true},activeProductCode:"304471P122",resolvedHeroUrl:hero,rejectedForeignCandidateCount:0,rejectedForeignCandidateExamples:[],rejectedForeignHeroCandidates:[],heroSourceProductCode:"304471P122",heroSourceProductUrl:"https://www.viator.com/tours/San-Francisco/San-Francisco-Alcatraz-App-Guided-Tour-Cruise-Jail-House-Tour/d651-304471P122",heroSourceFieldPath:"product.media.images[0].variants.FULL.url",heroHost:"dynamic-media.tacdn.com",productUrlFieldPath:null,bookingUrlSource:"generated:viator-search-product-code",ratingFieldPath:null,reviewCountFieldPath:null,overviewFieldPath:null,highlightsFieldPath:null,itineraryFieldPath:null,itineraryItemCount:1,itinerarySourceUsed:null,itinerarySummaryFieldPath:null,meetingPointFieldPath:null,meetingPointRawText:null,meetingPointSummaryApplied:false,meetingPointSummaryReason:null,faqsFieldPath:null,faqFieldPath:null,faqCount:0,faqSourceUsed:null,requirementsFieldPath:null,highlightClassificationReason:null,classificationFieldPath:null,fieldLevelFallbackUsed:false,fallbackFieldNames:[],itineraryStructuredSourceUsed:true,itineraryFallbackSummaryUsed:false,extractionFailure:false,hasAnyViablePriceCandidate:false,viablePriceCandidateFieldPaths:[],priceIntegrityViolation:false,
    } as any,
  } as any);

  expect(tour.overviewText).not.toContain("Embark on an exhilarating journey through history");
  expect(tour.overviewText).toContain("San Francisco");
  expect(tour.itinerary[0]?.description).toBe("Stop at Alcatraz Island for about 25 minutes.");
  expect(tour.seoDescription).toBeTruthy();
  expect(tour.seoDescription).not.toContain("Embark on an exhilarating journey through history");
});
