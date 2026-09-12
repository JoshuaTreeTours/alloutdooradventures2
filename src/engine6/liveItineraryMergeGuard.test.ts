import { describe, expect, it } from "vitest";

import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import {
  hasWeakEngine6ItineraryTitles,
  preserveEngine6BaselineItineraryWhenStronger,
} from "./liveItineraryMergeGuard";
import type { Engine6Tour } from "./types";

const itinerary = (titles: string[]) =>
  titles.map(title => ({
    title,
    description: `${title} context for the route.`,
    stopType: "stop" as const,
  }));

const tour = (overrides: Partial<Engine6Tour>): Engine6Tour => ({
  productCode: "TEST1",
  title: "Test Tour",
  seoTitle: "Test Tour",
  seoDescription: "Test tour description.",
  description: "Test tour description.",
  metaDescription: "Test tour description.",
  city: "New Orleans",
  state: "Louisiana",
  resolvedImageUrl: "https://example.com/image.jpg",
  heroImageUrl: "https://example.com/image.jpg",
  resolvedHero: null,
  priceAmount: null,
  priceFormatted: "",
  aggregateRating: null,
  reviewCount: null,
  meetingPointText: "",
  durationText: "2 hours",
  overviewText: "Test overview.",
  highlights: [],
  itinerary: [],
  itinerarySummaryText: null,
  faqs: [],
  included: [],
  requirements: [],
  primaryCategory: "sightseeing-tour",
  categories: ["sightseeing-tour"],
  primaryDisplayCategory: "Sightseeing Tour",
  activityCategories: [],
  categoryLabel: "Sightseeing Tour",
  pagePath: "/destinations/louisiana/new-orleans/tours/test-tour",
  canonicalPath: "/destinations/louisiana/new-orleans/tours/test-tour",
  bookingUrl: "https://www.viator.com/tours/test/d1-TEST1",
  ownership: {
    routeOwner: "viator",
    ctaOwner: "viator",
    presentationOwner: "engine6",
    commercialOwner: "viator",
    commercialFallbackReason: "none",
  },
  diagnostics: {
    source: "live-api",
    commercialPriceFieldPath: null,
    commercialPriceRawValue: null,
    priceSourceUsed: "fallback",
    heroImageFieldPath: null,
    heroVariantFieldPath: null,
    selectedHeroWidth: null,
    selectedHeroHeight: null,
    imageSourceUsed: "none",
    heroSourceType: "none",
    heroQualityClassification: "none",
    finalHeroUrl: null,
    heroFallbackTriggered: false,
    heroCandidatesPresent: false,
    heroCandidateCount: 0,
    heroCandidateCountBeforeFiltering: 0,
    heroCandidateCountAfterFiltering: 0,
    heroPlaceholderFallbackReason: null,
    captionPrecedenceApplied: false,
    candidateFamilyIdentityDeterminable: false,
    heroSurfaceParity: { page: true, card: true, schema: true },
    rejectedForeignHeroCandidates: [],
    heroSourceProductCode: null,
    heroSourceProductUrl: null,
    heroSourceFieldPath: null,
    heroHost: null,
    productUrlFieldPath: null,
    bookingUrlSource: "test",
    ratingFieldPath: null,
    reviewCountFieldPath: null,
    overviewFieldPath: null,
    highlightsFieldPath: null,
    meetingPointFieldPath: null,
    itineraryFieldPath: "live.itinerary",
    itineraryItemCount: overrides.itinerary?.length ?? 0,
    itinerarySourceUsed: "live.itinerary",
    itineraryStructuredSourceUsed: true,
    itineraryFallbackSummaryUsed: false,
    itinerarySummaryFieldPath: null,
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
  ...overrides,
});

describe("Engine6 live itinerary merge guard", () => {
  it("good baseline itinerary beats a weaker live candidate", () => {
    const baseline = tour({
      itinerary: itinerary([
        "French Quarter",
        "St. Louis Cathedral",
        "Jackson Square",
      ]),
    });
    const live = tour({
      itinerary: itinerary([
        "This",
        "Pedal past the lively music district",
        "Filled with the city's best restaurants and neighborhood music venues",
      ]),
    });

    const merged = preserveEngine6BaselineItineraryWhenStronger({
      baselineTour: baseline,
      liveTour: live,
    });

    expect(merged.itinerary.map(item => item.title)).toEqual([
      "French Quarter",
      "St. Louis Cathedral",
      "Jackson Square",
    ]);
  });

  it("weak live itinerary cannot overwrite meaningful fixture titles", () => {
    const baseline = tour({
      itinerary: itinerary(["Garden District", "Lafayette Cemetery No. 1"]),
    });
    const live = tour({ itinerary: itinerary(["Stop", "Pass By"]) });

    expect(hasWeakEngine6ItineraryTitles(live.itinerary)).toBe(true);
    expect(
      preserveEngine6BaselineItineraryWhenStronger({
        baselineTour: baseline,
        liveTour: live,
      }).itinerary.map(item => item.title)
    ).toEqual(["Garden District", "Lafayette Cemetery No. 1"]);
  });

  it("strong live itinerary may still be used when baseline is missing or unusable", () => {
    const live = tour({
      itinerary: itinerary(["Golden Gate Bridge", "Sausalito Waterfront"]),
    });
    const unusableBaseline = tour({ itinerary: itinerary(["This", "Stop"]) });

    expect(
      preserveEngine6BaselineItineraryWhenStronger({
        baselineTour: null,
        liveTour: live,
      }).itinerary
    ).toBe(live.itinerary);
    expect(
      preserveEngine6BaselineItineraryWhenStronger({
        baselineTour: unusableBaseline,
        liveTour: live,
      }).itinerary
    ).toBe(live.itinerary);
  });

  it("JSON-LD uses the final preserved itinerary object", () => {
    const baseline = tour({
      itinerary: itinerary([
        "French Quarter",
        "Royal Street",
        "Mississippi River",
      ]),
    });
    const live = tour({
      itinerary: itinerary(["This", "Attraction", "Location"]),
    });
    const merged = preserveEngine6BaselineItineraryWhenStronger({
      baselineTour: baseline,
      liveTour: live,
    });
    const graph = buildEngine6SchemaGraph(merged)["@graph"] as Array<
      Record<string, unknown>
    >;
    const trip = graph.find(node => node["@type"] === "TouristTrip") as {
      itinerary?: { itemListElement?: Array<{ item: { name: string } }> };
    };

    expect(
      trip.itinerary?.itemListElement?.map(item => item.item.name)
    ).toEqual(["French Quarter", "Royal Street", "Mississippi River"]);
  });
});
