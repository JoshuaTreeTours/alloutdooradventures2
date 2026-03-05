import { Link } from "wouter";

import type { Tour } from "../data/tours.types";
import { getActivityLabelFromSlug } from "../data/activityLabels";
import { getTourDetailPath } from "../data/tours";
import { formatStartingPrice } from "../lib/pricing";
import Image from "./Image";

type TourCardProps = {
  tour: Tour;
  href?: string;
};

const ENGINE4_CARD_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'><rect width='1200' height='900' fill='#e7eadf'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial,sans-serif' font-size='42' fill='#2f4a2f'>Tour image unavailable</text></svg>`
  );

export default function TourCard({ tour, href }: TourCardProps) {
  const detailHref = href ?? getTourDetailPath(tour);
  const shortDescription = tour.shortDescription?.trim();
  const categorySource =
    tour.primaryCategory ?? tour.categories?.[0] ?? tour.activitySlugs?.[0];
  const categoryLabel = getActivityLabelFromSlug(categorySource);
  const subtitle = shortDescription || categoryLabel;
  const regionLabel = tour.destination.state || tour.destination.country || "";
  const locationLabel = regionLabel
    ? `${tour.destination.city}, ${regionLabel}`
    : tour.destination.city;
  const startingPriceLabel = formatStartingPrice(
    tour.startingPrice,
    tour.currency
  );
  const cardImage =
    tour.engine === "engine4"
      ? tour.heroImage?.trim() || ENGINE4_CARD_PLACEHOLDER
      : tour.primaryImageUrl?.trim() || tour.heroImage?.trim() || "/hero.jpg";

  const fallbackImage =
    tour.engine === "engine4" ? ENGINE4_CARD_PLACEHOLDER : "/hero.jpg";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white/90 shadow-sm">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black/5">
        <Image
          src={cardImage}
          fallbackSrc={fallbackImage}
          alt={tour.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        {tour.badges.likelyToSellOut && (
          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#ffedd5] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9a3412]">
              Likely to sell out
            </span>
          </div>
        )}
        {tour.tagPills?.length ? (
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
            {tour.tagPills.map(tag => (
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
            {locationLabel}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[#1f2a1f]">
            {tour.title}
          </h3>
          {subtitle ? (
            <p className="mt-2 text-sm text-[#405040]">{subtitle}</p>
          ) : null}
          {startingPriceLabel ? (
            <p className="mt-3 text-sm font-semibold text-[#1f2a1f]">
              From {startingPriceLabel}
            </p>
          ) : null}
        </div>
        <div className="mt-auto">
          <Link href={detailHref}>
            <a className="inline-flex items-center justify-center rounded-full bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]">
              View Tour
            </a>
          </Link>
        </div>
      </div>
    </article>
  );
}
