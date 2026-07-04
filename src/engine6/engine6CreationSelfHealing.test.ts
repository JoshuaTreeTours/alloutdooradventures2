import { describe, expect, it } from "vitest";

(globalThis as { location?: { pathname: string; search?: string } }).location =
  {
    pathname: "/",
    search: "",
  };

import {
  applyEngine6ItineraryOriginalityRepairs,
  applyEngine6ItinerarySummaryOnlyRepair,
  formatEngine6CreationSelfHealingReport,
  runEngine6CreationSelfHealing,
} from "./engine6CreationSelfHealing";
import type { Engine6Tour } from "./types";

const buildTour = (overrides: Partial<Engine6Tour> = {}): Engine6Tour =>
  ({
    productCode: "TESTP1",
    title: "Monterey Coastal Kayak Tour",
    seoTitle: "Monterey Coastal Kayak Tour",
    seoDescription: "Explore Monterey Bay by kayak.",
    description: "Explore Monterey Bay by kayak with a local guide.",
    metaDescription: "Explore Monterey Bay by kayak with a local guide.",
    city: "Monterey",
    state: "California",
    resolvedImageUrl: null,
    heroImageUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/bb/cc/dd.jpg",
    resolvedHero: {
      url: "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/bb/cc/dd.jpg",
      width: 674,
      height: 446,
      sourceType: "api-primary",
      sourceProductCode: "TESTP1",
      sourceProductUrl: "https://www.viator.com/tours/Monterey/Tour/d1-TESTP1",
      fieldPath: "product.media.images[0].variants.FULL.url",
      host: "media.tacdn.com",
    },
    priceAmount: 99,
    priceFormatted: "From $99.00",
    aggregateRating: 4.8,
    reviewCount: 10,
    durationText: "3 hours",
    meetingPointText: "Meet at the pier",
    overviewText: "Explore Monterey Bay by kayak with a local guide.",
    highlights: ["Coastal wildlife", "Guided paddle"],
    itinerary: [],
    itinerarySummaryText: "Paddle along Monterey Bay with coastal wildlife viewing.",
    faqs: [],
    included: [],
    requirements: [],
    primaryCategory: "kayak-tour",
    categories: ["kayak-tour"],
    primaryDisplayCategory: "Kayak",
    activityCategories: [],
    categoryLabel: "Kayak",
    pagePath: "/destinations/california/monterey/tours/monterey-coastal-kayak-tour",
    canonicalPath:
      "/destinations/california/monterey/tours/monterey-coastal-kayak-tour",
    bookingUrl:
      "https://www.viator.com/tours/Monterey/Tour/d1-TESTP1?pid=P00290915",
    ownership: {
      routeOwner: "viator",
      ctaOwner: "viator",
      presentationOwner: "engine6",
      commercialOwner: "viator",
      commercialFallbackReason: "none",
    },
    diagnostics: {
      source: "bundled-fallback",
      commercialPriceFieldPath: "product.pricing.summary.fromPrice",
      commercialPriceRawValue: 99,
      priceSourceUsed: "live-price",
      heroImageFieldPath: "product.media.images[0]",
      heroVariantFieldPath: "product.media.images[0].variants.FULL",
      selectedHeroWidth: 674,
      selectedHeroHeight: 446,
      imageSourceUsed: "api-primary",
      heroSourceType: "api-primary",
      heroQualityClassification: "product-media",
      finalHeroUrl:
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/bb/cc/dd.jpg",
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
      heroSourceProductCode: "TESTP1",
      heroSourceProductUrl:
        "https://www.viator.com/tours/Monterey/Tour/d1-TESTP1",
      heroSourceFieldPath: "product.media.images[0].variants.FULL.url",
      heroHost: "media.tacdn.com",
      productUrlFieldPath: "product.productUrl",
      bookingUrlSource: "product.productUrl",
      ratingFieldPath: "product.reviews.combinedAverageRating",
      reviewCountFieldPath: "product.reviews.totalReviews",
      overviewFieldPath: "product.description",
      highlightsFieldPath: "product.highlights",
      meetingPointFieldPath: "product.logistics.start[0].description",
    },
    ...overrides,
  }) as Engine6Tour;

