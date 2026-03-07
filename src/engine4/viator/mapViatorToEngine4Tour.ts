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
import { buildViatorAffiliateUrl } from "./buildViatorAffiliateUrl";
import { resolveEngine4ViatorHero } from "./resolveEngine4ViatorHero";
import { resolveViatorPrimaryImageFromApiTour } from "./resolveViatorPrimaryImage";
import { selectEngine4ViatorImage } from "./selectEngine4ViatorImage";

const cleanText = (value?: string | null) => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const toSentence = (values: string[]) => values.join(" ").trim();

const coalesceText = (...values: Array<string | undefined>) => {
  for (const value of values) {
    const cleaned = cleanText(value);
    if (cleaned) {
      return cleaned;
    }
  }
  return undefined;
};

const coalesceNumber = (...values: Array<number | undefined>) => {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }
  return undefined;
};

const resolvePriceFrom = (input: { fromPrice?: string; currency?: string }) => {
  const rawPrice = cleanText(input.fromPrice);
  if (!rawPrice) {
    return undefined;
  }

  if (/^[^\d]*\$/.test(rawPrice)) {
    return rawPrice;
  }

  if ((input.currency ?? "").toUpperCase() === "USD") {
    return `$${rawPrice}`;
  }

  return rawPrice;
};

const logEngine4ImageDecision = (input: {
  productCode: string;
  title: string;
  candidates: Array<{ source: string; url: string }>;
  rejected: Array<{ source: string; url: string; reason: string }>;
  resolvedHeroImage?: string;
  downstreamOverwriteBlocked: boolean;
}) => {
  if (
    process.env.NODE_ENV !== "development" &&
    process.env.NODE_ENV !== "test"
  ) {
    return;
  }

  console.info(`[engine4-image] product=${input.productCode}`);
  console.info(`[engine4-image] title=${input.title}`);
  console.info(
    `[engine4-image] candidates=${JSON.stringify(input.candidates)}`
  );
  console.info(`[engine4-image] rejected=${JSON.stringify(input.rejected)}`);
  console.info(
    `[engine4-image] resolvedHeroImage=${input.resolvedHeroImage ?? "<none>"}`
  );
  console.info(
    `[engine4-image] downstreamOverwriteBlocked=${String(input.downstreamOverwriteBlocked)}`
  );
};

const hasApiText = (value?: string) => Boolean(cleanText(value));
const hasApiNumber = (value?: number) =>
  typeof value === "number" && Number.isFinite(value);

const logEngine4ApiProvenance = (input: {
  productCode: string;
  apiTour?: Engine4ViatorApiTour;
  fallbackTour?: Engine4ViatorApiTour;
}) => {
  if (
    process.env.NODE_ENV !== "development" &&
    process.env.NODE_ENV !== "test"
  ) {
    return;
  }

  const { apiTour, fallbackTour, productCode } = input;

  const sourceFor = {
    title: hasApiText(apiTour?.title)
      ? "api"
      : hasApiText(fallbackTour?.title)
        ? "fallback"
        : "missing",
    price: hasApiText(apiTour?.fromPrice)
      ? "api"
      : hasApiText(fallbackTour?.fromPrice)
        ? "fallback"
        : "missing",
    rating: hasApiNumber(apiTour?.rating)
      ? "api"
      : hasApiNumber(fallbackTour?.rating)
        ? "fallback"
        : "missing",
    reviewCount: hasApiNumber(apiTour?.reviewCount)
      ? "api"
      : hasApiNumber(fallbackTour?.reviewCount)
        ? "fallback"
        : "missing",
    duration: hasApiText(apiTour?.duration)
      ? "api"
      : hasApiText(fallbackTour?.duration)
        ? "fallback"
        : "missing",
    meeting: hasApiText(apiTour?.meetingPoint)
      ? "api"
      : hasApiText(fallbackTour?.meetingPoint)
        ? "fallback"
        : "missing",
    cancellation: hasApiText(apiTour?.cancellationPolicy)
      ? "api"
      : hasApiText(fallbackTour?.cancellationPolicy)
        ? "fallback"
        : "missing",
    inclusions:
      apiTour?.inclusions && apiTour.inclusions.length > 0
        ? "api"
        : fallbackTour?.inclusions && fallbackTour.inclusions.length > 0
          ? "fallback"
          : "missing",
    exclusions:
      apiTour?.exclusions && apiTour.exclusions.length > 0
        ? "api"
        : fallbackTour?.exclusions && fallbackTour.exclusions.length > 0
          ? "fallback"
          : "missing",
    itinerary:
      apiTour?.itinerary && apiTour.itinerary.length > 0
        ? "api"
        : fallbackTour?.itinerary && fallbackTour.itinerary.length > 0
          ? "fallback"
          : "missing",
    image: resolveViatorPrimaryImageFromApiTour(apiTour)
      ? "api"
      : resolveViatorPrimaryImageFromApiTour(fallbackTour)
        ? "fallback"
        : "missing",
  };

  const fallbackFields = Object.entries(sourceFor)
    .filter(([, source]) => source === "fallback")
    .map(([field]) => field);

  console.info(`[engine4-api] product=${productCode}`);
  console.info(`[engine4-api] apiFetch=${String(Boolean(apiTour))}`);
  console.info(`[engine4-api] primaryImageSource=${sourceFor.image}`);
  console.info(`[engine4-api] priceSource=${sourceFor.price}`);
  console.info(`[engine4-api] ratingSource=${sourceFor.rating}`);
  console.info(`[engine4-api] reviewCountSource=${sourceFor.reviewCount}`);
  console.info(`[engine4-api] durationSource=${sourceFor.duration}`);
  console.info(
    `[engine4-api] fallbackFields=${JSON.stringify(fallbackFields)}`
  );
};

