import type { Tour } from "../data/tours.types";
import { toEngine6Card } from "./cards";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import type { Engine6ApiResponse } from "./types";

export const ENGINE6_163873P16_CARD_IMAGE_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-360x240/12/26/61/64.jpg";

const ENGINE6_163873P16_LISTING_PAYLOAD: Engine6ApiResponse = {
  source: "bundled-fallback",
  rawProductCode: "163873P16",
  rawProduct: {
    productCode: "163873P16",
    title: "East Zion Top of the World Jeep Tour",
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
    commercialPriceRawValue: "$105.09",
    priceSourceUsed: "live-price",
    heroImageFieldPath: "product.images[0].url",
    heroVariantFieldPath: "product.images[0].url",
    selectedHeroWidth: 360,
    selectedHeroHeight: 240,
    imageSourceUsed: "live-product-image",
    productUrlFieldPath: "product.productUrl",
    bookingUrlSource: "product.productUrl",
    ratingFieldPath: "product.reviews.combinedAverageRating",
    reviewCountFieldPath: "product.reviews.totalReviews",
    overviewFieldPath: "product.description.text",
    highlightsFieldPath: "product.highlights",
    meetingPointFieldPath: "product.logistics.start.description",
    itineraryFieldPath: "product.itineraryItems",
    itineraryItemCount: 1,
    itinerarySourceUsed: "product.itineraryItems",
    faqsFieldPath: "merged:product.qAndA.items+product.additionalInfo",
    faqFieldPath: "merged:product.qAndA.items+product.additionalInfo",
    faqCount: 4,
    faqSourceUsed: "merged:product.qAndA.items+product.additionalInfo",
    requirementsFieldPath: "product.additionalInfo",
    highlightClassificationReason:
      "product.highlights kept as selling-point bullets",
    classificationFieldPath: "inferred:title+overview+highlights",
    fieldLevelFallbackUsed: false,
    fallbackFieldNames: [],
  },
  extracted: {
    title: "East Zion Top of the World Jeep Tour",
    seoTitle: "East Zion Top of the World Jeep Tour in Springdale",
    seoDescription:
      "Grab bird’s-eye views of Zion National Park on this Jeep tour with easy off-road access, scenic overlooks, and guide-led geology context.",
    city: "Springdale",
    state: "Utah",
    heroImageUrl: ENGINE6_163873P16_CARD_IMAGE_URL,
    cardImageUrl: ENGINE6_163873P16_CARD_IMAGE_URL,
    productUrl:
      "https://www.viator.com/tours/Utah/East-Zion-Top-of-the-World-Jeep-Tour/d785-163873P16",
    priceAmount: 105,
    priceFormatted: "From $105",
    aggregateRating: 5,
    reviewCount: 154,
    meetingPointText: "Meet us at Zion Mountain Ranch!",
    overviewText:
      "Grab bird’s-eye views of Zion National Park on this Jeep tour. After meeting up with your guide, you’ll spend the next 1.5 hours climbing up, up, up the mountains—all on private land—to incredible views of the Coral Pink Sand Dunes, Cedar Mountain, and beyond.",
    highlights: [
      "Easy meetup at at Zion Ponderosa Ranch Resort",
      "Your local guide adds valuable insight on the area's geology, flora, fauna, and more",
      "See Zion National Park and its environs from above",
      "Limited to 8 travelers, you'll get an intimate East Zion experience",
    ],
    itinerary: [
      {
        title: "Zion National Park",
        description: "Admission Ticket Free",
        duration: "30 minutes",
      },
    ],
    faqs: [
      {
        question: "Is this tour good for families?",
        answer:
          "Yes. The reasonably groomed trails make it approachable for families with small kids.",
      },
      {
        question: "Is this tour wheelchair accessible?",
        answer: "No. This tour is not wheelchair accessible.",
      },
      {
        question:
          "Are there any health restrictions travelers should know about?",
        answer:
          "Yes. This tour is not recommended for travelers with back problems, pregnant travelers, or travelers with serious heart or medical conditions.",
      },
      {
        question: "Can most travelers participate?",
        answer: "Yes. Most travelers can participate.",
      },
    ],
    requirements: [
      "Confirmation will be received at time of booking",
      "Not wheelchair accessible",
    ],
    primaryCategory: "off-road-tour",
    categories: ["off-road-tour"],
  },
};

export const engine6SpecimenTour = mapViatorToEngine6Tour(
  ENGINE6_163873P16_LISTING_PAYLOAD
);

const engine6SpecimenCard = toEngine6Card(engine6SpecimenTour);

export const engine6ListingTours: Tour[] = [
  {
    id: "engine6-163873P16",
    engine: "engine6",
    productCode: engine6SpecimenTour.productCode,
    slug: "east-zion-top-of-the-world-jeep-tour",
    title: engine6SpecimenTour.title,
    shortDescription: engine6SpecimenCard.description,
    categories: engine6SpecimenTour.categories,
    primaryCategory: engine6SpecimenTour.primaryCategory ?? undefined,
    destination: {
      country: "United States",
      state: engine6SpecimenTour.state,
      stateSlug: "utah",
      city: engine6SpecimenTour.city,
      citySlug: "springdale",
    },
    heroImage: engine6SpecimenTour.cardImageUrl,
    primaryImageUrl: engine6SpecimenTour.cardImageUrl,
    badges: {
      rating: engine6SpecimenTour.aggregateRating ?? undefined,
      reviewCount: engine6SpecimenTour.reviewCount ?? undefined,
      priceFrom: engine6SpecimenTour.priceFormatted,
    },
    startingPrice: engine6SpecimenTour.priceAmount ?? undefined,
    currency: "USD",
    tagPills: engine6SpecimenTour.categoryLabel
      ? [engine6SpecimenTour.categoryLabel]
      : undefined,
    activitySlugs: ["detours"],
    bookingProvider: "viator",
    bookingUrl: engine6SpecimenTour.bookingUrl,
    longDescription:
      engine6SpecimenTour.overviewText ?? engine6SpecimenCard.description,
  },
];
