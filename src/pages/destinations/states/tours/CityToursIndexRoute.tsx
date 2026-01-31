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
import { getCityTourDetailPath, getToursByCity } from "../../../../data/tours";
import {
  flagstaffTours,
  getFlagstaffTourDetailPath,
} from "../../../../data/flagstaffTours";
import { buildCanonicalUrl } from "../../../../utils/seo";
import {
  buildBreadcrumbList,
  buildCollectionPageStructuredData,
  buildItemList,
  buildPlaceStructuredData,
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
    state && city && state.slug === "arizona" && city.slug === "flagstaff",
  );
  const tours = state && city
    ? isFlagstaff
      ? flagstaffTours
      : getToursByCity(state.slug, city.slug)
    : [];
  const activityFilter =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("activity")
      : null;
  const filteredTours = activityFilter
    ? tours.filter((tour) => tour.activitySlugs.includes(activityFilter))
    : tours;
  const activityLabel = activityFilter
    ? getActivityLabelFromSlug(activityFilter)
    : null;
  const basePath =
    basePathOverride ??
    (state?.isFallback ? "/destinations" : `/destinations/states/${state?.slug ?? ""}`);
  const cityHref = state && city ? `${basePath}/cities/${city.slug}` : "";
  const stateHref = basePath;
  const heroImage = city?.heroImages[0] ?? "/hero.jpg";
  const itemListLimit = 100;

  const toursHref = `${cityHref}/tours`;
  const structuredDataNodes = useMemo(() => {
    if (!state || !city) {
      return null;
    }
    const canonicalCityUrl = buildCanonicalUrl(cityHref);
    const canonicalToursUrl = buildCanonicalUrl(toursHref);
    const statePlaceId =
      state.isFallback || !stateHref
        ? ""
        : `${buildCanonicalUrl(stateHref)}#place`;
    const countryPlace =
      state.isFallback
        ? { "@type": "Country", name: state.name }
        : { "@type": "Country", name: "United States" };
    const breadcrumbs = buildBreadcrumbList([
      { name: "Destinations", url: "/destinations" },
      { name: state.name, url: stateHref },
      { name: city.name, url: cityHref },
      { name: "Tours", url: toursHref },
    ]);
    const itemListItems = filteredTours.slice(0, itemListLimit).map((tour) => ({
      name: tour.title,
      url: isFlagstaff
        ? getFlagstaffTourDetailPath(tour)
        : getCityTourDetailPath(tour),
      image: tour.heroImage ? [tour.heroImage] : undefined,
    }));
    const itemListId = `${canonicalToursUrl}#itemlist`;
    const placeNode = buildPlaceStructuredData({
      id: `${canonicalCityUrl}#place`,
      name: city.name,
      containedInPlace: [
        ...(statePlaceId ? [{ "@id": statePlaceId }] : []),
        countryPlace,
      ],
    });
    const collectionPage = buildCollectionPageStructuredData({
      url: canonicalToursUrl,
      name: `Tours in ${city.name}`,
      description: `Browse guided tours and outdoor experiences in ${city.name}.`,
      image: heroImage,
      mainEntity: itemListItems.length ? { "@id": itemListId } : undefined,
    });
    const nodes = [collectionPage, breadcrumbs, placeNode];
    if (itemListItems.length) {
      nodes.push(buildItemList(itemListItems, { id: itemListId }));
    }
    return nodes;
  }, [
    city,
    cityHref,
    filteredTours,
    isFlagstaff,
    itemListLimit,
    state,
    stateHref,
    toursHref,
    heroImage,
  ]);

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
          <Image
            src={heroImage}
            fallbackSrc="/hero.jpg"
            alt={`${city.name} hero`}
            className="h-64 w-full object-cover md:h-80"
          />
        </div>
        {filteredTours.length ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredTours.map((tour) => (
              <TourCard
                key={tour.id}
                tour={tour}
                href={
                  isFlagstaff
                    ? getFlagstaffTourDetailPath(tour)
                    : getCityTourDetailPath(tour)
                }
              />
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
