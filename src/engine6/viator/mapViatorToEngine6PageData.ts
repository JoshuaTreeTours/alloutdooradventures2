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

const toParagraphText = (value: unknown): string => {
  if (typeof value === "string") {
    return cleanText(value) ?? "";
  }

  if (Array.isArray(value)) {
    return value
      .map(item => toParagraphText(item))
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  const record = asRecord(value);
  if (!record) {
    return "";
  }

  return (
    cleanText(record.text) ??
    cleanText(record.description) ??
    cleanText(record.summary) ??
    cleanText(record.content) ??
    ""
  );
};

const extractTicketDescription = (product: Record<string, unknown>) => {
  const ticketInfo = asRecord(product.ticketInfo);

  return (
    cleanText(ticketInfo?.ticketDescription) ??
    cleanText(ticketInfo?.description) ??
    toParagraphText(ticketInfo?.sections)
  );
};

const extractNumericPrice = (value: unknown): number | undefined => {
  const direct = asNumber(value);
  if (typeof direct === "number") {
    return direct;
  }

  const row = asRecord(value);
  if (!row) {
    return undefined;
  }

  return (
    asNumber(row.amount) ??
    asNumber(row.value) ??
    asNumber(row.price) ??
    asNumber(row.fromPrice) ??
    asNumber(row.recommendedRetailPrice)
  );
};

const extractPriceText = (value: unknown): string | undefined => {
  const row = asRecord(value);
  if (!row) {
    return undefined;
  }

  return (
    cleanText(row.formatted) ??
    cleanText(row.display) ??
    cleanText(row.text) ??
    cleanText(row.priceText)
  );
};

const findFirstPriceText = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const normalized = cleanText(value);
    if (!normalized) return undefined;
    if (/\$\s*\d|from\s+\$\s*\d/i.test(normalized)) {
      return normalized;
    }
    return undefined;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const next = findFirstPriceText(item);
      if (next) return next;
    }
    return undefined;
  }

  const row = asRecord(value);
  if (!row) return undefined;

  const direct =
    extractPriceText(row.fromPrice) ??
    extractPriceText(row.price) ??
    extractPriceText(row.amount) ??
    extractPriceText(row.summary);
  if (direct && /\$\s*\d|from\s+\$\s*\d/i.test(direct)) {
    return direct;
  }

  for (const entry of Object.values(row)) {
    const nested = findFirstPriceText(entry);
    if (nested) return nested;
  }

  return undefined;
};

const findFirstNumericPrice = (value: unknown): number | undefined => {
  const direct = extractNumericPrice(value);
  if (typeof direct === "number") {
    return direct;
  }

  if (Array.isArray(value)) {
    const candidates = value
      .map(item => findFirstNumericPrice(item))
      .filter((num): num is number => typeof num === "number");
    return candidates.length ? Math.min(...candidates) : undefined;
  }

  const row = asRecord(value);
  if (!row) {
    return undefined;
  }

  const candidates = Object.values(row)
    .map(entry => findFirstNumericPrice(entry))
    .filter((num): num is number => typeof num === "number");

  return candidates.length ? Math.min(...candidates) : undefined;
};

const extractPrice = (product: Record<string, unknown>) => {
  const pricingInfo = asRecord(product.pricingInfo);
  const pricingSummary = asRecord(pricingInfo?.summary);
  const legacyPricingSummary = asRecord(product.pricingSummary);
  const legacyFromPriceObj = asRecord(
    legacyPricingSummary?.fromPrice ?? legacyPricingSummary?.price
  );

  const ticketTypeRows = asArray(product.ticketTypes)
    .map(item => asRecord(item))
    .filter((row): row is Record<string, unknown> => Boolean(row));

  const ticketTypePrices = ticketTypeRows
    .map(row => {
      const rowPricing = asRecord(row.pricingInfo);
      const rowSummary = asRecord(rowPricing?.summary);

      return (
        extractNumericPrice(rowSummary?.fromPrice) ??
        extractNumericPrice(rowPricing?.fromPrice) ??
        extractNumericPrice(rowSummary?.price) ??
        extractNumericPrice(rowPricing?.price) ??
        extractNumericPrice(row.pricing)
      );
    })
    .filter((value): value is number => typeof value === "number");

  const fromPrice =
    extractNumericPrice(pricingSummary?.fromPrice) ??
    extractNumericPrice(pricingInfo?.fromPrice) ??
    extractNumericPrice(pricingSummary?.price) ??
    extractNumericPrice(pricingInfo?.price) ??
    extractNumericPrice(pricingInfo?.summary) ??
    extractNumericPrice(legacyFromPriceObj?.amount) ??
    extractNumericPrice(legacyPricingSummary?.fromPrice) ??
    extractNumericPrice(legacyPricingSummary?.price) ??
    (ticketTypePrices.length ? Math.min(...ticketTypePrices) : undefined) ??
    findFirstNumericPrice(product.pricingInfo) ??
    findFirstNumericPrice(product.ticketTypes);

  const currency =
    cleanText(pricingInfo?.currencyCode) ??
    cleanText(pricingSummary?.currencyCode) ??
    cleanText(legacyFromPriceObj?.currency) ??
    cleanText(legacyPricingSummary?.currency) ??
    cleanText(product.currencyCode);

  const fromPriceText =
    extractPriceText(pricingSummary?.fromPrice) ??
    extractPriceText(pricingInfo?.fromPrice) ??
    extractPriceText(pricingSummary?.price) ??
    extractPriceText(pricingInfo?.price) ??
    findFirstPriceText(product.pricingInfo) ??
    findFirstPriceText(product.ticketTypes) ??
    (typeof fromPrice === "number"
      ? `${currency ?? "USD"} ${fromPrice.toFixed(2)}`
      : undefined);

  return { fromPrice, currency, fromPriceText };
};

