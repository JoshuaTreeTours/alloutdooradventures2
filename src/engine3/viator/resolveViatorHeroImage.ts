import { viatorTours } from "../data/viatorTours";

const ALLOWED_TACDN_HOST_PATTERN =
  /(?:^|\.)dynamic-media\.tacdn\.com$|(?:^|\.)media\.tacdn\.com$/i;

const ALLOWED_EXTENSION_PATTERN = /\.(jpg|jpeg|png|webp|gif)$/i;

const cleanText = (value?: string | null): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeViatorImageUrl = (value?: string): string | undefined => {
  const cleaned = cleanText(value);
  if (!cleaned) {
    return undefined;
  }

  try {
    const parsed = new URL(cleaned);
    const host = parsed.hostname.toLowerCase();

    if (!ALLOWED_TACDN_HOST_PATTERN.test(host)) {
      return undefined;
    }

    if (!ALLOWED_EXTENSION_PATTERN.test(parsed.pathname.toLowerCase())) {
      return undefined;
    }

    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return undefined;
  }
};

const getHeroOverride = (productCode?: string): string | undefined => {
  const code = cleanText(productCode);
  if (!code) {
    return undefined;
  }

  const entry = viatorTours.find(
    tour => tour.viator.productCode.toLowerCase() === code.toLowerCase()
  );

  return normalizeViatorImageUrl(entry?.viator.heroImageOverrideUrl);
};

const firstValidGalleryImage = (images?: string[]): string | undefined => {
  if (!images?.length) {
    return undefined;
  }

  for (const image of images) {
    const normalized = normalizeViatorImageUrl(image);
    if (normalized) {
      return normalized;
    }
  }

  return undefined;
};

export const resolveViatorHeroImage = (input: {
  productCode?: string;
  heroImageOverride?: string | null;
  primaryImageUrl?: string | null;
  coverImageUrl?: string | null;
  imageGallery?: string[];
}): string | null => {
  const explicitOverride = normalizeViatorImageUrl(input.heroImageOverride ?? undefined);
  if (explicitOverride) {
    return explicitOverride;
  }

  const tourOverride = getHeroOverride(input.productCode);
  if (tourOverride) {
    return tourOverride;
  }

  const primaryImage = normalizeViatorImageUrl(input.primaryImageUrl ?? undefined);
  if (primaryImage) {
    return primaryImage;
  }

  const coverImage = normalizeViatorImageUrl(input.coverImageUrl ?? undefined);
  if (coverImage) {
    return coverImage;
  }

  return firstValidGalleryImage(input.imageGallery) ?? null;
};
