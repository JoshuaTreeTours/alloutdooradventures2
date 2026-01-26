import { useMemo } from "react";
import { Link, useLocation } from "wouter";

import Image from "../../../components/Image";
import Seo from "../../../components/Seo";
import TourCard from "../../../components/TourCard";
import { useStructuredData } from "../../../components/StructuredDataProvider";
import { getActivityLabelFromSlug } from "../../../data/activityLabels";
import {
  worldCountriesWithTours,
  worldToursByCountry,
} from "../../../data/worldIndex";
import { getTourDetailPath } from "../../../data/tours";
import { buildMetaDescription } from "../../../utils/seo";
import { buildBreadcrumbList, buildItemList } from "../../../utils/structuredData";

const FILTER_OPTIONS = [
  { label: "All tours", routeSlug: "all" },
  { label: "Cycling", routeSlug: "cycling" },
  { label: "Hiking", routeSlug: "hiking" },
  { label: "Paddle Sports", routeSlug: "paddle-sports", activitySlug: "canoeing" },
];

type WorldCountryRouteProps = {
  params: {
    countrySlug: string;
    categorySlug?: string;
  };
};

export default function WorldCountryRoute({
  params,
}: WorldCountryRouteProps) {
  const [, setLocation] = useLocation();
  const country = worldCountriesWithTours.find(
    (entry) => entry.slug === params.countrySlug,
  );
  const countryTours = worldToursByCountry[params.countrySlug] ?? [];
  const categorySlug = params.categorySlug;
  const activeFilter =
    categorySlug === "canoeing" ? "paddle-sports" : categorySlug ?? "all";
  const filterActivitySlug =
    categorySlug === "paddle-sports" ? "canoeing" : categorySlug;
  const categoryLabel = getActivityLabelFromSlug(filterActivitySlug);

  const heroImage = countryTours[0]?.heroImage ?? "/hero.jpg";
  const filteredTours = filterActivitySlug
    ? countryTours.filter(
        (tour) =>
          tour.activitySlugs.includes(filterActivitySlug) ||
          tour.categories?.includes(filterActivitySlug) ||
          tour.primaryCategory === filterActivitySlug,
      )
    : countryTours;
  const structuredDataNodes = useMemo(() => {
    if (!country) {
      return null;
    }
    const breadcrumbs = buildBreadcrumbList([
      { name: "Destinations", url: "/destinations" },
      { name: country.name, url: `/destinations/world/${country.slug}` },
    ]);
    const itemListItems = filteredTours.map((tour) => ({
      name: tour.title,
      url: getTourDetailPath(tour),
      image: tour.heroImage ? [tour.heroImage] : undefined,
    }));
    const nodes = [breadcrumbs];
    if (itemListItems.length) {
      nodes.push(buildItemList(itemListItems));
    }
    return nodes;
  }, [country, filteredTours]);

  useStructuredData(structuredDataNodes);

  if (!country) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Destination not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that destination. Head back to explore more tours.
        </p>
      </main>
    );
  }

  const title = filterActivitySlug
    ? `${categoryLabel ?? "Outdoor"} Tours in ${country.name} | All Outdoor Adventures`
    : `${country.name} Outdoor Adventures | Curated Tours & Experiences`;
  const description = buildMetaDescription(
    filterActivitySlug
      ? `Discover ${categoryLabel ?? "outdoor"} tours in ${country.name}, with guided experiences that highlight local landscapes and culture.`
      : `Explore ${countryTours.length} curated tours across ${country.name}, from adventure highlights to relaxed outdoor escapes.`,
    `Plan your ${country.name} adventure with curated tours, regional highlights, and trusted local operators.`,
  );

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo title={title} description={description} />
      <section className="relative overflow-hidden bg-[#2f4a2f]">
        <Image
          src={heroImage}
          fallbackSrc="/hero.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-16 text-white">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/80">
            <Link href="/destinations">
              <a>Destinations</a>
            </Link>
            <span>/</span>
            <span className="text-white">{country.name}</span>
          </div>
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/80">
              Worldwide destination hub
            </p>
            <h1 className="text-3xl font-semibold md:text-5xl">
              {country.name} tours
            </h1>
            <p className="max-w-2xl text-sm text-white/90 md:text-base">
              Browse guided adventures across {country.name}, updated from our
              live international inventory.
            </p>
            {categorySlug ? (
              <p className="text-sm text-white/80">
                Filtered by <span className="font-semibold">{categoryLabel}</span>.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-3 text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
              {country.name} tours
            </span>
            <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
              Explore active tours in {country.name}
            </h2>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {FILTER_OPTIONS.map((filter) => {
              const isActive = activeFilter === filter.routeSlug;
              const href =
                filter.routeSlug === "all"
                  ? `/destinations/world/${country.slug}`
                  : `/destinations/world/${country.slug}/${filter.routeSlug}`;
              return (
                <button
                  key={filter.routeSlug}
                  type="button"
                  onClick={() => setLocation(href)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                    isActive
                      ? "border-[#2f4a2f] bg-[#2f4a2f] text-white"
                      : "border-black/10 bg-white text-[#2f4a2f] hover:border-[#2f4a2f]"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
          <div className="mt-6 text-center text-sm text-[#405040]">
            {activeFilter === "all"
              ? `Showing all ${countryTours.length} tours`
              : `Showing ${filteredTours.length} ${
                  FILTER_OPTIONS.find(
                    (filter) => filter.routeSlug === activeFilter,
                  )?.label.toLowerCase() ?? ""
                } tours`}
          </div>
          {filteredTours.length ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-center text-sm text-[#405040]">
              New {country.name} tours are on the way. Check back soon.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
