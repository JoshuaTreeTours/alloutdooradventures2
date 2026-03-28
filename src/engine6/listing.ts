import type { Tour } from "../data/tours.types";
import { toEngine6Card } from "./cards";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import type { Engine6ApiResponse, Engine6Tour } from "./types";

export const ENGINE6_63657P1_CARD_IMAGE_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/56/92/6e.jpg";

const ENGINE6_63657P1_LISTING_PAYLOAD: Engine6ApiResponse = {
  source: "bundled-fallback",
  rawProductCode: "63657P1",
  rawProduct: {
    productCode: "63657P1",
    title: "Santa Barbara Vineyard to Table Taste Tour by E-Bike",
  },
  diagnostics: {
    source: "bundled-fallback",
    hasViatorApiKey: false,
    attemptedLiveFetch: false,
    upstreamStatus: null,
    upstreamContentType: null,
    upstreamOk: null,
    usedBundledFallbackBecause: "listing-specimen",
    commercialPriceFieldPath: "product.priceFrom",
    commercialPriceRawValue: "$199.00",
    priceSourceUsed: "live-price",
    heroImageFieldPath: "product.media.images[0].variants.FULL.url",
    heroVariantFieldPath: "product.media.images[0].variants.FULL",
    selectedHeroWidth: 674,
    selectedHeroHeight: 446,
    imageSourceUsed: "api-primary",
    heroSourceType: "api-primary",
    finalHeroUrl: ENGINE6_63657P1_CARD_IMAGE_URL,
    heroFallbackTriggered: false,
    rejectedForeignHeroCandidates: [],
    productUrlFieldPath: "product.productUrl",
    bookingUrlSource: "product.productUrl",
    ratingFieldPath: "product.reviews.combinedAverageRating",
    reviewCountFieldPath: "product.reviews.totalReviews",
    overviewFieldPath: "product.description.text",
    highlightsFieldPath: "product.highlights",
    meetingPointFieldPath: "product.logistics.start.description",
    itineraryFieldPath: "product.itineraryItems",
    itineraryItemCount: 4,
    itinerarySourceUsed: "product.itineraryItems",
    faqsFieldPath: "merged:product.additionalInfo",
    faqFieldPath: "merged:product.additionalInfo",
    faqCount: 3,
    faqSourceUsed: "merged:product.additionalInfo",
    requirementsFieldPath: "product.additionalInfo",
    highlightClassificationReason:
      "selected product.highlights as highlight content",
    classificationFieldPath: "inferred:title+overview+highlights",
    fieldLevelFallbackUsed: false,
    fallbackFieldNames: [],
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
    cardImageUrl: ENGINE6_63657P1_CARD_IMAGE_URL,
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
      {
        title: "Rideau Vineyard",
        description: "Admission Ticket Included",
        duration: "1 hour",
      },
      {
        title: "Rancho Olivos",
        description: "Admission Ticket Free",
        duration: "1 hour",
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

const ENGINE6_LISTING_PAYLOADS: Engine6ApiResponse[] = [
  ENGINE6_63657P1_LISTING_PAYLOAD,
];

const toEngine6ListingTour = (tour: Engine6Tour): Tour => {
  const pathSegments = tour.canonicalPath.split("/").filter(Boolean);
  const stateSlug = pathSegments[1] ?? "";
  const citySlug = pathSegments[2] ?? "";
  const slug = pathSegments[4] ?? "";
  const card = toEngine6Card(tour);

  return {
    id: `engine6-${tour.productCode}`,
    engine: "engine6",
    productCode: tour.productCode,
    slug,
    title: tour.title,
    shortDescription: card.description,
    categories: tour.categories,
    primaryCategory: tour.primaryCategory ?? undefined,
    destination: {
      country: "United States",
      state: tour.state,
      stateSlug,
      city: tour.city,
      citySlug,
    },
    heroImage: tour.heroImageUrl,
    primaryImageUrl: tour.heroImageUrl,
    badges: {
      rating: tour.aggregateRating ?? undefined,
      reviewCount: tour.reviewCount ?? undefined,
      priceFrom: tour.priceFormatted,
    },
    startingPrice: tour.priceAmount ?? undefined,
    currency: "USD",
    tagPills: tour.categoryLabel ? [tour.categoryLabel] : undefined,
    activitySlugs: ["bike-tours"],
    bookingProvider: "viator",
    bookingUrl: tour.bookingUrl,
    longDescription: tour.overviewText ?? card.description,
  };
};

const engine6Tours = ENGINE6_LISTING_PAYLOADS.map(mapViatorToEngine6Tour);

export const engine6SpecimenTour = engine6Tours[0]!;

export const engine6ListingTours: Tour[] = engine6Tours.map(toEngine6ListingTour);
