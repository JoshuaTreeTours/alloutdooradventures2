import { Link } from "wouter";

import type { Tour } from "../data/tours.types";
import { getActivityLabelFromSlug } from "../data/activityLabels";
import { getTourDetailPath } from "../data/tours";
import { formatStartingPrice } from "../lib/pricing";
import { buildRentalDescription } from "../templates/rentalDescription";
import { isRentalTour } from "../utils/isRentalTour";
import Image from "./Image";

type TourCardProps = {
  tour: Tour;
  href?: string;
};

const CARD_BLURB_MAX_CHARS = 150;
const ENGINE4_OVERVIEW_SNIPPET_MAX_CHARS = 140;
const ENGINE6_GLOBAL_PLACEHOLDER_IMAGE = "/images/hiking-hero.jpg";
const NON_TRIVIAL_HIGHLIGHT_JUNK_REGEX =
  /(check-?in|safety briefing|meet(ing)? point|pickup|drop-?off)/i;

type TourCardBlurbSource = {
  summary?: string;
  excerpt?: string;
  content?: {
    overview?: string;
    highlights?: string[];
  };
};

function toSnippet(text: string, maxChars: number): string {
  const normalizedText = text.trim().replace(/\s+/g, " ");
  if (!normalizedText) {
    return "";
  }

  const firstSentence =
    normalizedText.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? normalizedText;
  if (firstSentence.length <= maxChars) {
    return firstSentence;
  }

  const clipped = firstSentence.slice(0, maxChars);
  const lastWordBoundary = clipped.lastIndexOf(" ");
  const snippet =
    lastWordBoundary > maxChars * 0.6
      ? clipped.slice(0, lastWordBoundary)
      : clipped;

  return `${snippet.trim()}…`;
}

function pickNonTrivialHighlight(highlights?: string[]): string {
  return (
    highlights?.find(highlight => {
      const normalizedHighlight = highlight?.trim();
      return (
        normalizedHighlight &&
        !NON_TRIVIAL_HIGHLIGHT_JUNK_REGEX.test(normalizedHighlight)
      );
    }) ?? ""
  );
}

function formatCategoryLabel(slug?: string): string {
  if (!slug) {
    return "Tour";
  }

  if (slug === "off-road-tour") {
    return "Jeep Tour";
  }

  return slug.replace(/-/g, " ").replace(/\b\w/g, char => char.toUpperCase());
}


const resolveEngine6CardImage = (tour: Tour) => {
  const resolvedHero = tour.heroImage?.trim();
  return resolvedHero && resolvedHero.length > 0
    ? resolvedHero
    : ENGINE6_GLOBAL_PLACEHOLDER_IMAGE;
};

function getCardBlurb(tour: Tour): string {
  if (isRentalTour(tour)) {
    return buildRentalDescription({
      equipment: tour.title,
      city: tour.destination.city,
      location: tour.destination.state || tour.destination.country || "",
    });
  }

  if (tour.engine === "engine4") {
    const content = (tour as TourCardBlurbSource).content;
    const overview = content?.overview?.trim() ?? "";
    return overview
      ? toSnippet(overview, ENGINE4_OVERVIEW_SNIPPET_MAX_CHARS)
      : pickNonTrivialHighlight(content?.highlights);
  }

  const shortSummaryCandidate = [
    (tour as TourCardBlurbSource).summary,
    (tour as TourCardBlurbSource).excerpt,
    tour.shortDescription,
  ].find(value => value?.trim());

  if (shortSummaryCandidate?.trim()) {
    return shortSummaryCandidate.trim().replace(/\s+/g, " ");
  }

  const normalizedDescription = tour.longDescription
    ?.trim()
    .replace(/\s+/g, " ");
  if (!normalizedDescription) {
    return "";
  }

  if (normalizedDescription.length <= CARD_BLURB_MAX_CHARS) {
    return normalizedDescription;
  }

  const clipped = normalizedDescription.slice(0, CARD_BLURB_MAX_CHARS);
  const lastWordBoundary = clipped.lastIndexOf(" ");
  const snippet =
    lastWordBoundary > CARD_BLURB_MAX_CHARS * 0.6
      ? clipped.slice(0, lastWordBoundary)
      : clipped;

  return `${snippet.trim()}…`;
}

export default function TourCard({ tour, href }: TourCardProps) {
  const detailHref = href ?? getTourDetailPath(tour);
  const isRental = isRentalTour(tour);
  const blurb = getCardBlurb(tour);
  const categorySource =
    tour.primaryCategory ?? tour.categories?.[0] ?? tour.activitySlugs?.[0];
  const categoryLabel =
    tour.engine === "engine6"
      ? formatCategoryLabel(categorySource)
      : getActivityLabelFromSlug(categorySource);
  const regionLabel = tour.destination.state || tour.destination.country || "";
  const locationLabel = regionLabel
    ? `${tour.destination.city}, ${regionLabel}`
    : tour.destination.city;
  const startingPriceLabel = formatStartingPrice(
    tour.startingPrice,
    tour.currency
  );
  const hasRating =
    !tour.suppressReviews &&
    typeof tour.badges.rating === "number" &&
    typeof tour.badges.reviewCount === "number";
  const cardImage =
    tour.engine === "engine4"
      ? tour.heroImage?.trim() || "/hero.jpg"
      : tour.engine === "engine6"
        ? resolveEngine6CardImage(tour)
        : tour.primaryImageUrl?.trim() || tour.heroImage?.trim() || "/hero.jpg";
  const fallbackImage =
    tour.engine === "engine6"
      ? resolveEngine6CardImage(tour)
      : "/hero.jpg";
  const renderedTagPills =
    tour.tagPills?.map(tag =>
      tour.engine === "engine6" && tag.toUpperCase() === "ENGINE6"
        ? formatCategoryLabel(categorySource)
        : tag
    ) ?? [];

  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white/90 shadow-sm"
      data-card-image-src={cardImage}
      data-hero-image-src={tour.heroImage?.trim() || ""}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black/5">
        <Image
          src={cardImage}
          fallbackSrc={fallbackImage}
          alt={tour.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        {isRental ? (
          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#ecfdf3] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#166534]">
              Rental
            </span>
          </div>
        ) : null}
        {tour.badges.likelyToSellOut && (
          <div
            className={`absolute ${isRental ? "right-3" : "left-3"} top-3 flex flex-wrap items-center gap-2`}
          >
            <span className="inline-flex items-center rounded-full bg-[#ffedd5] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9a3412]">
              Likely to sell out
            </span>
          </div>
        )}
        {renderedTagPills.length ? (
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
            {renderedTagPills.map(tag => (
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
          {blurb ? (
            <p className="mt-2 overflow-hidden text-sm text-[#405040] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] md:[-webkit-line-clamp:3]">
              {blurb}
            </p>
          ) : categoryLabel ? (
            <p className="mt-2 text-sm text-[#405040]">{categoryLabel}</p>
          ) : null}
          {hasRating ? (
            <p className="mt-3 text-sm font-medium text-[#2f4a2f]">
              ★ {tour.badges.rating.toFixed(1)} ({tour.badges.reviewCount}{" "}
              reviews)
            </p>
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
              {isRental ? "View Rental" : "View Tour"}
            </a>
          </Link>
        </div>
      </div>
    </article>
  );
}
