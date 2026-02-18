import { useMemo } from "react";
import { Link } from "wouter";

import Image from "../../../../components/Image";
import TourCard from "../../../../components/TourCard";
import { useStructuredData } from "../../../../components/StructuredDataProvider";
import { getActivityLabelFromSlug } from "../../../../data/activityLabels";
import { getCityBySlugs, getStateBySlug } from "../../../../data/destinations";
import {
  getFallbackCityBySlugs,
  getFallbackStateBySlug,
} from "../../../../data/tourFallbacks";
import { getToursByCityUnified } from "../../../../data/tours";
import {
  flagstaffTours,
  getFlagstaffTourDetailPath,
} from "../../../../data/flagstaffTours";
import { hasValidTourImage } from "../../../../lib/hasValidTourImage";
import { resolveHeroImageForRoute } from "../../../../utils/hero";
import {
  buildBreadcrumbList,
  buildItemList,
} from "../../../../utils/structuredData";

type CityToursIndexRouteProps = {
  params: {
    stateSlug: string;
    citySlug: string;
  };
  basePathOverride?: string;
};

export default function CityToursIndexRoute({
  params,
  basePathOverride,
}: CityToursIndexRouteProps) {
  const state =
    getStateBySlug(params.stateSlug) ??
    getFallbackStateBySlug(params.stateSlug);
  const city =
    getCityBySlugs(params.stateSlug, params.citySlug) ??
    getFallbackCityBySlugs(params.stateSlug, params.citySlug);

  const isFlagstaff = Boolean(
    state && city && state.slug === "arizona" && city.slug === "flagstaff"
  );
  const tours =
    state && city
      ? isFlagstaff
        ? flagstaffTours.map(tour => ({
            tour,
            href: getFlagstaffTourDetailPath(tour),
          }))
        : getToursByCityUnified(state.slug, city.slug)
      : [];
  const activityFilter =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("activity")
      : null;
  const toursWithImages = tours.filter(entry => hasValidTourImage(entry.tour));
  const filteredTours = activityFilter
    ? toursWithImages.filter(entry =>
        entry.tour.activitySlugs.includes(activityFilter)
      )
    : toursWithImages;
  const activityLabel = activityFilter
    ? getActivityLabelFromSlug(activityFilter)
    : null;
  const stateHref =
    basePathOverride ??
    (state?.isFallback
      ? `/destinations/${state?.slug ?? ""}`
      : `/destinations/states/${state?.slug ?? ""}`);
  const cityHref =
    state && city
      ? state?.isFallback && !basePathOverride
        ? `/destinations/${state.slug}/${city.slug}`
        : `${stateHref}/cities/${city.slug}`
      : "";
  const toursHref = `${cityHref}/tours`;
  const heroImage =
    resolveHeroImageForRoute({
      route: toursHref,
      state,
      city,
      cityTours: tours.map(entry => entry.tour),
    }) ?? undefined;
  const structuredDataNodes = useMemo(() => {
    if (!state || !city) {
      return null;
    }
    const breadcrumbs = buildBreadcrumbList([
      { name: "Destinations", url: "/destinations" },
      { name: state.name, url: stateHref },
      { name: city.name, url: cityHref },
      { name: "Tours", url: toursHref },
    ]);
    const itemListItems = filteredTours.map(entry => ({
      name: entry.tour.title,
      url: entry.href,
      image: entry.tour.heroImage ? [entry.tour.heroImage] : undefined,
    }));
    const nodes = [breadcrumbs];
    if (itemListItems.length) {
      nodes.push(buildItemList(itemListItems));
    }
    return nodes;
  }, [city, cityHref, filteredTours, state, stateHref, toursHref]);

  useStructuredData(structuredDataNodes);

  if (!state || !city) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Tours not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that city. Head back to destinations to keep
          exploring.
        </p>
      </main>
    );
  }

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
            <span className="text-white">Tours</span>
          </div>
          <div>
            <h1 className="text-3xl font-semibold md:text-5xl">
              {activityLabel ? `${activityLabel} tours in ` : "Tours in "}
              {city.name}
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-white/90 md:text-base">
              Browse guided experiences with live booking links and activity
              filters.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
          {heroImage ? (
            <Image
              src={heroImage}
              fallbackSrc={heroImage}
              alt={`${city.name} hero`}
              className="h-64 w-full object-cover md:h-80"
            />
          ) : (
            <div className="h-64 w-full bg-[#2f4a2f]/10 md:h-80" />
          )}
        </div>
        {filteredTours.length ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredTours.map(({ tour, href }) => (
              <TourCard key={tour.id} tour={tour} href={href} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-sm text-[#405040]">
            New tours are on the way. Check back soon for {city.name} updates.
          </p>
        )}
      </section>
    </main>
  );
}