export const mapViatorToEngine4Tour = (input: {
  record: Engine4ViatorTourRecord;
  apiTour?: Engine4ViatorApiTour;
}): Engine4TourViewModel => {
  const { record, apiTour } = input;
  const fallbackTour =
    engine4ViatorApiFallbackByProductCode[record.productCode];

  logEngine4ApiProvenance({
    productCode: record.productCode,
    apiTour,
    fallbackTour,
  });

  const meetingPointFull = coalesceText(
    apiTour?.meetingPoint,
    fallbackTour?.meetingPoint
  );
  const resolvedApiTour: Engine4ViatorApiTour | undefined =
    apiTour || fallbackTour
      ? {
          ...(fallbackTour ?? {}),
          ...(apiTour ?? {}),
          title: coalesceText(apiTour?.title, fallbackTour?.title) ?? "",
          sourceUrl:
            coalesceText(apiTour?.sourceUrl, fallbackTour?.sourceUrl) ?? "",
          sourceDerivedImageUrl: coalesceText(
            apiTour?.sourceDerivedImageUrl,
            fallbackTour?.sourceDerivedImageUrl
          ),
          primaryImageUrl: coalesceText(
            apiTour?.primaryImageUrl,
            fallbackTour?.primaryImageUrl
          ),
          fromPrice: resolvePriceFrom({
            fromPrice: coalesceText(
              apiTour?.fromPrice,
              fallbackTour?.fromPrice
            ),
            currency: coalesceText(
              apiTour?.priceCurrency,
              fallbackTour?.priceCurrency
            ),
          }),
          priceCurrency: coalesceText(
            apiTour?.priceCurrency,
            fallbackTour?.priceCurrency
          ),
          duration: coalesceText(apiTour?.duration, fallbackTour?.duration),
          startTime: coalesceText(apiTour?.startTime, fallbackTour?.startTime),
          meetingPoint: meetingPointFull,
          cancellationPolicy: coalesceText(
            apiTour?.cancellationPolicy,
            fallbackTour?.cancellationPolicy
          ),
          whatToExpect: coalesceText(
            apiTour?.whatToExpect,
            fallbackTour?.whatToExpect
          ),
          description: coalesceText(
            apiTour?.description,
            fallbackTour?.description
          ),
          descriptionLong: coalesceText(
            apiTour?.descriptionLong,
            fallbackTour?.descriptionLong
          ),
          overview: coalesceText(apiTour?.overview, fallbackTour?.overview),
          rating: coalesceNumber(apiTour?.rating, fallbackTour?.rating),
          reviewCount: coalesceNumber(
            apiTour?.reviewCount,
            fallbackTour?.reviewCount
          ),
          galleryImages: Array.from(
            new Set([
              ...(apiTour?.galleryImages ?? []),
              ...(fallbackTour?.galleryImages ?? []),
            ])
          ),
          highlights:
            (apiTour?.highlights && apiTour.highlights.length > 0
              ? apiTour.highlights
              : fallbackTour?.highlights) ?? [],
          faqs:
            (apiTour?.faqs && apiTour.faqs.length > 0
              ? apiTour.faqs
              : fallbackTour?.faqs) ?? [],
          itinerary:
            (apiTour?.itinerary && apiTour.itinerary.length > 0
              ? apiTour.itinerary
              : fallbackTour?.itinerary) ?? [],
          inclusions:
            (apiTour?.inclusions && apiTour.inclusions.length > 0
              ? apiTour.inclusions
              : fallbackTour?.inclusions) ?? [],
          exclusions:
            (apiTour?.exclusions && apiTour.exclusions.length > 0
              ? apiTour.exclusions
              : fallbackTour?.exclusions) ?? [],
          additionalInfo:
            (apiTour?.additionalInfo && apiTour.additionalInfo.length > 0
              ? apiTour.additionalInfo
              : fallbackTour?.additionalInfo) ?? [],
          productCode: record.productCode,
        }
      : undefined;

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

  const imageSelection = selectEngine4ViatorImage({
    productCode: record.productCode,
    apiTour: resolvedApiTour,
    recordHeroImage: record.heroImage,
  });

  const resolvedHeroImage =
    imageSelection.selected ??
    resolveEngine4ViatorHero({
      productCode: record.productCode,
      apiTour: resolvedApiTour,
    });

  const tour: Engine4TourViewModel = {
    tourId: `engine4-${record.productCode}`,
    engine: "engine4",
    bookingProvider: "viator",
    productCode: record.productCode,
    slug: record.slug,
    title: cleanText(resolvedApiTour?.title) ?? "Tour",
    canonicalPath: buildEngine4TourPath(record),
    bookingUrl: buildViatorAffiliateUrl(record.productCode),
    destination: record.destination,
    heroImage: resolvedHeroImage,
    primaryImage: resolvedHeroImage,
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

  const candidates = imageSelection.candidates;

  logEngine4ImageDecision({
    productCode: record.productCode,
    title: tour.title,
    candidates,
    rejected: imageSelection.rejected,
    resolvedHeroImage: tour.heroImage ?? undefined,
    downstreamOverwriteBlocked: Boolean(tour.primaryImage),
  });

  assertEngine4ViatorTour(tour);
  return tour;
};
