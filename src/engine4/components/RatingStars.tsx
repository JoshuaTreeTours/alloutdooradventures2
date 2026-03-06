type RatingStarsProps = {
  ratingValue: number;
  reviewCount?: number;
  className?: string;
};

type StarFill = "full" | "partial" | "empty";

const STAR_PATH =
  "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

const clampRating = (ratingValue: number): number =>
  Math.max(0, Math.min(5, ratingValue));

const getStarFill = (ratingValue: number, index: number): StarFill => {
  const fillAmount = clampRating(ratingValue) - index;

  if (fillAmount >= 1) {
    return "full";
  }

  if (fillAmount > 0) {
    return "partial";
  }

  return "empty";
};

function StarIcon({
  fill,
  fillRatio,
  index,
}: {
  fill: StarFill;
  fillRatio: number;
  index: number;
}) {
  const gradientId = `engine4-star-fill-${index}`;

  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid="rating-star"
    >
      {fill === "partial" ? (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop
              offset={`${Math.round(fillRatio * 100)}%`}
              stopColor="currentColor"
            />
            <stop
              offset={`${Math.round(fillRatio * 100)}%`}
              stopColor="transparent"
            />
          </linearGradient>
        </defs>
      ) : null}
      <path
        d={STAR_PATH}
        stroke="currentColor"
        strokeWidth="1.4"
        fill={
          fill === "full"
            ? "currentColor"
            : fill === "partial"
              ? `url(#${gradientId})`
              : "transparent"
        }
      />
    </svg>
  );
}

export default function RatingStars({
  ratingValue,
  reviewCount,
  className,
}: RatingStarsProps) {
  const safeRating = clampRating(ratingValue);

  return (
    <span
      aria-label={`Rated ${safeRating.toFixed(1)} out of 5 stars`}
      className={`inline-flex items-center gap-2 text-[#8BFF8B] ${className ?? ""}`.trim()}
      data-testid="rating-stars"
    >
      <span className="inline-flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => {
          const fillAmount = Math.max(0, Math.min(1, safeRating - index));
          return (
            <StarIcon
              key={index}
              index={index}
              fill={getStarFill(safeRating, index)}
              fillRatio={fillAmount}
            />
          );
        })}
      </span>
      {Number.isFinite(reviewCount) ? (
        <span className="text-sm text-white/95">
          {Math.round(reviewCount!)} reviews
        </span>
      ) : null}
    </span>
  );
}
