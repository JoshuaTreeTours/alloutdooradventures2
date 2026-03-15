import RatingStars from "../../engine4/components/RatingStars";
import type { Engine6ResolvedTourPageData } from "../types";

const formatFactsPrice = (page: Engine6ResolvedTourPageData) => {
  if (typeof page.fromPrice === "number" && page.fromPrice > 0) {
    return `$${Math.round(page.fromPrice)}`;
  }

  if (!page.fromPriceText) return undefined;

  const parsed = Number.parseFloat(page.fromPriceText.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;

  return `$${Math.round(parsed)}`;
};

export default function Engine6FactsCard({
  page,
}: {
  page: Engine6ResolvedTourPageData;
}) {
  const factsPrice = formatFactsPrice(page);

  return (
    <aside className="rounded-2xl border border-[#d6d1c7] bg-white p-5 text-[#1f2a1f] shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-[#6a7b68]">From</p>
      <p className="mt-1 text-2xl font-semibold">
        {factsPrice ? `${factsPrice} per person` : "Check live pricing"}
      </p>
      {typeof page.ratingValue === "number" ? (
        <div className="mt-4">
          <RatingStars
            ratingValue={page.ratingValue}
            reviewCount={page.reviewCount}
            className="text-[#1f6b2b]"
          />
        </div>
      ) : null}
      <dl className="mt-4 space-y-3 text-sm text-[#344434]">
        {page.meetingPointShort ? (
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-[#6a7b68]">
              Meeting point
            </dt>
            <dd>{page.meetingPointShort}</dd>
          </div>
        ) : null}
        {page.durationText ? (
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-[#6a7b68]">
              Duration
            </dt>
            <dd>{page.durationText}</dd>
          </div>
        ) : null}
        {page.cancellationText ? (
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-[#6a7b68]">
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
