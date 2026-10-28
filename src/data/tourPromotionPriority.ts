import type { Tour } from "./tours.types";
import { getFareHarborProofFromTour } from "./fareharborLeadToGoldProof";

/**
 * Lead-to-Gold is a documented FareHarbor migration, not the entire
 * FareHarbor catalog. Promote verified migrated items as Engine 7 before Engine 6, while only including items
 * whose product ID resolves to the verified migration registry.
 */
export const isEnhancedFareHarborTour = (tour: Tour): boolean =>
  tour.bookingProvider === "fareharbor" &&
  Boolean(getFareHarborProofFromTour(tour));

export const getTourPromotionRank = (tour: Tour): number => {
  if (isEnhancedFareHarborTour(tour)) return 7;
  if (tour.engine === "engine6") return 6;
  if (tour.engine === "engine4") return 4;
  if (tour.engine === "engine3") return 3;
  if (tour.engine === "engine2") return 2;
  return 1;
};

/** Stable priority order: Engine 7 (verified Lead-to-Gold), Engine 6, remaining engines. */
export const prioritizeTourPromotionEntries = <T>(
  entries: readonly T[],
  getTour: (entry: T) => Tour
): T[] =>
  entries
    .map((entry, index) => ({ entry, index }))
    .sort(
      (a, b) =>
        getTourPromotionRank(getTour(b.entry)) -
          getTourPromotionRank(getTour(a.entry)) ||
        a.index - b.index
    )
    .map(({ entry }) => entry);

/** Featured previews use the same Engine 7-first order as full catalogs. */
export const selectFeaturedTourPreview = (
  orderedTours: readonly Tour[],
  limit: number
): Tour[] => {
  if (limit <= 0) return [];
  return prioritizeTourPromotionEntries(orderedTours, tour => tour).slice(0, limit);
};