type ImageVariant = {
  url: string;
  width?: number;
  height?: number;
};

const rankVariant = (variant: ImageVariant): number => {
  const width = variant.width ?? 0;
  const height = variant.height ?? 0;
  const area = width * height;
  return area > 0 ? area : variant.url.length;
};

const extractImages = (product: Record<string, unknown>) => {
  const imageRows = asArray(product.images)
    .map(item => asRecord(item))
    .filter((row): row is Record<string, unknown> => Boolean(row));

  const imageCandidates = imageRows.map(row => {
    const directUrl = cleanText(row.url);

    const variants = asArray(row.variants)
      .map(item => asRecord(item))
      .filter((variant): variant is Record<string, unknown> => Boolean(variant))
      .map(variant => ({
        url: cleanText(variant.url),
        width: asNumber(variant.width),
        height: asNumber(variant.height),
      }))
      .filter((variant): variant is ImageVariant => Boolean(variant.url));

    const mergedVariants = directUrl
      ? [{ url: directUrl }, ...variants]
      : variants;

    const largest = [...mergedVariants].sort(
      (a, b) => rankVariant(b) - rankVariant(a)
    )[0];

    return {
      isCover: row.isCover === true,
      largest: largest?.url,
      variants: mergedVariants,
    };
  });

  const galleryImages = Array.from(
    new Set(
      imageCandidates
        .map(candidate => candidate.largest)
        .filter((url): url is string => Boolean(url))
    )
  );

  const coverImage = imageCandidates.find(
    candidate => candidate.isCover
  )?.largest;
  const heroImage = coverImage ?? galleryImages[0];

  return { heroImage, galleryImages };
};

const extractMeetingPoint = (product: Record<string, unknown>) => {
  const meetingPoints = asArray(product.meetingPoints)
    .map(item => asRecord(item))
    .filter((item): item is Record<string, unknown> => Boolean(item));

  const ticketDescription = extractTicketDescription(product);

  const full =
    cleanText(meetingPoints[0]?.fullAddress) ??
    cleanText(meetingPoints[0]?.address) ??
    cleanText(meetingPoints[0]?.description) ??
    (ticketDescription
      ?.match(
        /(?:meeting|pickup)\s*(?:point|location)?\s*[:\-]\s*([^\.]+)/i
      )?.[1]
      ?.trim() ||
      undefined);

  const short =
    cleanText(meetingPoints[0]?.name) ?? full?.split(",")[0]?.trim();

  return { meetingPointFull: full, meetingPointShort: short };
};

const extractItinerary = (
  product: Record<string, unknown>
): Engine6ItineraryItem[] => {
  const itineraryObj = asRecord(product.itinerary);
  const ticketInfo = asRecord(product.ticketInfo);

  const candidates = [
    ...asArray(product.itineraryItems),
    ...asArray(product.itinerary),
    ...asArray(itineraryObj?.items),
    ...asArray(itineraryObj?.itineraryItems),
    ...asArray(product.stops),
    ...asArray(ticketInfo?.itinerary),
    ...asArray(ticketInfo?.items),
  ];

  const extracted = candidates
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

  if (extracted.length > 0) {
    return extracted;
  }

  const ticketDescription = extractTicketDescription(product);
  if (!ticketDescription) {
    return [];
  }

  const sentenceStops = ticketDescription
    .split(/\.(?:\s+|$)/)
    .map(item => cleanText(item))
    .filter((item): item is string => Boolean(item))
    .slice(0, 3)
    .map((item, index) => ({
      title: `Tour segment ${index + 1}`,
      description: item,
    }));

  return sentenceStops;
};

