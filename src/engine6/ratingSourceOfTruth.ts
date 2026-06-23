import { normalizeEngine6AggregateRating } from "./rating";
import type { Engine6LiveProductFields } from "./liveProductFields";
import type { Engine6Tour } from "./types";

export type Engine6RatingSourceOfTruth = {
  aggregateRating: number | null;
  reviewCount: number | null;
};

const normalizeReviewCount = (value: number | null | undefined) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.trunc(value);
};

export const normalizeEngine6RatingSourceOfTruth = ({
  aggregateRating,
  reviewCount,
}: Engine6RatingSourceOfTruth): Engine6RatingSourceOfTruth => {
  const normalizedAggregateRating =
    normalizeEngine6AggregateRating(aggregateRating);
  const normalizedReviewCount = normalizeReviewCount(reviewCount);

  if (normalizedAggregateRating === null || normalizedReviewCount === null) {
    return { aggregateRating: null, reviewCount: null };
  }

  return {
    aggregateRating: normalizedAggregateRating,
    reviewCount: normalizedReviewCount,
  };
};

export const getEngine6TourRatingSourceOfTruth = (
  tour: Pick<Engine6Tour, "aggregateRating" | "reviewCount">
) =>
  normalizeEngine6RatingSourceOfTruth({
    aggregateRating: tour.aggregateRating,
    reviewCount: tour.reviewCount,
  });

export const getEngine6LiveRatingSourceOfTruth = (
  liveFields?: Partial<Engine6LiveProductFields>
) =>
  normalizeEngine6RatingSourceOfTruth({
    aggregateRating:
      typeof liveFields?.aggregateRating === "number"
        ? liveFields.aggregateRating
        : null,
    reviewCount:
      typeof liveFields?.reviewCount === "number"
        ? liveFields.reviewCount
        : null,
  });
