import {
  getInvalidPlaceholderTourIds,
  getInvalidPlaceholderTourPaths,
  getInvalidPlaceholderTourSlugs,
} from "./invalidPlaceholderTours";
import { isStageBBookingPageNotFound } from "../fareharbor/stageBTerminalBookingPages";
import { isFareHarborMigratedRouteRef } from "../../data/fareharborLeadToGoldProof";

const HARD_DELETED_PRODUCT_IDS = new Set([
  "16628",
  "301378",
  "301379",
  "549337",
  ...getInvalidPlaceholderTourIds(),
]);
const HARD_DELETED_SLUGS = new Set([
  "central-park-bike-tours-16628",
  "intermediate-singletrack-mountain-biking-clinic-301378",
  "private-mtb-lesson-301379",
  "golden-gate-bridge-bike-tour-with-muir-woods-and-sausalito-549337",
  ...getInvalidPlaceholderTourSlugs(),
]);
const HARD_DELETED_CANONICAL_PATHS = new Set([
  "/destinations/new-york/new-york/tours/central-park-bike-tours-16628",
  "/destinations/united-states/alaska/anchorage/tours/intermediate-singletrack-mountain-biking-clinic-301378",
  "/destinations/united-states/alaska/anchorage/tours/private-mtb-lesson-301379",
  "/destinations/alaska/anchorage/tours/intermediate-singletrack-mountain-biking-clinic-301378",
  "/destinations/alaska/anchorage/tours/private-mtb-lesson-301379",
  "/tours/alaska/anchorage/intermediate-singletrack-mountain-biking-clinic-301378",
  "/tours/alaska/anchorage/private-mtb-lesson-301379",
  "/destinations/california/san-francisco/tours/golden-gate-bridge-bike-tour-with-muir-woods-and-sausalito-549337",
  ...getInvalidPlaceholderTourPaths(),
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
  const normalizedSlug = normalize(slug);
  const normalizedCanonicalPath = normalize(canonicalPath);
  if (
    isStageBBookingPageNotFound(normalizedProductId) ||
    isStageBBookingPageNotFound(normalizedSlug) ||
    isStageBBookingPageNotFound(normalizedCanonicalPath)
  ) {
    return true;
  }
  if (
    isFareHarborMigratedRouteRef({
      itemId: normalizedProductId,
      slug: normalizedSlug,
      path: normalizedCanonicalPath,
    })
  ) {
    return false;
  }
  if (
    normalizedProductId === "34849" ||
    normalizedSlug === "shared-san-andreas-fault-jeep-tour-34849" ||
    normalizedCanonicalPath ===
      "/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849"
  ) {
    return false;
  }
  if (
    normalizedProductId &&
    HARD_DELETED_PRODUCT_IDS.has(normalizedProductId)
  ) {
    return true;
  }

  if (normalizedSlug && HARD_DELETED_SLUGS.has(normalizedSlug)) {
    return true;
  }

  if (
    normalizedCanonicalPath &&
    HARD_DELETED_CANONICAL_PATHS.has(normalizedCanonicalPath)
  ) {
    return true;
  }

  return false;
};
