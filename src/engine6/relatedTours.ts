import type { Tour } from "../data/tours.types";
import { slugify } from "../utils/slugify";

import { engine6ListingTours } from "./listing";
import { getEngine6RouteSpecByProductCode } from "./routes";
import type { Engine6Tour } from "./types";

const hasUsableHeroImage = (tour: Tour) =>
  Boolean(tour.primaryImageUrl?.trim() || tour.heroImage?.trim());

export const getEngine6RelatedTours = (
  currentTour: Engine6Tour,
  options?: { maxCount?: number }
): Tour[] => {
  const routeSpec = getEngine6RouteSpecByProductCode(currentTour.productCode);
  const citySlug = routeSpec?.citySlug ?? slugify(currentTour.city);
  const stateSlug = routeSpec?.stateSlug ?? slugify(currentTour.state);
  const maxCount = options?.maxCount ?? 8;

  return engine6ListingTours
    .filter(
      tour =>
        tour.engine === "engine6" &&
        tour.productCode !== currentTour.productCode &&
        tour.destination.citySlug === citySlug &&
        tour.destination.stateSlug === stateSlug
    )
    .sort((left, right) => {
      const leftHeroScore = hasUsableHeroImage(left) ? 1 : 0;
      const rightHeroScore = hasUsableHeroImage(right) ? 1 : 0;
      if (rightHeroScore !== leftHeroScore) {
        return rightHeroScore - leftHeroScore;
      }

      const leftReviewCount = left.badges.reviewCount ?? 0;
      const rightReviewCount = right.badges.reviewCount ?? 0;
      if (rightReviewCount !== leftReviewCount) {
        return rightReviewCount - leftReviewCount;
      }

      const leftRating = left.badges.rating ?? 0;
      const rightRating = right.badges.rating ?? 0;
      if (rightRating !== leftRating) {
        return rightRating - leftRating;
      }

      return left.title.localeCompare(right.title);
    })
    .slice(0, maxCount);
};
