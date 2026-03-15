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

const isValidCommercialPrice = (value: number | undefined) =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const sanitizePriceText = (value: string | undefined) => {
  if (!value) return undefined;
  const numeric = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  if (Number.isFinite(numeric) && numeric <= 0) return undefined;
  return value;
};

const formatMinutesToDuration = (minutes: number | undefined) => {
  if (typeof minutes !== "number" || !Number.isFinite(minutes) || minutes <= 0) {
    return undefined;
  }

  if (minutes < 60) {
    return `${Math.round(minutes)} minutes`;
  }

  const hours = minutes / 60;
  if (Number.isInteger(hours)) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  return `${hours.toFixed(1).replace(/\.0$/, "")} hours`;
};

const extractPrice = (product: Record<string, unknown>) => {
  const attempts: string[] = [
    "product.pricingSummary.fromPrice.amount",
    "product.pricingInfo.summary.fromPrice",
    "product.pricingInfo.fromPrice",
    "product.ticketTypes[].pricingInfo.summary.fromPrice",
  ];

  const pricingSummary = asRecord(product.pricingSummary);
  const summaryFromPrice = asRecord(pricingSummary?.fromPrice);

  const pricingInfo = asRecord(product.pricingInfo);
  const pricingInfoSummary = asRecord(pricingInfo?.summary);

  const ticketTypeRows = asArray(product.ticketTypes)
    .map(item => asRecord(item))
    .filter((row): row is Record<string, unknown> => Boolean(row));

  const ticketTypePrices = ticketTypeRows
    .map(row => {
      const rowPricing = asRecord(row.pricingInfo);
      const rowSummary = asRecord(rowPricing?.summary);
      return (
        extractNumericPrice(rowSummary?.fromPrice) ??
        extractNumericPrice(rowPricing?.fromPrice)
      );
    })
    .filter((value): value is number => typeof value === "number");

  const candidates: Array<{ path: string; value: number | undefined }> = [
    {
      path: "product.pricingSummary.fromPrice.amount",
      value: extractNumericPrice(summaryFromPrice?.amount),
    },
    {
      path: "product.pricingInfo.summary.fromPrice",
      value: extractNumericPrice(pricingInfoSummary?.fromPrice),
    },
    {
      path: "product.pricingInfo.fromPrice",
      value: extractNumericPrice(pricingInfo?.fromPrice),
    },
    {
      path: "product.ticketTypes[].pricingInfo.summary.fromPrice",
      value: ticketTypePrices.length ? Math.min(...ticketTypePrices) : undefined,
    },
  ];

  const resolved = candidates.find(candidate => isValidCommercialPrice(candidate.value));

  const fromPrice = resolved?.value;
  const resolvedPath = resolved?.path;

  const currency =
    cleanText(summaryFromPrice?.currency) ??
    cleanText(pricingSummary?.currency) ??
    cleanText(asRecord(pricingInfoSummary?.fromPrice)?.currencyCode) ??
    cleanText(pricingInfo?.currencyCode) ??
    cleanText(product.currencyCode);

  const fromPriceText =
    sanitizePriceText(
      cleanText(summaryFromPrice?.formatted) ??
        cleanText(summaryFromPrice?.display) ??
        cleanText(summaryFromPrice?.text) ??
        extractPriceText(pricingInfoSummary?.fromPrice) ??
        extractPriceText(pricingInfo?.fromPrice)
    ) ??
    (typeof fromPrice === "number" && fromPrice > 0
      ? `${currency ?? "USD"} ${fromPrice.toFixed(2)}`
      : undefined);

  return {
    fromPrice,
    currency,
    fromPriceText,
    attemptedPaths: attempts,
    resolvedPath,
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
  const logistics = asRecord(product.logistics);
  const startLocation = asRecord(logistics?.startLocation);
  const address = asRecord(startLocation?.address);

  const full =
    cleanText(startLocation?.fullAddress) ??
    cleanText(startLocation?.description) ??
    cleanText(startLocation?.name) ??
    cleanText(address?.fullAddress) ??
    cleanText(address?.streetAddress) ??
    cleanText(address?.addressLine1);

  const short = cleanText(startLocation?.name) ?? full?.split(",")[0]?.trim();

  return { meetingPointFull: full, meetingPointShort: short };
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
  const itinerary = asRecord(product.itinerary);
  const itineraryItems = asArray(itinerary?.items);

  const mapped = itineraryItems
    .map(normalizeItineraryStop)
    .filter((item): item is Engine6ItineraryItem => Boolean(item));

  if (mapped.length > 0) {
    return mapped;
  }

  return [];
};

const extractDurationText = (
  product: Record<string, unknown>,
  itinerary: Engine6ItineraryItem[]
) => {
  const duration = asRecord(product.duration);
  const durationMinutes = asNumber(duration?.fixedDurationInMinutes);
  const fromMinutes = formatMinutesToDuration(durationMinutes);

  const itineraryDuration = itinerary
    .map(item => item.duration)
    .find((item): item is string => Boolean(item));

  return fromMinutes ?? itineraryDuration;
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

  const { fromPrice, currency, fromPriceText, attemptedPaths, resolvedPath } =
    extractPrice(product);
  const { heroImage, galleryImages } = extractImages(product);

  const itinerary = extractItinerary(product);
  const { meetingPointFull, meetingPointShort } = extractMeetingPoint(product);
  const durationText = extractDurationText(product, itinerary);

  const cancellationText =
    cleanText(product.cancellationPolicy) ??
    cleanText(asRecord(product.cancellationPolicy)?.description);

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

  const reviewSummary = asRecord(product.reviewSummary);
  const reviews = asRecord(product.reviews);
  const ratingValue =
    asNumber(product.rating) ??
    asNumber(product.averageRating) ??
    asNumber(reviewSummary?.averageRating) ??
    asNumber(reviews?.combinedAverageRating) ??
    asNumber(reviews?.averageRating);
  const reviewCount =
    asNumber(product.reviewCount) ??
    asNumber(reviewSummary?.totalReviews) ??
    asNumber(reviews?.totalReviews) ??
    asNumber(reviews?.count);

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
    priceDebug: {
      attemptedPaths,
      resolvedPath,
    },
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
