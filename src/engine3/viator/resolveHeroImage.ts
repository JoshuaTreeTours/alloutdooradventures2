import { viatorTours } from "../data/viatorTours";
import { VIATOR_PLACEHOLDER_SVG } from "../../utils/viatorPlaceholderSvg";

type ResolveViatorHeroInput = {
  bookingProvider?: string;
  productCode?: string;
  heroImageOverride?: string;
  heroImageOverrideUrl?: string;
  primaryImageUrl?: string;
  coverImageUrl?: string;
  imageCandidates?: Array<string | undefined | null>;
  galleryImages?: Array<string | undefined | null>;
  supplierImage?: string;
};

const cleanText = (value?: string | null): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeUrl = (value?: string | null): string | undefined => {
  const cleaned = cleanText(value);
  if (!cleaned) {
    return undefined;
  }

  try {
    return new URL(cleaned).toString();
  } catch {
    return undefined;
  }
};

const hasCaptionPath = (pathAndQuery: string): boolean =>
  pathAndQuery.toLowerCase().includes("/caption.jpg");

const hasThumbnailResizeQuery = (url: URL): boolean => {
  const query = url.searchParams;
  return ["w", "h", "s", "width", "height"].some(key => query.has(key));
};

export const isApprovedViatorImageUrl = (urlValue?: string | null): boolean => {
  const normalized = normalizeUrl(urlValue);
  if (!normalized) {
    return false;
  }

  const parsed = new URL(normalized);
  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.toLowerCase();
  const pathAndQuery = `${path}${parsed.search.toLowerCase()}`;

  if (hasCaptionPath(pathAndQuery)) {
    return false;
  }

  if (host.includes("dynamic-media.tacdn.com")) {
    return false;
  }

  if (!host.includes("media.tacdn.com")) {
    return false;
  }

  if (path.startsWith("/media/attractions-splice-")) {
    return true;
  }

  if (path.startsWith("/media/photo-")) {
    return !hasThumbnailResizeQuery(parsed);
  }

  return false;
};

const getHeroOverrideFromCatalog = (
  productCode?: string
): string | undefined => {
  if (!productCode) {
    return undefined;
  }

  const match = viatorTours.find(
    item => item.viator.productCode.toUpperCase() === productCode.toUpperCase()
  );

  return cleanText(match?.viator.heroImageOverrideUrl);
};

const pickPreferredApprovedImage = (
  images: Array<string | undefined | null>
): string | undefined => {
  const approved = Array.from(
    new Set(
      images
        .map(image => normalizeUrl(image))
        .filter((image): image is string =>
          Boolean(image && isApprovedViatorImageUrl(image))
        )
    )
  );

  const mediaTacdn = approved.find(image =>
    new URL(image).hostname.toLowerCase().includes("media.tacdn.com")
  );
  return mediaTacdn ?? approved[0];
};

const pickGalleryImage = (
  images: Array<string | undefined | null>
): string | undefined => {
  const normalized = Array.from(
    new Set(
      images
        .map(image => normalizeUrl(image))
        .filter((image): image is string => Boolean(image))
    )
  );

  const approved = normalized.filter(image => isApprovedViatorImageUrl(image));
  if (approved.length === 0) {
    return undefined;
  }

  const mediaTacdn = approved.find(image =>
    new URL(image).hostname.toLowerCase().includes("media.tacdn.com")
  );
  return mediaTacdn ?? approved[0];
};

export const resolveEngine3ViatorHero = (
  input: ResolveViatorHeroInput
): string | null => {
  if (input.bookingProvider && input.bookingProvider !== "viator") {
    return null;
  }

  const explicitOverride =
    cleanText(input.heroImageOverride) ??
    cleanText(input.heroImageOverrideUrl) ??
    getHeroOverrideFromCatalog(input.productCode);

  if (explicitOverride && isApprovedViatorImageUrl(explicitOverride)) {
    return explicitOverride;
  }

  const apiPrimary = pickPreferredApprovedImage([
    input.primaryImageUrl,
    input.coverImageUrl,
    ...(input.imageCandidates ?? []),
    input.supplierImage,
  ]);

  if (apiPrimary) {
    return apiPrimary;
  }

  const galleryImage = pickGalleryImage(
    input.galleryImages ?? input.imageCandidates ?? []
  );
  if (galleryImage) {
    return galleryImage;
  }

  return VIATOR_PLACEHOLDER_SVG;
};
