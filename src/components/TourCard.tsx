import { Link } from "wouter";

import type { Tour } from "../data/tours.types";
import { getTourDetailPath } from "../data/tours";
import Image from "./Image";

type TourCardProps = {
  tour: Tour;
  href?: string;
};

export default function TourCard({ tour, href }: TourCardProps) {
  const detailHref = href ?? getTourDetailPath(tour);
  const ratingLabel =
    typeof tour.badges.rating === "number"
      ? `${tour.badges.rating.toFixed(1)}`
      : null;
  const reviewLabel =
    typeof tour.badges.reviewCount === "number"
      ? `${tour.badges.reviewCount}`
      : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white/90 shadow-sm">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black/5">
        <Image
          src={tour.heroImage}
          fallbackSrc="/hero.jpg"
          alt={tour.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
          {ratingLabel && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#1f2a1f] shadow-sm">
              ⭐ {ratingLabel}
              {reviewLabel ? (
                <span className="text-[#405040]">({reviewLabel})</span>
              ) : null}
            </span>
          )}
          {tour.badges.likelyToSellOut && (
            <span className="inline-flex items-center rounded-full bg-[#ffedd5] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9a3412]">
              Likely to sell out
            </span>
          )}
        </div>
        {tour.tagPills?.length ? (
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
            {tour.tagPills.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2f4a2f]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
            {tour.destination.city}, {tour.destination.state}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[#1f2a1f]">
            {tour.title}
          </h3>
          {tour.badges.tagline ? (
            <p className="mt-2 text-sm text-[#405040]">
              {tour.badges.tagline}
            </p>
          ) : null}
        </div>
        <div className="mt-auto">
          <Link href={detailHref}>
            <a className="inline-flex items-center text-sm font-semibold text-[#2f4a2f]">
              View tour details
            </a>
          </Link>
        </div>
      </div>
    </article>
  );
}
