import type {
  Engine4ViatorApiTour,
  Engine4TourViewModel,
  Engine4ViatorTourRecord,
} from "../types";
import { buildEngine4TourPath } from "../buildEngine4TourPath";
import { engine4ViatorApiFallbackByProductCode } from "../data/viatorTours";
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
  cleanText(apiTour?.descriptionLong) ??
  cleanText(apiTour?.description);

const buildFallbackFaqs = (apiTour?: Engine4ViatorApiTour) => {
  const meetingPoint = cleanText(apiTour?.meetingPoint);
  const duration = cleanText(apiTour?.duration);
  const cancellationPolicy = cleanText(apiTour?.cancellationPolicy);

  return [
    meetingPoint
      ? {
          question: "Where do we meet?",
          answer: `The listed meeting point is ${meetingPoint}.`,
        }
      : undefined,
    duration
      ? {
          question: "How long is the tour?",
          answer: `The listed duration is approximately ${duration}.`,
        }
      : undefined,
    cancellationPolicy
      ? {
          question: "What is the cancellation policy?",
          answer: cancellationPolicy,
        }
      : undefined,
  ].filter((faq): faq is { question: string; answer: string } => Boolean(faq));
};

export const mapViatorToEngine4Tour = (input: {
  record: Engine4ViatorTourRecord;
  apiTour?: Engine4ViatorApiTour;
}): Engine4TourViewModel => {
  const { record, apiTour } = input;
  const fallbackTour =
    engine4ViatorApiFallbackByProductCode[record.viator.productCode];
  const resolvedApiTour = apiTour ?? fallbackTour;

  const heroImage = resolveEngine4ViatorHero({
    productCode: record.viator.productCode,
    apiTour: resolvedApiTour,
  });

  const highlights =
    resolvedApiTour?.highlights && resolvedApiTour.highlights.length > 0
      ? resolvedApiTour.highlights
      : [];

  const meetingPoint = cleanText(resolvedApiTour?.meetingPoint);
  const meetingPointShort = meetingPoint?.split(",")[0]?.trim();
  const cancellationPolicy = cleanText(resolvedApiTour?.cancellationPolicy);

  const itinerary = resolvedApiTour?.itinerary?.length
    ? resolvedApiTour.itinerary
    : resolvedApiTour?.descriptionLong
      ? [
          {
            title: "Tour experience",
            description: cleanText(resolvedApiTour.descriptionLong),
          },
        ]
      : undefined;

  return {
    tourId: `engine4-${record.viator.productCode}`,
    productCode: record.viator.productCode,
    title: cleanText(resolvedApiTour?.title) ?? "Tour",
    canonicalPath: buildEngine4TourPath(record),
    bookingUrl: record.viator.url,
    city: "Aspen",
    state: "Colorado",
    country: "United States",
    heroImage,
    galleryImages: Array.from(
      new Set(
        [heroImage, ...(resolvedApiTour?.galleryImages ?? [])].filter(Boolean)
      )
    ),
    fromPrice: cleanText(resolvedApiTour?.fromPrice),
    rating: resolvedApiTour?.rating,
    reviewCount: resolvedApiTour?.reviewCount,
    duration: cleanText(resolvedApiTour?.duration),
    startTime: cleanText(resolvedApiTour?.startTime),
    meetingPoint,
    meetingPointShort,
    description: cleanText(resolvedApiTour?.description),
    descriptionLong: cleanText(resolvedApiTour?.descriptionLong),
    itinerary,
    whatToExpect: cleanText(resolvedApiTour?.whatToExpect),
    cancellationPolicy,
    inclusions: resolvedApiTour?.inclusions,
    exclusions: resolvedApiTour?.exclusions,
    additionalInfo: resolvedApiTour?.additionalInfo,
    overview: buildOverview(resolvedApiTour) ?? "",
    highlights,
    faqs:
      resolvedApiTour?.faqs && resolvedApiTour.faqs.length > 0
        ? resolvedApiTour.faqs
        : buildFallbackFaqs(resolvedApiTour),
  };
};
