type TourRatingProps = {
  rating: number;
  reviewCount: number;
};

export default function TourRating({ rating, reviewCount }: TourRatingProps) {
  const clampedRating = Math.max(0, Math.min(5, rating));
  const filledStars = Math.floor(clampedRating);
  const hasHalfStar = clampedRating - filledStars >= 0.5;
  const emptyStars = 5 - filledStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/95">
      <span aria-label={`Rating: ${rating.toFixed(1)} out of 5 stars`}>
        <span className="text-[#8BFF8B]">{"★".repeat(filledStars)}</span>
        {hasHalfStar ? <span className="text-[#8BFF8B]">⯨</span> : null}
        <span className="text-white/70">{"☆".repeat(emptyStars)}</span>
      </span>
      <span>{rating.toFixed(1)}</span>
      <span>{reviewCount.toLocaleString()} reviews</span>
      <span className="text-white/80">Reviews from Viator (Tripadvisor)</span>
    </div>
  );
}
