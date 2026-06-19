import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import TourCard from "../components/TourCard";
import {
  getCityTourDetailPath,
  getToursByCity,
  getToursByCityUnified,
  getToursByState,
} from "../data/tours";
import Engine6TourPage, {
  hydrateRelatedTourCommercialFields,
} from "./components/Engine6TourPage";
import ToursLanding from "../pages/tours/ToursLanding";
import CityToursIndexRoute from "../pages/destinations/states/tours/CityToursIndexRoute";
import CityTourDetailRoute from "../pages/destinations/states/tours/CityTourDetailRoute";
import { buildEngine6ViatorBookingUrl } from "./buildEngine6ViatorBookingUrl";
import { validateEngine6GovernedItinerary } from "./itineraryGovernance";
import { normalizeEngine6AggregateRating } from "./rating";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import {
  buildEngine6MetaDescription,
  buildEngine6Seo,
  buildEngine6SeoDescription,
  buildEngine6SeoTitle,
  buildMetaDescription,
  hasEngine6GeneratedDescriptionPrefix,
  isEngine6OperationalFiller,
} from "./seo";
import { buildEngine6CardSurfaces, toEngine6Card } from "./cards";
import { ENGINE6_63657P1_CARD_IMAGE_URL, engine6SpecimenTour } from "./listing";
import { resolveMerchantDescription } from "./merchantDescriptions";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import {
  engine6ResolvedTours,
  getEngine6NativeTourByCanonicalPath,
} from "./registry";
import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures";
import {
  ENGINE6_ANTELOPE_ROUTE,
  ENGINE6_CATALINA_ROUTE,
  ENGINE6_EMERALD_CAVE_ROUTE,
  ENGINE6_ANCHORAGE_PRIVATE_ROUTE,
  ENGINE6_ANCHORAGE_SUNSET_ROUTE,
  ENGINE6_ANCHORAGE_GREENBELT_ROUTE,
  ENGINE6_FORT_LAUDERDALE_BAHAMAS_FERRY_ROUTE,
  ENGINE6_FORT_LAUDERDALE_TROPICAL_KAYAK_ROUTE,
  ENGINE6_FORT_LAUDERDALE_EVERGLADES_AIRBOAT_ROUTE,
  ENGINE6_FORT_LAUDERDALE_JETCAR_RENTAL_ROUTE,
  ENGINE6_FORT_LAUDERDALE_BIG_GAME_FISHING_ROUTE,
  ENGINE6_NYC_CLASSIC_MANHATTAN_EBIKE_ROUTE,
  ENGINE6_NYC_BROOKLYN_BRIDGE_ROUTE,
  ENGINE6_NYC_PEDICAB_ROUTE,
  ENGINE6_PARAGON_ROUTE,
  ENGINE6_MIAMI_PIRATE_BOAT_ROUTE,
  ENGINE6_PALM_SPRINGS_SUNRISE_HIKE_ROUTE,
  ENGINE6_JOSHUA_TREE_HALF_DAY_SMALL_GROUP_ROUTE,
  ENGINE6_PALM_SPRINGS_INDIAN_CANYONS_BIKE_HIKE_ROUTE,
  ENGINE6_NYC_CHINATOWN_LITTLE_ITALY_FOOD_ROUTE,
  ENGINE6_SAN_DIEGO_BAY_DAY_SAIL_ROUTE,
  ENGINE6_SAN_DIEGO_HALF_DAY_4X4_ROUTE,
  ENGINE6_SAN_DIEGO_JOSHUA_TREE_ROUTE,
  ENGINE6_SAN_DIEGO_PRIVATE_BALBOA_SEGWAY_ROUTE,
  ENGINE6_SAN_DIEGO_PRIVATE_SAILING_CHARTER_ROUTE,
  ENGINE6_SAN_DIEGO_SEA_CAVE_KAYAK_ROUTE,
  ENGINE6_SAN_DIEGO_SEAL_TOUR_ROUTE,
  ENGINE6_SAN_DIEGO_SUNSET_SAILING_ROUTE,
  ENGINE6_SAN_DIEGO_TIJUANA_BORDER_TOUR_ROUTE,
  ENGINE6_SAN_DIEGO_ZOO_COMBO_ROUTE,
  ENGINE6_SPECIMEN_ROUTE,
  ENGINE6_YOSEMITE_ROUTE,
  ENGINE6_GOLDEN_GATE_MUIR_WOODS_BIKE_ROUTE,
  ENGINE6_SAN_FRANCISCO_YOSEMITE_3_DAY_CAMPING_ROUTE,
  ENGINE6_EXPLICIT_ROUTE_REPLACEMENTS,
  ENGINE6_ORIGINAL_MERCHANT_APPROVED_PRODUCT_CODES,
} from "./routes";
import {
  buildEngine6SpecimenApiUrl,
  resolveEngine6SpecimenResponse,
  shouldShowEngine6Diagnostics,
} from "../pages/engine6/Engine6SpecimenRoute";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const specimenProductPayload = {
  product: {
    productCode: "63657P1",
    productUrl:
      "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
    title: "Santa Barbara Vineyard to Table Taste Tour by E-Bike",
    description: {
      text: "<p>Ride through the towns and vineyards of the Santa Ynez Valley wine region on this e-bike tour with transport from Santa Barbara. With a guide, you'll pedal a Rad Power E-bike to wineries, a lavendar farm, the town of Solvang, and other spots for wine and olive-oil tastings and lunch.</p>",
    },
    highlights: [
      "Bike and helmet provided for this tour through the Santa Ynez Valley wine region",
      "Stop for wine and olive-oil tastings and learn about lavendar oil production",
      "Enjoy a picnic lunch at a winery without packing food",
      "Hotel pickup and drop-off for transport to the riding location",
    ],
    additionalInfo: [
      "Confirmation will be received at time of booking",
      "Not wheelchair accessible",
      "A minimum of 2 people per booking is required",
      "Travelers should have a moderate physical fitness level",
      "This tour/activity will have a maximum of 8 travelers",
    ],
    location: { city: "Santa Barbara", state: "California" },
    priceFrom: "$199.00",
    media: {
      images: [
        {
          isCover: true,
          variants: {
            FULL: {
              url: ENGINE6_63657P1_CARD_IMAGE_URL,
              width: 674,
              height: 446,
            },
          },
        },
      ],
    },
    reviews: { combinedAverageRating: 4.9, totalReviews: 177 },
    logistics: {
      start: {
        description:
          "3850 State St, Santa Barbara, CA 93105, USA. Peppertree Inn with free parking.",
      },
    },
    itineraryItems: [
      {
        title: "I Bike Santa Barbara Wine Tours",
        description: "Admission Ticket Included",
        duration: "40 minutes",
      },
      {
        title: "Solvang",
        description: "Admission Ticket Free",
        duration: "20 minutes",
      },
    ],
  },
};

const ENGINE6_60136P1_EXPECTED_HERO_URL =
  "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/0b/eb/d1/48.jpg";

const ENGINE6_36001P1_EXPECTED_HERO_URL =
  "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/07/31/dd/5f.jpg";
const ENGINE6_447234P3_EXPECTED_HERO_URL =
  "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/13/c0/42/c4.jpg";
const ENGINE6_5584233P1_EXPECTED_HERO_URL =
  "https://dynamic-media.tacdn.com/media/photo-o/30/39/1f/1e/caption.jpg?w=700&h=500&s=1";
const ENGINE6_327321P1_EXPECTED_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/0d/07/b0/bc.jpg";
const ENGINE6_335698P7_EXPECTED_HERO_URL =
  "https://dynamic-media.tacdn.com/media/photo-o/2f/3a/5f/b2/caption.jpg?w=700&h=500&s=1";
const ENGINE6_3351P15_EXPECTED_HERO_URL =
  "https://dynamic-media.tacdn.com/media/photo-o/2f/39/12/13/caption.jpg?w=700&h=500&s=1";
const ENGINE6_21165P1_EXPECTED_HERO_URL =
  "https://dynamic-media.tacdn.com/media/photo-o/2f/19/65/61/caption.jpg?w=700&h=500&s=1";
const ENGINE6_31015P9_EXPECTED_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-360x240/0a/b2/7b/e3.jpg";
const ENGINE6_173946P1_EXPECTED_HERO_URL =
  "https://dynamic-media.tacdn.com/media/photo-o/2e/ed/15/f7/caption.jpg?w=1400&h=1000&s=1";
const ENGINE6_18125P5_EXPECTED_HERO_URL =
  "https://dynamic-media.tacdn.com/media/photo-o/2e/ed/15/dc/caption.jpg?w=700&h=500&s=1";

const countStructuredSourceStops = (
  rawPayload: Record<string, unknown>
): number => {
  const payload = rawPayload as Record<string, unknown>;
  const itinerary = payload.itinerary as Record<string, unknown> | undefined;
  const itineraryItems = Array.isArray(payload.itineraryItems)
    ? (payload.itineraryItems as unknown[])
    : Array.isArray(itinerary?.itineraryItems)
      ? (itinerary.itineraryItems as unknown[])
      : Array.isArray(itinerary?.items)
        ? (itinerary.items as unknown[])
        : Array.isArray(itinerary?.days)
          ? (itinerary.days as unknown[]).flatMap(day => {
              if (!day || typeof day !== "object") return [];
              const row = day as Record<string, unknown>;
              return Array.isArray(row.items)
                ? (row.items as unknown[])
                : Array.isArray(row.stops)
                  ? (row.stops as unknown[])
                  : [];
            })
          : [];

  return itineraryItems.filter(item => {
    if (!item || typeof item !== "object") {
      return false;
    }
    const row = item as Record<string, unknown>;
    return typeof row.title === "string" || typeof row.name === "string";
  }).length;
};

const specimenApiPayload = {
  source: "live-api" as const,
  diagnostics: {
    source: "live-api" as const,
    hasViatorApiKey: true,
    attemptedLiveFetch: true,
    upstreamStatus: 200,
    upstreamContentType: "application/json",
    upstreamOk: true,
    usedBundledFallbackBecause: "",
    commercialPriceFieldPath: "product.priceFrom",
    commercialPriceRawValue: "$199.00",
    priceSourceUsed: "live-price" as const,
    heroImageFieldPath: "product.media.images[0].variants.FULL.url",
    heroVariantFieldPath: "product.media.images[0].variants.FULL",
    selectedHeroWidth: 674,
    selectedHeroHeight: 446,
    imageSourceUsed: "api-primary" as const,
    heroSourceType: "api-primary" as const,
    heroQualityClassification: "splice" as const,
    finalHeroUrl: ENGINE6_63657P1_CARD_IMAGE_URL,
    heroFallbackTriggered: false,
    heroCandidatesPresent: true,
    heroCandidateCount: 1,
    heroPlaceholderFallbackReason: null,
    captionPrecedenceApplied: false,
    candidateFamilyIdentityDeterminable: true,
    heroSurfaceParity: {
      page: true,
      card: true,
      schema: true,
    },
    rejectedForeignHeroCandidates: [],
    productUrlFieldPath: "product.productUrl",
    bookingUrlSource: "product.productUrl",
    ratingFieldPath: "product.reviews.combinedAverageRating",
    reviewCountFieldPath: "product.reviews.totalReviews",
    overviewFieldPath: "product.description.text",
    highlightsFieldPath: "product.highlights",
    highlightClassificationReason:
      "selected product.highlights as highlight content",
    itineraryFieldPath: "product.itineraryItems",
    itineraryItemCount: 2,
    itinerarySourceUsed: "product.itineraryItems",
    meetingPointFieldPath: "product.logistics.start.description",
    faqsFieldPath: "merged:product.additionalInfo",
    faqFieldPath: "merged:product.additionalInfo",
    faqCount: 3,
    faqSourceUsed: "merged:product.additionalInfo",
    requirementsFieldPath: "product.additionalInfo",
    classificationFieldPath: "inferred:title+overview+highlights",
    fieldLevelFallbackUsed: false,
    fallbackFieldNames: [],
  },
  rawProductCode: "63657P1",
  rawProduct: {
    title: "Santa Barbara Vineyard to Table Taste Tour by E-Bike",
  },
  extracted: {
    title: "Santa Barbara Vineyard to Table Taste Tour by E-Bike",
    seoTitle:
      "Santa Barbara Vineyard to Table Taste Tour by E-Bike in Santa Barbara",
    seoDescription:
      "Ride through the towns and vineyards of the Santa Ynez Valley wine region on this e-bike tour with transport from Santa Barbara.",
    city: "Santa Barbara",
    state: "California",
    heroImageUrl: ENGINE6_63657P1_CARD_IMAGE_URL,
    productUrl:
      "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
    priceAmount: 199,
    priceFormatted: "From $199",
    aggregateRating: 4.9,
    reviewCount: 177,
    meetingPointText:
      "3850 State St, Santa Barbara, CA 93105, USA. Peppertree Inn with free parking.",
    overviewText:
      "Ride through the towns and vineyards of the Santa Ynez Valley wine region on this e-bike tour with transport from Santa Barbara. With a guide, you'll pedal a Rad Power E-bike to wineries, a lavendar farm, the town of Solvang, and other spots for wine and olive-oil tastings and lunch.",
    highlights: [
      "Bike and helmet provided for this tour through the Santa Ynez Valley wine region",
      "Stop for wine and olive-oil tastings and learn about lavendar oil production",
      "Enjoy a picnic lunch at a winery without packing food",
      "Hotel pickup and drop-off for transport to the riding location",
    ],
    itinerary: [
      {
        title: "I Bike Santa Barbara Wine Tours",
        description: "Admission Ticket Included",
        duration: "40 minutes",
      },
      {
        title: "Solvang",
        description: "Admission Ticket Free",
        duration: "20 minutes",
      },
    ],
    faqs: [
      {
        question: "Is this tour wheelchair accessible?",
        answer: "No. This tour is not wheelchair accessible.",
      },
      {
        question: "Do I need a minimum group size?",
        answer: "Yes. A minimum of 2 people per booking is required.",
      },
      {
        question: "What fitness level should travelers expect?",
        answer:
          "Travelers should have a moderate physical fitness level, and the tour will have a maximum of 8 travelers.",
      },
    ],
    requirements: [
      "Confirmation will be received at time of booking",
      "Not wheelchair accessible",
      "A minimum of 2 people per booking is required",
      "Travelers should have a moderate physical fitness level",
      "This tour/activity will have a maximum of 8 travelers",
    ],
    primaryCategory: "bike-tour",
    categories: ["bike-tour"],
  },
};

describe("engine6 extractor", () => {
  it("resolves a product-scoped API primary hero for the specimen tour", () => {
    const extracted = extractEngine6Product(specimenProductPayload);

    expect(extracted.extracted.heroImageUrl).toBe(
      ENGINE6_63657P1_CARD_IMAGE_URL
    );
    expect(extracted.diagnostics.heroImageFieldPath).toBe(
      "product.media.images[0].variants.FULL.url"
    );
    expect(extracted.diagnostics.heroVariantFieldPath).toBe(
      "product.media.images[0].variants.FULL"
    );
    expect(extracted.diagnostics.selectedHeroWidth).toBe(674);
    expect(extracted.diagnostics.selectedHeroHeight).toBe(446);
    expect(extracted.diagnostics.imageSourceUsed).toBe("api-primary");
    expect(extracted.diagnostics.heroSourceType).toBe("api-primary");
    expect(extracted.diagnostics.finalHeroUrl).toBe(
      ENGINE6_63657P1_CARD_IMAGE_URL
    );
    expect(extracted.diagnostics.heroFallbackTriggered).toBe(false);
    expect(extracted.diagnostics.rejectedForeignHeroCandidates).toEqual([]);
    expect(extracted.extracted.priceAmount).toBe(199);
    expect(extracted.extracted.priceFormatted).toBe("From $199");
    expect(extracted.diagnostics.commercialPriceFieldPath).toBe(
      "product.priceFrom"
    );
    expect(extracted.extracted.requirements).toContain(
      "A minimum of 2 people per booking is required"
    );
  });

  it("never uses /hero.jpg and renders no hero when API candidates are invalid", () => {
    const extracted = extractEngine6Product({
      product: {
        productCode: "STATIC1",
        productUrl:
          "https://www.viator.com/tours/Santa-Barbara/Static-Hero/d4372-STATIC1",
        title: "Static Hero Tour",
        description: { text: "Description" },
        location: { city: "Santa Barbara", state: "California" },
        priceFrom: "$10.00",
        imageUrl: "https://www.alloutdooradventures.com/hero.jpg",
      },
    });

    expect(extracted.extracted.heroImageUrl).toBeNull();
    expect(extracted.diagnostics.heroSourceType).toBe("approved-placeholder");
    expect(extracted.diagnostics.heroFallbackTriggered).toBe(true);
    expect(extracted.diagnostics.rejectedForeignHeroCandidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: "https://www.alloutdooradventures.com/hero.jpg",
          reason: "static-hero-disallowed",
        }),
      ])
    );
  });

  it("prefers structured day itinerary fields and preserves section labels", () => {
    const extracted = extractEngine6Product({
      product: {
        productCode: "DAYTEST1",
        productUrl: "https://www.viator.com/tours/Test/d1-DAYTEST1",
        title: "Structured itinerary test",
        media: specimenProductPayload.product.media,
        itinerary: {
          days: [
            {
              dayTitle: "Day 1",
              items: [
                { title: "Stop A", description: "A details" },
                { title: "Stop B", description: "B details" },
              ],
            },
            {
              dayTitle: "Day 2",
              items: [{ title: "Stop C", description: "C details" }],
            },
          ],
        },
        itinerarySummary:
          "Generic summary should not be primary when days exist.",
      },
    });

    expect(extracted.diagnostics.itineraryFieldPath).toBe(
      "product.itinerary.days"
    );
    expect(extracted.diagnostics.itineraryStructuredSourceUsed).toBe(true);
    expect(extracted.diagnostics.itineraryFallbackSummaryUsed).toBe(false);
    expect(extracted.extracted.itinerary.map(item => item.title)).toEqual([
      "Stop A",
      "Stop B",
      "Stop C",
    ]);
    expect(extracted.extracted.itinerary[0]?.sectionLabel).toBe("Day 1");
    expect(extracted.extracted.itinerary[2]?.sectionLabel).toBe("Day 2");
  });

  it("renders no image only when product API imagery is absent", () => {
    const extracted = extractEngine6Product({
      product: {
        productCode: "NOPHOTO1",
        productUrl:
          "https://www.viator.com/tours/Santa-Barbara/No-Photo/d4372-NOPHOTO1",
        title: "No Photo Tour",
        description: { text: "Description" },
        location: { city: "Santa Barbara", state: "California" },
        priceFrom: "$49.00",
      },
    });

    expect(extracted.extracted.heroImageUrl).toBeNull();
    expect(extracted.diagnostics.heroSourceType).toBe("approved-placeholder");
    expect(extracted.diagnostics.heroFallbackTriggered).toBe(true);
    expect(extracted.diagnostics.rejectedForeignHeroCandidates).toEqual([]);
  });

  it("uses the next valid current-product API image for sunset/sailing when earlier candidates are invalid", () => {
    const extracted = extractEngine6Product({
      product: {
        productCode: "SUNSET1",
        productUrl:
          "https://www.viator.com/tours/San-Diego/Sunset-Sailing-Experience/d736-SUNSET1",
        title: "Sunset Sailing Experience",
        description: { text: "Description" },
        location: { city: "San Diego", state: "California" },
        priceFrom: "$79.00",
        media: {
          images: [
            {
              isCover: true,
              variants: {
                FULL: {
                  url: "https://images.example.com/invalid-cover.jpg",
                  width: 1200,
                  height: 800,
                },
              },
            },
            {
              variants: {
                FULL: {
                  url: "https://dynamic-media.tacdn.com/media/photo-o/aa/bb/cc/dd.jpg",
                  width: 1024,
                  height: 683,
                },
              },
            },
          ],
        },
      },
    });

    expect(extracted.extracted.heroImageUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/aa/bb/cc/dd.jpg"
    );
    expect(extracted.diagnostics.heroFallbackTriggered).toBe(false);
    expect(extracted.diagnostics.rejectedForeignHeroCandidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: "https://images.example.com/invalid-cover.jpg",
          reason: "untrusted-media-host",
        }),
      ])
    );
  });
});

