import { describe, expect, it } from "vitest";

import {
  buildEngine6InventoryHealthReplacementReport,
  recommendEngine6ReplacementCandidate,
} from "./inventoryHealthReplacementRecommendations";
import type { Engine6Tour } from "./types";

const baseTour = (overrides: Partial<Engine6Tour>): Engine6Tour => ({
  productCode: "BASEP1",
  title: "Base tour",
  seoTitle: "Base tour",
  seoDescription: "Base tour",
  description: "Base tour",
  metaDescription: "Base tour",
  city: "Santa Barbara",
  state: "California",
  resolvedImageUrl: "https://example.com/image.jpg",
  heroImageUrl: "https://example.com/image.jpg",
  resolvedHero: null,
  priceAmount: 99,
  priceFormatted: "$99.00",
  aggregateRating: 4.8,
  reviewCount: 12,
  meetingPointText: "Santa Barbara Harbor",
  durationText: "2 hours",
  overviewText: "A governed tour.",
  highlights: [],
  itinerary: [],
  itinerarySummaryText: null,
  faqs: [],
  included: [],
  requirements: [],
  primaryCategory: "boat-tour",
  categories: ["boat-tour"],
  primaryDisplayCategory: "Boat tour",
  activityCategories: [{ slug: "sailing", label: "Sailing" }],
  categoryLabel: "Boat tour",
  pagePath: "/destinations/california/santa-barbara/tours/base-tour",
  canonicalPath: "/destinations/california/santa-barbara/tours/base-tour",
  bookingUrl: "https://www.viator.com/tours/Santa-Barbara/Base/d4372-BASEP1",
  ownership: {
    routeOwner: "viator",
    ctaOwner: "viator",
    presentationOwner: "engine6",
    commercialOwner: "viator",
    commercialFallbackReason: "none",
  },
  diagnostics: {
    source: "live-api",
    commercialPriceFieldPath: "fromPrice",
    commercialPriceRawValue: 99,
    priceSourceUsed: "live-price",
    heroImageFieldPath: "images[0]",
    heroVariantFieldPath: "images[0].variants[0]",
    selectedHeroWidth: 1200,
    selectedHeroHeight: 800,
    imageSourceUsed: "api-primary",
    heroSourceType: "api-primary",
    heroQualityClassification: "product-media",
    finalHeroUrl: "https://example.com/image.jpg",
    heroFallbackTriggered: false,
    heroCandidatesPresent: true,
    heroCandidateCount: 1,
    heroCandidateCountBeforeFiltering: 1,
    heroCandidateCountAfterFiltering: 1,
    heroPlaceholderFallbackReason: null,
    captionPrecedenceApplied: false,
    candidateFamilyIdentityDeterminable: true,
    heroSurfaceParity: { page: true, card: true, schema: true },
    rejectedForeignHeroCandidates: [],
    heroSourceProductCode: "BASEP1",
    heroSourceProductUrl: "https://www.viator.com/tours/Santa-Barbara/Base/d4372-BASEP1",
    heroSourceFieldPath: "images[0]",
    heroHost: "example.com",
    productUrlFieldPath: "productUrl",
    bookingUrlSource: "viator-product-url",
    ratingFieldPath: "reviews.combinedAverageRating",
    reviewCountFieldPath: "reviews.totalReviews",
    overviewFieldPath: "description",
    highlightsFieldPath: "highlights",
    meetingPointFieldPath: "logistics.start[0]",
    itineraryFieldPath: "itinerary",
    itineraryItemCount: 0,
    itinerarySourceUsed: "none",
    faqsFieldPath: "faqs",
    faqFieldPath: "faqs",
    faqCount: 0,
    faqSourceUsed: "none",
    requirementsFieldPath: "requirements",
    highlightClassificationReason: null,
    classificationFieldPath: "classification",
    fieldLevelFallbackUsed: false,
    fallbackFieldNames: [],
  },
  ...overrides,
});

