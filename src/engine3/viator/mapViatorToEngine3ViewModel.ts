import type { Engine2Tour } from "../../engine2/data/loadEngine2";
import type { Engine3TourViewModel, ViatorProductData } from "../types";
import { generateEngine3Description } from "../utils/generateEngine3Description";
import { resolveEngine3PrimaryImage } from "../utils/resolveEngine3PrimaryImage";
import { ENGINE3_VIATOR_OVERRIDES } from "./engine3ViatorOverrides";

const cleanText = (value?: string | null): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeList = (values?: string[]): string[] | undefined => {
  if (!Array.isArray(values)) {
    return undefined;
  }

  const normalized = values
    .map(item => cleanText(item))
    .filter((item): item is string => Boolean(item));

  return normalized.length > 0 ? normalized : undefined;
};

const normalizeSentenceKey = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const dedupeList = (values?: string[]): string[] | undefined => {
  const normalized = normalizeList(values);
  if (!normalized?.length) {
    return undefined;
  }

  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of normalized) {
    const key = normalizeSentenceKey(item);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(item);
  }

  return result.length > 0 ? result : undefined;
};

const normalizeFaqs = (
  faqs?: Array<{ question: string; answer: string }>
): Array<{ question: string; answer: string }> | undefined => {
  if (!faqs?.length) {
    return undefined;
  }

  const seen = new Set<string>();
  const normalized = faqs
    .map(item => ({
      question: cleanText(item.question),
      answer: cleanText(item.answer),
    }))
    .filter((item): item is { question: string; answer: string } =>
      Boolean(item.question && item.answer)
    )
    .filter(item => {
      const key = normalizeSentenceKey(item.question);
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

  return normalized.length > 0 ? normalized : undefined;
};

const getStateSlugFromCanonicalPath = (
  canonicalPath?: string
): string | undefined => {
  if (!canonicalPath) {
    return undefined;
  }

  const parts = canonicalPath.split("/").filter(Boolean);
  if (parts[0] !== "destinations") {
    return undefined;
  }

  return parts[1] ?? undefined;
};

export const mapViatorToEngine3ViewModel = (
  tour: Engine2Tour,
  productData?: ViatorProductData
): Engine3TourViewModel => {
  const bookingUrl =
    cleanText(tour.bookingUrl) ?? cleanText(tour.booking.bookingUrl);

  const title = cleanText(productData?.title) ?? tour.name;
  const highlights =
    dedupeList(productData?.highlights) ?? dedupeList(tour.content.highlights);
  const included =
    dedupeList(productData?.included) ?? dedupeList(tour.content.included);
  const itinerary =
    productData?.itinerary
      ?.map((item, index) => ({
        title: cleanText(item.title),
        description: cleanText(item.description),
        duration: cleanText(item.duration),
        order: item.order ?? index + 1,
      }))
      .filter(item => Boolean(item.title || item.description || item.duration))
      .sort(
        (a, b) =>
          (a.order ?? Number.MAX_SAFE_INTEGER) -
          (b.order ?? Number.MAX_SAFE_INTEGER)
      ) ??
    tour.content.itinerary
      ?.map((item, index) => ({
        title: cleanText(item.title),
        description: cleanText(item.description),
        duration: cleanText(item.duration),
        order: index + 1,
      }))
      .filter(item => Boolean(item.title || item.description || item.duration));

  const overrideEntry =
    ENGINE3_VIATOR_OVERRIDES[productData?.productCode ?? ""];
  const overrideDescription = cleanText(overrideEntry?.description);
  const overviewFactsOverride = overrideEntry?.overviewFactsOverride;
  const sourceDescription = cleanText(productData?.description);
  const hasNarrativeSources = Boolean(
    (highlights && highlights.length > 0) ||
    (itinerary && itinerary.some(item => Boolean(item.title)))
  );

  const generatedDescription = hasNarrativeSources
    ? generateEngine3Description({
        title,
        city: cleanText(tour.geo.city),
        region: cleanText(tour.geo.region),
        duration:
          cleanText(productData?.duration) ?? cleanText(tour.content.duration),
        highlights,
        meetingPoint:
          cleanText(overviewFactsOverride?.meetingPoint) ??
          cleanText(productData?.meetingLocation) ??
          cleanText(productData?.meetingPointDescription) ??
          cleanText(tour.content.meetingPoint?.address) ??
          cleanText(tour.content.meetingPoint?.instructions),
        departureLocation:
          cleanText(productData?.departureLocation) ??
          cleanText(overviewFactsOverride?.meetingPoint),
        maxGroupSize:
          overviewFactsOverride?.groupMax ?? productData?.maxGroupSize,
        minAge: overviewFactsOverride?.ageMin ?? productData?.minAge,
        cancellationWindowHours:
          overviewFactsOverride?.cancellationHours ??
          productData?.cancellationWindowHours,
        vehicleType: cleanText(productData?.vehicleType),
        specialHighlightPhrase:
          cleanText(overviewFactsOverride?.signatureHighlight) ??
          cleanText(productData?.signatureHighlight),
        itineraryStopNames: itinerary
          ?.map(item => cleanText(item.title))
          .filter((item): item is string => Boolean(item)),
        viatorDescription: sourceDescription,
      })
    : undefined;

  const normalizedFaqs =
    normalizeFaqs(overrideEntry?.faqs) ??
    normalizeFaqs(productData?.faqs) ??
    normalizeFaqs(tour.content.faqs);

  const fallbackOneLiner = `${title} in ${
    cleanText(tour.geo.city) ?? cleanText(tour.geo.region) ?? "the destination"
  } (${cleanText(productData?.duration) ?? cleanText(tour.content.duration) ?? "duration varies"}).`;

  const { primaryImageUrl, heroImageOverrideUrl } = resolveEngine3PrimaryImage({
    productCode: productData?.productCode ?? tour.id,
    imageCandidates: productData?.imageCandidates,
    fallbackImageUrl:
      cleanText(productData?.supplierImage) ?? cleanText(tour.images.hero),
  });

  return {
    tourId: tour.id,
    title,
    description:
      overrideDescription ??
      generatedDescription ??
      sourceDescription ??
      fallbackOneLiner,
    country: cleanText(tour.geo.country),
    stateSlug: getStateSlugFromCanonicalPath(tour.seo.canonicalPath),
    city: tour.geo.city,
    citySlug: cleanText(tour.sourceCitySlug),
    region: tour.geo.region,
    canonicalPath: tour.seo.canonicalPath,
    bookingUrl: bookingUrl ?? "",
    duration:
      cleanText(productData?.duration) ?? cleanText(tour.content.duration),
    primaryImageUrl,
    heroImageOverrideUrl,
    heroImageUrl: primaryImageUrl,
    priceFrom:
      cleanText(productData?.priceFrom) ?? cleanText(tour.pricing?.price),
    priceCurrency: cleanText(productData?.priceCurrency),
    rating: productData?.rating ?? tour.viatorRatingValue ?? undefined,
    reviewCount:
      productData?.reviewCount ?? tour.viatorReviewCount ?? undefined,
    highlights,
    included,
    notIncluded:
      dedupeList(productData?.notIncluded) ??
      dedupeList(tour.content.notIncluded),
    meetingPointDescription:
      cleanText(productData?.meetingPointDescription) ??
      cleanText(tour.content.meetingPoint?.address) ??
      cleanText(tour.content.meetingPoint?.instructions),
    operatorName:
      cleanText(productData?.operatorName) ?? cleanText(tour.provider.name),
    availability: cleanText(productData?.availability),
    latitude: productData?.latitude ?? tour.geo.lat ?? undefined,
    longitude: productData?.longitude ?? tour.geo.lng ?? undefined,
    itinerary,
    faqs:
      productData?.productCode === "2335P1"
        ? normalizedFaqs?.slice(0, 5)
        : normalizedFaqs,
  };
};
