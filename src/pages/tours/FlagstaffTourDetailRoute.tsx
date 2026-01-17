import { Link } from "wouter";

import Image from "../../components/Image";
import TourCard from "../../components/TourCard";
import { getCityBySlugs, getStateBySlug } from "../../data/destinations";
import {
  getFallbackCityBySlugs,
  getFallbackStateBySlug,
} from "../../data/tourFallbacks";
import { getAffiliateDisclosure } from "../../data/tours";
import {
  getActivityLabel,
  getExpandedTourDescription,
  getSkillLevelLabel,
  getTourReviewSummary,
} from "../../data/tourNarratives";
import {
  flagstaffTours,
  getFlagstaffTourBookingPath,
  getFlagstaffTourBySlug,
  getFlagstaffTourDetailPath,
  getFlagstaffTourSlug,
} from "../../data/flagstaffTours";

type FlagstaffTourDetailRouteProps = {
  params: {
    tourSlug: string;
  };
};

export default function FlagstaffTourDetailRoute({
  params,
}: FlagstaffTourDetailRouteProps) {
  const state =
    getStateBySlug("arizona") ?? getFallbackStateBySlug("arizona");
  const city =
    getCityBySlugs("arizona", "flagstaff") ??
    getFallbackCityBySlugs("arizona", "flagstaff");

  if (!state || !city) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Tour not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that destination. Head back to destinations to keep
          exploring.
        </p>
      </main>
    );
  }

  const tour = getFlagstaffTourBySlug(params.tourSlug);

  if (!tour) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Tour not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that tour. Head back to the tours list to keep
          exploring.
        </p>
        <div className="mt-6">
          <Link href="/destinations/arizona/flagstaff/tours">
            <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129]">
              Back to tours
            </a>
          </Link>
        </div>
      </main>
    );
  }

  const tourSlug = getFlagstaffTourSlug(tour);
  const relatedTours = flagstaffTours.filter(
    (item) => getFlagstaffTourSlug(item) !== tourSlug,
  );
  const cityHref = `/destinations/states/${state.slug}/cities/${city.slug}`;
  const stateHref = state.isFallback
    ? "/destinations"
    : `/destinations/states/${state.slug}`;
  const toursHref = `/destinations/${state.slug}/${city.slug}/tours`;
  const disclosure = getAffiliateDisclosure(tour);
  const activityLabel = getActivityLabel(tour);
  const skillLevel = getSkillLevelLabel(tour);
  const reviewSummary = getTourReviewSummary(tour);
  const suppressReviews = tour.suppressReviews ?? true;

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/80">
            <Link href="/destinations">
              <a>Destinations</a>
            </Link>
            <span>/</span>
            <Link href={stateHref}>
              <a>{state.name}</a>
            </Link>
            <span>/</span>
            <Link href={cityHref}>
              <a>{city.name}</a>
            </Link>
            <span>/</span>
            <Link href={toursHref}>
              <a>Tours</a>
            </Link>
            <span>/</span>
            <span className="text-white">{tour.title}</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              {tour.destination.city}, {tour.destination.state}
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
              {tour.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white/90">
              {!suppressReviews && tour.badges.rating ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
                  ⭐ {tour.badges.rating}
                  {tour.badges.reviewCount
                    ? ` (${tour.badges.reviewCount})`
                    : ""}
                </span>
              ) : null}
              {tour.badges.duration ? (
                <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1">
                  {tour.badges.duration}
                </span>
              ) : null}
              {tour.badges.likelyToSellOut ? (
                <span className="inline-flex items-center rounded-full bg-[#ffedd5] px-3 py-1 text-[#9a3412]">
                  Likely to sell out
                </span>
              ) : null}
            </div>
            {tour.badges.tagline ? (
              <p className="mt-3 max-w-3xl text-sm text-white/90 md:text-base">
                {tour.badges.tagline}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={getFlagstaffTourBookingPath(tour)}>
              <a className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]">
                Book Now
              </a>
            </Link>
            <a
              className="inline-flex items-center justify-center rounded-md border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              href="#outdoor-adventures-review"
            >
              Review summary
            </a>
            <Link href={toursHref}>
              <a className="inline-flex items-center justify-center rounded-md bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25">
                Back to tours
              </a>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
          <div>
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
              <Image
                src={tour.heroImage}
                fallbackSrc="/hero.jpg"
                alt={tour.title}
                className="h-64 w-full object-cover md:h-80"
              />
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-[#2f4a2f]">
              What you’ll experience
            </h2>
            {getExpandedTourDescription(tour).map((paragraph) => (
              <p
                key={paragraph}
                className="mt-4 text-sm text-[#405040] leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-[#1f2a1f]">
                Tour snapshot
              </h3>
              <div className="mt-4 space-y-3 text-sm text-[#405040]">
                {!suppressReviews ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
                        Rating
                      </span>
                      <span className="font-semibold text-[#1f2a1f]">
                        {tour.badges.rating ? `${tour.badges.rating} ★` : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
                        Reviews
                      </span>
                      <span className="font-semibold text-[#1f2a1f]">
                        {tour.badges.reviewCount ?? "—"}
                      </span>
                    </div>
                  </>
                ) : null}
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
                    Duration
                  </span>
                  <span className="font-semibold text-[#1f2a1f]">
                    {tour.badges.duration ?? "Check booking page"}
                  </span>
                </div>
                {tour.badges.likelyToSellOut ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a3412]">
                    Likely to sell out
                  </p>
                ) : null}
              </div>
              {disclosure ? (
                <p className="mt-6 text-xs text-[#405040]">{disclosure}</p>
              ) : null}
            </div>
            <div
              id="outdoor-adventures-review"
              className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-[#1f2a1f]">
                  Outdoor Adventures review
                </h3>
                <span className="rounded-full bg-[#e6f4ea] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2f8a3d]">
                  Approved
                </span>
              </div>
              <p className="mt-3 text-sm text-[#405040]">{reviewSummary}</p>
              <div className="mt-4 space-y-2 text-xs text-[#405040]">
                <p>
                  <span className="font-semibold text-[#1f2a1f]">
                    Skill level:
                  </span>{" "}
                  {skillLevel}
                </p>
                <p>
                  <span className="font-semibold text-[#1f2a1f]">
                    Activity focus:
                  </span>{" "}
                  {activityLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
        {tour.galleryImages?.length ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {tour.galleryImages.map((image) => (
              <div
                key={image}
                className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
              >
                <Image
                  src={image}
                  fallbackSrc="/hero.jpg"
                  alt={`${tour.title} gallery`}
                  className="h-56 w-full object-cover md:h-64"
                />
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {relatedTours.length > 0 && (
        <section className="bg-white/60">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <h2 className="text-2xl font-semibold text-[#2f4a2f]">
              More tours in {city.name}
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedTours.map((related) => (
                <TourCard
                  key={related.slug}
                  tour={related}
                  href={getFlagstaffTourDetailPath(related)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
