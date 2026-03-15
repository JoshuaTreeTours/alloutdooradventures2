import { buildCanonicalUrl } from "../../utils/seo";
import type {
  Engine6FaqItem,
  Engine6ItineraryItem,
  Engine6ProductRecord,
  Engine6ResolvedTourPageData,
} from "../types";

const cleanText = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized || undefined;
};

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;

const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const toStringArray = (value: unknown): string[] =>
  asArray(value)
    .map(cleanText)
    .filter((entry): entry is string => Boolean(entry));

const extractPrice = (product: Record<string, unknown>) => {
  const pricingSummary = asRecord(product.pricingSummary);
  const amountObj = asRecord(
    pricingSummary?.fromPrice ?? pricingSummary?.price
  );

  const numericPrice =
    asNumber(amountObj?.amount) ??
    asNumber(pricingSummary?.fromPrice) ??
    asNumber(pricingSummary?.price) ??
    asNumber(product.fromPrice) ??
    asNumber(product.price);

  const currency =
    cleanText(amountObj?.currency) ??
    cleanText(pricingSummary?.currency) ??
    cleanText(product.currencyCode);

  const fromPriceText =
    cleanText(amountObj?.formatted) ??
    cleanText(amountObj?.display) ??
    cleanText(amountObj?.text) ??
    (typeof numericPrice === "number"
      ? `${currency ?? "USD"} ${numericPrice.toFixed(2)}`
      : undefined);

  return { fromPrice: numericPrice, currency, fromPriceText };
};

const extractMeetingPoint = (product: Record<string, unknown>) => {
  const meetingPoints = asArray(product.meetingPoints)
    .map(item => asRecord(item))
    .filter((item): item is Record<string, unknown> => Boolean(item));
  const logistics = asRecord(product.logistics);
  const logisticsStart = asRecord(logistics?.start);

  const full =
    cleanText(meetingPoints[0]?.fullAddress) ??
    cleanText(meetingPoints[0]?.address) ??
    cleanText(meetingPoints[0]?.description) ??
    cleanText(logisticsStart?.description) ??
    cleanText(logisticsStart?.location) ??
    cleanText(product.meetingPoint);

  const short =
    cleanText(meetingPoints[0]?.name) ??
    cleanText(logisticsStart?.name) ??
    full?.split(",")[0]?.trim();

  return { meetingPointFull: full, meetingPointShort: short };
};

const extractDurationText = (product: Record<string, unknown>) => {
  const logistics = asRecord(product.logistics);
  const durationObj =
    asRecord(product.duration) ?? asRecord(logistics?.duration);

  return (
    cleanText(durationObj?.formatted) ??
    cleanText(durationObj?.text) ??
    cleanText(durationObj?.description) ??
    cleanText(product.duration) ??
    (typeof product.durationMinutes === "number"
      ? `${product.durationMinutes} minutes`
      : undefined)
  );
};

const extractFaqs = (product: Record<string, unknown>): Engine6FaqItem[] => {
  const candidates = [...asArray(product.faqs), ...asArray(product.faq)];

  return candidates
    .map(item => {
      const row = asRecord(item);
      if (!row) return undefined;
      const question =
        cleanText(row.question) ?? cleanText(row.title) ?? cleanText(row.q);
      const answer =
        cleanText(row.answer) ?? cleanText(row.description) ?? cleanText(row.a);
      if (!question || !answer) return undefined;
      return { question, answer };
    })
    .filter((row): row is Engine6FaqItem => Boolean(row));
};

const extractItinerary = (
  product: Record<string, unknown>
): Engine6ItineraryItem[] => {
  const itineraryObj = asRecord(product.itinerary);
  const candidates = [
    ...asArray(product.itineraryItems),
    ...asArray(product.itinerary),
    ...asArray(itineraryObj?.items),
    ...asArray(itineraryObj?.itineraryItems),
    ...asArray(product.stops),
  ];

  return candidates
    .map(item => {
      const row = asRecord(item);
      if (!row) return undefined;
      const title =
        cleanText(row.title) ?? cleanText(row.name) ?? cleanText(row.label);
      if (!title) return undefined;
      return {
        title,
        description: cleanText(row.description) ?? cleanText(row.summary),
        duration: cleanText(row.duration) ?? cleanText(row.durationText),
      };
    })
    .filter((row): row is Engine6ItineraryItem => Boolean(row));
};

