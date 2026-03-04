import type {
  Engine4ViatorApiTour,
  Engine4TourViewModel,
  Engine4ViatorTourRecord,
} from "../types";
import {
  ENGINE4_VIATOR_PLACEHOLDER_HERO,
  resolveEngine4ViatorHero,
} from "./resolveEngine4ViatorHero";

const cleanText = (value?: string | null) => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const buildOverview = (apiTour?: Engine4ViatorApiTour) =>
  cleanText(apiTour?.overview) ??
  "Discover Aspen on a guided walking experience featuring local history, culture, and scenic routes.";

const buildFallbackFaqs = () => [
  {
    question: "Where do we meet?",
    answer: "Wheeler Opera House, 320 E Hyman Ave, Aspen, CO 81611.",
  },
  {
    question: "How long is the tour?",
    answer: "The tour duration is approximately 2 hours.",
  },
  {
    question: "What is the cancellation policy?",
    answer: "Free cancellation is available up to 24 hours in advance.",
  },
];

export const mapViatorToEngine4Tour = (input: {
  record: Engine4ViatorTourRecord;
  apiTour?: Engine4ViatorApiTour;
}): Engine4TourViewModel => {
  const { record, apiTour } = input;
  const heroImage = resolveEngine4ViatorHero({
    productCode: record.viator.productCode,
    apiTour,
  });

  if (
    heroImage !== ENGINE4_VIATOR_PLACEHOLDER_HERO &&
    !heroImage.includes("tacdn")
  ) {
    throw new Error(
      `Engine4 Viator hero must be a tacdn image for ${record.viator.productCode}`
    );
  }

  const highlights =
    apiTour?.highlights && apiTour.highlights.length > 0
      ? apiTour.highlights
      : [
          "Guided light hike in Aspen’s East End",
          "2-hour duration",
          "8:15 AM departure",
          "Meeting point at Wheeler Opera House",
          "Free cancellation up to 24 hours in advance",
        ];

  return {
    tourId: `engine4-${record.viator.productCode}`,
    productCode: record.viator.productCode,
    title: cleanText(apiTour?.title) ?? "Aspen Walking Tour",
    canonicalPath: `/destinations/${record.destination.state}/${record.destination.city}/tours/${record.slug}-${record.viator.productCode.toLowerCase()}`,
    bookingUrl: cleanText(apiTour?.sourceUrl) ?? record.viator.url,
    city: "Aspen",
    state: "Colorado",
    country: "United States",
    heroImage,
    galleryImages: Array.from(
      new Set([heroImage, ...(apiTour?.galleryImages ?? [])].filter(Boolean))
    ),
    fromPrice: cleanText(apiTour?.fromPrice),
    rating: apiTour?.rating,
    reviewCount: apiTour?.reviewCount,
    duration: cleanText(apiTour?.duration),
    startTime: cleanText(apiTour?.startTime),
    meetingPoint: cleanText(apiTour?.meetingPoint),
    meetingPointShort: cleanText(apiTour?.meetingPoint)?.includes(
      "pedestrian mall"
    )
      ? "Wheeler Opera House pedestrian mall"
      : "Wheeler Opera House",
    cancellationPolicy: cleanText(apiTour?.cancellationPolicy),
    inclusions: apiTour?.inclusions,
    overview: buildOverview(apiTour),
    highlights,
    faqs:
      apiTour?.faqs && apiTour.faqs.length > 0
        ? apiTour.faqs
        : buildFallbackFaqs(),
  };
};
