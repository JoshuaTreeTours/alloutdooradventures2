import { viatorTours } from "../data/viatorTours";

const cleanText = (value?: string | null): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const parseUrl = (value?: string): URL | null => {
  const cleaned = cleanText(value);
  if (!cleaned) {
    return null;
  }

  try {
    return new URL(cleaned);
  } catch {
    return null;
  }
};

const normalizeViatorImageUrl = (value?: string): string | undefined => {
  const parsed = parseUrl(value);
  if (!parsed) {
    return undefined;
  }

  return parsed.toString();
};

const isImageExtension = (pathname: string) =>
  /\.(jpg|jpeg|png|webp|gif)$/i.test(pathname.toLowerCase());

export const isApprovedViatorStableImageUrl = (value?: string): boolean => {
  const parsed = parseUrl(value);
  if (!parsed) {
    return false;
  }

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.toLowerCase();

  if (host.includes("dynamic-media.tacdn.com")) {
    return false;
  }

  if (!host.includes("media.tacdn.com")) {
    return false;
  }

  if (!isImageExtension(path)) {
    return false;
  }

  if (path.includes("/media/attractions-splice-")) {
    return true;
  }

  if (path.includes("/media/photo-") && !path.endsWith("/caption.jpg")) {
    return true;
  }

  return false;
};

export const isApprovedViatorDynamicCaptionUrl = (value?: string): boolean => {
  const parsed = parseUrl(value);
  if (!parsed) {
    return false;
  }

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.toLowerCase();

  if (host !== "dynamic-media.tacdn.com") {
    return false;
  }

  return path.startsWith("/media/photo-o/") && path.endsWith("/caption.jpg");
};

const resolveApprovedImage = (
  value?: string | null,
  options?: { allowDynamicCaption?: boolean }
): string | undefined => {
  const normalized = normalizeViatorImageUrl(value ?? undefined);
  if (!normalized) {
    return undefined;
  }

  if (isApprovedViatorStableImageUrl(normalized)) {
    return normalized;
  }

  if (options?.allowDynamicCaption && isApprovedViatorDynamicCaptionUrl(normalized)) {
    return normalized;
  }

  return undefined;
};

const getHeroOverride = (productCode?: string): string | undefined => {
  const code = cleanText(productCode);
  if (!code) {
    return undefined;
  }

  const entry = viatorTours.find(
    tour => tour.viator.productCode.toLowerCase() === code.toLowerCase()
  );

  return resolveApprovedImage(entry?.viator.heroImageOverrideUrl, {
    allowDynamicCaption: true,
  });
};

const pickGalleryImage = (images?: string[]): string | undefined => {
  if (!images?.length) {
    return undefined;
  }

  for (const image of images) {
    const stable = resolveApprovedImage(image);
    if (stable) {
      return stable;
    }
  }

  for (const image of images) {
    const dynamic = resolveApprovedImage(image, { allowDynamicCaption: true });
    if (dynamic && isApprovedViatorDynamicCaptionUrl(dynamic)) {
      return dynamic;
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
  const explicitOverride = resolveApprovedImage(input.heroImageOverride, {
    allowDynamicCaption: true,
  });
  if (explicitOverride) {
    return explicitOverride;
  }

  const tourOverride = getHeroOverride(input.productCode);
  if (tourOverride) {
    return tourOverride;
  }

  const primaryImage = resolveApprovedImage(input.primaryImageUrl, {
    allowDynamicCaption: true,
  });
  if (primaryImage) {
    return primaryImage;
  }

  const coverImage = resolveApprovedImage(input.coverImageUrl, {
    allowDynamicCaption: true,
  });
  if (coverImage) {
    return coverImage;
  }

  return pickGalleryImage(input.imageGallery) ?? null;
};

export const resolveEngine3ViatorHero = resolveViatorHeroImage;