const unhealthyHappyHour = baseTour({
  productCode: "447486P2",
  title: "Santa Barbara Happy Hour on a Yacht",
  canonicalPath:
    "/destinations/california/santa-barbara/tours/santa-barbara-happy-hour-on-a-yacht",
  pagePath:
    "/destinations/california/santa-barbara/tours/santa-barbara-happy-hour-on-a-yacht",
  bookingUrl: "",
  heroImageUrl: null,
  resolvedImageUrl: null,
  priceAmount: null,
  aggregateRating: null,
  reviewCount: null,
});

const replacementCruise = baseTour({
  productCode: "447486P8",
  title: "Discover Santa Barbara Cruise Narrated Coastal Yacht Experience",
  canonicalPath:
    "/destinations/california/santa-barbara/tours/discover-santa-barbara-cruise-narrated-coastal-yacht-experience",
  pagePath:
    "/destinations/california/santa-barbara/tours/discover-santa-barbara-cruise-narrated-coastal-yacht-experience",
  reviewCount: 42,
});

const otherCityCruise = baseTour({
  productCode: "OTHERP1",
  title: "Other City Cruise",
  city: "San Diego",
  canonicalPath: "/destinations/california/san-diego/tours/other-city-cruise",
  pagePath: "/destinations/california/san-diego/tours/other-city-cruise",
});

describe("Engine6 inventory health replacement recommendations", () => {
  it("flags an unhealthy surfaced product and suggests a same-city replacement", () => {
    const report = buildEngine6InventoryHealthReplacementReport({
      tours: [unhealthyHappyHour, replacementCruise, otherCityCruise],
      surfacedProductCodes: ["447486P2"],
      unavailableProductCodes: ["447486P2"],
      generatedAt: "2026-07-08T00:00:00.000Z",
    });

    expect(report.pass).toBe(false);
    expect(report.findings).toHaveLength(1);
    expect(report.findings[0].unhealthyProductCode).toBe("447486P2");
    expect(report.findings[0].reasons).toContain(
      "current Engine6/Viator source marks product retired or unavailable"
    );
    expect(report.findings[0].recommendedReplacement?.productCode).toBe(
      "447486P8"
    );
    expect(
      report.findings[0].recommendedReplacement?.commercialFieldsPresent
    ).toEqual({
      bookingUrl: true,
      image: true,
      price: true,
      rating: true,
      reviewCount: true,
    });
  });

  it("does not suggest inactive, different-city, or commercially incomplete candidates", () => {
    const incompleteCandidate = baseTour({
      productCode: "447486P4",
      title: "Private Harbor Cruise on Electric Boat in Santa Barbara",
      reviewCount: null,
      canonicalPath:
        "/destinations/california/santa-barbara/tours/private-harbor-cruise-on-electric-boat-in-santa-barbara-447486P4",
    });

    const recommendation = recommendEngine6ReplacementCandidate({
      unhealthyTour: unhealthyHappyHour,
      tours: [unhealthyHappyHour, incompleteCandidate, otherCityCruise],
      unavailableProductCodes: new Set(["447486P2"]),
      excludedReplacementProductCodes: new Set(["447486P2"]),
    });

    expect(recommendation).toBeNull();
  });

  it("never mutates or automatically replaces the surfaced product", () => {
    const tours = [unhealthyHappyHour, replacementCruise];
    const originalCodes = tours.map(tour => tour.productCode);

    const report = buildEngine6InventoryHealthReplacementReport({
      tours,
      surfacedProductCodes: ["447486P2"],
      unavailableProductCodes: ["447486P2"],
    });

    expect(tours.map(tour => tour.productCode)).toEqual(originalCodes);
    expect(report.auditedSurfaceProductCodes).toEqual(["447486P2"]);
    expect(report.findings[0].unhealthyProductCode).toBe("447486P2");
    expect(report.findings[0].recommendedReplacement?.productCode).toBe(
      "447486P8"
    );
  });
});