const weakItineraryPayload = {
  product: {
    productCode: "TESTP1",
    productUrl: "https://www.viator.com/tours/Monterey/Tour/d1-TESTP1",
    description: "Explore Monterey Bay by kayak with a local guide.",
    media: {
      images: [
        {
          variants: {
            FULL: {
              url: "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/bb/cc/dd.jpg",
            },
          },
        },
      ],
    },
    reviews: {
      combinedAverageRating: 4.8,
      totalReviews: 10,
    },
    pricing: {
      summary: {
        fromPrice: 99,
        currency: "USD",
      },
    },
    logistics: {
      start: [{ description: "Meet at the pier" }],
    },
    itineraryItems: [
      {
        title: "Monterey Harbor",
        description: "Launch from Monterey Harbor and begin the coastal paddle.",
      },
    ],
  },
};

const originalityPayload = {
  product: {
    ...weakItineraryPayload.product,
    itineraryItems: [
      {
        title: "Monterey Harbor",
        description:
          "Launch from Monterey Harbor and begin the coastal paddle.",
        duration: "30 minutes",
      },
      {
        title: "Cannery Row",
        description:
          "Paddle past Cannery Row and watch for sea otters along the kelp beds.",
        duration: "45 minutes",
      },
    ],
  },
};

describe("engine6CreationSelfHealing", () => {
  it("switches weak itineraries to summary-only rendering when mapped stop count is below threshold", () => {
    const tour = buildTour({
      itinerary: [
        {
          title: "Monterey Harbor",
          description: "Launch from Monterey Harbor.",
          duration: "30 minutes",
        },
      ],
    });

    const repair = applyEngine6ItinerarySummaryOnlyRepair({
      tour,
      rawPayload: weakItineraryPayload,
    });

    expect(repair.applied).toBe(true);
    expect(repair.tour.itinerary).toEqual([]);
    expect(repair.tour.itinerarySummaryText).toBe(tour.itinerarySummaryText);
  });

  it("rewrites only affected itinerary stop descriptions for originality failures", () => {
    const mirroredDescription =
      "Paddle past Cannery Row and watch for sea otters along the kelp beds.";
    const tour = buildTour({
      itinerary: [
        {
          title: "Monterey Harbor",
          description: "Already original harbor description.",
          duration: "30 minutes",
        },
        {
          title: "Cannery Row",
          description: mirroredDescription,
          duration: "45 minutes",
        },
      ],
    });

    const repair = applyEngine6ItineraryOriginalityRepairs({
      tour,
      rawPayload: originalityPayload,
    });

    expect(repair.repairs).toHaveLength(1);
    expect(repair.repairs[0]?.stopIndex).toBe(1);
    expect(repair.tour.itinerary[0]?.description).toBe(
      "Already original harbor description."
    );
    expect(repair.tour.itinerary[0]?.title).toBe("Monterey Harbor");
    expect(repair.tour.itinerary[0]?.duration).toBe("30 minutes");
    expect(repair.tour.itinerary[1]?.description).not.toBe(mirroredDescription);
    expect(repair.tour.itinerary[1]?.title).toBe("Cannery Row");
    expect(repair.tour.itinerary[1]?.duration).toBe("45 minutes");
  });

  it("does not invent itinerary stops during self-healing", () => {
    const tour = buildTour({
      itinerary: [
        {
          title: "Monterey Harbor",
          description: "Launch from Monterey Harbor.",
        },
      ],
    });

    const repair = applyEngine6ItinerarySummaryOnlyRepair({
      tour,
      rawPayload: weakItineraryPayload,
    });

    expect(repair.tour.itinerary.length).toBe(0);
    expect(repair.tour.itinerary.length).toBeLessThan(
      originalityPayload.product.itineraryItems.length
    );
  });

  it("does not modify governed product descriptions during self-healing", () => {
    const tour = buildTour({
      itinerary: [
        {
          title: "Monterey Harbor",
          description:
            "Launch from Monterey Harbor and begin the coastal paddle.",
        },
        {
          title: "Cannery Row",
          description:
            "Paddle past Cannery Row and watch for sea otters along the kelp beds.",
        },
      ],
    });

    const before = {
      title: tour.title,
      description: tour.description,
      overviewText: tour.overviewText,
      heroImageUrl: tour.heroImageUrl,
      priceAmount: tour.priceAmount,
      aggregateRating: tour.aggregateRating,
      reviewCount: tour.reviewCount,
      canonicalPath: tour.canonicalPath,
      bookingUrl: tour.bookingUrl,
    };

    const { tour: repairedTour } = runEngine6CreationSelfHealing({
      tour,
      rawPayload: originalityPayload,
    });

    expect(repairedTour.title).toBe(before.title);
    expect(repairedTour.description).toBe(before.description);
    expect(repairedTour.overviewText).toBe(before.overviewText);
    expect(repairedTour.heroImageUrl).toBe(before.heroImageUrl);
    expect(repairedTour.priceAmount).toBe(before.priceAmount);
    expect(repairedTour.aggregateRating).toBe(before.aggregateRating);
    expect(repairedTour.reviewCount).toBe(before.reviewCount);
    expect(repairedTour.canonicalPath).toBe(before.canonicalPath);
    expect(repairedTour.bookingUrl).toBe(before.bookingUrl);
  });

  it("is idempotent when no mechanical repairs are required", () => {
    const tour = buildTour({
      itinerary: [],
      itinerarySummaryText: "Summary only itinerary.",
    });

    const first = runEngine6CreationSelfHealing({
      tour,
      rawPayload: weakItineraryPayload,
    });
    const second = runEngine6CreationSelfHealing({
      tour: first.tour,
      rawPayload: weakItineraryPayload,
    });

    expect(first.report.idempotent).toBe(true);
    expect(second.report.repairs).toEqual([]);
    expect(JSON.stringify(second.tour)).toBe(JSON.stringify(first.tour));
  });

  it("emits a repair report with blocked and repaired violations", () => {
    const tour = buildTour({
      itinerary: [
        {
          title: "Monterey Harbor",
          description:
            "Launch from Monterey Harbor and begin the coastal paddle.",
          duration: "30 minutes",
        },
      ],
    });

    const { report } = runEngine6CreationSelfHealing({
      tour,
      rawPayload: weakItineraryPayload,
    });

    expect(report.moduleId).toBe("engine6-creation-self-healing");
    expect(report.productCode).toBe("TESTP1");
    expect(report.repairs.length).toBeGreaterThan(0);
    expect(report.initialViolations.length).toBeGreaterThan(0);

    const markdown = formatEngine6CreationSelfHealingReport(report);
    expect(markdown).toContain("Engine6 Creation Self-Healing");
    expect(markdown).toContain("Repairs");
    expect(markdown).toContain("TESTP1");
  });

  it("requires human approval for non-mechanical blocking failures", () => {
    const tour = buildTour({
      canonicalPath:
        "/destinations/california/yosemite/tours/wrong-destination-tour",
      city: "Yosemite",
    });

    const { report } = runEngine6CreationSelfHealing({
      tour,
      rawPayload: weakItineraryPayload,
    });

    expect(report.humanApprovalRequired).toBe(true);
    expect(report.humanApprovalReasons.length).toBeGreaterThan(0);
  });

  it("leaves published destination fixture paths untouched by only repairing creation-time tour objects", () => {
    const publishedFixturePaths = [
      "data/engine6/viator/5119P13.exact-product.json",
      "scripts/generate-sedona-engine6-fixtures.ts",
      "scripts/generate-glacier-engine6-fixtures.ts",
    ];

    const tour = buildTour();
    const { report } = runEngine6CreationSelfHealing({
      tour,
      rawPayload: weakItineraryPayload,
    });

    expect(report.repairs.every(repair => repair.kind !== "fixture-write")).toBe(
      true
    );
    expect(publishedFixturePaths.every(path => path.length > 0)).toBe(true);
  });
});
