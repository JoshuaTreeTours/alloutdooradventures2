import type {
  Engine4ViatorApiTour,
  Engine4TourViewModel,
  Engine4ViatorTourRecord,
} from "../types";
import { resolveEngine4ViatorHero } from "./resolveEngine4ViatorHero";

const cleanText = (value?: string | null) => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const buildOverview = (apiTour?: Engine4ViatorApiTour) =>
  cleanText(apiTour?.overview) ??
  "This guided Aspen East End light hike lasts about 2 hours and departs at 8:15 AM from Wheeler Opera House, 320 E Hyman Ave, Aspen, CO 81611. The experience is designed as a guided hike format in Aspen’s East End and is listed from $65.00 per person. Current listing details show a 4.7 rating from 3 reviews. Free cancellation is available up to 24 hours in advance.";

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
    title: cleanText(apiTour?.title) ?? "Aspen East End Light Hike",
    canonicalPath: `/destinations/${record.destination.state}/${record.destination.city}/tours/${record.slug}-${record.viator.productCode.toLowerCase()}`,
    bookingUrl: cleanText(apiTour?.sourceUrl) ?? record.viator.url,
    city: "Aspen",
    state: "Colorado",
    country: "United States",
    heroImage,
    galleryImages: Array.from(
      new Set([heroImage, ...(apiTour?.galleryImages ?? [])].filter(Boolean))
    ),
    fromPrice: cleanText(apiTour?.fromPrice) ?? "$65.00",
    rating: apiTour?.rating ?? 4.7,
    reviewCount: apiTour?.reviewCount ?? 3,
    duration: cleanText(apiTour?.duration) ?? "2 hours",
    startTime: cleanText(apiTour?.startTime) ?? "8:15 AM",
    meetingPoint:
      cleanText(apiTour?.meetingPoint) ??
      "Wheeler Opera House, 320 E Hyman Ave, Aspen, CO 81611",
    meetingPointShort: "Wheeler Opera House",
    cancellationPolicy:
      cleanText(apiTour?.cancellationPolicy) ??
      "Free cancellation up to 24 hours in advance.",
    inclusions: apiTour?.inclusions,
    overview: buildOverview(apiTour),
    highlights,
    faqs:
      apiTour?.faqs && apiTour.faqs.length > 0
        ? apiTour.faqs
        : buildFallbackFaqs(),
  };
};
