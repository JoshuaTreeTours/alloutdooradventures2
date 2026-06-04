const INVALID_PLACEHOLDER_TOUR_PRODUCT_IDS = new Set([
  "650824",
  "661652",
  "519110",
]);

const INVALID_PLACEHOLDER_TOUR_SLUGS = new Set([
  "full-day-tours-650824",
  "bike-661652",
  "camp-talks-519110",
  "__SEO_CANONICAL__",
  "__SEO_PLACEHOLDER__",
]);

export const INVALID_PLACEHOLDER_TOUR_PATHS = [
  "/destinations/wyoming/jackson/tours/full-day-tours-650824",
  "/destinations/california/coronado/tours/bike-661652",
  "/destinations/australia/summerlands/tours/camp-talks-519110",
  "/destinations/colorado/oak-creek/tours/__SEO_CANONICAL__",
] as const;

const normalize = (value?: string | null) => (value ?? "").trim();

const normalizePath = (value?: string | null) => {
  const normalized = normalize(value);
  return normalized.length > 1 && normalized.endsWith("/")
    ? normalized.slice(0, -1)
    : normalized;
};

export const getInvalidPlaceholderTourIds = () =>
  Array.from(INVALID_PLACEHOLDER_TOUR_PRODUCT_IDS);

export const getInvalidPlaceholderTourPaths = () =>
  Array.from(INVALID_PLACEHOLDER_TOUR_PATHS);

export const isInvalidPlaceholderTourSlug = (slug?: string | null) => {
  const normalizedSlug = normalize(slug);
  if (!normalizedSlug) {
    return false;
  }

  if (INVALID_PLACEHOLDER_TOUR_SLUGS.has(normalizedSlug)) {
    return true;
  }

  if (/__SEO_[A-Z0-9_]+__/i.test(normalizedSlug)) {
    return true;
  }

  if (/placeholder/i.test(normalizedSlug)) {
    return true;
  }

  const productId = normalizedSlug.match(/-(\d+)$/)?.[1] ?? null;
  return Boolean(
    productId && INVALID_PLACEHOLDER_TOUR_PRODUCT_IDS.has(productId)
  );
};

export const isInvalidPlaceholderTourPath = (path?: string | null) => {
  const normalizedPath = normalizePath(path);
  if (!normalizedPath) {
    return false;
  }

  if (
    INVALID_PLACEHOLDER_TOUR_PATHS.some(
      invalidPath => normalizePath(invalidPath) === normalizedPath
    )
  ) {
    return true;
  }

  const match = normalizedPath.match(
    /^\/destinations\/(?:united-states\/)?[^/]+\/[^/]+\/tours\/([^/]+)$/
  );

  return Boolean(match && isInvalidPlaceholderTourSlug(match[1]));
};
