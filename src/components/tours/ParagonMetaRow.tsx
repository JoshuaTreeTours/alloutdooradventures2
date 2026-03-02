type ParagonMetaRowProps = {
  bookingProvider?: string;
  priceFrom?: number | string | null;
  currency?: string | null;
  ratingValue?: number | string | null;
  reviewCount?: number | string | null;
  meetingPointText?: string | null;
};

const toPositiveNumber = (
  value?: number | string | null
): number | undefined => {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = Number.parseFloat(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(normalized) && normalized > 0 ? normalized : undefined;
};

const hasText = (value?: string | null): value is string =>
  typeof value === "string" && value.trim().length > 0;

const formatPrice = (
  priceFrom?: number | string | null,
  currency?: string | null
): string | undefined => {
  if (
    typeof priceFrom === "number" &&
    Number.isFinite(priceFrom) &&
    priceFrom > 0
  ) {
    const symbol =
      currency?.toUpperCase() === "USD" || !currency ? "$" : `${currency} `;
    return `From ${symbol}${priceFrom.toFixed(2)} per person`;
  }

  if (typeof priceFrom === "string" && priceFrom.trim().length > 0) {
    return `From ${priceFrom.trim()} per person`;
  }

  return undefined;
};

const formatReviewCount = (
  reviewCount?: number | string | null
): string | undefined => {
  const reviewNumber = toPositiveNumber(reviewCount);
  if (reviewNumber !== undefined) {
    return `${Math.round(reviewNumber).toLocaleString()} reviews`;
  }

  if (typeof reviewCount === "string" && reviewCount.trim().length > 0) {
    return `${reviewCount.trim()} reviews`;
  }

  return undefined;
};

const renderStars = (rating?: number): string => {
  if (!rating) {
    return "★★★★★";
  }

  const clampedRating = Math.max(0, Math.min(5, rating));
  const filledStars = Math.floor(clampedRating);
  const hasHalfStar = clampedRating - filledStars >= 0.5;
  const emptyStars = 5 - filledStars - (hasHalfStar ? 1 : 0);

  return `${"★".repeat(filledStars)}${hasHalfStar ? "⯨" : ""}${"☆".repeat(
    Math.max(0, emptyStars)
  )}`;
};

export default function ParagonMetaRow({
  bookingProvider,
  priceFrom,
  currency,
  ratingValue,
  reviewCount,
  meetingPointText,
}: ParagonMetaRowProps) {
  if (bookingProvider !== "viator") {
    return null;
  }

  const priceLabel = formatPrice(priceFrom, currency);
  const parsedRating = toPositiveNumber(ratingValue);
  const reviewLabel = formatReviewCount(reviewCount);

  return (
    <div className="mt-4 space-y-2 text-sm text-white/95">
      {priceLabel ? (
        <p className="font-semibold text-white/90">{priceLabel}</p>
      ) : null}

      {reviewLabel ? (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            aria-label={
              parsedRating
                ? `Rating: ${parsedRating.toFixed(1)} out of 5 stars`
                : "Rated 5 out of 5 stars"
            }
            className="text-[#8BFF8B]"
          >
            {renderStars(parsedRating)}
          </span>
          {parsedRating ? <span>{parsedRating.toFixed(1)}</span> : null}
          <span>{reviewLabel}</span>
        </p>
      ) : null}

      {hasText(meetingPointText) ? (
        <p>
          <span className="font-semibold">Meeting point:</span>{" "}
          {meetingPointText.trim()}
        </p>
      ) : null}
    </div>
  );
}