describe("engine6 meta descriptions", () => {
  it("clamps long descriptions at a word boundary with an ellipsis", () => {
    const metaDescription = buildEngine6MetaDescription(
      "Ride through the towns and vineyards of the Santa Ynez Valley wine region on this e-bike tour with transport from Santa Barbara, wine tastings, picnic lunch, and countryside views for adventurous food-loving cyclists."
    );

    expect(metaDescription.endsWith("...")).toBe(true);
  });

  it("strips HTML before safely truncating at a word boundary", () => {
    const metaDescription = buildMetaDescription(
      "<p>Ride through the towns and vineyards of the Santa Ynez Valley wine region on this e-bike tour with transport from Santa Barbara and a guide-led tasting itinerary.</p>"
    );

    expect(metaDescription).not.toContain("<p>");
    expect(metaDescription.length).toBeLessThanOrEqual(160);
  });

  it("builds traveler-first SEO description and strips generated prefixes and operational filler", () => {
    const metaDescription = buildEngine6SeoDescription({
      title: "Golden Gate Sunset Cruise",
      city: "San Francisco",
      categoryLabel: "Boat Tour",
      sourceDescription:
        "Public transportation options are available nearby. Cruise the bay at sunset with skyline and bridge views plus a small-group guide.",
    });

    expect(metaDescription).toMatch(/^Cruise the bay at sunset/);
    expect(hasEngine6GeneratedDescriptionPrefix(metaDescription)).toBe(false);
    expect(isEngine6OperationalFiller(metaDescription)).toBe(false);
    expect(metaDescription.length).toBeGreaterThanOrEqual(120);
    expect(metaDescription.length).toBeLessThanOrEqual(160);
  });

  it("keeps API-derived meta descriptions product-specific for priority routes", () => {
    const priorityProductCodes = [
      "411138P3",
      "398496P5",
      "152424P1",
      "447486P2",
      "5503P10",
      "190492P3",
      "414460P1",
    ];
    const bannedGenericFragments = [
      "guide support",
      "easy logistics",
      "traveler-friendly pace",
      "guided local context",
      "scenic views",
      "memorable experience",
      "with clear logistics",
    ];

    for (const productCode of priorityProductCodes) {
      const tour = engine6ResolvedTours.find(
        candidate => candidate.productCode === productCode
      );
      expect(tour, `missing Engine6 tour ${productCode}`).toBeDefined();
      const description = tour ? buildEngine6Seo(tour).description : "";

      expect(description.length).toBeGreaterThanOrEqual(140);
      expect(description.length).toBeLessThanOrEqual(160);
      expect(description).not.toContain("...");
      for (const fragment of bannedGenericFragments) {
        expect(description.toLowerCase()).not.toContain(fragment);
      }
    }

    expect(
      buildEngine6Seo(
        engine6ResolvedTours.find(tour => tour.productCode === "411138P3")!
      ).description
    ).toContain("Turnagain Arm Drive");
    expect(
      buildEngine6Seo(
        engine6ResolvedTours.find(tour => tour.productCode === "398496P5")!
      ).description
    ).toContain("Las Vegas Sphere");
    expect(
      buildEngine6Seo(
        engine6ResolvedTours.find(tour => tour.productCode === "414460P1")!
      ).description
    ).toContain("Bethesda Fountain");
  });

  it("governs all Engine6 meta and schema descriptions without generated taxonomy prefixes", () => {
    for (const tour of engine6ResolvedTours) {
      expect(hasEngine6GeneratedDescriptionPrefix(tour.metaDescription)).toBe(
        false
      );
      expect(hasEngine6GeneratedDescriptionPrefix(tour.seoDescription)).toBe(
        false
      );

      const graph = buildEngine6SchemaGraph(tour)["@graph"] as Array<
        Record<string, unknown>
      >;
      const product = graph.find(node => node["@type"] === "Product");
      expect(
        hasEngine6GeneratedDescriptionPrefix(String(product?.description ?? ""))
      ).toBe(false);
      expect(String(product?.description ?? "").length).toBeGreaterThanOrEqual(
        tour.metaDescription.length
      );
      expect(tour.metaDescription.length).toBeGreaterThanOrEqual(120);
      expect(tour.metaDescription.length).toBeLessThanOrEqual(160);
      expect(tour.metaDescription).not.toMatch(
        /^(This tour offers|This experience provides|This private tour offers an unparalleled opportunity|Join us for|Come discover)/i
      );
    }
  });

  it("uses rich governed product descriptions for JSON-LD while preserving concise SERP metadata", () => {
    const productCodes = [
      "411138P3",
      "447486P2",
      "398496P5",
      "152424P1",
      "190492P3",
    ];
    const requiredTermsByProductCode: Record<string, string[]> = {
      "411138P3": [
        "Byron Glacier",
        "Beluga Point",
        "Alaska Wildlife Conservation Center",
      ],
      "447486P2": ["Santa Barbara Harbor", "Stearns Wharf", "Santa Ynez"],
      "398496P5": ["Sphere", "Strip"],
      "152424P1": [
        "Muir Woods National Monument",
        "Sausalito",
        "Golden Gate Bridge",
      ],
      "190492P3": ["Bryce Canyon", "Zion National Park"],
    };
    const bannedFragments = [
      "guide support",
      "easy logistics",
      "traveler-friendly pace",
      "memorable experience",
      "scenic views",
      "guided local context",
    ];
    const wordCount = (value: string) =>
      value.trim().split(/\s+/).filter(Boolean).length;

    for (const productCode of productCodes) {
      const tour = engine6ResolvedTours.find(
        candidate => candidate.productCode === productCode
      );
      expect(tour, productCode).toBeDefined();
      const seo = buildEngine6Seo(tour!);
      const graph = buildEngine6SchemaGraph(tour!)["@graph"] as Array<
        Record<string, unknown>
      >;
      const webPage = graph.find(node => node["@type"] === "WebPage");
      const trip = graph.find(node => node["@type"] === "TouristTrip");
      const product = graph.find(node => node["@type"] === "Product");
      const richDescription = String(product?.description ?? "");

      expect(seo.description.length).toBeGreaterThanOrEqual(120);
      expect(seo.description.length).toBeLessThanOrEqual(160);
      expect(seo.description.length).toBeLessThan(richDescription.length);
      expect(webPage?.description).toBe(richDescription);
      expect(trip?.description).toBe(richDescription);
      expect(wordCount(richDescription), productCode).toBeGreaterThanOrEqual(
        75
      );
      expect(wordCount(richDescription), productCode).toBeLessThanOrEqual(120);
      expect(richDescription).not.toContain("...");
      expect(richDescription.startsWith(tour!.title)).toBe(false);
      for (const term of requiredTermsByProductCode[productCode]) {
        expect(richDescription).toContain(term);
      }
      for (const fragment of bannedFragments) {
        expect(richDescription.toLowerCase()).not.toContain(fragment);
      }
    }
  });

  it("uses the same governed rich description source for post-original-55 merchant rows", () => {
    const productCode = "7081NYCDAY";
    const tour = engine6ResolvedTours.find(
      candidate => candidate.productCode === productCode
    );
    expect(tour).toBeDefined();
    const product = (
      buildEngine6SchemaGraph(tour!)["@graph"] as Array<Record<string, unknown>>
    ).find(node => node["@type"] === "Product");

    const merchantDescription = resolveMerchantDescription({
      productCode,
      title: tour!.title,
      city: tour!.city,
      categoryLabel: tour!.categoryLabel,
      productOverviewDescription: tour!.overviewText,
      pageMetadataDescription: tour!.metaDescription,
      jsonLdProductDescription: tour!.description,
      viatorApiDescription: tour!.overviewText,
      itineraryStops: tour!.itinerary,
      highlights: tour!.highlights,
      included: tour!.included,
      durationText: tour!.durationText,
    });
    const parseCsvLine = (line: string) => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        if (inQuotes) {
          if (char === '"' && line[index + 1] === '"') {
            current += '"';
            index += 1;
          } else if (char === '"') {
            inQuotes = false;
          } else {
            current += char;
          }
        } else if (char === '"') {
          inQuotes = true;
        } else if (char === ",") {
          values.push(current);
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current);
      return values;
    };
    const merchantFeedLines = readFileSync("data/merchantFeed.csv", "utf8")
      .trim()
      .split("\n");
    const headers = parseCsvLine(merchantFeedLines[0]);
    const merchantFeedRow = merchantFeedLines
      .slice(1)
      .map(parseCsvLine)
      .find(row => row[headers.indexOf("id")] === productCode);

    expect(merchantDescription).toBe(product?.description);
    expect(merchantFeedRow?.[headers.indexOf("description")]).toBe(
      product?.description
    );
  });

  it("repairs targeted post-original-55 merchant rows to the JSON-LD Product.description source", () => {
    const targetedProductCodes = [
      "5119P13",
      "190492P3",
      "13920P12",
      "7079RREBIKE",
      "191767P5",
      "3533P14",
      "60136P1",
      "26719P8",
      "152424P1",
    ];
    const parseCsvLine = (line: string) => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        if (inQuotes) {
          if (char === '"' && line[index + 1] === '"') {
            current += '"';
            index += 1;
          } else if (char === '"') {
            inQuotes = false;
          } else {
            current += char;
          }
        } else if (char === '"') {
          inQuotes = true;
        } else if (char === ",") {
          values.push(current);
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current);
      return values;
    };
    const merchantFeedLines = readFileSync("data/merchantFeed.csv", "utf8")
      .trim()
      .split("\n");
    const headers = parseCsvLine(merchantFeedLines[0]);
    const descriptionIndex = headers.indexOf("description");
    const merchantDescriptionByProductCode = new Map(
      merchantFeedLines
        .slice(1)
        .map(parseCsvLine)
        .map(row => [row[headers.indexOf("id")], row[descriptionIndex]])
    );

    for (const productCode of targetedProductCodes) {
      const tour = engine6ResolvedTours.find(
        candidate => candidate.productCode === productCode
      );
      expect(tour, productCode).toBeDefined();
      const product = (
        buildEngine6SchemaGraph(tour!)["@graph"] as Array<
          Record<string, unknown>
        >
      ).find(node => node["@type"] === "Product");
      const productDescription = String(product?.description ?? "");
      const merchantDescription = resolveMerchantDescription({
        productCode,
        title: tour!.title,
        city: tour!.city,
        categoryLabel: tour!.categoryLabel,
        productOverviewDescription: tour!.overviewText,
        pageMetadataDescription: tour!.metaDescription || tour!.seoDescription,
        jsonLdProductDescription: productDescription,
        viatorApiDescription: tour!.overviewText,
        itineraryStops: tour!.itinerary,
        highlights: tour!.highlights,
        included: tour!.included,
        durationText: tour!.durationText,
      });

      expect(merchantDescription, productCode).toBe(productDescription);
      expect(
        merchantDescriptionByProductCode.get(productCode),
        productCode
      ).toBe(productDescription);
    }
  });

  it("fails governance when post-original-55 merchant rows keep fallback descriptions despite sufficient source data", () => {
    const parseCsvLine = (line: string) => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        if (inQuotes) {
          if (char === '"' && line[index + 1] === '"') {
            current += '"';
            index += 1;
          } else if (char === '"') {
            inQuotes = false;
          } else {
            current += char;
          }
        } else if (char === '"') {
          inQuotes = true;
        } else if (char === ",") {
          values.push(current);
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current);
      return values;
    };
    const wordCount = (value: string) =>
      value.trim().split(/\s+/).filter(Boolean).length;
    const richSourceWordCount = (tour: (typeof engine6ResolvedTours)[number]) =>
      wordCount(
        [
          tour.overviewText,
          tour.description,
          ...tour.itinerary.flatMap(stop => [stop.title, stop.description]),
          ...tour.highlights,
          ...tour.included,
          tour.durationText,
          tour.categoryLabel,
        ]
          .filter(Boolean)
          .join(" ")
      );
    const merchantFeedLines = readFileSync("data/merchantFeed.csv", "utf8")
      .trim()
      .split("\n");
    const headers = parseCsvLine(merchantFeedLines[0]);
    const descriptionIndex = headers.indexOf("description");
    const merchantDescriptionByProductCode = new Map(
      merchantFeedLines
        .slice(1)
        .map(parseCsvLine)
        .map(row => [row[headers.indexOf("id")], row[descriptionIndex]])
    );
    const fallbackRows = engine6ResolvedTours
      .filter(
        tour =>
          !ENGINE6_ORIGINAL_MERCHANT_APPROVED_PRODUCT_CODES.has(
            tour.productCode
          )
      )
      .filter(tour => richSourceWordCount(tour) >= 75)
      .flatMap(tour => {
        const product = (
          buildEngine6SchemaGraph(tour)["@graph"] as Array<
            Record<string, unknown>
          >
        ).find(node => node["@type"] === "Product");
        const governedRichDescription = String(product?.description ?? "");
        const merchantDescription =
          merchantDescriptionByProductCode.get(tour.productCode) ?? "";
        const resolvedMerchantDescription = resolveMerchantDescription({
          productCode: tour.productCode,
          title: tour.title,
          city: tour.city,
          categoryLabel: tour.categoryLabel,
          productOverviewDescription: tour.overviewText,
          pageMetadataDescription: tour.metaDescription || tour.seoDescription,
          jsonLdProductDescription: tour.description,
          viatorApiDescription: tour.overviewText,
          itineraryStops: tour.itinerary,
          highlights: tour.highlights,
          included: tour.included,
          durationText: tour.durationText,
        });

        const governedRichWordCount = wordCount(governedRichDescription);
        const richDescriptionThreshold = Math.min(75, governedRichWordCount);

        return merchantDescription !== governedRichDescription ||
          resolvedMerchantDescription !== governedRichDescription ||
          wordCount(merchantDescription) < richDescriptionThreshold
          ? [
              `${tour.productCode}: merchant=${wordCount(
                merchantDescription
              )} words, governed=${wordCount(governedRichDescription)} words`,
            ]
          : [];
      });

    expect(fallbackRows).toEqual([]);
  });

  it("synthesizes readable non-truncated title for stitched supplier input", () => {
    const seoTitle = buildEngine6SeoTitle({
      title: "San Francisco Alcatraz App Guided Tour Cruise Jail House Tou",
      city: "San Francisco",
      state: "California",
    });

    expect(seoTitle).toBe(
      "San Francisco Alcatraz App-Guided Tour Cruise jailhouse"
    );
    expect(seoTitle.endsWith("Tou")).toBe(false);
  });

  it("prevents duplicate city phrasing in SEO titles", () => {
    const seoTitle = buildEngine6SeoTitle({
      title: "Golden Gate Cruise in San Francisco in San Francisco",
      city: "San Francisco",
      state: "California",
    });

    expect(seoTitle.toLowerCase()).not.toContain(
      "in san francisco in san francisco"
    );
    expect(seoTitle).toBe("Golden Gate Cruise in San Francisco");
  });
});

describe("engine6 Viator booking URLs", () => {
  it("uses the canonical Santa Barbara Viator detail URL when no preferred product URL is available", () => {
    expect(buildEngine6ViatorBookingUrl("63657P1")).toBe(
      "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1?pid=P00290915&uid=U00174482&mcid=58086&medium=link&currency=USD"
    );
  });

  it("uses the canonical Anchorage product URL for 411138P3 with affiliate params", () => {
    expect(buildEngine6ViatorBookingUrl("411138P3", null)).toBe(
      "https://www.viator.com/tours/Anchorage/Private-Anchorage-Tour-and-Wilderness-Adventure/d4152-411138P3?pid=P00290915&uid=U00174482&mcid=58086&medium=link&currency=USD"
    );
  });

  it("uses the canonical 89173P10 Viator product URL with affiliate params", () => {
    expect(
      buildEngine6ViatorBookingUrl(
        "89173P10",
        "https://www.viator.com/tours/Fort-Lauderdale/Fort-Lauderdales-Tropical-Kayak-Tour-and-Island-Adventure/d660-89173P10"
      )
    ).toBe(
      "https://www.viator.com/tours/Fort-Lauderdale/Fort-Lauderdales-Tropical-Kayak-Tour-and-Island-Adventure/d660-89173P10?pid=P00290915&uid=U00174482&mcid=58086&medium=link&currency=USD"
    );
  });
});

