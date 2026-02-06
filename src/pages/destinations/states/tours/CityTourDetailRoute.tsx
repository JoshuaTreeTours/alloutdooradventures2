import { useMemo } from "react";
import { Link } from "wouter";

import Image from "../../../../components/Image";
import Seo from "../../../../components/Seo";
import TourCard from "../../../../components/TourCard";
import { useStructuredData } from "../../../../components/StructuredDataProvider";
import { getCityBySlugs, getStateBySlug } from "../../../../data/destinations";
import {
  getFallbackCityBySlugs,
  getFallbackStateBySlug,
} from "../../../../data/tourFallbacks";
import {
  getAffiliateDisclosure,
  getCityTourDetailPath,
  getTourBookingPath,
  getTourById,
  getTourBySlug,
  getToursByCity,
  getTourBySlugs,
} from "../../../../data/tours";
import {
  flagstaffTours,
  getFlagstaffTourDetailPath,
  getFlagstaffTourSlug,
} from "../../../../data/flagstaffTours";
import { getExpandedTourDescription } from "../../../../data/tourNarratives";
import {
  filterHeroImages,
  resolveHeroImageForRoute,
} from "../../../../utils/hero";
import { buildMetaDescription } from "../../../../utils/seo";
import { normalizeFareharborUrl } from "../../../../lib/fareharbor";
import {
  buildBreadcrumbList,
  buildTourProductStructuredData,
  buildTourTripStructuredData,
  buildWebPageStructuredData,
} from "../../../../utils/structuredData";

type CityTourDetailRouteProps = {
  params: {
    stateSlug: string;
    citySlug: string;
    tourSlug: string;
  };
};

