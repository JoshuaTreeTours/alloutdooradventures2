import RatingStars from "../../engine4/components/RatingStars";
import type { Engine6ResolvedTourPageData } from "../types";

export default function Engine6FactsCard({
  page,
}: {
  page: Engine6ResolvedTourPageData;
}) {
  return (
    <aside className="rounded-2xl border border-white/20 bg-black/35 p-5 text-white backdrop-blur">
      <p className="text-xs uppercase tracking-[0.2em] text-white/80">From</p>
      <p className="mt-1 text-2xl font-semibold">
        {page.fromPriceText
          ? `${page.fromPriceText} per person`
          : "Check live pricing"}
      </p>
      {typeof page.ratingValue === "number" ? (
        <div className="mt-4">
          <RatingStars
            ratingValue={page.ratingValue}
            reviewCount={page.reviewCount}
            className="text-[#9effa8]"
          />
        </div>
      ) : null}
      <dl className="mt-4 space-y-3 text-sm text-white/95">
        {page.meetingPointShort ? (
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-white/70">
              Meeting point
            </dt>
            <dd>{page.meetingPointShort}</dd>
          </div>
        ) : null}
        {page.durationText ? (
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-white/70">
              Duration
            </dt>
            <dd>{page.durationText}</dd>
          </div>
        ) : null}
        {page.cancellationText ? (
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-white/70">
              Cancellation
            </dt>
            <dd>{page.cancellationText}</dd>
          </div>
        ) : null}
      </dl>
      <a
        href={page.bookingUrl}
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"
      >
        Reserve this tour
      </a>
    </aside>
  );
}