describe("engine6 aggregate rating normalization", () => {
  it("rounds valid ratings to one decimal place and safely ignores invalid inputs", () => {
    expect(normalizeEngine6AggregateRating(4.94)).toBe(4.9);
    expect(normalizeEngine6AggregateRating(4.666)).toBe(4.7);
    expect(normalizeEngine6AggregateRating(null)).toBeNull();
    expect(normalizeEngine6AggregateRating(undefined)).toBeNull();
  });
});

describe("engine6 mapping/cards/page", () => {
  it("hides Engine6 debug diagnostics by default across Miami, Fort Lauderdale, and Bahamas-paragon routes", () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousDebugFlag = process.env.NEXT_PUBLIC_ENGINE6_DEBUG;

    process.env.NODE_ENV = "production";
    delete process.env.NEXT_PUBLIC_ENGINE6_DEBUG;

    const targetRoutes = [
      ENGINE6_MIAMI_PIRATE_BOAT_ROUTE,
      ENGINE6_FORT_LAUDERDALE_TROPICAL_KAYAK_ROUTE,
      ENGINE6_FORT_LAUDERDALE_BAHAMAS_FERRY_ROUTE,
    ];

    try {
      for (const route of targetRoutes) {
        const tour = engine6ResolvedTours.find(
          entry => entry.canonicalPath === route
        );
        expect(tour, `Expected engine6 tour for route ${route}`).toBeDefined();

        const html = renderToString(<Engine6TourPage tour={tour!} />);

        expect(html).not.toContain('data-testid="engine6-debug-diagnostics"');
        expect(html).not.toContain("Resolved hero source");
        expect(html).not.toContain("Final hero URL");
        expect(html).toContain('data-testid="engine6-breadcrumbs"');
        expect(html).toContain('data-testid="engine6-bottom-cta"');
      }
    } finally {
      if (previousNodeEnv === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = previousNodeEnv;
      }

      if (previousDebugFlag === undefined) {
        delete process.env.NEXT_PUBLIC_ENGINE6_DEBUG;
      } else {
        process.env.NEXT_PUBLIC_ENGINE6_DEBUG = previousDebugFlag;
      }
    }
  });

  it("shows Engine6 debug diagnostics only when NEXT_PUBLIC_ENGINE6_DEBUG=true in non-production", () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousDebugFlag = process.env.NEXT_PUBLIC_ENGINE6_DEBUG;

    process.env.NODE_ENV = "development";
    process.env.NEXT_PUBLIC_ENGINE6_DEBUG = "true";

    try {
      const tour = engine6ResolvedTours.find(
        entry => entry.canonicalPath === ENGINE6_MIAMI_PIRATE_BOAT_ROUTE
      );
      expect(tour).toBeDefined();

      const html = renderToString(<Engine6TourPage tour={tour!} />);
      expect(html).toContain('data-testid="engine6-debug-diagnostics"');
      expect(html).toContain("Resolved hero source");
      expect(html).toContain("Final CTA URL");
    } finally {
      if (previousNodeEnv === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = previousNodeEnv;
      }

      if (previousDebugFlag === undefined) {
        delete process.env.NEXT_PUBLIC_ENGINE6_DEBUG;
      } else {
        process.env.NEXT_PUBLIC_ENGINE6_DEBUG = previousDebugFlag;
      }
    }
  });

  it("renders the clean Santa Barbara specimen with the API-scoped hero", () => {
    const tour = mapViatorToEngine6Tour(specimenApiPayload);

    const card = toEngine6Card(tour);
    const surfaces = buildEngine6CardSurfaces(tour);
    const html = renderToString(<Engine6TourPage tour={tour} />);

    expect(tour.productCode).toBe("63657P1");
    expect(tour.priceFormatted).toBe("From $199");
    expect(tour.bookingUrl).toBe(
      "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1?pid=P00290915&uid=U00174482&mcid=58086&medium=link&currency=USD"
    );
    expect(card.title).toContain("Santa Barbara Vineyard");
    expect(surfaces.city[0].priceLabel).toBe("From $199");
    expect(tour.primaryCategory).toBe("bike-tour");
    expect(tour.categoryLabel).toBe("Bike Tour");
    expect(tour.metaDescription.length).toBeLessThanOrEqual(160);
    expect(tour.canonicalPath).toBe(ENGINE6_SPECIMEN_ROUTE);
    expect(html).toContain(`src="${ENGINE6_63657P1_CARD_IMAGE_URL}"`);
    expect(html).toContain('data-testid="engine6-hero-banner"');
    expect(html).toContain('data-testid="engine6-breadcrumbs"');
    expect(html).toContain('data-testid="engine6-tours-activities-label"');
    expect(html).toContain("Santa Barbara Tours &amp; Activities");
    expect(html).toContain('href="/destinations"');
    expect(html).toContain('href="/destinations/california"');
    expect(html).toContain(
      'href="/destinations/california/santa-barbara/tours"'
    );
    expect(html).toContain('aria-label="Santa Barbara Tours &amp; Activities"');
    const heroIndex = html.indexOf('data-testid="engine6-hero-banner"');
    const breadcrumbIndex = html.indexOf('data-testid="engine6-breadcrumbs"');
    const h1Index = html.indexOf("<h1");
    expect(heroIndex).toBeGreaterThan(-1);
    expect(breadcrumbIndex).toBeGreaterThan(heroIndex);
    expect(h1Index).toBeGreaterThan(breadcrumbIndex);
    expect(html).not.toContain("/hero.jpg");
    expect(html).toContain(
      "Santa Barbara Vineyard to Table Taste Tour by E-Bike"
    );
    expect(html).toContain("Bike Tour");
    expect(html).toContain('data-testid="engine6-bottom-cta"');
  });

  it("surfaces hero guardrail debug fields in specimen diagnostics", () => {
    const apiUrl = buildEngine6SpecimenApiUrl("63657P1");
    const resolved = resolveEngine6SpecimenResponse({
      payload: specimenApiPayload,
      httpStatus: 200,
      productCode: "63657P1",
      apiUrl,
    });

    expect(resolved.error).toBeNull();
    expect(resolved.debug.requestedProductCode).toBe("63657P1");
    expect(resolved.debug.sourceProductUrl).toBe(
      specimenApiPayload.extracted.productUrl
    );
    expect(resolved.debug.finalHeroUrl).toBe(ENGINE6_63657P1_CARD_IMAGE_URL);
    expect(resolved.debug.heroSourceType).toBe("api-primary");
    expect(resolved.debug.fallbackTriggered).toBe(false);
    expect(resolved.debug.rejectedForeignHeroCandidates).toEqual([]);
  });

  it("falls back to route-backed tour data when live specimen responses fail", () => {
    const representativeRoutes = [
      ENGINE6_SAN_DIEGO_BAY_DAY_SAIL_ROUTE,
      ENGINE6_NYC_CHINATOWN_LITTLE_ITALY_FOOD_ROUTE,
      ENGINE6_SAN_DIEGO_TIJUANA_BORDER_TOUR_ROUTE,
      ENGINE6_SAN_DIEGO_HALF_DAY_4X4_ROUTE,
      ENGINE6_SAN_DIEGO_SEAL_TOUR_ROUTE,
    ];
    const failurePayloads = [
      { label: "http-500", payload: { error: "upstream failed" }, status: 500 },
      { label: "malformed-object", payload: null, status: 200 },
      {
        label: "missing-extracted",
        payload: { source: "live-api" },
        status: 200,
      },
      {
        label: "mapping-failed",
        payload: {
          source: "live-api",
          extracted: { title: "Unmappable tour without productCode" },
        },
        status: 200,
      },
    ];

    expect(representativeRoutes).toHaveLength(5);

    for (const route of representativeRoutes) {
      const fallbackTour = getEngine6NativeTourByCanonicalPath(route);
      expect(fallbackTour).not.toBeNull();

      for (const failure of failurePayloads) {
        const resolved = resolveEngine6SpecimenResponse({
          payload: failure.payload,
          httpStatus: failure.status,
          productCode: fallbackTour!.productCode,
          apiUrl: buildEngine6SpecimenApiUrl(fallbackTour!.productCode),
          responseContentType:
            failure.label === "http-500" ? "application/json" : null,
          responseBodyPreview: failure.label,
          fallbackTour,
        });

        expect(resolved.error, `${route} ${failure.label}`).toBeNull();
        expect(resolved.tour?.canonicalPath, `${route} ${failure.label}`).toBe(
          route
        );

        const html = renderToString(<Engine6TourPage tour={resolved.tour!} />);
        expect(html).not.toContain("Engine6 specimen unavailable");
        expect(html).toContain('data-testid="engine6-hero-banner"');
        expect(html).toContain('data-testid="engine6-bottom-cta"');

        const seo = buildEngine6Seo(resolved.tour!);
        expect(seo.url).toBe(route);
        expect(seo.description).toBeTruthy();

        const graph = buildEngine6SchemaGraph(resolved.tour!)[
          "@graph"
        ] as Array<Record<string, unknown>>;
        const schemaTypes = new Set(graph.map(node => node["@type"]));
        expect(schemaTypes.has("Organization")).toBe(true);
        expect(schemaTypes.has("WebSite")).toBe(true);
        expect(schemaTypes.has("WebPage")).toBe(true);
        expect(schemaTypes.has("Product")).toBe(true);
        expect(schemaTypes.has("TouristTrip")).toBe(true);
        expect(schemaTypes.has("BreadcrumbList")).toBe(true);
      }
    }
  });

  it("keeps activity taxonomy changes isolated from Engine6 detail route resolution", () => {
    const unresolvedRoutes = engine6ResolvedTours.filter(
      tour => getEngine6NativeTourByCanonicalPath(tour.canonicalPath) !== tour
    );

    expect(unresolvedRoutes).toEqual([]);
    expect(engine6ResolvedTours.length).toBeGreaterThan(100);
  });

  it("keeps rendering without an image when no valid product-owned hero exists", () => {
    const resolved = resolveEngine6SpecimenResponse({
      payload: {
        ...specimenApiPayload,
        diagnostics: {
          ...specimenApiPayload.diagnostics,
          imageSourceUsed: "approved-placeholder",
          heroSourceType: "approved-placeholder",
          finalHeroUrl: null,
          heroFallbackTriggered: true,
        },
        extracted: {
          ...specimenApiPayload.extracted,
          heroImageUrl: null,
        },
      },
      httpStatus: 200,
      productCode: "63657P1",
      apiUrl: buildEngine6SpecimenApiUrl("63657P1"),
    });

    const html = renderToString(<Engine6TourPage tour={resolved.tour!} />);

    expect(resolved.tour?.resolvedImageUrl).toBeNull();
    expect(html).not.toContain("/hero.jpg");
    expect(html).not.toContain("/images/hiking-hero.jpg");
  });
});

