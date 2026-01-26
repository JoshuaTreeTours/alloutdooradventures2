import { useMemo, useState } from "react";
import { Link } from "wouter";

import Image from "../components/Image";
import TourCard from "../components/TourCard";
import { useStructuredData } from "../components/StructuredDataProvider";
import type { StateDestination } from "../data/destinations";
import { getCityTourDetailPath, getToursByState } from "../data/tours";
import { buildBreadcrumbList, buildItemList } from "../utils/structuredData";

const FILTER_OPTIONS = [
  { label: "All", slug: "all" },
  { label: "Cycling", slug: "cycling" },
  { label: "Hiking", slug: "hiking" },
  { label: "Paddle Sports", slug: "canoeing" },
];

export default function StateToursTemplate({
  state,
}: {
  state: StateDestination;
}) {
  const stateTours = getToursByState(state.slug);
  const [activeFilter, setActiveFilter] = useState("all");
  const filteredTours = useMemo(() => {
    if (activeFilter === "all") {
      return stateTours;
    }
    return stateTours.filter((tour) =>
      tour.activitySlugs.includes(activeFilter)
    );
  }, [activeFilter, stateTours]);
  const structuredDataNodes = useMemo(() => {
    const breadcrumbs = buildBreadcrumbList([
      { name: "Destinations", url: "/destinations" },
      { name: state.name, url: `/destinations/states/${state.slug}` },
    ]);
    const itemListItems = filteredTours.map((tour) => ({
      name: tour.title,
      url: getCityTourDetailPath(tour),
      image: tour.heroImage ? [tour.heroImage] : undefined,
    }));
    const nodes = [breadcrumbs];
    if (itemListItems.length) {
      nodes.push(buildItemList(itemListItems));
    }
    return nodes;
  }, [filteredTours, state.name, state.slug]);

  useStructuredData(structuredDataNodes);

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <section className="relative overflow-hidden bg-[#2f4a2f]">
        <Image
          src={state.heroImage}
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
            <Link href={`/destinations/states/${state.slug}`}>
              <a>{state.name}</a>
            </Link>
          </div>
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/80">
              State-wide tours
            </p>
            <h1 className="text-3xl font-semibold md:text-5xl">
              {state.name} tours
            </h1>
            <p className="max-w-2xl text-sm text-white/90 md:text-base">
              Browse every tour in {state.name} and filter by activity to find
              your pace.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-2 text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
              All tours in {state.name}
            </span>
            <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
              Explore every adventure in {state.name}
            </h2>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {FILTER_OPTIONS.map((filter) => {
              const isActive = activeFilter === filter.slug;
              return (
                <button
                  key={filter.slug}
                  type="button"
                  onClick={() => setActiveFilter(filter.slug)}
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
              ? `Showing all ${stateTours.length} tours`
              : `Showing ${filteredTours.length} ${
                  FILTER_OPTIONS.find((filter) => filter.slug === activeFilter)
                    ?.label.toLowerCase() ?? ""
                } tours`}
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredTours.map((tour) => (
              <TourCard
                key={tour.id}
                tour={tour}
                href={getCityTourDetailPath(tour)}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
