import type { Engine4ViatorApiTour } from "../types";

const TACDN_SOURCE_REGEX =
  /https:\/\/dynamic-media\.tacdn\.com\/media\/photo-o\/[^"'\s>]+/i;

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;

const asValidImageUrl = (value: unknown): string | undefined => {
  const candidate = asString(value);
  if (!candidate) {
    return undefined;
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return undefined;
    }
    return candidate;
  } catch {
    return undefined;
  }
};

const extractFromVariantObject = (
  variants: Record<string, unknown> | undefined
): string | undefined => {
  if (!variants) {
    return undefined;
  }

  return (
    asValidImageUrl(asRecord(variants.large)?.url ?? variants.large) ??
    asValidImageUrl(asRecord(variants.hero)?.url ?? variants.hero) ??
    asValidImageUrl(asRecord(variants.medium)?.url ?? variants.medium)
  );
};

const extractApiImage = (
  product: Record<string, unknown>
): string | undefined => {
  const firstImage = Array.isArray(product.images)
    ? asRecord(product.images[0])
    : undefined;

  const variantsArray = Array.isArray(firstImage?.variants)
    ? (firstImage?.variants as unknown[])
    : [];
  const preferredVariant =
    variantsArray
      .map(variant => asRecord(variant))
      .find(variant => {
        const name = asString(variant?.name)?.toLowerCase();
        return name === "large" || name === "hero" || name === "medium";
      }) ?? asRecord(variantsArray[0]);
  const variantArrayUrl = asValidImageUrl(preferredVariant?.url);
  if (variantArrayUrl) {
    return variantArrayUrl;
  }

  const mappedVariant = extractFromVariantObject(
    asRecord(firstImage?.variants)
  );
  if (mappedVariant) {
    return mappedVariant;
  }

  return (
    asValidImageUrl(firstImage?.url) ??
    asValidImageUrl(product.primaryImageUrl) ??
    asValidImageUrl(product.sourceDerivedImageUrl)
  );
};

const normalizeSourceBlob = (source: unknown): string => {
  if (typeof source === "string") {
    return source;
  }

  if (source === undefined || source === null) {
    return "";
  }

  try {
    return JSON.stringify(source);
  } catch {
    return "";
  }
};

const extractTacdnFromSource = (
  product: Record<string, unknown>
): string | undefined => {
  const source =
    normalizeSourceBlob(product.sourceHtml) ||
    normalizeSourceBlob(product.sourcePayload) ||
    normalizeSourceBlob(product.sourceCode) ||
    normalizeSourceBlob(product.rawProductPayload);

  if (!source) {
    return undefined;
  }

  const match = source.match(TACDN_SOURCE_REGEX);
  return asValidImageUrl(match?.[0]);
};

const extractFallbackImage = (
  product: Record<string, unknown>
): string | undefined =>
  asValidImageUrl(product.fallbackImage) ?? asValidImageUrl(product.heroImage);

export const resolveViatorPrimaryImageWithProvenance = (product: unknown) => {
  const productRecord = asRecord(product);
  if (!productRecord) {
    return {
      primaryImage: undefined,
      apiImageFound: false,
      tacdnFound: false,
      fallbackUsed: false,
      fallbackReason: "invalid product payload",
    };
  }

  const apiImage = extractApiImage(productRecord);
  if (apiImage) {
    return {
      primaryImage: apiImage,
      apiImageFound: true,
      tacdnFound: false,
      fallbackUsed: false,
      fallbackReason: undefined,
    };
  }

  const tacdnImage = extractTacdnFromSource(productRecord);
  if (tacdnImage) {
    return {
      primaryImage: tacdnImage,
      apiImageFound: false,
      tacdnFound: true,
      fallbackUsed: false,
      fallbackReason: undefined,
    };
  }

  const fallbackImage = extractFallbackImage(productRecord);
  if (fallbackImage) {
    return {
      primaryImage: fallbackImage,
      apiImageFound: false,
      tacdnFound: false,
      fallbackUsed: true,
      fallbackReason:
        "no valid API image variant URL and no TACDN image extracted from source",
    };
  }

  return {
    primaryImage: undefined,
    apiImageFound: false,
    tacdnFound: false,
    fallbackUsed: false,
    fallbackReason:
      "no valid API image variant URL, no TACDN source image, and no approved fallback record image",
  };
};

export const resolveViatorPrimaryImage = (
  product: unknown
): string | undefined =>
  resolveViatorPrimaryImageWithProvenance(product).primaryImage;

export const resolveViatorPrimaryImageFromApiTour = (
  apiTour: Engine4ViatorApiTour | undefined
): string | undefined => {
  if (!apiTour) {
    return undefined;
  }

  return resolveViatorPrimaryImage(apiTour.rawProductPayload ?? apiTour);
};
