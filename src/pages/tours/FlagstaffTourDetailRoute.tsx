import { useMemo } from "react";
import { Link } from "wouter";

import Image from "../../components/Image";
import Seo from "../../components/Seo";
import TourCard from "../../components/TourCard";
import { useStructuredData } from "../../components/StructuredDataProvider";
import { getCityBySlugs, getStateBySlug } from "../../data/destinations";
import {
  getFallbackCityBySlugs,
  getFallbackStateBySlug,
} from "../../data/tourFallbacks";
import { getAffiliateDisclosure, getTourBookingPath } from "../../data/tours";
import { getExpandedTourDescription } from "../../data/tourNarratives";
import {
  flagstaffTours,
  getFlagstaffTourBySlug,
  getFlagstaffTourDetailPath,
  getFlagstaffTourSlug,
} from "../../data/flagstaffTours";
import { formatStartingPrice } from "../../lib/pricing";
import { filterHeroImages, resolveHeroImageForRoute } from "../../utils/hero";
import { buildMetaDescription } from "../../utils/seo";
import {
  buildBreadcrumbList,
  buildTourProductStructuredData,
  buildWebPageStructuredData,
} from "../../utils/structuredData";

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
  const resolvedState = state ?? {
    name: "Arizona",
    slug: "arizona",
    isFallback: true,
  };
  const resolvedCity = city ?? {
    name: "Flagstaff",
    slug: "flagstaff",
    isFallback: true,
  };

  const cityHref = `/destinations/states/${resolvedState.slug}/cities/${resolvedCity.slug}`;
  const stateHref = resolvedState.isFallback
    ? "/destinations"
    : `/destinations/states/${resolvedState.slug}`;
  const toursHref = `/destinations/${resolvedState.slug}/${resolvedCity.slug}/tours`;
  const tour = getFlagstaffTourBySlug(params.tourSlug);
  const detailUrl = tour ? getFlagstaffTourDetailPath(tour) : toursHref;
  const heroImage = resolveHeroImageForRoute({
    route: detailUrl,
    tour,
  }) ?? undefined;
  const structuredImages = filterHeroImages(
    [heroImage, ...(tour?.galleryImages ?? [])],
    "product",
  );
  const bookingUrl = tour ? getTourBookingPath(tour) : "";
  const productDescription = tour
    ? getExpandedTourDescription(tour)[0]
    : undefined;
  const metaDescription = tour
    ? buildMetaDescription(
        tour.shortDescription ?? tour.badges.tagline ?? tour.longDescription,
        `Book ${tour.title} in ${resolvedCity.name}, ${resolvedState.name} with trusted guides and curated outdoor experiences.`,
      )
    : buildMetaDescription(
        "Tour details are still loading. Check back soon for the full experience.",
        `Explore tours in ${resolvedCity.name}, ${resolvedState.name}.`,
      );
  const structuredDataNodes = useMemo(() => {
    if (!tour || !detailUrl || !bookingUrl) {
      return null;
    }
    return [
      buildWebPageStructuredData({
        url: detailUrl,
        name: tour.title,
        description: metaDescription,
        image: heroImage,
      }),
      buildTourProductStructuredData({
        tour,
        detailUrl,
        bookingUrl,
        description: productDescription,
        images: structuredImages.length ? structuredImages : undefined,
      }),
      buildBreadcrumbList([
        { name: "Destinations", url: "/destinations" },
        { name: resolvedState.name, url: stateHref },
        { name: resolvedCity.name, url: cityHref },
        { name: "Tours", url: toursHref },
        { name: tour.title, url: detailUrl },
      ]),
    ];
  }, [
    bookingUrl,
    cityHref,
    detailUrl,
    heroImage,
    metaDescription,
    productDescription,
    resolvedCity.name,
    resolvedState.name,
    stateHref,
    structuredImages,
    tour,
    toursHref,
  ]);

  useStructuredData(structuredDataNodes);

  const tourSlug = tour ? getFlagstaffTourSlug(tour) : null;
  const title = `${tour?.title ?? "Tour"} | ${resolvedCity.name}, ${resolvedState.name} Outdoor Tour`;
  const description =
    metaDescription ??
    buildMetaDescription(
      tour?.shortDescription ?? tour?.badges.tagline ?? tour?.longDescription,
      `Book ${tour?.title ?? "this tour"} in ${resolvedCity.name}, ${resolvedState.name} with trusted guides and curated outdoor experiences.`,
    );
  const relatedTours = tour
    ? flagstaffTours.filter(
        (item) => getFlagstaffTourSlug(item) !== tourSlug,
      )
    : [];
  const disclosure = tour ? getAffiliateDisclosure(tour) : null;
  const startingPriceLabel = tour
    ? formatStartingPrice(tour.startingPrice, tour.currency)
    : null;

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={title}
        description={description}
        url={detailUrl}
        image={heroImage ?? null}
      />
      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/80">
            <Link href="/destinations">
              <a>Destinations</a>
            </Link>
            <span>/</span>
            <Link href={stateHref}>
              <a>{resolvedState.name}</a>
            </Link>
            <span>/</span>
            <Link href={cityHref}>
              <a>{resolvedCity.name}</a>
            </Link>
            <span>/</span>
            <Link href={toursHref}>
              <a>Tours</a>
            </Link>
            <span>/</span>
            <span className="text-white">{tour?.title ?? "Tour"}</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              {tour
                ? `${tour.destination.city}, ${tour.destination.state}`
                : `${resolvedCity.name}, ${resolvedState.name}`}
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
              {tour?.title ?? "Tour details coming soon"}
            </h1>
            {tour ? (
              <>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white/90">
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
                {startingPriceLabel ? (
                  <p className="mt-3 text-sm font-semibold text-white/90">
                    From {startingPriceLabel}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-3 max-w-3xl text-sm text-white/90 md:text-base">
                We’re pulling in the full tour details. In the meantime, browse
                other Flagstaff tours for options that are ready to book.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {bookingUrl ? (
              <Link href={bookingUrl}>
                <a className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]">
                  Book Now
                </a>
              </Link>
            ) : (
              <Link href={toursHref}>
                <a className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]">
                  View tours
                </a>
              </Link>
            )}
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
              {heroImage ? (
                <Image
                  src={heroImage}
                  fallbackSrc={heroImage}
                  alt={tour?.title ?? "Tour"}
                  className="h-64 w-full object-cover md:h-80"
                />
              ) : (
                <div className="flex h-64 items-center justify-center bg-[#f8f4ed] text-sm text-[#7a8a6b] md:h-80">
                  Tour imagery coming soon.
                </div>
              )}
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-[#2f4a2f]">
              What you’ll experience
            </h2>
            {tour
              ? getExpandedTourDescription(tour).map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-4 text-sm text-[#405040] leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))
              : [
                  "We’re still gathering the full tour narrative. Check back soon for the detailed itinerary.",
                ].map((paragraph) => (
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
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
                    Duration
                  </span>
                  <span className="font-semibold text-[#1f2a1f]">
                    {tour?.badges.duration ?? "Check booking page"}
                  </span>
                </div>
                {tour?.badges.likelyToSellOut ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a3412]">
                    Likely to sell out
                  </p>
                ) : null}
              </div>
              {disclosure ? (
                <p className="mt-6 text-xs text-[#405040]">{disclosure}</p>
              ) : null}
            </div>
          </div>
        </div>
        {tour?.galleryImages?.length ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {tour.galleryImages.map((image) => (
              <div
                key={image}
                className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
              >
                <Image
                  src={image}
                  fallbackSrc={image}
                  alt={`${tour?.title ?? "Tour"} gallery`}
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
              More tours in {resolvedCity.name}
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
