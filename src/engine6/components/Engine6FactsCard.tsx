import RatingStars from "../../engine4/components/RatingStars";

type Engine6FactsCardProps = {
  fromPrice: number;
  currency: string;
  ratingValue?: number;
  reviewCount?: number;
  meetingPoint: string;
  duration: string;
  cancellation: string;
};

const currencyFormatter = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

export default function Engine6FactsCard({
  fromPrice,
  currency,
  ratingValue,
  reviewCount,
  meetingPoint,
  duration,
  cancellation,
}: Engine6FactsCardProps) {
  const hasRating =
    typeof ratingValue === "number" && typeof reviewCount === "number";

  return (
    <div className="mt-6 rounded-2xl border border-white/25 bg-white/10 p-4 text-sm text-white/95">
      <p>
        <strong>From:</strong> {currencyFormatter(fromPrice, currency)} per person
      </p>
      {hasRating ? (
        <div className="mt-3">
          <RatingStars ratingValue={ratingValue} reviewCount={reviewCount} />
        </div>
      ) : null}
      <p className="mt-3">
        <strong>Meeting point:</strong> {meetingPoint}
      </p>
      <p className="mt-2">
        <strong>Duration:</strong> {duration}
      </p>
      <p className="mt-2 border-t border-white/20 pt-2">
        <strong>Cancellation:</strong> {cancellation}
      </p>
    </div>
  );
}