describe("engine6 seo/schema", () => {
  it("builds a schema graph anchored to the specimen canonical path with local/merchant constraints", () => {
    const tour = mapViatorToEngine6Tour(specimenApiPayload);
    const schema = buildEngine6SchemaGraph(tour);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const trip = graph.find(node => node["@type"] === "TouristTrip");
    const product = graph.find(node => node["@type"] === "Product");
    const offer = graph.find(node => node["@type"] === "Offer");
    const webpage = graph.find(node => node["@type"] === "WebPage");

    const breadcrumb = graph.find(node => node["@type"] === "BreadcrumbList");

    expect(trip).toMatchObject({
      name: "Santa Barbara Vineyard to Table Taste Tour by E-Bike",
      image: ENGINE6_63657P1_CARD_IMAGE_URL,
      url: `https://www.alloutdooradventures.com${ENGINE6_SPECIMEN_ROUTE}`,
      touristDestination: {
        "@id": `https://www.alloutdooradventures.com${ENGINE6_SPECIMEN_ROUTE}#destination`,
      },
    });
    expect(breadcrumb).toMatchObject({
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Destinations",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "California",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Santa Barbara",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Santa Barbara Vineyard to Table Taste Tour by E-Bike",
        },
      ],
    });
    expect(product).toMatchObject({
      name: "Santa Barbara Vineyard to Table Taste Tour by E-Bike",
      image: ENGINE6_63657P1_CARD_IMAGE_URL,
      category: "Bike Tour",
      url: `https://www.alloutdooradventures.com${ENGINE6_SPECIMEN_ROUTE}`,
    });
    expect(webpage).toMatchObject({
      name: "Santa Barbara Vineyard to Table Taste Tour by E-Bike",
      mainEntity: {
        "@id": `https://www.alloutdooradventures.com${ENGINE6_SPECIMEN_ROUTE}#trip`,
      },
    });
    expect(offer).toMatchObject({
      url: tour.bookingUrl,
      price: 199,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    });
    expect(
      String((offer as { priceValidUntil?: string }).priceValidUntil)
    ).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("engine6 diagnostics visibility", () => {
  it("keeps diagnostics hidden by default and allows an explicit debug query", () => {
    expect(shouldShowEngine6Diagnostics("")).toBe(false);
    expect(shouldShowEngine6Diagnostics("?engine6Debug=1")).toBe(true);
  });
});

describe("engine6 listing surfaces", () => {
  const getRelatedToursForSpecimen = (productCode: string) => {
    const tour = engine6ResolvedTours.find(
      entry => entry.productCode === productCode
    );
    expect(tour).toBeDefined();

    const [, stateSlug = "", citySlug = "", currentSlug = ""] =
      /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/.exec(
        tour!.canonicalPath
      ) ?? [];
    const relatedTours = getToursByCityUnified(stateSlug, citySlug).filter(
      entry => {
        const matchesProductCode =
          Boolean(tour!.productCode) &&
          Boolean(entry.tour.productCode) &&
          entry.tour.productCode?.toUpperCase() ===
            tour!.productCode.toUpperCase();
        const matchesSlug = entry.tour.slug === currentSlug;
        return !matchesProductCode && !matchesSlug;
      }
    );

    return {
      tour: tour!,
      relatedTours,
    };
  };

  it("adds 63657P1 to California and Santa Barbara listing sources", () => {
    const californiaTours = getToursByState("california");
    const santaBarbaraTours = getToursByCity("california", "santa-barbara");
    expect(californiaTours.some(tour => tour.productCode === "63657P1")).toBe(
      true
    );
    expect(santaBarbaraTours.some(tour => tour.productCode === "63657P1")).toBe(
      true
    );
  });

  it("adds 5119P13 to Nevada and Las Vegas listing sources", () => {
    const nevadaTours = getToursByState("nevada");
    const lasVegasTours = getToursByCity("nevada", "las-vegas");
    expect(nevadaTours.some(tour => tour.productCode === "5119P13")).toBe(true);
    expect(lasVegasTours.some(tour => tour.productCode === "5119P13")).toBe(
      true
    );
  });

  it("adds 89173P10 to Florida and Fort Lauderdale listing sources", () => {
    const floridaTours = getToursByState("florida");
    const fortLauderdaleTours = getToursByCity("florida", "fort-lauderdale");
    expect(floridaTours.some(tour => tour.productCode === "89173P10")).toBe(
      true
    );
    expect(
      fortLauderdaleTours.some(tour => tour.productCode === "89173P10")
    ).toBe(true);
  });

  it("keeps exact hero parity for 89173P10 and maps to the Fort Lauderdale canonical route", () => {
    const kayakTour = engine6ResolvedTours.find(
      tour => tour.productCode === "89173P10"
    );
    expect(kayakTour).toBeDefined();
    expect(kayakTour?.canonicalPath).toBe(
      ENGINE6_FORT_LAUDERDALE_TROPICAL_KAYAK_ROUTE
    );
    expect(kayakTour?.heroImageUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/2f/0c/e5/f4/caption.jpg?w=700&h=500&s=1"
    );
    expect(kayakTour?.bookingUrl).toBe(
      "https://www.viator.com/tours/Fort-Lauderdale/Fort-Lauderdales-Tropical-Kayak-Tour-and-Island-Adventure/d660-89173P10?pid=P00290915&uid=U00174482&mcid=58086&medium=link&currency=USD"
    );
  });

  it("adds 76145P2, 5559561P1, and 118958P8 to Florida and Fort Lauderdale listing sources", () => {
    const floridaTours = getToursByState("florida");
    const fortLauderdaleTours = getToursByCity("florida", "fort-lauderdale");
    for (const productCode of ["76145P2", "5559561P1", "118958P8"]) {
      expect(floridaTours.some(tour => tour.productCode === productCode)).toBe(
        true
      );
      expect(
        fortLauderdaleTours.some(tour => tour.productCode === productCode)
      ).toBe(true);
    }
  });

  it("keeps exact hero/card/cta parity for 76145P2, 5559561P1, and 118958P8", () => {
    const expectations = [
      {
        productCode: "76145P2",
        route: ENGINE6_FORT_LAUDERDALE_EVERGLADES_AIRBOAT_ROUTE,
        hero: "https://dynamic-media.tacdn.com/media/photo-o/2f/15/16/f1/caption.jpg?w=1100&h=800&s=1",
        cta: "https://www.viator.com/tours/Fort-Lauderdale/Authentic-Private-Everglades-Airboat-Tour/d660-76145P2?pid=P00290915&uid=U00174482&mcid=58086&medium=link&currency=USD",
      },
      {
        productCode: "5559561P1",
        route: ENGINE6_FORT_LAUDERDALE_JETCAR_RENTAL_ROUTE,
        hero: "https://dynamic-media.tacdn.com/media/photo-o/2e/d1/7c/59/caption.jpg?w=700&h=500&s=1",
        cta: "https://www.viator.com/tours/Fort-Lauderdale/JetCar-Fort-Lauderdale-Rental/d660-5559561P1?pid=P00290915&uid=U00174482&mcid=58086&medium=link&currency=USD",
      },
      {
        productCode: "118958P8",
        route: ENGINE6_FORT_LAUDERDALE_BIG_GAME_FISHING_ROUTE,
        hero: "https://dynamic-media.tacdn.com/media/photo-o/2f/0f/cd/26/caption.jpg?w=1100&h=800&s=1",
        cta: "https://www.viator.com/tours/Fort-Lauderdale/4-Hour-Shared-Big-Game-Fishing/d660-118958P8?pid=P00290915&uid=U00174482&mcid=58086&medium=link&currency=USD",
      },
    ] as const;

    for (const expectation of expectations) {
      const tour = engine6ResolvedTours.find(
        item => item.productCode === expectation.productCode
      );
      expect(tour).toBeDefined();
      expect(tour?.canonicalPath).toBe(expectation.route);
      expect(tour?.heroImageUrl).toBe(expectation.hero);
      expect(tour?.resolvedImageUrl).toBe(expectation.hero);
      expect(tour?.resolvedHero?.url).toBe(expectation.hero);
      expect(tour?.bookingUrl).toBe(expectation.cta);

      const listingTour = getToursByCity("florida", "fort-lauderdale").find(
        item => item.productCode === expectation.productCode
      );
      expect(listingTour?.heroImage).toBe(expectation.hero);
      expect(listingTour?.primaryImageUrl).toBe(expectation.hero);
      expect(listingTour?.bookingUrl).toBe(expectation.cta);

      const schema = buildEngine6SchemaGraph(tour!);
      const graph = schema["@graph"] as Array<Record<string, unknown>>;
      const webpage = graph.find(node => node["@type"] === "WebPage");
      const trip = graph.find(node => node["@type"] === "TouristTrip");
      const product = graph.find(node => node["@type"] === "Product");
      const breadcrumb = graph.find(
        node => node["@type"] === "BreadcrumbList"
      ) as Record<string, unknown> | undefined;
      expect((webpage as { image?: string } | undefined)?.image).toBe(
        expectation.hero
      );
      expect((trip as { image?: string } | undefined)?.image).toBe(
        expectation.hero
      );
      expect((product as { image?: string } | undefined)?.image).toBe(
        expectation.hero
      );
      expect(breadcrumb).toBeDefined();
      expect(
        (breadcrumb?.itemListElement as Array<{ name: string }>).map(
          item => item.name
        )
      ).toEqual(["Destinations", "Florida", "Fort Lauderdale", tour!.title]);

      const html = renderToString(<Engine6TourPage tour={tour!} />);
      expect(html).toContain("Destinations");
      expect(html).toContain("Florida");
      expect(html).toContain("Fort Lauderdale");
      expect(html).toContain(tour!.title);
      expect(html).toContain(
        `href="${tour!.bookingUrl.replaceAll("&", "&amp;")}"`
      );
      expect(html).toContain(
        `src="${expectation.hero.replaceAll("&", "&amp;")}"`
      );
    }
  });
  it("adds 32779P2 to California and Avalon listing sources (not Los Angeles listing)", () => {
    const californiaTours = getToursByState("california");
    const avalonTours = getToursByCity("california", "avalon");
    const losAngelesTours = getToursByCity("california", "los-angeles");
    expect(californiaTours.some(tour => tour.productCode === "32779P2")).toBe(
      true
    );
    expect(avalonTours.some(tour => tour.productCode === "32779P2")).toBe(true);
    expect(losAngelesTours.some(tour => tour.productCode === "32779P2")).toBe(
      false
    );
  });

  it("extracts and renders itinerary + faq content generically for the Las Vegas Engine6 tour", () => {
    const vegasTour = engine6ResolvedTours.find(
      tour => tour.productCode === "5119P13"
    );
    expect(vegasTour).toBeDefined();
    expect(vegasTour?.itinerary.length).toBe(4);
    expect(vegasTour?.faqs.length).toBe(2);
    expect(vegasTour?.included.length).toBe(4);
    expect(vegasTour?.requirements.length).toBe(4);

    const html = renderToString(<Engine6TourPage tour={vegasTour!} />);
    if ((vegasTour?.itinerary.length ?? 0) >= 2) {
      expect(html).toContain(">Itinerary<");
      expect(html).toContain('data-testid="engine6-itinerary-timeline"');
    } else if (vegasTour?.itinerarySummaryText) {
      expect(html).toContain(">Itinerary summary<");
      expect(html).toContain('data-testid="engine6-itinerary-summary-only"');
    } else {
      expect(html).not.toContain(">Itinerary<");
    }
    expect(html).toContain(">FAQs<");
    expect(html).toContain(">What’s included<");
    expect(html).toContain(">Additional info<");
    expect(html).toContain("Admission included");
    expect(html).toContain("Hoover Dam");
    expect(html).toContain("Grand Canyon West");
    expect(html).toContain("Eagle Point and Guano Point");
    expect(html).toContain("Colorado River Helicopter Landing");
    expect(html).toContain(
      "Is helicopter landing included in the standard tour option?"
    );
    expect(html).toContain("How long is the overall day from Las Vegas?");
    expect((html.match(/<details /g) ?? []).length).toBe(2);
  });

  it("renders itinerary, meeting point, included/additional info, and omits FAQs for 32779P2 when absent", () => {
    const catalinaTour = engine6ResolvedTours.find(
      tour => tour.productCode === "32779P2"
    );
    expect(catalinaTour).toBeDefined();
    expect(catalinaTour?.city).toBe("Avalon");
    expect(catalinaTour?.state).toBe("California");
    expect(catalinaTour?.itinerary.length).toBeGreaterThanOrEqual(0);
    expect(catalinaTour?.included.length).toBeGreaterThan(0);
    expect(catalinaTour?.requirements.length).toBeGreaterThan(0);
    expect(catalinaTour?.meetingPointText).toContain("Green Pleasure Pier");
    expect(catalinaTour?.faqs.length).toBe(0);

    const html = renderToString(<Engine6TourPage tour={catalinaTour!} />);
    if ((catalinaTour?.itinerary.length ?? 0) >= 2) {
      expect(html).toContain(">Itinerary<");
      expect(html).toContain('data-testid="engine6-itinerary-timeline"');
    } else if (catalinaTour?.itinerarySummaryText) {
      expect(html).toContain(">Itinerary summary<");
      expect(html).toContain('data-testid="engine6-itinerary-summary-only"');
    } else {
      expect(html).not.toContain(">Itinerary<");
    }
    expect(html).toContain(">What’s included<");
    expect(html).toContain(">Additional info<");
    expect(html).toContain("Meeting point:");
    expect(html).not.toContain(">FAQs<");
  });

  it("hides FAQ section gracefully when upstream FAQ data is absent", () => {
    expect(engine6SpecimenTour.faqs.length).toBe(0);
    const html = renderToString(<Engine6TourPage tour={engine6SpecimenTour} />);
    expect(html).not.toContain(">FAQs<");
  });

  it("automatically includes the Engine6 route in the city unified tours listing", () => {
    const unifiedTours = getToursByCityUnified("california", "santa-barbara");
    const engine6Entry = unifiedTours.find(
      entry =>
        entry.tour.engine === "engine6" && entry.tour.productCode === "63657P1"
    );

    expect(engine6Entry).toBeDefined();
    expect(engine6Entry?.href).toBe(ENGINE6_SPECIMEN_ROUTE);
    expect(engine6Entry?.tour.heroImage).toBe(ENGINE6_63657P1_CARD_IMAGE_URL);
    expect(engine6Entry?.tour.primaryImageUrl).toBe(
      ENGINE6_63657P1_CARD_IMAGE_URL
    );
    expect(engine6Entry?.tour.bookingUrl).toBe(
      "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1?pid=P00290915&uid=U00174482&mcid=58086&medium=link&currency=USD"
    );
  });

  it("exposes Engine6 entries to the /tours?state=...&city=... filtered datasource", () => {
    const unifiedTours = getToursByCityUnified("california", "santa-barbara");
    const engine6Entry = unifiedTours.find(
      entry =>
        entry.tour.engine === "engine6" && entry.tour.productCode === "63657P1"
    );

    expect(engine6Entry).toBeDefined();
    expect(engine6Entry?.href).toBe(ENGINE6_SPECIMEN_ROUTE);
    expect(engine6Entry?.tour.badges?.priceFrom).toBe("From $199");
    expect(engine6Entry?.tour.badges?.rating).toBe(4.9);
    expect(engine6Entry?.tour.badges?.reviewCount).toBe(177);
  });

  it("renders the listing card with the resolved Engine6 image", () => {
    const listingTour = getToursByCity("california", "santa-barbara").find(
      tour => tour.productCode === "63657P1"
    );

    expect(listingTour?.primaryImageUrl).toBe(ENGINE6_63657P1_CARD_IMAGE_URL);
    expect(listingTour?.heroImage).toBe(ENGINE6_63657P1_CARD_IMAGE_URL);

    const html = renderToString(
      <TourCard
        tour={listingTour!}
        href={getCityTourDetailPath(listingTour!)}
      />
    );

    expect(html).toContain(`src="${ENGINE6_63657P1_CARD_IMAGE_URL}"`);
    expect(html).toContain("Santa Barbara, California");
    expect(html).toContain(
      "Santa Barbara Vineyard to Table Taste Tour by E-Bike"
    );
    expect(html).toContain("Bike Tour");
    expect(html).not.toContain("/hero.jpg");
  });

  it("routes and renders the 5119P13 listing card with detail-page hero parity", () => {
    const unifiedTours = getToursByCityUnified("nevada", "las-vegas");
    const engine6Entry = unifiedTours.find(
      entry => entry.tour.productCode === "5119P13"
    );

    expect(engine6Entry).toBeDefined();
    expect(engine6Entry?.href).toBe(ENGINE6_PARAGON_ROUTE);
    expect(engine6Entry?.tour.heroImage).toBe(
      engine6Entry?.tour.primaryImageUrl
    );
    expect(engine6Entry?.tour.badges?.priceFrom).toMatch(/^From \$/);
    expect(engine6Entry?.tour.badges?.rating).toBeGreaterThan(4);
    expect(engine6Entry?.tour.badges?.reviewCount).toBeGreaterThan(100);
  });

  it("routes and renders 32779P2 in Avalon with detail-page hero parity", () => {
    const unifiedTours = getToursByCityUnified("california", "avalon");
    const engine6Entry = unifiedTours.find(
      entry => entry.tour.productCode === "32779P2"
    );

    expect(engine6Entry).toBeDefined();
    expect(engine6Entry?.href).toBe(ENGINE6_CATALINA_ROUTE);
    expect(engine6Entry?.tour.destination.city).toBe("Avalon");
    expect(engine6Entry?.tour.destination.state).toBe("California");
    expect(engine6Entry?.tour.heroImage).toBe(
      engine6Entry?.tour.primaryImageUrl
    );
    expect(engine6Entry?.tour.badges?.priceFrom).toBe("From $53");
  });

  it("routes and renders 3097SDZSP_2VISIT in San Diego with canonical affiliate CTA and image parity", () => {
    const unifiedTours = getToursByCityUnified("california", "san-diego");
    const engine6Entry = unifiedTours.find(
      entry => entry.tour.productCode === "3097SDZSP_2VISIT"
    );

    expect(engine6Entry).toBeDefined();
    expect(engine6Entry?.href).toBe(ENGINE6_SAN_DIEGO_ZOO_COMBO_ROUTE);
    expect(engine6Entry?.tour.destination.city).toBe("San Diego");
    expect(engine6Entry?.tour.destination.state).toBe("California");
    expect(engine6Entry?.tour.heroImage).toBe(
      engine6Entry?.tour.primaryImageUrl
    );
    expect(engine6Entry?.tour.heroImage).not.toContain("/hero.jpg");
    expect(engine6Entry?.tour.heroImage).not.toContain(
      "/images/hiking-hero.jpg"
    );
    expect(engine6Entry?.tour.bookingUrl).toContain(
      "/tours/San-Diego/San-Diego-Zoo-and-Safari-Park-Combo-Tour/d736-3097SDZSP_2VISIT"
    );
    expect(engine6Entry?.tour.bookingUrl).not.toContain("/search/");

    const detailTour = engine6ResolvedTours.find(
      tour => tour.productCode === "3097SDZSP_2VISIT"
    );
    const detailHtml = renderToString(<Engine6TourPage tour={detailTour!} />);
    expect(detailHtml).toContain('data-testid="engine6-breadcrumbs"');
    expect(detailHtml).toContain(
      `href=\"/destinations/california/san-diego/tours\"`
    );
  });

  it("routes and renders 447234P3 in San Diego with canonical affiliate CTA and image parity", () => {
    const unifiedTours = getToursByCityUnified("california", "san-diego");
    const matchingEntries = unifiedTours.filter(
      entry => entry.tour.productCode === "447234P3"
    );
    const engine6Entry = matchingEntries[0];

    expect(matchingEntries).toHaveLength(1);
    expect(engine6Entry).toBeDefined();
    expect(engine6Entry?.href).toBe(ENGINE6_SAN_DIEGO_JOSHUA_TREE_ROUTE);
    expect(engine6Entry?.tour.destination.city).toBe("San Diego");
    expect(engine6Entry?.tour.destination.state).toBe("California");
    expect(engine6Entry?.tour.heroImage).toBe(
      engine6Entry?.tour.primaryImageUrl
    );
    expect(engine6Entry?.tour.heroImage).toBe(
      ENGINE6_447234P3_EXPECTED_HERO_URL
    );
    expect(engine6Entry?.tour.bookingUrl).toContain(
      "/tours/San-Diego/Day-Trip-to-Joshua-Tree-National-Park-from-San-Diego/d736-447234P3"
    );
    expect(engine6Entry?.tour.bookingUrl).not.toContain("/search/");
    expect(engine6Entry?.tour.badges?.priceFrom).toBe("From $995");

    const detailTour = engine6ResolvedTours.find(
      tour => tour.productCode === "447234P3"
    );
    expect(detailTour?.heroImageUrl).toBe(ENGINE6_447234P3_EXPECTED_HERO_URL);
    expect(detailTour?.diagnostics.captionPrecedenceApplied).toBe(false);
    expect(detailTour?.diagnostics.candidateFamilyIdentityDeterminable).toBe(
      true
    );
    expect(detailTour?.diagnostics.heroSurfaceParity).toEqual({
      page: true,
      card: true,
      schema: true,
    });
    expect(detailTour?.diagnostics.heroSourceType).not.toBe(
      "approved-placeholder"
    );
    expect(detailTour?.diagnostics.heroFallbackTriggered).toBe(false);
    const detailHtml = renderToString(<Engine6TourPage tour={detailTour!} />);
    expect(detailHtml).toContain('data-testid="engine6-breadcrumbs"');
    expect(detailHtml).toContain("From $995");
    expect(detailHtml).toContain(`src="${ENGINE6_447234P3_EXPECTED_HERO_URL}"`);
    expect(detailHtml).toContain(
      `href=\"/destinations/california/san-diego/tours\"`
    );

    const schema = buildEngine6SchemaGraph(detailTour!);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const offerNode = graph.find(node => node["@type"] === "Offer") as
      | Record<string, unknown>
      | undefined;
    const tripNode = graph.find(node => node["@type"] === "TouristTrip") as
      | Record<string, unknown>
      | undefined;
    expect(offerNode?.price).toBe(995);
    expect(offerNode?.description).toBe("From $995");
    expect(tripNode?.image).toBe(ENGINE6_447234P3_EXPECTED_HERO_URL);
  });

  it("routes and renders 5584233P1 in San Diego with canonical affiliate CTA and image parity", () => {
    const unifiedTours = getToursByCityUnified("california", "san-diego");
    const matchingEntries = unifiedTours.filter(
      entry => entry.tour.productCode === "5584233P1"
    );
    const engine6Entry = matchingEntries[0];

    expect(matchingEntries).toHaveLength(1);
    expect(engine6Entry).toBeDefined();
    expect(engine6Entry?.href).toBe(ENGINE6_SAN_DIEGO_SUNSET_SAILING_ROUTE);
    expect(engine6Entry?.tour.destination.city).toBe("San Diego");
    expect(engine6Entry?.tour.destination.state).toBe("California");
    expect(engine6Entry?.tour.heroImage).toBe(
      engine6Entry?.tour.primaryImageUrl
    );
    expect(engine6Entry?.tour.heroImage).toBe(
      ENGINE6_5584233P1_EXPECTED_HERO_URL
    );
    expect(engine6Entry?.tour.heroImage).not.toContain("/hero.jpg");
    expect(engine6Entry?.tour.heroImage).not.toContain(
      "/images/hiking-hero.jpg"
    );
    expect(engine6Entry?.tour.bookingUrl).toBe(
      "https://www.viator.com/tours/San-Diego/Spectacular-Sunset-Sailing/d736-5584233P1?pid=P00290915&uid=U00174482&mcid=58086&medium=link&currency=USD"
    );
    expect(engine6Entry?.tour.bookingUrl).not.toContain("/search/");
    expect(engine6Entry?.tour.badges?.priceFrom).toBe("From $120");
    expect(engine6Entry?.tour.badges?.rating).toBe(5);
    expect(engine6Entry?.tour.badges?.reviewCount).toBe(22);

    const detailTour = engine6ResolvedTours.find(
      tour => tour.productCode === "5584233P1"
    );
    expect(detailTour?.heroImageUrl).toBe(ENGINE6_5584233P1_EXPECTED_HERO_URL);
    expect(detailTour?.diagnostics.heroSourceType).not.toBe(
      "approved-placeholder"
    );
    expect(detailTour?.diagnostics.heroFallbackTriggered).toBe(false);
    const detailHtml = renderToString(<Engine6TourPage tour={detailTour!} />);
    expect(detailHtml).toContain('data-testid="engine6-breadcrumbs"');
    expect(detailHtml).toContain('data-testid="engine6-back-to-tours"');
    expect(detailHtml).toContain(
      "Safe Harbor Marina, 955 Harbor Island Dr, San Diego, CA 92101"
    );
    expect(detailHtml).toContain(
      `src="${ENGINE6_5584233P1_EXPECTED_HERO_URL.replaceAll("&", "&amp;")}"`
    );
    expect(detailHtml).toContain(
      `href=\"/destinations/california/san-diego/tours\"`
    );

    const schema = buildEngine6SchemaGraph(detailTour!);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const offerNode = graph.find(node => node["@type"] === "Offer") as
      | Record<string, unknown>
      | undefined;
    const tripNode = graph.find(node => node["@type"] === "TouristTrip") as
      | Record<string, unknown>
      | undefined;
    expect(offerNode?.price).toBe(120);
    expect(offerNode?.description).toBe("From $120");
    expect(tripNode?.image).toBe(ENGINE6_5584233P1_EXPECTED_HERO_URL);
  });

  it("routes and renders 327321P1 in Palm Springs with direct affiliate CTA, image parity, and no gallery", () => {
    const unifiedTours = getToursByCityUnified("california", "joshua-tree");
    const matchingEntries = unifiedTours.filter(
      entry => entry.tour.productCode === "327321P1"
    );
    const engine6Entry = matchingEntries[0];

    expect(matchingEntries).toHaveLength(1);
    expect(engine6Entry).toBeDefined();
    expect(engine6Entry?.href).toBe(ENGINE6_PALM_SPRINGS_SUNRISE_HIKE_ROUTE);
    expect(engine6Entry?.tour.heroImage).toBe(
      ENGINE6_327321P1_EXPECTED_HERO_URL
    );
    expect(engine6Entry?.tour.primaryImageUrl).toBe(
      ENGINE6_327321P1_EXPECTED_HERO_URL
    );
    expect(engine6Entry?.tour.heroImage).not.toContain("/hero.jpg");
    expect(engine6Entry?.tour.heroImage).not.toContain(
      "/images/hiking-hero.jpg"
    );
    expect(engine6Entry?.tour.bookingUrl).toBe(
      "https://www.viator.com/tours/Palm-Springs/Mountain-Sunrise-Hike-and-Meditation/d648-327321P1?pid=P00290915&uid=U00174482&mcid=58086&medium=link&currency=USD"
    );
    expect(engine6Entry?.tour.bookingUrl).not.toContain("/search/");
    expect(engine6Entry?.tour.badges?.priceFrom).toBe("From $108");
    expect(engine6Entry?.tour.badges?.rating).toBe(5);
    expect(engine6Entry?.tour.badges?.reviewCount).toBe(92);

    const detailTour = engine6ResolvedTours.find(
      tour => tour.productCode === "327321P1"
    );
    expect(detailTour?.heroImageUrl).toBe(ENGINE6_327321P1_EXPECTED_HERO_URL);
    expect(detailTour?.diagnostics.heroFallbackTriggered).toBe(false);
    expect(detailTour?.diagnostics.finalHeroUrl).toBe(
      ENGINE6_327321P1_EXPECTED_HERO_URL
    );

    const detailHtml = renderToString(<Engine6TourPage tour={detailTour!} />);
    expect(detailHtml).toContain('data-testid="engine6-breadcrumbs"');
    expect(detailHtml).toContain(
      "1500 A S Palm Canyon Dr, Palm Springs, CA 92264, USA"
    );
    expect(detailHtml).toContain(`src="${ENGINE6_327321P1_EXPECTED_HERO_URL}"`);
    expect(detailHtml).toContain(
      `href=\"/destinations/california/palm-springs/tours\"`
    );
    expect(detailHtml).not.toContain('data-testid="engine6-gallery"');

    const schema = buildEngine6SchemaGraph(detailTour!);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const webpageNode = graph.find(node => node["@type"] === "WebPage") as
      | Record<string, unknown>
      | undefined;
    const productNode = graph.find(node => node["@type"] === "Product") as
      | Record<string, unknown>
      | undefined;
    const offerNode = graph.find(node => node["@type"] === "Offer") as
      | Record<string, unknown>
      | undefined;
    const faqNode = graph.find(node => node["@type"] === "FAQPage") as
      | Record<string, unknown>
      | undefined;

    expect(webpageNode?.image).toBe(ENGINE6_327321P1_EXPECTED_HERO_URL);
    expect(productNode?.image).toBe(ENGINE6_327321P1_EXPECTED_HERO_URL);
    expect(productNode?.url).toBe(
      "https://www.alloutdooradventures.com/destinations/california/palm-springs/tours/mountain-sunrise-hike-and-meditation-in-palm-springs"
    );
    expect(offerNode?.url).toBe(
      "https://www.viator.com/tours/Palm-Springs/Mountain-Sunrise-Hike-and-Meditation/d648-327321P1?pid=P00290915&uid=U00174482&mcid=58086&medium=link&currency=USD"
    );
    expect(Array.isArray(faqNode?.mainEntity)).toBe(true);
    expect((faqNode?.mainEntity as unknown[]).length).toBe(5);
  });

  it("rebuilds 335698P7 in place with Engine6 route, exact hero parity, and schema parity", () => {
    const unifiedTours = getToursByCityUnified("california", "joshua-tree");
    const matchingEntries = unifiedTours.filter(
      entry => entry.tour.productCode === "335698P7"
    );
    expect(matchingEntries).toHaveLength(1);
    expect(matchingEntries[0]?.href).toBe(
      ENGINE6_JOSHUA_TREE_HALF_DAY_SMALL_GROUP_ROUTE
    );
    expect(matchingEntries[0]?.tour.heroImage).toBe(
      ENGINE6_335698P7_EXPECTED_HERO_URL
    );

    const detailTour = engine6ResolvedTours.find(
      tour => tour.productCode === "335698P7"
    );
    expect(detailTour?.heroImageUrl).toBe(ENGINE6_335698P7_EXPECTED_HERO_URL);
    expect(detailTour?.canonicalPath).toBe(
      ENGINE6_JOSHUA_TREE_HALF_DAY_SMALL_GROUP_ROUTE
    );
    expect(detailTour?.priceAmount).toBe(99);
    expect(detailTour?.priceFormatted).toBe("From $99.00");

    expect(detailTour?.bookingUrl).toContain("/d648-335698P7");
    expect(detailTour?.bookingUrl).toContain("pid=P00290915");

    const detailHtml = renderToString(<Engine6TourPage tour={detailTour!} />);
    expect(detailHtml).toContain(
      ENGINE6_335698P7_EXPECTED_HERO_URL.replaceAll("&", "&amp;")
    );
    expect(detailHtml).toContain('data-testid="engine6-breadcrumbs"');
    expect(detailHtml).toContain(
      'href="/destinations/california/joshua-tree/tours"'
    );
    expect(detailHtml).toContain("<strong>Price:</strong>");
    expect(detailHtml).toContain("From $99.00");
    expect(detailHtml).not.toContain("Check latest price");

    const schema = buildEngine6SchemaGraph(detailTour!);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const webpageNode = graph.find(node => node["@type"] === "WebPage") as
      | Record<string, unknown>
      | undefined;
    const productNode = graph.find(node => node["@type"] === "Product") as
      | Record<string, unknown>
      | undefined;
    const offerNode = graph.find(node => node["@type"] === "Offer") as
      | Record<string, unknown>
      | undefined;
    expect(webpageNode?.image).toBe(ENGINE6_335698P7_EXPECTED_HERO_URL);
    expect(productNode?.image).toBe(ENGINE6_335698P7_EXPECTED_HERO_URL);
    expect(productNode?.offers).toBeDefined();
    expect(productNode?.aggregateRating).toBeDefined();
    expect(offerNode?.price).toBe(99);
    expect(detailTour?.itinerary.length).toBeGreaterThan(0);
  });

  it("keeps 335698P13 review counts aligned across listing, detail hero, and schema aggregate rating", () => {
    const unifiedTours = getToursByCityUnified("california", "joshua-tree");
    const entry = unifiedTours.find(
      item => item.tour.productCode === "335698P13"
    );

    expect(entry).toBeDefined();
    expect(entry?.tour.badges?.rating).toBe(5);
    expect(entry?.tour.badges?.reviewCount).toBe(86);

    const detailTour = engine6ResolvedTours.find(
      tour => tour.productCode === "335698P13"
    );
    expect(detailTour).toBeDefined();
    expect(detailTour?.aggregateRating).toBe(5);
    expect(detailTour?.reviewCount).toBe(86);

    const schema = buildEngine6SchemaGraph(detailTour!);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const aggregateNode = graph.find(
      node => node["@type"] === "AggregateRating"
    ) as Record<string, unknown> | undefined;
    expect(aggregateNode).toBeDefined();
    expect(aggregateNode?.ratingValue).toBe(5);
    expect(aggregateNode?.reviewCount).toBe(86);
  });

  it("rebuilds 3351P15 in place with API-derived price/reviews and deterministic hero parity", () => {
    const unifiedTours = getToursByCityUnified("california", "joshua-tree");
    const entry = unifiedTours.find(
      item => item.tour.productCode === "3351P15"
    );
    expect(entry?.href).toBe(
      ENGINE6_PALM_SPRINGS_INDIAN_CANYONS_BIKE_HIKE_ROUTE
    );
    expect(entry?.tour.heroImage).toBe(ENGINE6_3351P15_EXPECTED_HERO_URL);
    expect(entry?.tour.badges?.priceFrom).toBe("From $149.00");
    expect(entry?.tour.badges?.rating).toBe(4.5);
    expect(entry?.tour.badges?.reviewCount).toBe(216);

    const detailTour = engine6ResolvedTours.find(
      tour => tour.productCode === "3351P15"
    );
    expect(detailTour?.priceAmount).toBe(149);
    expect(detailTour?.priceFormatted).toBe("From $149.00");
    expect(detailTour?.reviewCount).toBe(216);
    expect(detailTour?.heroImageUrl).toBe(ENGINE6_3351P15_EXPECTED_HERO_URL);
    expect(detailTour?.canonicalPath).toBe(
      ENGINE6_PALM_SPRINGS_INDIAN_CANYONS_BIKE_HIKE_ROUTE
    );

    const detailHtml = renderToString(<Engine6TourPage tour={detailTour!} />);
    expect(detailHtml).toContain("From $149.00");
    expect(detailHtml).not.toContain("Check latest price");

    const schema = buildEngine6SchemaGraph(detailTour!);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const productNode = graph.find(
      node => node["@type"] === "Product"
    ) as Record<string, unknown>;
    const offerNode = graph.find(node => node["@type"] === "Offer") as Record<
      string,
      unknown
    >;
    const aggregate = productNode?.aggregateRating as Record<string, unknown>;
    expect(productNode?.image).toBe(ENGINE6_3351P15_EXPECTED_HERO_URL);
    expect(offerNode?.price).toBe(149);
    expect(aggregate?.ratingValue).toBe(4.5);
    expect(aggregate?.reviewCount).toBe(216);
  });

  it("routes and renders new San Diego engine6 specimens with hero parity, direct affiliate CTA, and schema URL separation", () => {
    const expectedByProductCode = {
      "21165P1": {
        route: ENGINE6_SAN_DIEGO_SEA_CAVE_KAYAK_ROUTE,
        hero: ENGINE6_21165P1_EXPECTED_HERO_URL,
        cta: "https://www.viator.com/tours/San-Diego/Original-Sea-Cave-Kayak-Tour/d736-21165P1?pid=P00290915&uid=U00174482&mcid=58086&medium=link&currency=USD",
      },
      "31015P9": {
        route: ENGINE6_SAN_DIEGO_PRIVATE_SAILING_CHARTER_ROUTE,
        hero: ENGINE6_31015P9_EXPECTED_HERO_URL,
        cta: "https://www.viator.com/tours/San-Diego/Private-Sailing-Charter-on-San-Diego-Bay/d736-31015P9?pid=P00290915&uid=U00174482&mcid=58086&medium=link&currency=USD",
      },
      "173946P1": {
        route: ENGINE6_SAN_DIEGO_HALF_DAY_4X4_ROUTE,
        hero: ENGINE6_173946P1_EXPECTED_HERO_URL,
        cta: "https://www.viator.com/tours/San-Diego/Half-Day-4x4-Adventure/d736-173946P1?pid=P00290915&mcid=58086&medium=link&uid=U00174482&currency=USD",
      },
      "18125P5": {
        route: ENGINE6_SAN_DIEGO_PRIVATE_BALBOA_SEGWAY_ROUTE,
        hero: ENGINE6_18125P5_EXPECTED_HERO_URL,
        cta: "https://www.viator.com/tours/San-Diego/Private-Balboa-Park-Segway-Tour/d736-18125P5?pid=P00290915&mcid=58086&medium=link&uid=U00174482&currency=USD",
      },
    } as const;

    const cityUnified = getToursByCityUnified("california", "san-diego");

    for (const [productCode, expected] of Object.entries(
      expectedByProductCode
    )) {
      const entry = cityUnified.find(
        card => card.tour.productCode === productCode
      );
      expect(entry?.href).toBe(expected.route);
      expect(entry?.tour.heroImage).toBe(expected.hero);
      expect(entry?.tour.primaryImageUrl).toBe(expected.hero);
      expect(entry?.tour.heroImage).not.toContain("/hero.jpg");
      expect(entry?.tour.bookingUrl).toBe(expected.cta);
      expect(entry?.tour.bookingUrl).not.toContain("/search/");

      const detailTour = engine6ResolvedTours.find(
        tour => tour.productCode === productCode
      );
      expect(detailTour?.heroImageUrl).toBe(expected.hero);
      expect(detailTour?.diagnostics.heroFallbackTriggered).toBe(false);
      expect(detailTour?.faqs).toHaveLength(5);

      const detailHtml = renderToString(<Engine6TourPage tour={detailTour!} />);
      expect(detailHtml).toContain(
        `src=\"${expected.hero.replaceAll("&", "&amp;")}\"`
      );
      expect(detailHtml).toContain(expected.cta.replaceAll("&", "&amp;"));
      expect(detailHtml).toContain("Meeting point:");
      expect(detailHtml).not.toContain('data-testid="engine6-gallery"');

      const schema = buildEngine6SchemaGraph(detailTour!);
      const graph = schema["@graph"] as Array<Record<string, unknown>>;
      const webpageNode = graph.find(node => node["@type"] === "WebPage") as
        | Record<string, unknown>
        | undefined;
      const productNode = graph.find(node => node["@type"] === "Product") as
        | Record<string, unknown>
        | undefined;
      const offerNode = graph.find(node => node["@type"] === "Offer") as
        | Record<string, unknown>
        | undefined;

      expect(webpageNode?.image).toBe(expected.hero);
      expect(productNode?.image).toBe(expected.hero);
      expect(productNode?.url).toBe(
        `https://www.alloutdooradventures.com${expected.route}`
      );
      expect(offerNode?.url).toBe(expected.cta);
    }

    const heroes = Object.keys(expectedByProductCode).map(productCode => {
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );
      return tour?.heroImageUrl;
    });
    expect(new Set(heroes).size).toBe(4);
  });

  it("renders an Other Tours slider below bottom CTA with unified listing cards", () => {
    for (const productCode of ["63657P1", "5119P13", "32779P2"]) {
      const { tour, relatedTours } = getRelatedToursForSpecimen(productCode);
      expect(
        relatedTours.some(
          entry =>
            entry.tour.productCode?.toUpperCase() === productCode ||
            entry.tour.slug === tour.slug
        )
      ).toBe(false);

      const html = renderToString(<Engine6TourPage tour={tour} />);
      expect(html).toContain('data-testid="engine6-bottom-cta"');
      if (relatedTours.length >= 2) {
        expect(html).toContain(`Other Tours in ${tour.city}`);
        expect(html).toContain('data-testid="engine6-related-tours"');
        expect(
          html.indexOf('data-testid="engine6-related-tours"')
        ).toBeGreaterThan(html.indexOf('data-testid="engine6-bottom-cta"'));

        for (const related of relatedTours) {
          expect(html).toContain(related.href);
        }
      } else {
        expect(html).not.toContain('data-testid="engine6-related-tours"');
      }
    }
  });

  it("keeps related card route identity stable while hydrating only commercial fields", () => {
    const scenarios = ["63657P1", "5119P13", "32779P2"]
      .map(code => getRelatedToursForSpecimen(code))
      .filter(
        candidate =>
          candidate.relatedTours.find(
            entry => entry.tour.engine === "engine6" && entry.tour.productCode
          ) !== undefined
      );
    expect(scenarios.length).toBeGreaterThan(0);
    const { tour, relatedTours } = scenarios[0]!;
    const related = relatedTours.find(
      entry => entry.tour.engine === "engine6" && entry.tour.productCode
    )!;

    const hydrated = hydrateRelatedTourCommercialFields(related, {
      priceAmount: 987,
      priceFormatted: "From $987.00",
      aggregateRating: 4.9,
      reviewCount: 321,
      durationText: "9 hours",
      meetingPointText: "Ignored for cards",
    });

    expect(hydrated.href).toBe(related.href);
    expect(hydrated.tour.productCode).toBe(related.tour.productCode);
    expect(hydrated.tour.title).toBe(related.tour.title);
    expect(hydrated.tour.slug).toBe(related.tour.slug);
    expect(hydrated.tour.heroImage).toBe(related.tour.heroImage);
    expect(hydrated.tour.startingPrice).toBe(987);
    expect(hydrated.tour.badges.priceFrom).toBe("From $987.00");
    expect(hydrated.tour.badges.rating).toBe(4.9);
    expect(hydrated.tour.badges.reviewCount).toBe(321);
    expect(hydrated.tour.badges.duration).toBe("9 hours");

    const relatedCardHtml = renderToString(
      <TourCard tour={hydrated.tour} href={hydrated.href} />
    );
    expect(relatedCardHtml).toContain(`href="${hydrated.href}"`);
    expect(relatedCardHtml).toContain(hydrated.tour.title);

    const detailHtml = renderToString(<Engine6TourPage tour={tour} />);
    expect(detailHtml).toContain(`href="${hydrated.href}"`);
  });

  it("uses the exact same resolved hero for Vegas detail page, city listing card, and filtered tours card", () => {
    const vegasTour = engine6ResolvedTours.find(
      tour => tour.productCode === "5119P13"
    );
    const expectedHero = vegasTour?.heroImageUrl;
    expect(expectedHero).toContain("https://");

    const cityUnified = getToursByCityUnified("nevada", "las-vegas");
    const cityEntry = cityUnified.find(
      entry => entry.tour.productCode === "5119P13"
    );
    expect(cityEntry?.tour.heroImage).toBe(expectedHero);
    expect(cityEntry?.tour.primaryImageUrl).toBe(expectedHero);

    const previousWindow = (globalThis as { window?: Window }).window;
    const previousLocation = (
      globalThis as {
        location?: { pathname: string; search?: string };
      }
    ).location;
    (
      globalThis as {
        window?: {
          location: { pathname: string; search: string };
          history: { pushState: () => void };
        };
      }
    ).window = {
      location: {
        pathname: "/tours",
        search: "?state=nevada&city=las-vegas",
      },
      history: { pushState: () => {} },
    };
    (
      globalThis as { location?: { pathname: string; search: string } }
    ).location = {
      pathname: "/tours",
      search: "?state=nevada&city=las-vegas",
    };

    const filteredHtml = renderToString(<ToursLanding />);
    expect(filteredHtml).toContain(
      `src="${expectedHero?.replace(/&/g, "&amp;")}"`
    );
    expect(filteredHtml).toContain(
      `data-card-image-src="${expectedHero?.replace(/&/g, "&amp;")}"`
    );
    expect(filteredHtml).toContain(
      `data-hero-image-src="${expectedHero?.replace(/&/g, "&amp;")}"`
    );
    expect(filteredHtml.toLowerCase()).not.toContain("octopus");

    (globalThis as { window?: Window }).window = previousWindow;
    (
      globalThis as { location?: { pathname: string; search?: string } }
    ).location = previousLocation;
  });

  it("keeps Antelope hero parity across detail, city listing, and filtered tours without placeholder override", () => {
    const antelopeTour = engine6ResolvedTours.find(
      tour => tour.productCode === "60136P1"
    );
    expect(antelopeTour).toBeDefined();
    expect(antelopeTour?.heroImageUrl).toBe(ENGINE6_60136P1_EXPECTED_HERO_URL);

    const detailHtml = renderToString(<Engine6TourPage tour={antelopeTour!} />);
    const escapedHero = antelopeTour!.heroImageUrl.replace(/&/g, "&amp;");
    expect(detailHtml).toContain(`src="${escapedHero}"`);
    expect(antelopeTour!.heroImageUrl).not.toContain("/images/hiking-hero.jpg");

    const unified = getToursByCityUnified("nevada", "las-vegas");
    const entry = unified.find(tour => tour.tour.productCode === "60136P1");
    expect(entry).toBeDefined();
    expect(entry?.href).toBe(ENGINE6_ANTELOPE_ROUTE);
    expect(entry?.tour.heroImage).toBe(ENGINE6_60136P1_EXPECTED_HERO_URL);
    expect(entry?.tour.primaryImageUrl).toBe(ENGINE6_60136P1_EXPECTED_HERO_URL);

    const cardHtml = renderToString(
      <TourCard tour={entry!.tour} href={entry!.href} />
    );
    expect(cardHtml).toContain(`data-card-image-src="${escapedHero}"`);
    expect(cardHtml).toContain(`data-hero-image-src="${escapedHero}"`);
    expect(cardHtml).not.toContain("/images/hiking-hero.jpg");

    const previousWindow = (globalThis as { window?: Window }).window;
    const previousLocation = (
      globalThis as {
        location?: { pathname: string; search?: string };
      }
    ).location;
    (
      globalThis as {
        window?: {
          location: { pathname: string; search: string };
          history: { pushState: () => void };
        };
      }
    ).window = {
      location: { pathname: "/tours", search: "?state=nevada&city=las-vegas" },
      history: { pushState: () => {} },
    };
    (
      globalThis as { location?: { pathname: string; search: string } }
    ).location = {
      pathname: "/tours",
      search: "?state=nevada&city=las-vegas",
    };

    const filteredHtml = renderToString(<ToursLanding />);
    expect(filteredHtml).toContain(`data-card-image-src="${escapedHero}"`);
    expect(filteredHtml).toContain(`data-hero-image-src="${escapedHero}"`);
    expect(filteredHtml).toContain(
      ENGINE6_60136P1_EXPECTED_HERO_URL.replace(/&/g, "&amp;")
    );
    expect(filteredHtml).not.toContain("/images/hiking-hero.jpg");

    (globalThis as { window?: Window }).window = previousWindow;
    (
      globalThis as { location?: { pathname: string; search?: string } }
    ).location = previousLocation;
  });

  it("routes and renders 26719P8 in Las Vegas with itinerary, FAQs, and affiliate booking URL", () => {
    const emeraldTour = engine6ResolvedTours.find(
      tour => tour.productCode === "26719P8"
    );
    expect(emeraldTour).toBeDefined();
    expect(emeraldTour?.pagePath).toBe(ENGINE6_EMERALD_CAVE_ROUTE);
    expect(emeraldTour?.itinerary.length).toBeGreaterThan(0);
    expect(emeraldTour?.faqs.length).toBeGreaterThan(0);
    expect(emeraldTour?.included.length).toBeGreaterThan(0);
    expect(emeraldTour?.requirements.length).toBeGreaterThan(0);
    expect(emeraldTour?.bookingUrl).toBe(
      "https://www.viator.com/tours/Las-Vegas/Emerald-Cave-Kayaking-Tour/d684-26719P8?pid=P00290915&uid=U00174482&mcid=58086&medium=link&currency=USD"
    );

    const detailHtml = renderToString(<Engine6TourPage tour={emeraldTour!} />);
    const escapedHero = emeraldTour!.heroImageUrl.replace(/&/g, "&amp;");
    expect(detailHtml).toContain(">Itinerary<");
    expect(detailHtml).toContain(">FAQs<");
    expect(detailHtml).toContain(`src="${escapedHero}"`);

    const unified = getToursByCityUnified("nevada", "las-vegas");
    const entry = unified.find(item => item.tour.productCode === "26719P8");
    expect(entry).toBeDefined();
    expect(entry?.href).toBe(ENGINE6_EMERALD_CAVE_ROUTE);
    expect(entry?.tour.heroImage).toBe(emeraldTour?.heroImageUrl);
    expect(entry?.tour.primaryImageUrl).toBe(emeraldTour?.heroImageUrl);
    expect(entry?.tour.badges?.priceFrom).toBe("From $109");
    expect(entry?.tour.badges?.rating).toBe(4.9);
    expect(entry?.tour.badges?.reviewCount).toBe(5060);
  });

  it("renders a non-empty Las Vegas city tours hero src (no alt-only fallback block)", () => {
    const html = renderToString(
      <CityToursIndexRoute
        params={{ stateSlug: "nevada", citySlug: "las-vegas" }}
      />
    );

    expect(html).toContain('alt="Las Vegas hero"');
    expect(html).toMatch(/<img[^>]+src="[^"]+"[^>]+alt="Las Vegas hero"/);
    expect(html).not.toContain('alt="Las Vegas hero" src=""');
    expect(html).not.toContain('src="undefined"');
  });

  it("renders New York City tour cards with Engine6 entries before non-Engine6 entries", () => {
    const unified = getToursByCityUnified("new-york", "new-york");
    const firstEngine6 = unified.find(entry => entry.tour.engine === "engine6");
    const firstNonEngine6 = unified.find(
      entry => entry.tour.engine !== "engine6"
    );

    expect(firstEngine6).toBeDefined();
    expect(firstNonEngine6).toBeDefined();

    const html = renderToString(
      <CityToursIndexRoute
        params={{ stateSlug: "new-york", citySlug: "new-york" }}
      />
    );
    const engine6HrefIndex = html.indexOf(firstEngine6!.href);
    const nonEngine6HrefIndex = html.indexOf(firstNonEngine6!.href);

    expect(engine6HrefIndex).toBeGreaterThan(-1);
    expect(nonEngine6HrefIndex).toBeGreaterThan(-1);
    expect(engine6HrefIndex).toBeLessThan(nonEngine6HrefIndex);
  });

  it("surfaces 3454YE3D through public route, city listings, card surfaces, and schema hero parity", () => {
    const expectedHero =
      "https://dynamic-media.tacdn.com/media/photo-o/2e/b5/19/f1/caption.jpg?w=700&h=500&s=1";
    const tour = engine6ResolvedTours.find(
      entry => entry.productCode === "3454YE3D"
    );

    expect(tour).toBeDefined();
    expect(tour?.canonicalPath).toBe(
      ENGINE6_SAN_FRANCISCO_YOSEMITE_3_DAY_CAMPING_ROUTE
    );
    expect(tour?.heroImageUrl).toBe(expectedHero);
    expect(tour?.resolvedHero?.url).toBe(expectedHero);
    expect(tour?.diagnostics.heroSourceFieldPath).toBe(
      "product.media.images[0].variants.FULL.url"
    );

    const listingTour = getToursByCity("california", "san-francisco").find(
      entry => entry.productCode === "3454YE3D"
    );
    expect(listingTour).toBeDefined();
    expect(listingTour?.heroImage).toBe(expectedHero);
    expect(listingTour?.primaryImageUrl).toBe(expectedHero);
    const unifiedEntry = getToursByCityUnified(
      "california",
      "san-francisco"
    ).find(
      entry =>
        entry.tour.engine === "engine6" && entry.tour.productCode === "3454YE3D"
    );
    expect(unifiedEntry).toBeDefined();
    expect(unifiedEntry?.href).toBe(
      ENGINE6_SAN_FRANCISCO_YOSEMITE_3_DAY_CAMPING_ROUTE
    );
    expect(unifiedEntry?.tour.heroImage).toBe(expectedHero);

    const card = toEngine6Card(tour!);
    const cardSurfaces = buildEngine6CardSurfaces(tour!);
    expect(card.href).toBe(ENGINE6_SAN_FRANCISCO_YOSEMITE_3_DAY_CAMPING_ROUTE);
    expect(card.imageUrl).toBe(expectedHero);
    expect(cardSurfaces.city[0]?.imageUrl).toBe(expectedHero);
    expect(cardSurfaces.search[0]?.href).toBe(
      ENGINE6_SAN_FRANCISCO_YOSEMITE_3_DAY_CAMPING_ROUTE
    );

    expect(tour!.itinerary).toHaveLength(15);
    expect(tour!.itinerary.map(item => item.description)).toEqual([
      "Leave San Francisco for Yosemite with an eastbound Bay Bridge crossing and Sierra-bound drive.",
      "Cross the Bay Bridge for views toward Alcatraz Island, Angel Island, and the wider San Francisco Bay.",
      "Arrive at Yosemite National Park after the drive from San Francisco and begin the park portion of the trip.",
      "Walk the Tuolumne Grove route to see mature giant sequoias in a quieter Yosemite forest setting.",
      "Travel through Yosemite Valley for an overview of its glacier-shaped cliffs, meadows, and central landmarks.",
      "Use free time in Yosemite Village for independent walking, food, photos, or nearby valley exploration.",
      "Visit the Yosemite Falls area during valley time to see one of the park’s signature waterfall landmarks.",
      "Browse the Ansel Adams Gallery for photography-focused Yosemite history and park-inspired artwork.",
      "Settle into the Yosemite campsite as camping equipment is distributed and the overnight base is introduced.",
      "Spend the second day in Yosemite High Country with alpine scenery shaped by lakes, granite, and open meadows.",
      "Follow high-country hiking options selected around group pace, seasonal access, and mountain conditions.",
      "Return to Yosemite Valley on the final day for another block of independent park time.",
      "Choose a valley activity such as a waterfall walk, bicycle rental, museum visit, or Merced River break.",
      "Stop at El Capitan Meadow to view the granite wall and watch climbers when conditions allow.",
      "Travel back from Yosemite to the San Francisco Hilton after the final day in the park.",
    ]);
    expect(
      validateEngine6GovernedItinerary({
        renderedItems: tour!.itinerary,
        overviewText: tour!.overviewText,
      })
    ).toEqual([]);

    const detailHtml = renderToString(
      <CityTourDetailRoute
        params={{
          stateSlug: "california",
          citySlug: "san-francisco",
          tourSlug: "3-day-yosemite-camping-adventure-from-san-francisco",
        }}
      />
    );
    const escapedHero = expectedHero.replace(/&/g, "&amp;");
    expect(detailHtml).toContain(
      "Yosemite 3-Day Camping Adventure from San Francisco"
    );
    expect(detailHtml).not.toContain("Tour not found");
    expect(detailHtml).toContain(`src="${escapedHero}"`);

    const schema = buildEngine6SchemaGraph(tour!);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const canonicalUrl = `https://www.alloutdooradventures.com${ENGINE6_SAN_FRANCISCO_YOSEMITE_3_DAY_CAMPING_ROUTE}`;
    for (const type of ["WebPage", "Product", "TouristTrip"]) {
      const node = graph.find(entry => entry["@type"] === type);
      expect(node?.url).toBe(canonicalUrl);
      expect((node as { image?: string } | undefined)?.image).toBe(
        expectedHero
      );
    }
  });

  it("surfaces 3454P57 through San Francisco route, listings, cards, and schema hero parity", () => {
    const expectedHero =
      "https://dynamic-media.tacdn.com/media/photo-o/2e/c3/8e/2c/caption.jpg?w=700&h=500&s=1";
    const tour = engine6ResolvedTours.find(
      entry => entry.productCode === "3454P57"
    );

    expect(tour).toBeDefined();
    expect(tour?.canonicalPath).toBe(ENGINE6_GOLDEN_GATE_MUIR_WOODS_BIKE_ROUTE);
    expect(tour?.heroImageUrl).toBe(expectedHero);
    expect(tour?.resolvedHero?.url).toBe(expectedHero);
    expect(tour?.diagnostics.heroSourceFieldPath).toBe(
      "product.media.images[0].variants.FULL.url"
    );
    expect(tour?.overviewText).toContain("Muir Woods National Monument");
    expect(tour?.overviewText).toContain("Sausalito");
    expect(tour?.overviewText).not.toContain("Yosemite");
    expect(tour?.overviewText).not.toContain("Santa Barbara");
    expect(tour?.itinerary.map(item => item.title)).toEqual([
      "Fisherman’s Wharf bike orientation",
      "Bayfront ride toward the bridge",
      "Golden Gate Bridge crossing",
      "Sausalito bike handoff and lunch time",
      "Sausalito minicoach meeting point",
      "Muir Woods National Monument",
      "Sausalito return window",
      "San Francisco drop-off",
    ]);
    expect(
      validateEngine6GovernedItinerary({
        renderedItems: tour!.itinerary,
        overviewText: tour!.overviewText,
      })
    ).toEqual([]);

    const listingTour = getToursByCity("california", "san-francisco").find(
      entry => entry.productCode === "3454P57"
    );
    expect(listingTour).toBeDefined();
    expect(listingTour?.heroImage).toBe(expectedHero);
    expect(listingTour?.primaryImageUrl).toBe(expectedHero);
    expect(
      getToursByCity("california", "san-francisco").some(
        entry =>
          entry.slug ===
          "golden-gate-bridge-bike-tour-with-muir-woods-and-sausalito-549337"
      )
    ).toBe(false);

    const unifiedEntry = getToursByCityUnified(
      "california",
      "san-francisco"
    ).find(
      entry =>
        entry.tour.engine === "engine6" && entry.tour.productCode === "3454P57"
    );
    expect(unifiedEntry).toBeDefined();
    expect(unifiedEntry?.href).toBe(ENGINE6_GOLDEN_GATE_MUIR_WOODS_BIKE_ROUTE);
    expect(unifiedEntry?.tour.heroImage).toBe(expectedHero);

    const card = toEngine6Card(tour!);
    const cardSurfaces = buildEngine6CardSurfaces(tour!);
    expect(card.href).toBe(ENGINE6_GOLDEN_GATE_MUIR_WOODS_BIKE_ROUTE);
    expect(card.imageUrl).toBe(expectedHero);
    expect(cardSurfaces.city[0]?.imageUrl).toBe(expectedHero);
    expect(cardSurfaces.search[0]?.href).toBe(
      ENGINE6_GOLDEN_GATE_MUIR_WOODS_BIKE_ROUTE
    );

    const detailHtml = renderToString(
      <CityTourDetailRoute
        params={{
          stateSlug: "california",
          citySlug: "san-francisco",
          tourSlug:
            "golden-gate-bridge-bike-tour-with-muir-woods-and-sausalito",
        }}
      />
    );
    const escapedHero = expectedHero.replace(/&/g, "&amp;");
    expect(detailHtml).toContain(
      "Golden Gate Bridge Bike Tour with Muir Woods and Sausalito Tour"
    );
    expect(detailHtml).not.toContain("Tour not found");
    expect(detailHtml).toContain(`src="${escapedHero}"`);

    const schema = buildEngine6SchemaGraph(tour!);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const canonicalUrl = `https://www.alloutdooradventures.com${ENGINE6_GOLDEN_GATE_MUIR_WOODS_BIKE_ROUTE}`;
    for (const type of ["WebPage", "Product", "TouristTrip"]) {
      const node = graph.find(entry => entry["@type"] === type);
      expect(node?.url).toBe(canonicalUrl);
      expect((node as { image?: string } | undefined)?.image).toBe(
        expectedHero
      );
    }
  });

  it("regression: every Engine6 listing card image stays identical to its detail hero", () => {
    for (const tour of engine6ResolvedTours) {
      const card = toEngine6Card(tour);
      expect(card.imageUrl).toBe(tour.heroImageUrl);

      const [, stateSlug = "", citySlug = ""] =
        /^\/destinations\/([^/]+)\/([^/]+)\/tours\/[^/]+$/.exec(
          tour.pagePath
        ) ?? [];
      const unified = getToursByCityUnified(stateSlug, citySlug);
      const listingEntry = unified.find(
        entry =>
          entry.tour.engine === "engine6" &&
          entry.tour.productCode === tour.productCode
      );

      expect(listingEntry).toBeDefined();
      expect(listingEntry?.tour.heroImage).toBe(tour.heroImageUrl);
      expect(listingEntry?.tour.primaryImageUrl).toBe(tour.heroImageUrl);

      const listingHtml = renderToString(
        <TourCard tour={listingEntry!.tour} href={listingEntry!.href} />
      );
      const escapedHero = tour.heroImageUrl.replace(/&/g, "&amp;");
      expect(listingHtml).toContain(`src="${escapedHero}"`);
      expect(listingHtml).toContain(`data-card-image-src="${escapedHero}"`);
      expect(listingHtml).toContain(`data-hero-image-src="${escapedHero}"`);
    }
  });

  it("trace: specimen slug survives to the rendered card arrays and DOM for both listing pages", () => {
    const specimenSlug = "santa-barbara-vineyard-to-table-taste-tour-by-e-bike";
    const specimenTitle =
      "Santa Barbara Vineyard to Table Taste Tour by E-Bike";
    const slugFromPath = (path: string) =>
      path.split("/").filter(Boolean).pop();

    const registryIndex = engine6ResolvedTours.findIndex(
      tour => slugFromPath(tour.pagePath) === specimenSlug
    );
    // temporary trace output requested by review
    console.info("[engine6-trace] registry", {
      present: registryIndex > -1,
      index: registryIndex,
      total: engine6ResolvedTours.length,
      slug:
        registryIndex > -1
          ? slugFromPath(engine6ResolvedTours[registryIndex]!.pagePath)
          : null,
    });
    expect(registryIndex).toBeGreaterThan(-1);

    const unifiedTours = getToursByCityUnified("california", "santa-barbara");
    const unifiedIndex = unifiedTours.findIndex(
      entry => entry.tour.slug === specimenSlug
    );
    console.info("[engine6-trace] unified datasource", {
      present: unifiedIndex > -1,
      index: unifiedIndex,
      total: unifiedTours.length,
      href: unifiedIndex > -1 ? unifiedTours[unifiedIndex]!.href : null,
    });
    expect(unifiedIndex).toBeGreaterThan(-1);

    const cityListingHtml = renderToString(
      <TourCard
        tour={unifiedTours[unifiedIndex]!.tour}
        href={unifiedTours[unifiedIndex]!.href}
      />
    );
    console.info("[engine6-trace] city listing card DOM", {
      present: cityListingHtml.includes(specimenTitle),
      hrefPresent: cityListingHtml.includes(ENGINE6_SPECIMEN_ROUTE),
      totalCards: unifiedTours.length,
      index: unifiedIndex,
    });
    expect(cityListingHtml).toContain(specimenTitle);
    expect(cityListingHtml).toContain(ENGINE6_SPECIMEN_ROUTE);

    const previousWindow = (globalThis as { window?: Window }).window;
    const previousLocation = (
      globalThis as {
        location?: { pathname: string; search?: string };
      }
    ).location;
    (
      globalThis as {
        window?: {
          location: { pathname: string; search: string };
          history: { pushState: () => void };
        };
      }
    ).window = {
      location: {
        pathname: "/tours",
        search: "?state=california&city=santa-barbara",
      },
      history: { pushState: () => {} },
    };
    (
      globalThis as { location?: { pathname: string; search: string } }
    ).location = {
      pathname: "/tours",
      search: "?state=california&city=santa-barbara",
    };

    const filteredHtml = renderToString(<ToursLanding />);
    const filteredCardCount = (filteredHtml.match(/<article /g) ?? []).length;
    const filteredSlugIndex = filteredHtml.indexOf(ENGINE6_SPECIMEN_ROUTE);
    console.info("[engine6-trace] /tours filtered DOM", {
      present: filteredHtml.includes(specimenTitle),
      hrefPresent: filteredSlugIndex > -1,
      index: filteredSlugIndex,
      totalCards: filteredCardCount,
    });

    expect(filteredHtml).toContain(specimenTitle);
    expect(filteredHtml).toContain(ENGINE6_SPECIMEN_ROUTE);

    (globalThis as { window?: Window }).window = previousWindow;
    (
      globalThis as { location?: { pathname: string; search?: string } }
    ).location = previousLocation;
  });

  it("keeps the Engine6 specimen card helper aligned with the resolved hero image", () => {
    const card = toEngine6Card(engine6SpecimenTour);

    expect(card.imageUrl).toBe(ENGINE6_63657P1_CARD_IMAGE_URL);
    expect(card.locationLabel).toBe("Santa Barbara, California");
    expect(card.priceLabel).toBe("From $199");
    expect(card.ratingLabel).toBe("4.9 (177)");
  });
});

describe("engine6 multi-tour contract", () => {
  it.each(engine6ResolvedTours)(
    "renders supported sections conditionally for %s",
    tour => {
      const html = renderToString(<Engine6TourPage tour={tour} />);
      const schema = buildEngine6SchemaGraph(tour);
      const graph = schema["@graph"] as Array<Record<string, unknown>>;
      const faqNode = graph.find(node => node["@type"] === "FAQPage");
      const offerNode = graph.find(node => node["@type"] === "Offer") as
        | Record<string, unknown>
        | undefined;
      const productNode = graph.find(node => node["@type"] === "Product") as
        | Record<string, unknown>
        | undefined;
      const tripNode = graph.find(node => node["@type"] === "TouristTrip") as
        | Record<string, unknown>
        | undefined;

      if (tour.heroImageUrl) {
        expect(tour.heroImageUrl).toContain("http");
        expect(tour.heroImageUrl).not.toContain("/hero.jpg");
        expect(html).toContain(
          `src="${tour.heroImageUrl.replace(/&/g, "&amp;")}"`
        );
      } else {
        expect(html).not.toContain('src="/images/hiking-hero.jpg"');
      }
      if (tour.bookingUrl.startsWith("/destinations/")) {
        expect(tour.bookingUrl).toContain("/book");
      } else {
        expect(tour.bookingUrl).toContain("pid=P00290915");
        expect(tour.bookingUrl).toContain("mcid=58086");
      }
      expect(html).toContain(tour.bookingUrl.replace(/&/g, "&amp;"));

      if (tour.overviewText) {
        expect(html).toContain(">Overview<");
      }
      if (tour.highlights.length > 0) {
        expect(html).toContain(">Highlights<");
      }
      if (tour.meetingPointText) {
        expect(html).toContain("Meeting point:");
      }
      if (tour.included.length > 0) {
        expect(html).toContain(">What’s included<");
      }
      if (tour.itinerary.length >= 2) {
        expect(html).toContain(">Itinerary<");
        expect(html).toContain('data-testid="engine6-itinerary-timeline"');
        expect(tripNode?.itinerary).toBeTruthy();
      } else if (tour.itinerarySummaryText) {
        expect(html).toContain(">Itinerary summary<");
        expect(html).toContain('data-testid="engine6-itinerary-summary-only"');
      }
      if (tour.requirements.length > 0) {
        expect(html).toContain(">Additional info<");
      }
      if (tour.faqs.length > 0) {
        expect(html).toContain(">FAQs<");
      }

      expect(Boolean(faqNode)).toBe(tour.faqs.length > 0);
      expect(productNode?.url).toBe(
        `https://www.alloutdooradventures.com${tour.canonicalPath}`
      );
      expect(offerNode?.url).toBe(tour.bookingUrl);
      expect(offerNode?.priceCurrency).toBe("USD");
      expect(offerNode?.price).toBe(tour.priceAmount ?? undefined);
      if (tour.heroImageUrl) {
        expect(productNode?.image).toBe(tour.heroImageUrl);
        expect(tripNode?.image).toBe(tour.heroImageUrl);
      } else {
        expect(productNode?.image).toBeUndefined();
        expect(tripNode?.image).toBeUndefined();
      }
      if (tour.faqs.length > 0 && faqNode) {
        const mainEntity = (faqNode.mainEntity ?? []) as Array<{
          name?: string;
          acceptedAnswer?: { text?: string };
        }>;
        expect(mainEntity).toHaveLength(tour.faqs.length);
        expect(mainEntity.map(item => item.name)).toEqual(
          tour.faqs.map(item => item.question)
        );
      }
    }
  );
});

describe("engine6 specimen-specific coverage", () => {
  it("renders the Las Vegas paragon specimen with rich sections", () => {
    const vegasTour = engine6ResolvedTours.find(
      tour => tour.productCode === "5119P13"
    );
    expect(vegasTour).toBeDefined();

    const html = renderToString(<Engine6TourPage tour={vegasTour!} />);
    expect(html).toContain(">Overview<");
    expect(html).toContain(">Highlights<");
    expect(html).toContain("Meeting point:");
    expect(html).toContain(">What’s included<");
    expect(html).toContain(">Itinerary<");
    expect(html).toContain(">Additional info<");
    expect(html).toContain(">FAQs<");
    expect(html).toContain("Hoover Dam");
    expect(html).toContain("Grand Canyon West");
    expect(html).toContain(
      "Is helicopter landing included in the standard tour option?"
    );
    expect((html.match(/<details /g) ?? []).length).toBe(2);
  });
});

describe("engine6 image parity guardrails", () => {
  const parseStateCityFromCanonicalPath = (path: string) => {
    const [, stateSlug = "", citySlug = ""] =
      /^\/destinations\/([^/]+)\/([^/]+)\/tours\//.exec(path) ?? [];
    return { stateSlug, citySlug };
  };

  it.each([
    "63657P1",
    "5119P13",
    "32779P2",
    "60136P1",
    "411138P3",
    "414460P1",
    "3156P13",
  ])(
    "keeps detail, city card, filtered card, and related slider engine6 cards aligned for %s",
    productCode => {
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );
      expect(tour).toBeDefined();
      const expectedHero = tour!.heroImageUrl;
      expect(expectedHero).toContain("https://");

      const detailHtml = renderToString(<Engine6TourPage tour={tour!} />);
      const escapedHero = expectedHero.replace(/&/g, "&amp;");
      expect(detailHtml).toContain(`src="${escapedHero}"`);
      expect(detailHtml).not.toContain("/images/hiking-hero.jpg");

      const { stateSlug, citySlug } = parseStateCityFromCanonicalPath(
        tour!.canonicalPath
      );
      const unified = getToursByCityUnified(stateSlug, citySlug);
      const cityEntry = unified.find(
        entry => entry.tour.productCode === productCode
      );
      expect(cityEntry).toBeDefined();
      expect(cityEntry?.tour.heroImage).toBe(expectedHero);
      expect(cityEntry?.tour.primaryImageUrl).toBe(expectedHero);

      const cityCardHtml = renderToString(
        <TourCard tour={cityEntry!.tour} href={cityEntry!.href} />
      );
      expect(cityCardHtml).toContain(`data-card-image-src="${escapedHero}"`);
      expect(cityCardHtml).toContain(`data-hero-image-src="${escapedHero}"`);
      expect(cityCardHtml).not.toContain("/images/hiking-hero.jpg");

      const previousWindow = (globalThis as { window?: Window }).window;
      const previousLocation = (
        globalThis as {
          location?: { pathname: string; search?: string };
        }
      ).location;
      (
        globalThis as {
          window?: {
            location: { pathname: string; search: string };
            history: { pushState: () => void };
          };
        }
      ).window = {
        location: {
          pathname: "/tours",
          search: `?state=${stateSlug}&city=${citySlug}`,
        },
        history: { pushState: () => {} },
      };
      (
        globalThis as { location?: { pathname: string; search: string } }
      ).location = {
        pathname: "/tours",
        search: `?state=${stateSlug}&city=${citySlug}`,
      };

      const filteredHtml = renderToString(<ToursLanding />);
      expect(filteredHtml).toContain(`data-card-image-src="${escapedHero}"`);
      expect(filteredHtml).toContain(`data-hero-image-src="${escapedHero}"`);

      (globalThis as { window?: Window }).window = previousWindow;
      (
        globalThis as { location?: { pathname: string; search?: string } }
      ).location = previousLocation;

      const relatedEngine6Entries = unified.filter(
        entry =>
          entry.tour.engine === "engine6" &&
          entry.tour.productCode !== productCode &&
          entry.tour.slug !== cityEntry?.tour.slug
      );

      if (relatedEngine6Entries.length > 0) {
        for (const related of relatedEngine6Entries) {
          const escapedRelatedHero = related.tour.heroImage.replace(
            /&/g,
            "&amp;"
          );
          expect(detailHtml).toContain(
            `data-card-image-src="${escapedRelatedHero}"`
          );
          expect(detailHtml).toContain(
            `data-hero-image-src="${escapedRelatedHero}"`
          );
        }
      }
    }
  );

  it("blocks legacy/alternate image fields from overriding Engine6 heroImage", () => {
    const tour = {
      id: "engine6-legacy-test",
      engine: "engine6",
      productCode: "LEGACY",
      slug: "legacy-image-override-test",
      title: "Legacy Override Test",
      destination: {
        country: "United States",
        state: "Nevada",
        stateSlug: "nevada",
        city: "Las Vegas",
        citySlug: "las-vegas",
      },
      resolvedImageUrl:
        "https://dynamic-media.tacdn.com/media/photo-o/2f/38/e0/69/caption.jpg?w=1100&h=800&s=1",
      heroImage:
        "https://dynamic-media.tacdn.com/media/photo-o/2f/38/e0/69/caption.jpg?w=1100&h=800&s=1",
      primaryImageUrl: "https://cdn.example.com/legacy-primary.jpg",
      galleryImages: ["https://cdn.example.com/gallery-first.jpg"],
      badges: {},
      activitySlugs: ["hiking"],
      bookingProvider: "viator",
      bookingUrl: "https://www.viator.com/search/LEGACY",
      longDescription: "Legacy override guardrail test",
    } as const;

    const html = renderToString(
      <TourCard
        tour={tour}
        href="/destinations/nevada/las-vegas/tours/legacy-image-override-test"
      />
    );
    expect(html).toContain(
      'data-card-image-src="https://dynamic-media.tacdn.com/media/photo-o/2f/38/e0/69/caption.jpg?w=1100&amp;h=800&amp;s=1"'
    );
    expect(html).toContain(
      'data-hero-image-src="https://dynamic-media.tacdn.com/media/photo-o/2f/38/e0/69/caption.jpg?w=1100&amp;h=800&amp;s=1"'
    );
    expect(html).not.toContain("legacy-primary.jpg");
    expect(html).not.toContain("gallery-first.jpg");
    expect(html).not.toContain("/images/hiking-hero.jpg");
  });

  it("renders neutral placeholder when Engine6 resolvedImageUrl is absent", () => {
    const tour = {
      id: "engine6-placeholder-test",
      engine: "engine6",
      productCode: "NOPIC",
      slug: "engine6-placeholder-test",
      title: "Placeholder Fallback Test",
      destination: {
        country: "United States",
        state: "Nevada",
        stateSlug: "nevada",
        city: "Las Vegas",
        citySlug: "las-vegas",
      },
      heroImage: "",
      badges: {},
      activitySlugs: ["hiking"],
      bookingProvider: "viator",
      bookingUrl: "https://www.viator.com/search/NOPIC",
      longDescription: "Placeholder-only fallback test",
    } as const;

    const html = renderToString(
      <TourCard
        tour={tour}
        href="/destinations/nevada/las-vegas/tours/engine6-placeholder-test"
      />
    );
    expect(html).toContain('data-card-image-src="/images/hiking-hero.jpg"');
    expect(html).not.toContain('data-card-image-src="/hero.jpg"');
  });

  it("regression: engine6 cards never emit blank or unusable image src", () => {
    const baseTour = {
      id: "engine6-invalid-image-test",
      engine: "engine6",
      productCode: "BADIMG",
      slug: "engine6-invalid-image-test",
      title: "Invalid Hero Guardrail",
      destination: {
        country: "United States",
        state: "Alaska",
        stateSlug: "alaska",
        city: "Anchorage",
        citySlug: "anchorage",
      },
      badges: {},
      activitySlugs: ["wildlife"],
      bookingProvider: "viator",
      bookingUrl: "https://www.viator.com/search/BADIMG",
      longDescription: "Card image guardrail test",
    } as const;

    for (const badHero of [
      "",
      "   ",
      "undefined",
      "about:blank",
      "javascript:void(0)",
    ]) {
      const html = renderToString(
        <TourCard
          tour={{ ...baseTour, heroImage: badHero }}
          href="/destinations/alaska/anchorage/tours/engine6-invalid-image-test"
        />
      );
      expect(html).toContain('data-card-image-src="/images/hiking-hero.jpg"');
      expect(html).not.toContain('data-card-image-src="   "');
      expect(html).not.toContain('data-card-image-src="/hero.jpg"');
    }
  });

  it("never reuses the rejected Engine6 URL as card fallback", () => {
    const html = renderToString(
      <TourCard
        tour={{
          id: "engine6-rejected-fallback-reuse",
          engine: "engine6",
          productCode: "REJIMG",
          slug: "engine6-rejected-fallback-reuse",
          title: "Rejected Fallback Reuse",
          destination: {
            country: "United States",
            state: "Arizona",
            stateSlug: "arizona",
            city: "Phoenix",
            citySlug: "phoenix",
          },
          heroImage: "/images/hiking-hero.jpg",
          badges: {},
          activitySlugs: ["hiking"],
          bookingProvider: "viator",
          bookingUrl: "https://www.viator.com/search/REJIMG",
          longDescription: "Rejected URL reuse guardrail",
        }}
        href="/destinations/arizona/phoenix/tours/engine6-rejected-fallback-reuse"
      />
    );

    expect(html).toContain('data-hero-image-src=""');
    expect(html).toContain('data-card-image-src="/images/cycling-hero.jpg"');
    expect(html).not.toContain('data-card-image-src="/images/hiking-hero.jpg"');
    expect(html).not.toContain('data-card-image-src="/hero.jpg"');
  });
});

