const HARD_DELETED_PRODUCT_IDS = new Set([
  "301378",
  "301379",
  "549337",
  "650824",
  "661652",
  "519110",
]);
const HARD_DELETED_SLUGS = new Set([
  "intermediate-singletrack-mountain-biking-clinic-301378",
  "private-mtb-lesson-301379",
  "golden-gate-bridge-bike-tour-with-muir-woods-and-sausalito-549337",
  "full-day-tours-650824",
  "bike-661652",
  "camp-talks-519110",
]);
const HARD_DELETED_CANONICAL_PATHS = new Set([
  "/destinations/united-states/alaska/anchorage/tours/intermediate-singletrack-mountain-biking-clinic-301378",
  "/destinations/united-states/alaska/anchorage/tours/private-mtb-lesson-301379",
  "/destinations/alaska/anchorage/tours/intermediate-singletrack-mountain-biking-clinic-301378",
  "/destinations/alaska/anchorage/tours/private-mtb-lesson-301379",
  "/tours/alaska/anchorage/intermediate-singletrack-mountain-biking-clinic-301378",
  "/tours/alaska/anchorage/private-mtb-lesson-301379",
  "/destinations/california/san-francisco/tours/golden-gate-bridge-bike-tour-with-muir-woods-and-sausalito-549337",
  "/destinations/wyoming/jackson/tours/full-day-tours-650824",
  "/destinations/california/coronado/tours/bike-661652",
  "/destinations/australia/summerlands/tours/camp-talks-519110",
]);

const normalize = (value?: string | null) => (value ?? "").trim().toLowerCase();

export const isHardDeletedLegacyTour = ({
  productId,
  slug,
  canonicalPath,
}: {
  productId?: string | null;
  slug?: string | null;
  canonicalPath?: string | null;
}) => {
  const normalizedProductId = normalize(productId).replace(/^engine2-/, "");
  if (
    normalizedProductId &&
    HARD_DELETED_PRODUCT_IDS.has(normalizedProductId)
  ) {
    return true;
  }

  const normalizedSlug = normalize(slug);
  if (normalizedSlug && HARD_DELETED_SLUGS.has(normalizedSlug)) {
    return true;
  }

  const normalizedCanonicalPath = normalize(canonicalPath);
  if (
    normalizedCanonicalPath &&
    HARD_DELETED_CANONICAL_PATHS.has(normalizedCanonicalPath)
  ) {
    return true;
  }

  return false;
};
