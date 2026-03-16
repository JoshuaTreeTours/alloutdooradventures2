import type {
  Engine5ExactProductImage,
  Engine5ImageVariant,
  Engine5ViatorApiTour,
} from "../types";
import {
  extractViatorDuration,
  extractViatorFaqs,
  extractViatorHighlights,
  extractViatorImages,
  extractViatorItinerary,
  extractViatorMeetingPoint,
  extractViatorPrice,
  extractViatorRating,
  extractViatorReviewCount,
} from "./extractors";

const cleanText = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
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
const rankVariant = (variant: Engine5ImageVariant): number => {
  const width = variant.width ?? 0;
  const height = variant.height ?? 0;
  const hasLandscapeShape = width > height;
  const isPreferredLandscape = hasLandscapeShape && width >= 1100;
  const area = width * height;

  if (isPreferredLandscape) {
    return 3_000_000_000 + area;
  }

  if (hasLandscapeShape) {
    return 2_000_000_000 + area;
  }

  return 1_000_000_000 + area;
};

const selectCanonicalHero = (exactProductImages: Engine5ExactProductImage[]) => {
  const withVariants = exactProductImages.filter(image => image.variants.length > 0);
  const coverImages = withVariants.filter(image => image.isCover);
  const candidates = coverImages.length > 0 ? coverImages : withVariants;

  const allCandidateUrls = Array.from(
    new Set(
      exactProductImages.flatMap(image => image.variants.map(variant => variant.url))
    )
  );

  if (candidates.length === 0) {
    return {
      canonicalHeroUrl: undefined,
      heroSelectionSource: "missing" as const,
      heroSelectionSize: undefined,
      candidateUrls: allCandidateUrls,
    };
  }

  const selectedVariant = candidates
    .flatMap(image => image.variants)
    .sort((a, b) => rankVariant(b) - rankVariant(a))[0];

  if (!selectedVariant) {
    return {
      canonicalHeroUrl: undefined,
      heroSelectionSource: "missing" as const,
      heroSelectionSize: undefined,
      candidateUrls: allCandidateUrls,
    };
  }

  return {
    canonicalHeroUrl: selectedVariant.url,
    heroSelectionSource: "api-images-payload" as const,
    heroSelectionSize: {
      width: selectedVariant.width,
      height: selectedVariant.height,
    },
    candidateUrls: allCandidateUrls,
  };
};

export const getEngine5ViatorTourData = async (
  productCode: string
): Promise<Engine5ViatorApiTour> => {
  const normalizedCode = productCode.trim().toUpperCase();
  if (!normalizedCode) {
    throw new Error("Engine5 requires a Viator product code");
  }

  const response = await fetch(
    `/api/engine5/viator-product?productCode=${encodeURIComponent(normalizedCode)}`
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Engine5 Viator API unavailable for ${normalizedCode}: ${response.status} ${errorBody}`
    );
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const product =
    (payload.product as Record<string, unknown> | undefined) ?? payload;

  const title = cleanText(product.title) ?? cleanText(product.productTitle);
  const description =
    cleanText(product.shortDescription) ??
    cleanText(product.summary) ??
    cleanText(asRecord(product.description)?.text) ??
    cleanText(product.description);
  const bookingUrl = cleanText(product.productUrl) ?? cleanText(product.seoUrl);
  const exactProductImages = extractViatorImages(product)?.value ?? [];
  const heroSelection = selectCanonicalHero(exactProductImages);

  if (
    !title ||
    !description ||
    !bookingUrl ||
    !heroSelection.canonicalHeroUrl ||
    heroSelection.heroSelectionSource === "missing"
  ) {
    throw new Error(
      `Engine5 Viator API payload incomplete for ${normalizedCode}: required fields missing`
    );
  }

  const price = extractViatorPrice(product);
  const rating = extractViatorRating(product);
  const reviewCount = extractViatorReviewCount(product);
  const duration = extractViatorDuration(product);
  const meetingPoint = extractViatorMeetingPoint(product);
  const itinerary = extractViatorItinerary(product);
  const faqs = extractViatorFaqs(product);

  return {
    productCode: normalizedCode,
    title,
    description,
    bookingUrl,
    duration: duration?.value,
    startTime:
      cleanText(product.startTime) ?? cleanText(asRecord(product.schedule)?.startTime),
    fromPrice: price?.formattedPrice ?? (typeof price?.amount === "number" ? String(price.amount) : undefined),
    priceCurrency: cleanText(product.currencyCode),
    rating: rating?.value,
    reviewCount: reviewCount?.value,
    meetingPoint: meetingPoint?.value,
    cancellationPolicy: cleanText(product.cancellationPolicy),
    itinerary: itinerary?.value ?? [],
    highlights: extractViatorHighlights(product),
    faqs: faqs?.value ?? [],
    inclusions: toStringArray(product.inclusions),
    exclusions: toStringArray(product.exclusions),
    additionalInfo: toStringArray(product.additionalInfo),
    exactProductImages,
    canonicalHeroUrl: heroSelection.canonicalHeroUrl,
    heroSelectionSource: heroSelection.heroSelectionSource,
    heroSelectionSize: heroSelection.heroSelectionSize,
    heroSelectionDiagnostics: {
      candidateUrls: heroSelection.candidateUrls,
    },
    provenance: {
      apiFetchAttempted: true,
      apiFetchSucceeded: true,
      descriptionSource: "api",
    },
  };
};