export default function CityTourDetailRoute({
  params,
}: CityTourDetailRouteProps) {
  const rawTourSlug = params.tourSlug;
  const idMatch = rawTourSlug.match(/-(\d+)$/);
  const tourId = idMatch?.[1] ?? null;
  const parsedTourSlug = idMatch
    ? rawTourSlug.slice(0, -(idMatch[1].length + 1))
    : rawTourSlug;

  const state =
    getStateBySlug(params.stateSlug) ??
    getFallbackStateBySlug(params.stateSlug);
  const city =
    getCityBySlugs(params.stateSlug, params.citySlug) ??
    getFallbackCityBySlugs(params.stateSlug, params.citySlug);

  const tour =
    getTourById(tourId) ??
    getTourBySlug(parsedTourSlug) ??
    (state && city
      ? getTourBySlugs(state.slug, city.slug, parsedTourSlug)
      : null);

  const resolvedState =
    state ??
    (tour
      ? getStateBySlug(tour.destination.stateSlug) ??
        getFallbackStateBySlug(tour.destination.stateSlug)
      : null);
  const resolvedCity =
    city ??
    (tour
      ? getCityBySlugs(tour.destination.stateSlug, tour.destination.citySlug) ??
        getFallbackCityBySlugs(
          tour.destination.stateSlug,
          tour.destination.citySlug
        )
      : null);

  const isFlagstaff = Boolean(
    resolvedState &&
      resolvedCity &&
      resolvedState.slug === "arizona" &&
      resolvedCity.slug === "flagstaff"
  );

  const isFareharbor = Boolean(
    tour &&
      (tour.bookingProvider === "fareharbor" ||
        tour.bookingUrl?.includes("fareharbor.com") ||
        tour.bookingWidgetUrl?.includes("fareharbor.com"))
  );
  const ensureFareharborParams = (url?: string) => {
    if (!url) return undefined;
    if (!isFareharbor) return url;
    return normalizeFareharborUrl(url);
  };
  const embedSourceUrl = ensureFareharborParams(
    tour?.bookingUrl ?? tour?.bookingWidgetUrl
  );
  const canonicalUrl =
    tour && isFlagstaff
      ? getFlagstaffTourDetailPath(tour)
      : tour
        ? getCityTourDetailPath(tour)
        : "";
  const heroImage =
    resolveHeroImageForRoute({
      route: canonicalUrl,
      tour,
    }) ?? undefined;
  const structuredImages = filterHeroImages(
    [heroImage, ...(tour?.galleryImages ?? [])],
    "product"
  );
  const bookingUrl = tour ? getTourBookingPath(tour) : "";
  const productDescription = tour
    ? getExpandedTourDescription(tour)[0]
    : undefined;
  const metaDescription =
    tour && resolvedState && resolvedCity
      ? buildMetaDescription(
          tour.shortDescription ?? tour.badges.tagline ?? tour.longDescription,
          `Book ${tour.title} in ${resolvedCity.name}, ${resolvedState.name} with trusted guides and curated outdoor experiences.`
        )
      : undefined;
  const cityHref =
    resolvedState && resolvedCity
      ? `/destinations/states/${resolvedState.slug}/cities/${resolvedCity.slug}`
      : "";
  const stateHref = resolvedState
    ? resolvedState.isFallback
      ? "/destinations"
      : `/destinations/states/${resolvedState.slug}`
    : "";
  const toursHref =
    resolvedState && resolvedCity
      ? `/destinations/${resolvedState.slug}/${resolvedCity.slug}/tours`
      : `/destinations/${params.stateSlug}/${params.citySlug}/tours`;
  const structuredDataNodes = useMemo(() => {
    if (!tour || !canonicalUrl || !bookingUrl) {
      return null;
    }
    return [
      buildWebPageStructuredData({
        url: canonicalUrl,
        name: tour.title ?? "Tour",
        description: metaDescription,
        image: heroImage,
        mainEntityId: `${canonicalUrl}#trip`,
      }),
      buildTourProductStructuredData({
        tour,
        detailUrl: canonicalUrl,
        bookingUrl,
        description: productDescription,
        images: structuredImages.length ? structuredImages : undefined,
      }),
      buildTourTripStructuredData({
        tour,
        detailUrl: canonicalUrl,
        bookingUrl,
        description: productDescription,
        images: structuredImages.length ? structuredImages : undefined,
      }),
      buildBreadcrumbList(
        [
          { name: "Tours", url: "/tours" },
          ...(stateHref
            ? [{ name: resolvedState?.name ?? "", url: stateHref }]
            : []),
          ...(cityHref
            ? [{ name: resolvedCity?.name ?? "", url: cityHref }]
            : []),
          { name: tour.title ?? "Tour", url: canonicalUrl },
        ],
        `${canonicalUrl}#breadcrumb`
      ),
    ];
  }, [
    bookingUrl,
    canonicalUrl,
    cityHref,
    heroImage,
    metaDescription,
    productDescription,
    resolvedCity?.name,
    resolvedState?.name,
    stateHref,
    structuredImages,
    tour,
  ]);

  useStructuredData(structuredDataNodes);

  if (!resolvedState || !resolvedCity) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Tour not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that city. Head back to destinations to keep
          exploring.
        </p>
      </main>
    );
  }

  if (!tour) {
    const fallbackStateSlug = resolvedState?.slug ?? params.stateSlug;
    const fallbackCitySlug = resolvedCity?.slug ?? params.citySlug;
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Tour not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that tour. Head back to the tours list to keep
          exploring.
        </p>
        <div className="mt-6">
          <Link href={`/destinations/${fallbackStateSlug}/${fallbackCitySlug}/tours`}>
            <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129]">
              Back to tours
            </a>
          </Link>
        </div>
      </main>
    );
  }

  const tourSlug = isFlagstaff ? getFlagstaffTourSlug(tour) : tour.slug;
  const title = `${tour.title ?? "Tour"} | All Outdoor Adventures`;
  const description =
    metaDescription ??
    buildMetaDescription(
      tour.shortDescription ?? tour.badges.tagline ?? tour.longDescription,
      `Book ${tour.title ?? "tour"} in ${resolvedCity.name}, ${resolvedState.name} with trusted guides and curated outdoor experiences.`
    );
  const relatedTours = (
    isFlagstaff
      ? flagstaffTours
      : getToursByCity(resolvedState.slug, resolvedCity.slug)
  ).filter(item =>
    isFlagstaff
      ? getFlagstaffTourSlug(item) !== tourSlug
      : item.slug !== tour.slug
  );
  const disclosure = getAffiliateDisclosure(tour);

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={title}
        description={description}
        url={canonicalUrl}
        image={heroImage ?? null}
        type="article"
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
            <span className="text-white">{tour.title}</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              {tour.destination?.city ?? resolvedCity.name},{" "}
              {tour.destination?.state ?? resolvedState.name}
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
              {tour.title}
            </h1>
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
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={bookingUrl}>
              <a className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]">
                BOOK
              </a>
            </Link>
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
                  alt={tour.title}
                  className="h-64 w-full object-cover md:h-80"
                />
              ) : null}
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-[#2f4a2f]">
              What you’ll experience
            </h2>
            {getExpandedTourDescription(tour).map(paragraph => (
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
          </div>
        </div>
        {tour.galleryImages?.length ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {tour.galleryImages.map(image => (
              <div
                key={image}
                className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
              >
                <Image
                  src={image}
                  fallbackSrc={image}
                  alt={`${tour.title} gallery`}
                  className="h-56 w-full object-cover md:h-64"
                />
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {isFareharbor && embedSourceUrl ? (
        <section className="mx-auto max-w-5xl px-6 pb-14">
          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#2f4a2f]">
              Reserve on FareHarbor
            </h2>
            <p className="mt-3 text-sm text-[#405040]">
              Check availability and secure your spot directly through the
              FareHarbor booking widget.
            </p>
            <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white">
              <iframe
                title={`${tour.title} booking`}
                src={embedSourceUrl}
                className="h-[720px] w-full rounded-xl border-0 md:h-[820px]"
                allow="payment *; clipboard-read; clipboard-write; fullscreen; geolocation"
                sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
              />
            </div>
          </div>
        </section>
      ) : null}

      {relatedTours.length > 0 && (
        <section className="bg-white/60">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <h2 className="text-2xl font-semibold text-[#2f4a2f]">
              More tours in {resolvedCity.name}
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedTours.map(related => (
                <TourCard
                  key={related.slug}
                  tour={related}
                  href={
                    isFlagstaff
                      ? getFlagstaffTourDetailPath(related)
                      : getCityTourDetailPath(related)
                  }
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
