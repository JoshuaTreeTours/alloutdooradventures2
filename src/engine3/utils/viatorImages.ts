import type { ViatorProductData } from "../types";

const KNOWN_VIATOR_CDN_PATTERN =
  /(?:^|\.)dynamic-media\.tacdn\.com$|(?:^|\.)media\.tacdn\.com$|(?:^|\.)cache\.vtrcdn\.com$|(?:^|\.)cdn\.filestackcontent\.com$/i;

const IMAGE_EXTENSION_PATTERN = /\.(jpg|jpeg|png|webp)(?:$|[?#])/i;

const REJECT_PATH_PATTERN =
  /globalnav|orion\/images\/globalnav\/|globalnav\/fallback|fallback-|fallback-top-activities|logo|sprite|100x100|50x50|1x1|top-activities/i;

const normalizeImageUrl = (value?: string | null): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") {
      return undefined;
    }

    const joined = `${url.pathname}${url.search}`;
    const looksLikeImage =
      IMAGE_EXTENSION_PATTERN.test(joined) || KNOWN_VIATOR_CDN_PATTERN.test(url.hostname);

    if (!looksLikeImage || REJECT_PATH_PATTERN.test(joined)) {
      return undefined;
    }

    return url.toString();
  } catch {
    return undefined;
  }
};

const firstValid = (values: Array<string | null | undefined>): string | undefined => {
  for (const value of values) {
    const normalized = normalizeImageUrl(value);
    if (normalized) {
      return normalized;
    }
  }
  return undefined;
};

const getPreferredCandidate = (product: Partial<ViatorProductData>): string | undefined => {
  const explicitCover = firstValid([
    (product as ViatorProductData & { primaryImageUrl?: string }).primaryImageUrl,
    (product as ViatorProductData & { coverImageUrl?: string }).coverImageUrl,
    (product as ViatorProductData & { heroImageUrl?: string }).heroImageUrl,
  ]);

  if (explicitCover) {
    return explicitCover;
  }

  const listCandidate = firstValid(product.imageCandidates ?? []);
  if (listCandidate) {
    return listCandidate;
  }

  return normalizeImageUrl(product.supplierImage);
};

export const pickViatorPrimaryImage = (
  product?: Partial<ViatorProductData>
): { heroUrl?: string; cardUrl?: string } => {
  const best = product ? getPreferredCandidate(product) : undefined;

  if (!best) {
    return {};
  }

  return {
    heroUrl: best,
    cardUrl: best,
  };
};
