import RatingStars from "../../engine4/components/RatingStars";
import type { Engine6PageData } from "../types";

type Props = { data: Engine6PageData };

export default function Engine6FactsCard({ data }: Props) {
  const hasRating =
    typeof data.ratingValue === "number" && typeof data.reviewCount === "number";

  return (
    <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
      <div className="grid gap-3 text-sm text-white/95 md:grid-cols-2">
        <div className="space-y-3">
          <p>
            <strong>From:</strong> {data.fromPrice} per person
          </p>
          {hasRating ? (
            <RatingStars
              ratingValue={data.ratingValue as number}
              reviewCount={data.reviewCount as number}
            />
          ) : null}
        </div>
        <div className="space-y-3">
          {data.meetingPointShort ? (
            <p>
              <strong>Meeting point:</strong> {data.meetingPointShort}
            </p>
          ) : null}
          {data.durationText ? (
            <p>
              <strong>Duration:</strong> {data.durationText}
            </p>
          ) : null}
        </div>
      </div>
      {data.cancellationText ? (
        <p className="mt-4 border-t border-white/20 pt-3 text-sm text-white/90">
          <strong>Cancellation:</strong> {data.cancellationText}
        </p>
      ) : null}
    </div>
  );
}