const extractImages = (product: Record<string, unknown>) => {
  const imageEntries = asArray(product.images)
    .map(item => asRecord(item))
    .filter((item): item is Record<string, unknown> => Boolean(item));

  const urls = imageEntries.flatMap(image => {
    const variants = asArray(image.variants)
      .map(variant => asRecord(variant))
      .filter((variant): variant is Record<string, unknown> => Boolean(variant))
      .map(variant => cleanText(variant.url))
      .filter((url): url is string => Boolean(url));
    const directUrl = cleanText(image.url);
    return directUrl ? [directUrl, ...variants] : variants;
  });

  const uniqueUrls = Array.from(new Set(urls));
  const heroImage =
    imageEntries.find(image => image.isCover === true)?.variants &&
    asArray(imageEntries.find(image => image.isCover === true)?.variants)
      .map(variant => asRecord(variant))
      .filter((variant): variant is Record<string, unknown> => Boolean(variant))
      .map(variant => cleanText(variant.url))
      .find((url): url is string => Boolean(url));

  return {
    heroImage: heroImage ?? uniqueUrls[0],
    galleryImages: uniqueUrls,
  };
};

const buildOverview = (product: Record<string, unknown>) => {
  const long =
    cleanText(asRecord(product.description)?.text) ??
    cleanText(product.description) ??
    cleanText(product.longDescription) ??
    cleanText(product.summary) ??
    "";

  return long;
};

const ensureLongOverview = (overview: string, highlights: string[]) => {
  const wordCount = overview.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount >= 120 || highlights.length === 0) return overview;
  const extra = highlights.join(" ");
  return `${overview} ${extra}`.trim();
};

export const mapViatorToEngine6PageData = ({
  record,
  payload,
}: {
  record: Engine6ProductRecord;
  payload: Record<string, unknown>;
}): Engine6ResolvedTourPageData => {
  const product = asRecord(payload.product) ?? payload;
  const title =
    cleanText(product.title) ??
    cleanText(product.productTitle) ??
    "Untitled Viator tour";
  const overviewBase = buildOverview(product);
  const highlights =
    toStringArray(product.highlights).length > 0
      ? toStringArray(product.highlights)
      : toStringArray(product.bulletPoints);
  const overview = ensureLongOverview(overviewBase, highlights);
  const bookingUrl =
    cleanText(product.productUrl) ??
    cleanText(product.seoUrl) ??
    record.canonicalPath;
  const { fromPrice, currency, fromPriceText } = extractPrice(product);
  const { heroImage, galleryImages } = extractImages(product);
  const faqs = extractFaqs(product);
  const itinerary = extractItinerary(product);
  const { meetingPointFull, meetingPointShort } = extractMeetingPoint(product);
  const durationText = extractDurationText(product);
  const cancellationText =
    cleanText(asRecord(product.cancellationPolicy)?.description) ??
    cleanText(product.cancellationPolicy) ??
    cleanText(asRecord(product.logistics)?.cancellationPolicy);
  const inclusions = toStringArray(product.inclusions);
  const exclusions = toStringArray(product.exclusions);
  const additionalInfo = [
    ...toStringArray(product.additionalInfo),
    ...toStringArray(asRecord(product.additionalInfo)?.notes),
  ];

  const canonicalUrl = buildCanonicalUrl(record.canonicalPath);
  const seoDescription = overview.slice(0, 158);

  return {
    productCode: record.productCode,
    slug: record.slug,
    canonicalPath: record.canonicalPath,
    bookingUrl,
    destinationLabel: `${record.destination.city}, ${record.destination.state}`,
    title,
    overview,
    heroImage,
    galleryImages,
    fromPrice,
    fromPriceText,
    currency,
    ratingValue: asNumber(product.rating) ?? asNumber(product.averageRating),
    reviewCount: asNumber(product.reviewCount),
    meetingPointFull,
    meetingPointShort,
    durationText,
    cancellationText,
    highlights,
    inclusions,
    exclusions,
    itinerary,
    faqs,
    additionalInfo,
    seo: {
      title: `${title} | Hilo Tours`,
      description: seoDescription,
      canonicalUrl,
      ogImage: heroImage,
    },
    schema: {
      productName: title,
      description: seoDescription,
      image: heroImage,
      aggregateRating:
        typeof asNumber(product.rating) === "number" &&
        typeof asNumber(product.reviewCount) === "number"
          ? {
              ratingValue: asNumber(product.rating)!,
              reviewCount: asNumber(product.reviewCount)!,
            }
          : undefined,
      offer: {
        price: fromPrice,
        priceCurrency: currency,
        url: bookingUrl,
      },
    },
  };
};
