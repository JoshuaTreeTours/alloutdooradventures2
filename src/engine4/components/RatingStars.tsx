type RatingStarsProps = {
  rating?: number;
  className?: string;
};

type StarFill = "full" | "half" | "empty";

const STAR_PATH =
  "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

const getStarFill = (rating: number, index: number): StarFill => {
  const position = index + 1;

  if (rating >= position) {
    return "full";
  }

  const delta = rating - index;
  if (delta >= 0.75) {
    return "full";
  }

  if (delta >= 0.25) {
    return "half";
  }

  return "empty";
};

function StarIcon({ fill, index }: { fill: StarFill; index: number }) {
  const halfGradientId = `engine4-star-half-${index}`;

  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid="rating-star"
    >
      {fill === "half" ? (
        <defs>
          <linearGradient id={halfGradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
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
            : fill === "half"
              ? `url(#${halfGradientId})`
              : "transparent"
        }
      />
    </svg>
  );
}

export default function RatingStars({ rating, className }: RatingStarsProps) {
  const safeRating = Number.isFinite(rating) ? Math.max(0, Math.min(5, rating as number)) : 0;

  return (
    <span
      aria-label={`Rated ${safeRating.toFixed(1)} out of 5 stars`}
      className={`inline-flex items-center gap-1 text-[#8BFF8B] ${className ?? ""}`.trim()}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon key={index} fill={getStarFill(safeRating, index)} index={index} />
      ))}
    </span>
  );
}