const extractDurationText = (
  product: Record<string, unknown>,
  itinerary: Engine6ItineraryItem[]
) => {
  const duration = asRecord(product.duration);

  const itineraryDuration = itinerary
    .map(item => item.duration)
    .find((item): item is string => Boolean(item));

  const ticketDescription = extractTicketDescription(product);
  const ticketDurationMatch = ticketDescription?.match(
    /(\d+\s*(?:hours?|hrs?|minutes?|mins?|days?))/i
  );

  return (
    cleanText(duration?.formatted) ??
    cleanText(duration?.text) ??
    cleanText(duration?.description) ??
    cleanText(product.duration) ??
    itineraryDuration ??
    ticketDurationMatch?.[1]
  );
};

const extractFaqs = (product: Record<string, unknown>): Engine6FaqItem[] => {
  const ticketInfo = asRecord(product.ticketInfo);
  const candidates = [
    ...asArray(product.faqs),
    ...asArray(product.faq),
    ...asArray(ticketInfo?.faqs),
  ];

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

const extractHighlights = (product: Record<string, unknown>) => {
  const directHighlights = toStringArray(product.highlights);
  if (directHighlights.length > 0) {
    return directHighlights;
  }

  const ticketInfo = asRecord(product.ticketInfo);
  const fromTicketInfo = [
    ...toStringArray(ticketInfo?.highlights),
    ...toStringArray(ticketInfo?.bulletPoints),
  ];

  if (fromTicketInfo.length > 0) {
    return fromTicketInfo;
  }

  const descriptionText =
    cleanText(product.description) ??
    cleanText(asRecord(product.description)?.text) ??
    extractTicketDescription(product) ??
    "";

  return descriptionText
    .split(/\n|•|\s-\s/)
    .map(item => cleanText(item))
    .filter((item): item is string => Boolean(item))
    .slice(0, 6);
};

const extractOverview = (product: Record<string, unknown>) => {
  const ticketDescription = extractTicketDescription(product);

  return (
    cleanText(asRecord(product.description)?.text) ??
    cleanText(product.description) ??
    cleanText(product.shortDescription) ??
    cleanText(product.summary) ??
    ticketDescription ??
    ""
  );
};

const ensureLongOverview = (overview: string, highlights: string[]) => {
  const wordCount = overview.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount >= 120 || highlights.length === 0) return overview;
  return `${overview} ${highlights.join(" ")}`.trim();
};

const extractInclusions = (product: Record<string, unknown>) => {
  const ticketInfo = asRecord(product.ticketInfo);

  return [
    ...toStringArray(product.inclusions),
    ...toStringArray(ticketInfo?.inclusions),
  ];
};

const extractExclusions = (product: Record<string, unknown>) => {
  const ticketInfo = asRecord(product.ticketInfo);

  return [
    ...toStringArray(product.exclusions),
    ...toStringArray(ticketInfo?.exclusions),
  ];
};

const extractAdditionalInfo = (product: Record<string, unknown>) => {
  const ticketInfo = asRecord(product.ticketInfo);

  return [
    ...toStringArray(product.additionalInfo),
    ...toStringArray(asRecord(product.additionalInfo)?.notes),
    ...toStringArray(ticketInfo?.notes),
    ...toStringArray(ticketInfo?.restrictions),
  ];
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

  const highlights = extractHighlights(product);
  const overview = ensureLongOverview(extractOverview(product), highlights);

  const bookingUrl =
    cleanText(product.productUrl) ??
    cleanText(product.seoUrl) ??
    cleanText(product.webURL) ??
    record.canonicalPath;

  const { fromPrice, currency, fromPriceText } = extractPrice(product);
  const { heroImage, galleryImages } = extractImages(product);

  const itinerary = extractItinerary(product);
  const faqs = extractFaqs(product);
  const { meetingPointFull, meetingPointShort } = extractMeetingPoint(product);
  const durationText = extractDurationText(product, itinerary);

  const cancellationText =
    cleanText(asRecord(product.cancellationPolicy)?.description) ??
    cleanText(product.cancellationPolicy) ??
    cleanText(asRecord(product.ticketInfo)?.cancellationPolicy);

  const inclusions = extractInclusions(product);
  const exclusions = extractExclusions(product);
  const additionalInfo = extractAdditionalInfo(product);

  const canonicalUrl = buildCanonicalUrl(record.canonicalPath);
  const seoDescription = (overview || title).slice(0, 158);

  const ratingValue =
    asNumber(product.rating) ?? asNumber(product.averageRating);
  const reviewCount = asNumber(product.reviewCount);

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
    ratingValue,
    reviewCount,
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
        typeof ratingValue === "number" &&
        typeof reviewCount === "number" &&
        reviewCount > 0
          ? {
              ratingValue,
              reviewCount,
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
