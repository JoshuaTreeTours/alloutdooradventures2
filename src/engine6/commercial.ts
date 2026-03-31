import type { Engine6Tour } from "./types";

export type Engine6CommercialSnapshot = {
  rating: number | null;
  reviewCount: number | null;
  priceAmount: number | null;
};

export const getEngine6CommercialSnapshot = (
  tour: Engine6Tour
): Engine6CommercialSnapshot => ({
  rating:
    typeof tour.aggregateRating === "number" && Number.isFinite(tour.aggregateRating)
      ? Number(tour.aggregateRating.toFixed(1))
      : null,
  reviewCount:
    typeof tour.reviewCount === "number" && Number.isFinite(tour.reviewCount)
      ? tour.reviewCount
      : null,
  priceAmount:
    typeof tour.priceAmount === "number" && Number.isFinite(tour.priceAmount)
      ? tour.priceAmount
      : null,
});

export const formatEngine6PriceLabel = (priceAmount: number | null) =>
  typeof priceAmount === "number" ? `From $${priceAmount.toFixed(0)}` : null;

export const formatEngine6RatingLabel = ({
  rating,
  reviewCount,
}: {
  rating: number | null;
  reviewCount: number | null;
}) =>
  typeof rating === "number" && typeof reviewCount === "number"
    ? `${rating.toFixed(1)} (${reviewCount} reviews)`
    : "No ratings yet";
