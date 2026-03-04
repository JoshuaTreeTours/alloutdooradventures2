import type { Engine2Tour } from "../../engine2/data/loadEngine2";
import { extractMeetingPointText } from "../../utils/providers/viator/extractMeetingPointText";
import { normalizeViatorTourContent } from "../normalize/normalizeViatorTourContent";
import type { Engine3TourViewModel, ViatorProductData } from "../types";
import { resolveEngine3PrimaryImage } from "../utils/resolveEngine3PrimaryImage";
import { resolveEngine3ViatorHero } from "../utils/resolveEngine3ViatorHero";
import { buildViatorAffiliateUrl } from "../utils/viatorLinks";
import { ENGINE3_VIATOR_OVERRIDES } from "./engine3ViatorOverrides";

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

const parsePrice = (value?: string): number | undefined => {
  const cleaned = cleanText(value);
  if (!cleaned) {
    return undefined;
  }
  const parsed = Number.parseFloat(cleaned.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const formatUsdPrice = (amount: number): string => `$${amount.toFixed(2)}`;

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

  const overrideEntry = ENGINE3_VIATOR_OVERRIDES[productData?.productCode ?? ""];
  const overrideDescription = cleanText(overrideEntry?.description);
  const sourceDescription = cleanText(productData?.description);
  const meetingPointText = extractMeetingPointText({
    structuredLocation: undefined,
    fallbackText:
      cleanText(productData?.meetingPointText) ??
      cleanText(productData?.meetingPointDescription) ??
      cleanText(tour.content.meetingPoint?.address) ??
      cleanText(tour.content.meetingPoint?.instructions),
  });

  const normalizedFaqs =
    normalizeFaqs(overrideEntry?.faqs) ??
    normalizeFaqs(productData?.faqs) ??
    normalizeFaqs(tour.content.faqs);

  const fallbackOneLiner = `${title} in ${
    cleanText(tour.geo.city) ?? cleanText(tour.geo.region) ?? "the destination"
  } (${cleanText(productData?.duration) ?? cleanText(tour.content.duration) ?? "duration varies"}).`;

  const { gallery, heroImageOverrideUrl } = resolveEngine3PrimaryImage({
    productCode: productData?.productCode ?? tour.id,
    imageCandidates: productData?.imageCandidates,
    fallbackImageUrl:
      cleanText(productData?.supplierImage) ?? cleanText(tour.images.hero),
  });

  const contentImages = gallery;
  const primaryImageUrl =
    resolveEngine3ViatorHero({
      bookingProvider: "viator",
      heroImageOverrideUrl,
      contentImages,
    }) ?? undefined;

  const apiPrice = parsePrice(productData?.priceFrom);
  const priceOverride = overrideEntry?.startingPriceOverride;
  const tolerance = priceOverride?.tolerance ?? 30;
  let resolvedPrice = apiPrice;
  let resolvedCurrency = cleanText(productData?.priceCurrency) ?? "USD";

  if (priceOverride) {
    const delta =
      typeof apiPrice === "number" ? Math.abs(apiPrice - priceOverride.amount) : null;

    if (apiPrice === undefined || apiPrice <= 0 || (delta !== null && delta <= tolerance)) {
      resolvedPrice = priceOverride.amount;
      resolvedCurrency = priceOverride.currency;
    } else {
      console.warn(
        `[engine3] Price override ignored for ${productData?.productCode}: API price ${apiPrice} is outside tolerance ±${tolerance} from override ${priceOverride.amount}`
      );
    }
  }

  const departureMatchToken = cleanText(overrideEntry?.departureMeetingPointMatchContains);
  const showDepartureNote =
    Boolean(departureMatchToken) &&
    Boolean(meetingPointText?.toLowerCase().includes(departureMatchToken!.toLowerCase()));

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
    primaryImageUrl,
    heroImageOverrideUrl,
    heroImageUrl: primaryImageUrl,
    content: {
      images: contentImages,
    },
    priceFrom: typeof resolvedPrice === "number" ? formatUsdPrice(resolvedPrice) : undefined,
    priceCurrency: resolvedCurrency,
    rating: productData?.rating ?? tour.viatorRatingValue ?? undefined,
    reviewCount:
      productData?.reviewCount ?? tour.viatorReviewCount ?? undefined,
    meetingPointText,
    departureNote: showDepartureNote ? cleanText(overrideEntry?.departureNote) : undefined,
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
