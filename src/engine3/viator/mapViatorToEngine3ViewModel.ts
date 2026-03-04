import type { Engine2Tour } from "../../engine2/data/loadEngine2";
import { extractMeetingPointText } from "../../utils/providers/viator/extractMeetingPointText";
import { normalizeViatorTourContent } from "../normalize/normalizeViatorTourContent";
import type { Engine3TourViewModel, ViatorProductData } from "../types";
import { buildViatorAffiliateUrl } from "../utils/viatorLinks";
import { ENGINE3_VIATOR_OVERRIDES } from "./engine3ViatorOverrides";
import { resolveViatorHeroImage } from "./resolveViatorHeroImage";

const cleanText = (value?: string | null): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeSentenceKey = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

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
  const canonicalProductUrl = cleanText(productData?.sourceUrl);
  const attributedBookingUrl = buildViatorAffiliateUrl({
    baseUrl: canonicalProductUrl,
    fallbackUrl: bookingUrl,
  });

  const title = cleanText(productData?.title) ?? tour.name;
  const normalizedContent = normalizeViatorTourContent({
    productData,
    storedTour: tour,
  });
  const highlights =
    normalizedContent.highlights.length > 0
      ? normalizedContent.highlights
      : undefined;
  const inclusions =
    normalizedContent.inclusions.length > 0
      ? normalizedContent.inclusions
      : undefined;
  const exclusions =
    normalizedContent.exclusions.length > 0
      ? normalizedContent.exclusions
      : undefined;
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
  const sourceDescription = cleanText(productData?.description);

  const normalizedFaqs =
    normalizeFaqs(overrideEntry?.faqs) ??
    normalizeFaqs(productData?.faqs) ??
    normalizeFaqs(tour.content.faqs);

  const fallbackOneLiner = `${title} in ${
    cleanText(tour.geo.city) ?? cleanText(tour.geo.region) ?? "the destination"
  } (${cleanText(productData?.duration) ?? cleanText(tour.content.duration) ?? "duration varies"}).`;

  const heroImage = resolveViatorHeroImage({
    productCode: productData?.productCode ?? tour.id,
    primaryImageUrl: cleanText(productData?.supplierImage),
    imageGallery: [
      ...(productData?.imageCandidates ?? []),
      cleanText(tour.images.hero) ?? "",
      ...(tour.images.gallery ?? []),
    ].filter((value): value is string => Boolean(value)),
  });

  return {
    tourId: tour.id,
    bookingProvider: "viator",
    title,
    description:
      overrideDescription ??
      normalizedContent.overview ??
      sourceDescription ??
      fallbackOneLiner,
    overview: normalizedContent.overview,
    country: cleanText(tour.geo.country),
    stateSlug: getStateSlugFromCanonicalPath(tour.seo.canonicalPath),
    city: tour.geo.city,
    citySlug: cleanText(tour.sourceCitySlug),
    region: tour.geo.region,
    canonicalPath: tour.seo.canonicalPath,
    bookingUrl: attributedBookingUrl ?? "",
    viator: {
      productUrl: canonicalProductUrl ?? bookingUrl,
    },
    duration:
      cleanText(productData?.duration) ?? cleanText(tour.content.duration),
    heroImage: heroImage ?? undefined,
    primaryImageUrl: heroImage ?? null,
    heroImageUrl: heroImage ?? null,
    priceFrom:
      cleanText(productData?.priceFrom) ?? cleanText(tour.pricing?.price),
    priceCurrency: cleanText(productData?.priceCurrency),
    rating: productData?.rating ?? tour.viatorRatingValue ?? undefined,
    reviewCount:
      productData?.reviewCount ?? tour.viatorReviewCount ?? undefined,
    meetingPointText: extractMeetingPointText({
      structuredLocation: undefined,
      fallbackText:
        cleanText(productData?.meetingPointText) ??
        cleanText(productData?.meetingPointDescription) ??
        cleanText(tour.content.meetingPoint?.address) ??
        cleanText(tour.content.meetingPoint?.instructions),
    }),
    highlights,
    inclusions,
    exclusions,
    included: inclusions,
    notIncluded: exclusions,
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
    faqs: normalizedFaqs?.slice(0, 5),
  };
};