it("keeps Yosemite replacement hero parity across detail, city card, filtered card, and route wiring", () => {
  const yosemiteTour = engine6ResolvedTours.find(
    tour => tour.productCode === "36001P1"
  );
  expect(yosemiteTour).toBeDefined();
  expect(yosemiteTour?.heroImageUrl).toBe(ENGINE6_36001P1_EXPECTED_HERO_URL);
  expect(yosemiteTour?.canonicalPath).toBe(ENGINE6_YOSEMITE_ROUTE);

  const escapedHero = ENGINE6_36001P1_EXPECTED_HERO_URL.replace(/&/g, "&amp;");

  const detailHtml = renderToString(<Engine6TourPage tour={yosemiteTour!} />);
  expect(detailHtml).toContain(escapedHero);

  const cityUnified = getToursByCityUnified("california", "san-francisco");
  const cityEntry = cityUnified.find(
    entry =>
      entry.tour.engine === "engine6" && entry.tour.productCode === "36001P1"
  );
  expect(cityEntry).toBeDefined();
  const cityCardHtml = renderToString(
    <TourCard tour={cityEntry!.tour} href={cityEntry!.href} />
  );
  expect(cityCardHtml).toContain(`data-card-image-src="${escapedHero}"`);
  expect(cityCardHtml).toContain(`data-hero-image-src="${escapedHero}"`);

  const previousWindow = (globalThis as unknown as { window?: Window }).window;
  const nextWindow = {
    location: {
      pathname: "/tours",
      search: "?state=california&city=san-francisco",
    },
    history: {
      pushState: () => undefined,
    },
  } as unknown as Window;

  (globalThis as unknown as { window?: Window }).window = nextWindow;
  try {
    const filteredHtml = renderToString(<ToursLanding />);
    expect(filteredHtml).toContain(`data-card-image-src="${escapedHero}"`);
    expect(filteredHtml).toContain(`data-hero-image-src="${escapedHero}"`);
    expect(filteredHtml).toContain(ENGINE6_YOSEMITE_ROUTE);
  } finally {
    (globalThis as unknown as { window?: Window }).window = previousWindow;
  }

  expect(ENGINE6_EXPLICIT_ROUTE_REPLACEMENTS.has(ENGINE6_YOSEMITE_ROUTE)).toBe(
    true
  );
});

