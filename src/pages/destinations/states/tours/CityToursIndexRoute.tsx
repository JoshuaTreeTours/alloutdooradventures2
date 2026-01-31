import { useMemo } from "react";
import { Link, useLocation } from "wouter";

import Image from "../../../../components/Image";
import Seo from "../../../../components/Seo";
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
import {
  buildCityToursIndexMeta,
  buildSeoMetadata,
} from "../../../../utils/seo";
import {
  buildBreadcrumbList,
  buildItemList,
  buildWebPageStructuredData,
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
  const [location] = useLocation();
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
  const canonicalPath = (location ?? (state && city
    ? `/destinations/${state.slug}/${city.slug}/tours`
    : "/destinations")).split("?")[0];
  const seoMeta = state && city
    ? buildCityToursIndexMeta({
        cityName: city.name,
        stateName: state.name,
        activityLabel,
      })
    : null;
  const seo = seoMeta
    ? buildSeoMetadata({
        title: seoMeta.title,
        description: seoMeta.description,
        pathname: canonicalPath,
        image: heroImage,
      })
    : null;

  const toursHref = canonicalPath;
  const structuredDataNodes = useMemo(() => {
    if (!state || !city || !seo) {
      return null;
    }
    const breadcrumbId = `${seo.canonicalUrl}#breadcrumb`;
    const breadcrumbs = buildBreadcrumbList([
      { name: "Destinations", url: "/destinations" },
      { name: state.name, url: stateHref },
      { name: city.name, url: cityHref },
      { name: "Tours", url: toursHref },
    ], breadcrumbId);
    const itemListItems = filteredTours.map((tour) => ({
      name: tour.title,
      url: isFlagstaff
        ? getFlagstaffTourDetailPath(tour)
        : getCityTourDetailPath(tour),
      image: tour.heroImage ? [tour.heroImage] : undefined,
    }));
    const nodes = [
      buildWebPageStructuredData({
        url: seo.canonicalUrl,
        name: seo.title,
        description: seo.description,
        image: seo.image,
        type: "CollectionPage",
        breadcrumbId,
      }),
      breadcrumbs,
    ];
    if (itemListItems.length) {
      nodes.push(buildItemList(itemListItems));
    }
    return nodes;
  }, [
    city,
    cityHref,
    filteredTours,
    isFlagstaff,
    seo,
    state,
    stateHref,
    toursHref,
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
      {seo ? (
        <Seo
          title={seo.title}
          description={seo.description}
          canonicalUrl={seo.canonicalUrl}
          image={seo.image}
        />
      ) : null}
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
