import type { Tour } from "./tours.types";
import { getFareHarborProofFromTour } from "./fareharborLeadToGoldProof";

/**
 * Lead-to-Gold is a documented FareHarbor migration, not the entire
 * FareHarbor catalog. Keep Engine6 first, then promote only migrated items
 * whose product ID resolves to the verified migration registry.
 */
export const isEnhancedFareHarborTour = (tour: Tour): boolean =>
  tour.bookingProvider === "fareharbor" &&
  Boolean(getFareHarborProofFromTour(tour));

export const getTourPromotionRank = (tour: Tour): number => {
  if (tour.engine === "engine6") return 6;
  if (isEnhancedFareHarborTour(tour)) return 5;
  if (tour.engine === "engine4") return 4;
  if (tour.engine === "engine3") return 3;
  if (tour.engine === "engine2") return 2;
  return 1;
};

/** Stable priority order: Engine6, upgraded FareHarbor, remaining engines. */
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

/**
 * A short guide preview otherwise containing nothing but Engine6 must
 * reserve up to two places for upgraded FareHarbor, in second position.
 * Full catalogs still show ALL Engine6 before the first FareHarbor.
 */
export const selectFeaturedTourPreview = (
  orderedTours: readonly Tour[],
  limit: number
): Tour[] => {
  if (limit <= 0) return [];
  const selected = orderedTours.slice(0, limit);
  if (
    !selected.length ||
    selected.some(isEnhancedFareHarborTour) ||
    !selected.every(tour => tour.engine === "engine6")
  ) {
    return selected;
  }
  const enhancedFareHarbor = orderedTours
    .filter(isEnhancedFareHarborTour)
    .slice(0, Math.min(2, Math.max(1, Math.floor(limit / 4))));
  if (!enhancedFareHarbor.length) return selected;
  return [
    ...selected.slice(0, limit - enhancedFareHarbor.length),
    ...enhancedFareHarbor,
  ];
};
