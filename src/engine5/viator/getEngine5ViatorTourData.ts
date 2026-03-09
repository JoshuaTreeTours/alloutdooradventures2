import type { Engine5ViatorApiTour } from "../types";

const cleanText = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;

const asImage = (value: unknown): string | undefined => {
  const url = cleanText(value);
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? url
      : undefined;
  } catch {
    return undefined;
  }
};

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .map(item => cleanText(item))
        .filter((item): item is string => Boolean(item))
    : [];

const extractItinerary = (product: Record<string, unknown>) => {
  const raw =
    (product.itineraryItems as unknown[]) ??
    (product.itinerary as unknown[]) ??
    [];

  if (!Array.isArray(raw)) return [];

  return raw
    .map(item => {
      const row = asRecord(item);
      if (!row) return undefined;
      const title =
        cleanText(row.title) ?? cleanText(row.name) ?? cleanText(row.label);
      const description = cleanText(row.description) ?? cleanText(row.summary);
      const duration = cleanText(row.duration) ?? cleanText(row.durationText);
      if (!title) return undefined;
      return { title, description, duration };
    })
    .filter(
      (
        item
      ): item is { title: string; description?: string; duration?: string } =>
        Boolean(item)
    );
};

const extractGalleryImages = (product: Record<string, unknown>): string[] => {
  const images = Array.isArray(product.images) ? product.images : [];
  const urls = images.flatMap(image => {
    const row = asRecord(image);
    if (!row) return [] as string[];
    const direct = asImage(row.url);
    const variants = Array.isArray(row.variants) ? row.variants : [];
    const variantUrls = variants
      .map(variant => asImage(asRecord(variant)?.url))
      .filter((url): url is string => Boolean(url));
    return direct ? [direct, ...variantUrls] : variantUrls;
  });

  return Array.from(new Set(urls));
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
  const sourceUrl = cleanText(product.productUrl) ?? cleanText(product.seoUrl);
  const galleryImages = extractGalleryImages(product);
  const primaryImageUrl = galleryImages[0];

  if (!title || !description || !sourceUrl || !primaryImageUrl) {
    throw new Error(
      `Engine5 Viator API payload incomplete for ${normalizedCode}: required fields missing`
    );
  }

  return {
    productCode: normalizedCode,
    title,
    description,
    sourceUrl,
    duration: cleanText(product.duration) ?? cleanText(product.durationText),
    fromPrice: cleanText(product.priceFrom) ?? cleanText(product.fromPrice),
    priceCurrency: cleanText(product.currencyCode),
    rating: typeof product.rating === "number" ? product.rating : undefined,
    reviewCount:
      typeof product.reviewCount === "number" ? product.reviewCount : undefined,
    meetingPoint: cleanText(product.meetingPoint),
    cancellationPolicy: cleanText(product.cancellationPolicy),
    itinerary: extractItinerary(product),
    inclusions: toStringArray(product.inclusions),
    exclusions: toStringArray(product.exclusions),
    additionalInfo: toStringArray(product.additionalInfo),
    primaryImageUrl,
    galleryImages,
    provenance: {
      apiFetchAttempted: true,
      apiFetchSucceeded: true,
      heroImageSource: "api",
      listingImageSource: "api",
      descriptionSource: "api",
    },
  };
};
