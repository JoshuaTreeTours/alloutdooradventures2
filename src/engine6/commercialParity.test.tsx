import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import Engine6TourPage from "./components/Engine6TourPage";
import { toEngine6Card } from "./cards";
import {
  formatEngine6PriceLabel,
  getEngine6CommercialSnapshot,
} from "./commercial";
import { toEngine6ListingTour } from "./listing";
import type { Engine6Tour } from "./types";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const whaleWatchingTour: Engine6Tour = {
  productCode: "5144WHALE",
  title: "San Diego Whale Watching Cruise",
  seoTitle: "San Diego Whale Watching Cruise | All Outdoor Adventures",
  seoDescription: "Whale watching tour in San Diego.",
  description: "Whale watching tour in San Diego with marine-life narration.",
  metaDescription: "Whale watching tour in San Diego.",
  city: "San Diego",
  state: "California",
  resolvedImageUrl: "https://cdn.example.com/whale.jpg",
  heroImageUrl: "https://cdn.example.com/whale.jpg",
  priceAmount: 95,
  priceFormatted: "Starting at $95",
  aggregateRating: 4.666,
  reviewCount: 123,
  meetingPointText: "San Diego Harbor",
  durationText: "3 hours",
  overviewText: "Cruise San Diego waters to spot whales and dolphins.",
  highlights: ["Watch for migrating whales"],
  itinerary: [],
  itinerarySummaryText: null,
  faqs: [],
  included: [],
  requirements: [],
  primaryCategory: "wildlife-tour",
  categories: ["wildlife-tour"],
  categoryLabel: "Wildlife Tour",
  pagePath:
    "/destinations/california/san-diego/tours/san-diego-whale-watching-cruise-60603",
  canonicalPath:
    "/destinations/california/san-diego/tours/san-diego-whale-watching-cruise-60603",
  bookingUrl:
    "/destinations/california/san-diego/tours/san-diego-whale-watching-cruise-60603/book",
  diagnostics: {
    source: "legacy-fh-migrated",
    commercialPriceFieldPath: "legacy.price",
    commercialPriceRawValue: 95,
    priceSourceUsed: "fallback",
    heroImageFieldPath: "legacy.og:image",
    heroVariantFieldPath: null,
    selectedHeroWidth: null,
    selectedHeroHeight: null,
    imageSourceUsed: "api-gallery",
    heroSourceType: "api-gallery",
    heroQualityClassification: "product-media",
    finalHeroUrl: "https://cdn.example.com/whale.jpg",
    heroFallbackTriggered: false,
    captionPrecedenceApplied: false,
    candidateFamilyIdentityDeterminable: true,
    heroSurfaceParity: { page: true, card: true, schema: true },
    rejectedForeignHeroCandidates: [],
    productUrlFieldPath: "legacy.bookingPath",
    bookingUrlSource: "legacy.bookingPath",
    ratingFieldPath: "legacy.rating",
    reviewCountFieldPath: "legacy.reviewCount",
    overviewFieldPath: "legacy.overview",
    highlightsFieldPath: "legacy.highlights",
    meetingPointFieldPath: "legacy.meeting",
    itineraryFieldPath: "legacy.itinerary",
    itineraryItemCount: 0,
    itinerarySourceUsed: "legacy.itinerary",
    itinerarySummaryFieldPath: null,
    faqsFieldPath: null,
    faqFieldPath: null,
    faqCount: 0,
    faqSourceUsed: null,
    requirementsFieldPath: "legacy.additionalInfo",
    highlightClassificationReason: "legacy-fh-migrated",
    classificationFieldPath: null,
    fieldLevelFallbackUsed: false,
    fallbackFieldNames: [],
  },
};

describe("engine6 listing/page commercial parity", () => {
  it("keeps price/rating/reviewCount identical between page and listing card surfaces", () => {
    const commercial = getEngine6CommercialSnapshot(whaleWatchingTour);
    const card = toEngine6Card(whaleWatchingTour);
    const listingTour = toEngine6ListingTour(whaleWatchingTour);
    const html = renderToString(<Engine6TourPage tour={whaleWatchingTour} />);

    expect(commercial.rating).toBe(4.7);
    expect(commercial.reviewCount).toBe(123);
    expect(commercial.priceAmount).toBe(95);

    expect(card.ratingLabel).toBe("4.7 (123 reviews)");
    expect(card.priceLabel).toBe("From $95");

    expect(listingTour.badges.rating).toBe(4.7);
    expect(listingTour.badges.reviewCount).toBe(123);
    expect(listingTour.startingPrice).toBe(95);
    expect(listingTour.badges.priceFrom).toBe(
      formatEngine6PriceLabel(commercial.priceAmount)
    );

    expect(html).toContain("From $95");
    expect(html).toContain("4.7");
    expect(html).toContain("123");
    expect(html).toContain("reviews");
  });
});