describe("engine6 itinerary contract", () => {
  it("preserves meaningful source attraction names instead of generic itinerary labels", () => {
    const hero =
      "https://dynamic-media.tacdn.com/media/photo-o/31/00/00/01/caption.jpg?w=1100&h=800&s=1";
    const extraction = extractEngine6Product({
      product: {
        productCode: "276551P2",
        productUrl:
          "https://www.viator.com/tours/New-Orleans/Garden-District-and-French-Quarter-Bike-Tour/d675-276551P2",
        title: "New Orleans City Bike Tour",
        description: {
          text: "Bike New Orleans through the French Quarter and Garden District.",
        },
        location: { city: "New Orleans", state: "Louisiana" },
        media: {
          images: [
            {
              isCover: true,
              variants: {
                FULL: {
                  url: hero,
                  width: 1100,
                  height: 800,
                },
              },
            },
          ],
        },
        itineraryItems: [
          {
            title: "This",
            pointOfInterest: { name: "Congo Square" },
            description:
              "Congo Square is a historic gathering place tied to New Orleans music and culture.",
            duration: "10 minutes",
          },
          {
            title: "Pass By",
            pointOfInterestLocation: { locationName: "Treme" },
            description: "Pass through Treme as the route leaves the quarter.",
            stopType: "PASS_BY",
          },
          {
            title: "Location",
            location: { name: "Frenchmen Street" },
            description:
              "Frenchmen Street is known for music venues and neighborhood nightlife.",
            stopType: "pass-by",
          },
          {
            title: "Mississippi River",
            description:
              "The Mississippi River frames part of the downtown bike route.",
            stopType: "pass-by",
          },
          {
            title: "Attraction",
            pointOfInterest: { title: "Garden District" },
            description:
              "Garden District streets feature historic homes and mature oaks.",
            duration: "1 hour",
          },
          {
            title: "Stop",
            stop: { name: "Lafayette Cemetery No. 1" },
            description:
              "Lafayette Cemetery No. 1 is a brief stop before the return ride.",
            duration: "5 minutes",
          },
        ],
      },
    });
    const tour = mapViatorToEngine6Tour({
      source: "live-api",
      rawProductCode: "276551P2",
      rawProduct: extraction.product,
      extracted: extraction.extracted,
      diagnostics: {
        source: "live-api",
        hasViatorApiKey: true,
        attemptedLiveFetch: true,
        upstreamStatus: 200,
        upstreamContentType: "application/json",
        upstreamOk: true,
        usedBundledFallbackBecause: "",
        bookingUrlSource: "product.productUrl",
        fieldLevelFallbackUsed: false,
        fallbackFieldNames: [],
        ...extraction.diagnostics,
      },
    });
    const expectedNames = [
      "Congo Square",
      "Treme",
      "Frenchmen Street",
      "Mississippi River",
      "Garden District",
      "Lafayette Cemetery No. 1",
    ];

    expect(tour.itinerary.map(item => item.title)).toEqual(expectedNames);
    expect(tour.itinerary.map(item => item.description)).not.toContain("This");

    const html = renderToString(<Engine6TourPage tour={tour} />);
    expect(html).toContain('data-testid="engine6-itinerary-timeline"');
    expect(html).not.toContain(">This<");
    expectedNames.forEach(name => expect(html).toContain(name));

    const schema = buildEngine6SchemaGraph(tour);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const trip = graph.find(node => node["@type"] === "TouristTrip") as
      | {
          itinerary?: { itemListElement?: Array<{ item?: { name?: string } }> };
        }
      | undefined;
    const schemaNames = (trip?.itinerary?.itemListElement ?? []).map(
      item => item.item?.name
    );

    expect(schemaNames).toEqual(expectedNames);
    expect(schemaNames).not.toContain("This");
  });

  it("renders structured timeline when at least two itinerary stops are present", () => {
    const yosemite = engine6ResolvedTours.find(
      tour => tour.productCode === "36001P1"
    );
    expect(yosemite).toBeDefined();
    expect(yosemite?.itinerary.length).toBeGreaterThanOrEqual(6);

    const html = renderToString(<Engine6TourPage tour={yosemite!} />);
    expect(html).toContain('data-testid="engine6-itinerary-timeline"');
    expect(html).not.toContain('data-testid="engine6-itinerary-summary-only"');
    expect(html).toContain("Tunnel View");
    expect(html).toContain("Yosemite Valley");
    expect(html).toContain("Half Dome");
    expect(html).toContain("Yosemite Falls");
    expect(html).toContain("El Capitan");
    expect(html).toContain("Tuolumne Grove");
    expect(html).toContain("Bridalveil Fall");
  });

  it.each(["5119P13", "36001P1", "60136P1", "26719P8", "411138P3"])(
    "does not degrade structured itinerary rendering for %s when source has multiple stops",
    productCode => {
      const fixture = ENGINE6_VALIDATION_FIXTURES.find(
        entry => entry.productCode === productCode
      );
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );
      expect(fixture).toBeDefined();
      expect(tour).toBeDefined();

      const sourceStops = countStructuredSourceStops(
        fixture!.rawPayload as Record<string, unknown>
      );

      if (sourceStops >= 2) {
        expect(tour!.itinerary.length).toBeGreaterThanOrEqual(sourceStops);
        const html = renderToString(<Engine6TourPage tour={tour!} />);
        expect(html).toContain('data-testid="engine6-itinerary-timeline"');
      }
    }
  );

  it("renders Anchorage 411138P3 itinerary stops in source order with duration/admission details", () => {
    const anchorage = engine6ResolvedTours.find(
      tour => tour.productCode === "411138P3"
    );
    expect(anchorage).toBeDefined();
    expect(anchorage?.itinerary.map(item => item.title)).toEqual([
      "Anchorage",
      "Earthquake Park",
      "Beluga Point",
      "Alaska Wildlife Conservation Center",
      "Girdwood",
      "Turnagain Arm Drive",
    ]);

    const html = renderToString(<Engine6TourPage tour={anchorage!} />);
    expect(html).toContain('data-testid="engine6-itinerary-timeline"');
    expect(html).toContain("1 hour");
    expect(html).toContain("30 minutes");
    expect(html).toContain("Admission Ticket Included");
    expect(html).toContain("Admission Ticket Free");

    const schema = buildEngine6SchemaGraph(anchorage!);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const trip = graph.find(node => node["@type"] === "TouristTrip") as
      | {
          itinerary?: { itemListElement?: Array<{ item?: { name?: string } }> };
        }
      | undefined;
    const names = (trip?.itinerary?.itemListElement ?? []).map(
      item => item.item?.name
    );
    expect(names).toEqual([
      "Anchorage",
      "Earthquake Park",
      "Beluga Point",
      "Alaska Wildlife Conservation Center",
      "Girdwood",
      "Turnagain Arm Drive",
    ]);
  });

  it("renders summary-only itinerary style when structured stops are absent", () => {
    const tour = {
      ...engine6ResolvedTours[0]!,
      itinerary: [],
      itinerarySummaryText: "Overview schedule available at booking.",
    };

    const html = renderToString(<Engine6TourPage tour={tour} />);
    expect(html).toContain('data-testid="engine6-itinerary-summary-only"');
    expect(html).not.toContain('data-testid="engine6-itinerary-timeline"');
  });
});
describe("engine6 route wiring", () => {
  it("registers the specimen route before the generic city tour detail route", () => {
    const source = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
    const engine6RouteIndex = source.indexOf(
      "<Route path={ENGINE6_SPECIMEN_ROUTE} component={Engine6SpecimenRoute} />"
    );
    const genericRouteIndex = source.indexOf(
      'path="/destinations/:stateSlug/:citySlug/tours/:tourSlug"'
    );

    expect(engine6RouteIndex).toBeGreaterThan(-1);
    expect(genericRouteIndex).toBeGreaterThan(-1);
    expect(engine6RouteIndex).toBeLessThan(genericRouteIndex);
  });

  it("registers the paragon route before the generic city tour detail route", () => {
    const source = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
    const engine6RouteIndex = source.indexOf(
      "<Route path={ENGINE6_PARAGON_ROUTE} component={Engine6SpecimenRoute} />"
    );
    const genericRouteIndex = source.indexOf(
      'path="/destinations/:stateSlug/:citySlug/tours/:tourSlug"'
    );

    expect(engine6RouteIndex).toBeGreaterThan(-1);
    expect(genericRouteIndex).toBeGreaterThan(-1);
    expect(engine6RouteIndex).toBeLessThan(genericRouteIndex);
  });

  it("registers the Anchorage private route before the generic city tour detail route", () => {
    const source = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
    const engine6RouteIndex = source.indexOf(
      "path={ENGINE6_ANCHORAGE_PRIVATE_ROUTE}"
    );
    const genericRouteIndex = source.indexOf(
      'path="/destinations/:stateSlug/:citySlug/tours/:tourSlug"'
    );

    expect(engine6RouteIndex).toBeGreaterThan(-1);
    expect(genericRouteIndex).toBeGreaterThan(-1);
    expect(engine6RouteIndex).toBeLessThan(genericRouteIndex);
  });

  it("registers the Anchorage SUNSET route before the generic city tour detail route", () => {
    const source = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
    const engine6RouteIndex = source.indexOf(
      "path={ENGINE6_ANCHORAGE_SUNSET_ROUTE}"
    );
    const genericRouteIndex = source.indexOf(
      'path="/destinations/:stateSlug/:citySlug/tours/:tourSlug"'
    );

    expect(engine6RouteIndex).toBeGreaterThan(-1);
    expect(genericRouteIndex).toBeGreaterThan(-1);
    expect(engine6RouteIndex).toBeLessThan(genericRouteIndex);
  });

  it("registers the Anchorage greenbelt route before the generic city tour detail route", () => {
    const source = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
    const engine6RouteIndex = source.indexOf(
      "path={ENGINE6_ANCHORAGE_GREENBELT_ROUTE}"
    );
    const genericRouteIndex = source.indexOf(
      'path="/destinations/:stateSlug/:citySlug/tours/:tourSlug"'
    );

    expect(engine6RouteIndex).toBeGreaterThan(-1);
    expect(genericRouteIndex).toBeGreaterThan(-1);
    expect(engine6RouteIndex).toBeLessThan(genericRouteIndex);
  });

  it("registers the New York replacement route before the generic city tour detail route", () => {
    const source = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
    const engine6RouteIndex = source.indexOf(
      "path={ENGINE6_NYC_BROOKLYN_BRIDGE_ROUTE}"
    );
    const genericRouteIndex = source.indexOf(
      'path="/destinations/:stateSlug/:citySlug/tours/:tourSlug"'
    );

    expect(engine6RouteIndex).toBeGreaterThan(-1);
    expect(genericRouteIndex).toBeGreaterThan(-1);
    expect(engine6RouteIndex).toBeLessThan(genericRouteIndex);
  });

  it("registers the New York pedicab replacement route before the generic city tour detail route", () => {
    const source = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
    const engine6RouteIndex = source.indexOf(
      "path={ENGINE6_NYC_PEDICAB_ROUTE}"
    );
    const genericRouteIndex = source.indexOf(
      'path="/destinations/:stateSlug/:citySlug/tours/:tourSlug"'
    );

    expect(engine6RouteIndex).toBeGreaterThan(-1);
    expect(genericRouteIndex).toBeGreaterThan(-1);
    expect(engine6RouteIndex).toBeLessThan(genericRouteIndex);
  });

  it("registers the Best of NYC electric bike replacement route before the generic city tour detail route", () => {
    const source = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
    const engine6RouteIndex = source.indexOf(
      "path={ENGINE6_NYC_CLASSIC_MANHATTAN_EBIKE_ROUTE}"
    );
    const genericRouteIndex = source.indexOf(
      'path="/destinations/:stateSlug/:citySlug/tours/:tourSlug"'
    );

    expect(engine6RouteIndex).toBeGreaterThan(-1);
    expect(genericRouteIndex).toBeGreaterThan(-1);
    expect(engine6RouteIndex).toBeLessThan(genericRouteIndex);
  });

  it("registers the San Diego Joshua Tree route before the generic city tour detail route", () => {
    const source = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
    const engine6RouteIndex = source.indexOf(
      "path={ENGINE6_SAN_DIEGO_JOSHUA_TREE_ROUTE}"
    );
    const genericRouteIndex = source.indexOf(
      'path="/destinations/:stateSlug/:citySlug/tours/:tourSlug"'
    );

    expect(engine6RouteIndex).toBeGreaterThan(-1);
    expect(genericRouteIndex).toBeGreaterThan(-1);
    expect(engine6RouteIndex).toBeLessThan(genericRouteIndex);
  });

  it("keeps 411138P3 mapped to the Anchorage private canonical route", () => {
    const anchorageTour = engine6ResolvedTours.find(
      tour => tour.productCode === "411138P3"
    );
    expect(anchorageTour).toBeDefined();
    expect(anchorageTour?.canonicalPath).toBe(ENGINE6_ANCHORAGE_PRIVATE_ROUTE);
    expect(anchorageTour?.bookingUrl).toBe(
      "https://www.viator.com/tours/Anchorage/Private-Anchorage-Tour-and-Wilderness-Adventure/d4152-411138P3?pid=P00290915&uid=U00174482&mcid=58086&medium=link&currency=USD"
    );
  });

  it("registers the Anchorage greenbelt route before the united-states city tour detail route", () => {
    const source = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
    const engine6RouteIndex = source.indexOf(
      "path={ENGINE6_ANCHORAGE_GREENBELT_ROUTE}"
    );
    const unitedStatesRouteIndex = source.indexOf(
      'path="/destinations/united-states/:stateSlug/:citySlug/tours/:tourSlug"'
    );

    expect(engine6RouteIndex).toBeGreaterThan(-1);
    expect(unitedStatesRouteIndex).toBeGreaterThan(-1);
    expect(engine6RouteIndex).toBeLessThan(unitedStatesRouteIndex);
  });

  it("replaces 53474P8 in-place and keeps FareHarbor /book routing", () => {
    const anchorageTour = engine6ResolvedTours.find(
      tour => tour.productCode === "53474P8"
    );
    expect(anchorageTour).toBeDefined();
    expect(anchorageTour?.canonicalPath).toBe(
      "/destinations/alaska/anchorage/tours/anchorage-greenbelt-bike-tour-391155"
    );
    expect(anchorageTour?.bookingUrl).toBe(
      "/destinations/alaska/anchorage/tours/anchorage-greenbelt-bike-tour-391155/book"
    );
  });

  it("replaces 414460P1 in-place and keeps the existing /book endpoint CTA", () => {
    const nycPedicabTour = engine6ResolvedTours.find(
      tour => tour.productCode === "414460P1"
    );
    expect(nycPedicabTour).toBeDefined();
    expect(nycPedicabTour?.canonicalPath).toBe(
      "/destinations/new-york/new-york/tours/1-hour-central-park-pedicab-tour-27491"
    );
    expect(nycPedicabTour?.bookingUrl).toBe(
      "/destinations/new-york/new-york/tours/1-hour-central-park-pedicab-tour-27491/book"
    );
    expect(nycPedicabTour?.itinerary.length).toBeGreaterThanOrEqual(2);
    expect(
      ENGINE6_EXPLICIT_ROUTE_REPLACEMENTS.has(ENGINE6_NYC_PEDICAB_ROUTE)
    ).toBe(true);
  });

  it("replaces 233384P2 in-place and keeps the existing /book endpoint CTA", () => {
    const nycTour = engine6ResolvedTours.find(
      tour => tour.productCode === "233384P2"
    );
    expect(nycTour).toBeDefined();
    expect(nycTour?.canonicalPath).toBe(
      "/destinations/new-york/new-york/tours/brooklyn-bridge-and-waterfront-bike-tour-264853"
    );
    expect(nycTour?.bookingUrl).toBe(
      "/destinations/new-york/new-york/tours/brooklyn-bridge-and-waterfront-bike-tour-264853/book"
    );
    expect(
      ENGINE6_EXPLICIT_ROUTE_REPLACEMENTS.has(ENGINE6_NYC_BROOKLYN_BRIDGE_ROUTE)
    ).toBe(true);
  });

  it("replaces 3156P13 in-place at the existing Best of NYC slug and preserves /book CTA", () => {
    const nycElectricBikeTour = engine6ResolvedTours.find(
      tour => tour.productCode === "3156P13"
    );
    expect(nycElectricBikeTour).toBeDefined();
    expect(nycElectricBikeTour?.canonicalPath).toBe(
      "/destinations/new-york/new-york/tours/best-of-nyc-electric-bike-tour-202168"
    );
    expect(nycElectricBikeTour?.bookingUrl).toBe(
      "/destinations/new-york/new-york/tours/best-of-nyc-electric-bike-tour-202168/book"
    );
    expect(nycElectricBikeTour?.meetingPointText).toContain("79 Chambers St");
    expect(nycElectricBikeTour?.itinerary.length).toBeGreaterThanOrEqual(2);
    expect(
      ENGINE6_EXPLICIT_ROUTE_REPLACEMENTS.has(
        ENGINE6_NYC_CLASSIC_MANHATTAN_EBIKE_ROUTE
      )
    ).toBe(true);
  });

  it("keeps 100569P5 mapped to the Anchorage SUNSET canonical route", () => {
    const anchorageTour = engine6ResolvedTours.find(
      tour => tour.productCode === "100569P5"
    );
    expect(anchorageTour).toBeDefined();
    expect(anchorageTour?.canonicalPath).toBe(ENGINE6_ANCHORAGE_SUNSET_ROUTE);
    expect(anchorageTour?.description).toMatch(
      /^Explore the wilderness outside Anchorage/
    );
    expect(anchorageTour?.description).not.toMatch(
      /Join one of the best experiences in Anchorage/i
    );
  });
});
