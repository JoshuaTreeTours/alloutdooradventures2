import { Link } from "wouter";

import Image from "../../../components/Image";
import TourCard from "../../../components/TourCard";
import { countriesWithTours, toursByCountry } from "../../../data/europeIndex";
import type { Tour } from "../../../data/tours.types";

type EuropeCountryRouteProps = {
  params: {
    countrySlug: string;
    categorySlug?: string;
  };
};

const CATEGORY_FILTERS = [
  {
    label: "All Tours",
    slug: "tours",
    matches: (tour: Tour) => Boolean(tour),
  },
  {
    label: "Cycling",
    slug: "cycling",
    matches: (tour: Tour) =>
      tour.activitySlugs.includes("cycling"),
  },
  {
    label: "Hiking",
    slug: "hiking",
    matches: (tour: Tour) =>
      tour.activitySlugs.includes("hiking"),
  },
  {
    label: "Paddle Sports",
    slug: "paddle-sports",
    matches: (tour: Tour) => {
      if (tour.activitySlugs.includes("canoeing")) {
        return true;
      }
      const tagText = (tour.tags ?? []).join(" ").toLowerCase();
      return ["canoe", "kayak", "paddle", "rafting"].some((keyword) =>
        tagText.includes(keyword),
      );
    },
  },
];

export default function EuropeCountryRoute({
  params,
}: EuropeCountryRouteProps) {
  const country = countriesWithTours.find(
    (entry) => entry.slug === params.countrySlug,
  );
  const countryTours = toursByCountry[params.countrySlug] ?? [];
  const activeCategory = params.categorySlug ?? "tours";
  const categoryConfig =
    CATEGORY_FILTERS.find((category) => category.slug === activeCategory) ??
    CATEGORY_FILTERS[0];
  const filteredTours = countryTours.filter((tour) =>
    categoryConfig.matches(tour),
  );
  const categoryCounts = CATEGORY_FILTERS.reduce<Record<string, number>>(
    (accumulator, category) => {
      accumulator[category.slug] = countryTours.filter((tour) =>
        category.matches(tour),
      ).length;
      return accumulator;
    },
    {},
  );

  if (!country) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Destination not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that destination. Head back to Europe to keep
          exploring.
        </p>
      </main>
    );
  }

  const heroImage = countryTours[0]?.heroImage ?? "/hero.jpg";

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
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
              Europe country hub
            </p>
            <h1 className="text-3xl font-semibold md:text-5xl">
              {country.name} tours
            </h1>
            <p className="max-w-2xl text-sm text-white/90 md:text-base">
              Browse guided adventures across {country.name}, updated from our
              live European inventory.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-2 text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
              {country.name} tours
            </span>
            <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
              Explore active tours in {country.name}
            </h2>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {CATEGORY_FILTERS.map((category) => {
              const isActive = category.slug === activeCategory;
              const isEmpty = categoryCounts[category.slug] === 0;
              const href =
                category.slug === "tours"
                  ? `/destinations/europe/${country.slug}/tours`
                  : `/destinations/europe/${country.slug}/${category.slug}`;

              if (isEmpty && category.slug !== "tours") {
                return (
                  <span
                    key={category.slug}
                    className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#7a8a6b]"
                  >
                    {category.label} · Coming soon
                  </span>
                );
              }

              return (
                <Link key={category.slug} href={href}>
                  <a
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                      isActive
                        ? "border-[#2f4a2f] bg-[#2f4a2f] text-white"
                        : "border-black/10 bg-white text-[#2f4a2f] hover:border-[#2f4a2f]"
                    }`}
                  >
                    {category.label}
                  </a>
                </Link>
              );
            })}
          </div>
          <div className="mt-6 text-center text-sm text-[#405040]">
            Showing {filteredTours.length} tours
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
