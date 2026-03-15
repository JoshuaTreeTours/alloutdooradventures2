import {
  ENGINE6_PILOT_CANONICAL_PATH,
  ENGINE6_PILOT_PRODUCT_CODE,
  ENGINE6_PILOT_TOUR_SLUG,
} from "../routes";
import type { Engine6Faq, Engine6ItineraryItem, Engine6PageData } from "../types";

const cleanText = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .map(item => cleanText(item))
        .filter((item): item is string => Boolean(item))
    : [];

const extractImageUrls = (product: Record<string, unknown>): string[] => {
  const images = Array.isArray(product.images) ? product.images : [];
  const urls = images.flatMap(image => {
    const row = asRecord(image);
    if (!row) return [];
    const direct = cleanText(row.url);
    const variants = Array.isArray(row.variants)
      ? row.variants
          .map(variant => cleanText(asRecord(variant)?.url))
          .filter((url): url is string => Boolean(url))
      : [];
    return [direct, ...variants].filter((url): url is string => Boolean(url));
  });

  return Array.from(new Set(urls));
};

const toFaqs = (product: Record<string, unknown>): Engine6Faq[] => {
  const raw = Array.isArray(product.faqs) ? product.faqs : [];
  const faqs = raw
    .map(item => {
      const row = asRecord(item);
      const question = cleanText(row?.question) ?? cleanText(row?.title);
      const answer = cleanText(row?.answer) ?? cleanText(row?.description);
      return question && answer ? { question, answer } : undefined;
    })
    .filter((item): item is Engine6Faq => Boolean(item));

  if (faqs.length > 0) return faqs;

  const duration = cleanText(product.duration);
  const meetingPoint = cleanText(product.meetingPoint);
  const cancellation = cleanText(product.cancellationPolicy);

  return [
    duration
      ? {
          question: "How long does this experience take?",
          answer: `The listed duration is ${duration}.`,
        }
      : undefined,
    meetingPoint
      ? {
          question: "Where is the meeting point?",
          answer: `The listed meeting point is ${meetingPoint}.`,
        }
      : undefined,
    cancellation
      ? {
          question: "What is the cancellation policy?",
          answer: cancellation,
        }
      : undefined,
  ].filter((item): item is Engine6Faq => Boolean(item));
};

const toItinerary = (product: Record<string, unknown>): Engine6ItineraryItem[] => {
  const raw = Array.isArray(product.itineraryItems)
    ? product.itineraryItems
    : Array.isArray(product.itinerary)
      ? product.itinerary
      : [];

  return raw
    .map(item => {
      const row = asRecord(item);
      const title =
        cleanText(row?.title) ?? cleanText(row?.name) ?? cleanText(row?.label);
      if (!title) return undefined;
      return {
        title,
        description: cleanText(row?.description) ?? cleanText(row?.summary),
        duration: cleanText(row?.duration) ?? cleanText(row?.durationText),
      };
    })
    .filter((item): item is Engine6ItineraryItem => Boolean(item));
};

const parseNumericPrice = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const numeric = Number.parseFloat(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : undefined;
};

export const mapViatorToEngine6PageData = (
  payload: Record<string, unknown>
): Engine6PageData => {
  const product =
    (asRecord(payload.product) as Record<string, unknown> | undefined) ?? payload;

  const title =
    cleanText(product.title) ?? cleanText(product.productTitle) ?? "Tour";
  const imageUrls = extractImageUrls(product);
  const heroImage =
    imageUrls[0] ??
    cleanText(product.primaryImageUrl) ??
    cleanText(product.sourceDerivedImageUrl);
  const priceRaw =
    cleanText(product.priceFrom) ??
    cleanText(asRecord(product.pricingSummary)?.fromPrice) ??
    cleanText(product.fromPrice);
  const currency =
    cleanText(product.currencyCode) ??
    cleanText(asRecord(product.pricingSummary)?.currencyCode) ??
    "USD";
  const numericPrice = parseNumericPrice(priceRaw);

  if (!heroImage) {
    throw new Error("Engine6 pilot missing required hero image");
  }

  if (!numericPrice || numericPrice <= 0) {
    throw new Error(
      `Engine6 pilot requires a non-zero price for ${ENGINE6_PILOT_PRODUCT_CODE}`
    );
  }

  const fromPrice = currency === "USD" ? `$${numericPrice.toFixed(2)}` : `${numericPrice.toFixed(2)} ${currency}`;
  const highlights = toStringArray(product.highlights).slice(0, 10);
  const additionalInfo = toStringArray(product.additionalInfo);

  const overview =
    cleanText(product.description) ??
    cleanText(asRecord(product.description)?.text) ??
    cleanText(product.shortDescription) ??
    "Tour overview unavailable.";

  return {
    productCode:
      cleanText(product.productCode) ?? cleanText(product.code) ?? ENGINE6_PILOT_PRODUCT_CODE,
    slug: ENGINE6_PILOT_TOUR_SLUG,
    canonicalPath: ENGINE6_PILOT_CANONICAL_PATH,
    title,
    heroImage,
    galleryImages: imageUrls.length ? imageUrls : [heroImage],
    fromPrice,
    currency,
    ratingValue:
      typeof product.rating === "number" ? product.rating : undefined,
    reviewCount:
      typeof product.reviewCount === "number" ? product.reviewCount : undefined,
    meetingPointFull: cleanText(product.meetingPoint),
    meetingPointShort:
      cleanText(product.meetingPoint) ?? cleanText(product.meetingPointName),
    durationText:
      cleanText(product.duration) ?? cleanText(product.durationText),
    cancellationText: cleanText(product.cancellationPolicy),
    overview,
    highlights,
    inclusions: toStringArray(product.inclusions),
    exclusions: toStringArray(product.exclusions),
    itinerary: toItinerary(product),
    faqs: toFaqs(product),
    additionalInfo,
    seo: {
      title: `${title} | Santa Barbara Tours`,
      description: overview,
      canonical: ENGINE6_PILOT_CANONICAL_PATH,
      ogImage: heroImage,
    },
  };
};
