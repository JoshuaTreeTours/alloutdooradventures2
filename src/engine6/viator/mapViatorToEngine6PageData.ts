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

const isValidCommercialPrice = (value: number | undefined) =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const isFreeProduct = (product: Record<string, unknown>) => {
  const candidateText = [
    cleanText(product.title),
    cleanText(product.description),
    cleanText(asRecord(product.ticketInfo)?.ticketDescription),
  ]
    .filter((entry): entry is string => Boolean(entry))
    .join(" ")
    .toLowerCase();

  return /\bfree\b/.test(candidateText);
};

const sanitizePriceText = (value: string | undefined) => {
  if (!value) return undefined;
  const numeric = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  if (Number.isFinite(numeric) && numeric <= 0) return undefined;
  return value;
};

const extractPrice = (product: Record<string, unknown>) => {
  const pricingInfo = asRecord(product.pricingInfo);
  const pricingSummary = asRecord(pricingInfo?.summary);
  const legacyPricingSummary = asRecord(product.pricingSummary);
  const ticketInfo = asRecord(product.ticketInfo);

  const ticketTypeRows = asArray(product.ticketTypes)
    .map(item => asRecord(item))
    .filter((row): row is Record<string, unknown> => Boolean(row));

  const prioritizedNumericCandidates: Array<number | undefined> = [
    extractNumericPrice(pricingSummary?.fromPrice),
    extractNumericPrice(pricingInfo?.fromPrice),
    extractNumericPrice(pricingSummary?.price),
    extractNumericPrice(pricingInfo?.price),
    extractNumericPrice(pricingSummary?.adult),
    extractNumericPrice(pricingSummary?.traveler),
    extractNumericPrice(ticketInfo?.price),
    extractNumericPrice(legacyPricingSummary?.fromPrice),
    extractNumericPrice(legacyPricingSummary?.price),
  ];

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

  const scannedNumericPrice =
    findFirstNumericPrice(product.pricingInfo) ??
    findFirstNumericPrice(product.ticketTypes) ??
    findFirstNumericPrice(ticketInfo?.price);

  const firstValidPriority = prioritizedNumericCandidates.find(isValidCommercialPrice);
  const fallbackTicketTypePrice = ticketTypePrices.find(isValidCommercialPrice);
  const fallbackScannedPrice = isValidCommercialPrice(scannedNumericPrice)
    ? scannedNumericPrice
    : undefined;

  const freeProduct = isFreeProduct(product);
  const fromPrice =
    firstValidPriority ??
    fallbackTicketTypePrice ??
    fallbackScannedPrice ??
    (freeProduct
      ? prioritizedNumericCandidates.find(num => typeof num === "number")
      : undefined);

  const currency =
    cleanText(pricingInfo?.currencyCode) ??
    cleanText(pricingSummary?.currencyCode) ??
    cleanText(legacyPricingSummary?.currency) ??
    cleanText(asRecord(pricingSummary?.fromPrice)?.currencyCode) ??
    cleanText(asRecord(pricingSummary?.fromPrice)?.currency) ??
    cleanText(product.currencyCode);

  const rawTextPrice =
    extractPriceText(pricingSummary?.fromPrice) ??
    extractPriceText(pricingInfo?.fromPrice) ??
    extractPriceText(pricingSummary?.price) ??
    extractPriceText(pricingInfo?.price) ??
    findFirstPriceText(product.pricingInfo) ??
    findFirstPriceText(product.ticketTypes);

  const fromPriceText = sanitizePriceText(rawTextPrice);

  return {
    fromPrice: isValidCommercialPrice(fromPrice) || freeProduct ? fromPrice : undefined,
    currency,
    fromPriceText,
  };
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

const collectItineraryArrays = (value: unknown, depth = 0): unknown[][] => {
  if (depth > 5) return [];

  if (Array.isArray(value)) {
    if (
      value.some(item => {
        const row = asRecord(item);
        return Boolean(
          row &&
            (row.title || row.name || row.description || row.stopName || row.pointOfInterest)
        );
      })
    ) {
      return [value];
    }

    return value.flatMap(item => collectItineraryArrays(item, depth + 1));
  }

  const row = asRecord(value);
  if (!row) return [];

  return Object.values(row).flatMap(entry => collectItineraryArrays(entry, depth + 1));
};

const normalizeItineraryStop = (item: unknown): Engine6ItineraryItem | undefined => {
  const row = asRecord(item);
  if (!row) return undefined;

  const poi = asRecord(row.pointOfInterest);
  const location = asRecord(row.location);

  const title =
    cleanText(row.title) ??
    cleanText(row.name) ??
    cleanText(row.stopName) ??
    cleanText(poi?.title) ??
    cleanText(poi?.name) ??
    cleanText(location?.name) ??
    cleanText(row.label);

  const description =
    cleanText(row.description) ??
    cleanText(row.summary) ??
    cleanText(row.details) ??
    cleanText(row.commentary) ??
    cleanText(poi?.description) ??
    cleanText(location?.description);

  if (!title && !description) return undefined;

  return {
    title: title ?? "Tour stop",
    description,
    duration:
      cleanText(row.duration) ??
      cleanText(row.durationText) ??
      cleanText(row.length) ??
      cleanText(asRecord(row.timeAtLocation)?.formatted),
  };
};

const extractItinerary = (
  product: Record<string, unknown>
): Engine6ItineraryItem[] => {
  const ticketInfo = asRecord(product.ticketInfo);
  const variants = asArray(product.variants)
    .map(item => asRecord(item))
    .filter((item): item is Record<string, unknown> => Boolean(item));

  const directCandidates: unknown[] = [
    product.itinerary,
    product.itineraryItems,
    product.stops,
    asRecord(product.itinerary)?.items,
    asRecord(product.itinerary)?.itineraryItems,
    asRecord(product.itinerary)?.stopPoints,
    ticketInfo?.itinerary,
    ticketInfo?.items,
    ticketInfo?.stops,
    ...variants.map(item => item.itinerary),
  ];

  const allArrays = directCandidates.flatMap(candidate => collectItineraryArrays(candidate));

  const normalized = allArrays
    .flatMap(items => items.map(normalizeItineraryStop))
    .filter((item): item is Engine6ItineraryItem => Boolean(item));

  const deduped = normalized.filter(
    (item, index, list) =>
      list.findIndex(existing => existing.title === item.title) === index
  );

  if (deduped.length > 0) {
    return deduped;
  }

  const fallbackNarrative =
    extractTicketDescription(product) ??
    cleanText(asRecord(product.description)?.text) ??
    cleanText(product.description);

  if (!fallbackNarrative) {
    return [];
  }

  return fallbackNarrative
    .split(/\.(?:\s+|$)/)
    .map(item => cleanText(item))
    .filter((item): item is string => Boolean(item))
    .slice(0, 4)
    .map((item, index) => ({
      title: `Tour segment ${index + 1}`,
      description: item,
    }));
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

const extractRawFaqs = (product: Record<string, unknown>): Engine6FaqItem[] => {
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

const deriveFallbackFaqs = ({
  meetingPoint,
  durationText,
  cancellationText,
  inclusions,
  exclusions,
  additionalInfo,
}: {
  meetingPoint?: string;
  durationText?: string;
  cancellationText?: string;
  inclusions: string[];
  exclusions: string[];
  additionalInfo: string[];
}): Engine6FaqItem[] => {
  const faqs: Engine6FaqItem[] = [];

  if (meetingPoint) {
    faqs.push({
      question: "Where is the meeting point for this tour?",
      answer: meetingPoint,
    });
  }

  if (durationText) {
    faqs.push({
      question: "How long does this tour take?",
      answer: durationText,
    });
  }

  if (cancellationText) {
    faqs.push({
      question: "What is the cancellation policy?",
      answer: cancellationText,
    });
  }

  if (inclusions.length > 0) {
    faqs.push({
      question: "What is included in the tour price?",
      answer: inclusions.slice(0, 4).join("; "),
    });
  }

  if (exclusions.length > 0) {
    faqs.push({
      question: "What is not included in the tour price?",
      answer: exclusions.slice(0, 4).join("; "),
    });
  }

  if (additionalInfo.length > 0) {
    faqs.push({
      question: "Is there anything else I should know before booking?",
      answer: additionalInfo.slice(0, 4).join("; "),
    });
  }

  return faqs;
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
  const { meetingPointFull, meetingPointShort } = extractMeetingPoint(product);
  const durationText = extractDurationText(product, itinerary);

  const cancellationText =
    cleanText(asRecord(product.cancellationPolicy)?.description) ??
    cleanText(product.cancellationPolicy) ??
    cleanText(asRecord(product.ticketInfo)?.cancellationPolicy);

  const inclusions = extractInclusions(product);
  const exclusions = extractExclusions(product);
  const additionalInfo = extractAdditionalInfo(product);

  const rawFaqs = extractRawFaqs(product);
  const faqs =
    rawFaqs.length > 0
      ? rawFaqs
      : deriveFallbackFaqs({
          meetingPoint: meetingPointFull ?? meetingPointShort,
          durationText,
          cancellationText,
          inclusions,
          exclusions,
          additionalInfo,
        });

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
