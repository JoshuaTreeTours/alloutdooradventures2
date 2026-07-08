import { getEngine6TourRatingSourceOfTruth } from "./ratingSourceOfTruth";
import type { Engine6Tour } from "./types";

export const hasEngine6GovernedRatingAndReviewCount = (
  tour: Pick<Engine6Tour, "aggregateRating" | "reviewCount">
): boolean => {
  const ratingSourceOfTruth = getEngine6TourRatingSourceOfTruth(tour);
  return (
    ratingSourceOfTruth.aggregateRating !== null &&
    ratingSourceOfTruth.reviewCount !== null
  );
};

export const isEngine6SurfaceEligibleTour = (tour: Engine6Tour): boolean =>
  hasEngine6GovernedRatingAndReviewCount(tour);
