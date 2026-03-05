import { buildEngine4TourPath } from "../buildEngine4TourPath";
import { engine4ViatorApiFallbackByProductCode } from "../data/viatorTours";
import {
  assertEngine4ViatorTour,
  type Engine4TourViewModel,
  type Engine4ViatorApiTour,
  type Engine4ViatorTourRecord,
} from "../types";
import {
  buildFaqs,
  buildHighlights,
  buildOverview,
  normalizeItinerary,
} from "./buildEngine4Content";
import { resolveEngine4ViatorHero } from "./resolveEngine4ViatorHero";

const cleanText = (value?: string | null) => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const toSentence = (values: string[]) => values.join(" ").trim();

export const mapViatorToEngine4Tour = (input: {
  record: Engine4ViatorTourRecord;
  apiTour?: Engine4ViatorApiTour;
}): Engine4TourViewModel => {
  const { record, apiTour } = input;
  const fallbackTour =
    engine4ViatorApiFallbackByProductCode[record.productCode];
  const resolvedApiTour = apiTour ?? fallbackTour;

  const meetingPointFull = cleanText(resolvedApiTour?.meetingPoint);
  const itinerary = normalizeItinerary(resolvedApiTour);
  const whatToExpect = cleanText(resolvedApiTour?.whatToExpect);
  const overview = buildOverview({
    apiTour: resolvedApiTour,
    destination: record.destination,
    title: cleanText(resolvedApiTour?.title) ?? "Tour",
    itinerary,
  });
  const highlights = buildHighlights({
    apiTour: resolvedApiTour,
    itinerary,
    duration: cleanText(resolvedApiTour?.duration),
  });
  const faqs = buildFaqs({
    apiTour: resolvedApiTour,
    meetingPointFull,
    duration: cleanText(resolvedApiTour?.duration),
    cancellationPolicy: cleanText(resolvedApiTour?.cancellationPolicy),
  });

  const tour: Engine4TourViewModel = {
    tourId: `engine4-${record.productCode}`,
    engine: "engine4",
    bookingProvider: "viator",
    productCode: record.productCode,
    slug: record.slug,
    title: cleanText(resolvedApiTour?.title) ?? "Tour",
    canonicalPath: buildEngine4TourPath(record),
    bookingUrl: record.bookingUrl,
    destination: record.destination,
    heroImage: resolveEngine4ViatorHero({
      productCode: record.productCode,
      apiTour: resolvedApiTour,
    }),
    galleryImages: Array.from(
      new Set((resolvedApiTour?.galleryImages ?? []).filter(Boolean))
    ),
    facts: {
      priceFrom: cleanText(resolvedApiTour?.fromPrice),
      ratingValue: resolvedApiTour?.rating,
      reviewCount: resolvedApiTour?.reviewCount,
      duration: cleanText(resolvedApiTour?.duration),
      startTime: cleanText(resolvedApiTour?.startTime),
      meetingPointShort: meetingPointFull?.split(",")[0]?.trim(),
      meetingPointFull,
      cancellationPolicy: cleanText(resolvedApiTour?.cancellationPolicy),
    },
    content: {
      overview,
      highlights,
      faqs,
      itinerary: itinerary.length ? itinerary : undefined,
      inclusions: resolvedApiTour?.inclusions ?? [],
      exclusions: resolvedApiTour?.exclusions ?? [],
      whatToExpect,
      additionalInfo: toSentence(resolvedApiTour?.additionalInfo ?? []),
    },
  };

  assertEngine4ViatorTour(tour);
  return tour;
};
