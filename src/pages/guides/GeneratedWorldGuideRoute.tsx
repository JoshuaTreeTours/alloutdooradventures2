import { useMemo, useState } from "react";
import { Link } from "wouter";

import Image from "../../components/Image";
import TourCard from "../../components/TourCard";
import { getAllEngine2Tours, type Engine2Tour } from "../../engine2/data/loadEngine2";
import type { Tour } from "../../data/tours.types";

type RegistryEntry = {
  name: string;
  country: string;
  countrySlug: string;
  citySlug: string;
  wikidataId?: string | null;
};

type GeneratedGuide = {
  city: string;
  country: string;
  countrySlug: string;
  citySlug: string;
  wikidataId: string;
  wikipediaTitle: string;
  wikipediaUrl: string;
  leadImageUrl?: string | null;
  seoTitle: string;
  seoDescription: string;
  intro: string;
  topThings: Array<{ title: string; description: string }>;
  neighborhoods?: string[];
  whenToGo: string[];
  gettingAround: string[];
  dayTrips: string[];
  facts: {
    officialWebsite?: string | null;
  };
};

type ActivityFilter = "all" | "cycling" | "hiking" | "paddle";

const registryModule = import.meta.glob<RegistryEntry[]>(
  "../../content/guides/guideRegistry.top-cities.json",
  { eager: true, import: "default" },
);
const registry =
  registryModule["../../content/guides/guideRegistry.top-cities.json"] ?? [];

const generatedGuides = import.meta.glob<GeneratedGuide>(
  "../../content/guides/world/*/*.generated.json",
  { eager: true, import: "default" },
);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isGuideLike = (value: unknown): value is GeneratedGuide => {
  if (!value || typeof value !== "object") return false;
  const guide = value as Record<string, unknown>;
  return (
    isNonEmptyString(guide.seoTitle) &&
    isNonEmptyString(guide.intro) &&
    isNonEmptyString(guide.wikipediaUrl) &&
    isNonEmptyString(guide.wikipediaTitle) &&
    isNonEmptyString(guide.wikidataId) &&
    Array.isArray(guide.topThings) &&
    Array.isArray(guide.whenToGo) &&
    Array.isArray(guide.gettingAround) &&
    Array.isArray(guide.dayTrips)
  );
};

const getGuide = (countrySlug: string, citySlug: string): GeneratedGuide | null => {
  const key = `../../content/guides/world/${countrySlug}/${citySlug}.generated.json`;
  const candidate = generatedGuides[key];
  return isGuideLike(candidate) ? candidate : null;
};

const getRegistryEntry = (countrySlug: string, citySlug: string) =>
  registry.find(
    (entry) => entry.countrySlug === countrySlug && entry.citySlug === citySlug,
  );

export const shouldUseGeneratedGuide = (countrySlug: string, citySlug: string) => {
  const guide = getGuide(countrySlug, citySlug);
  if (guide) return true;

  const entry = getRegistryEntry(countrySlug, citySlug);
  return Boolean(entry?.wikidataId);
};

const toTourCardModel = (tour: Engine2Tour): Tour => ({
  id: tour.id,
  slug: tour.slug,
  title: tour.name,
  shortDescription: tour.content.experienceText,
  operator: tour.provider.name,
  tags: [],
  categories: [],
  primaryCategory: "detours",
  destination: {
    country: tour.geo.country,
    state: tour.geo.region,
    stateSlug: tour.sourceProvinceSlug ?? tour.sourceCountrySlug ?? "world",
    city: tour.geo.city,
    citySlug: tour.sourceCitySlug,
    lat: tour.geo.lat ?? undefined,
    lng: tour.geo.lng ?? undefined,
  },
  heroImage: tour.images.hero || tour.seo.ogImage || "/hero.jpg",
  galleryImages: tour.images.gallery,
  badges: {
    rating: (tour as unknown as { ratingValue?: number }).ratingValue,
    reviewCount: (tour as unknown as { ratingCount?: number }).ratingCount,
  },
  startingPrice: tour.pricing?.price ? Number(tour.pricing.price) : undefined,
  currency: tour.pricing?.currency,
  tagPills: tour.content.highlights?.slice(0, 2) ?? [],
  activitySlugs: ["detours"],
  bookingProvider: "fareharbor",
  bookingUrl: tour.booking.bookingUrl,
  longDescription: tour.content.experienceText,
});

const getActivityType = (tour: Engine2Tour): ActivityFilter => {
  const text = `${tour.name} ${(tour.content.highlights ?? []).join(" ")}`.toLowerCase();
  if (/(bike|cycling|e-bike)/.test(text)) return "cycling";
  if (/(hike|hiking|trek|trail)/.test(text)) return "hiking";
  if (/(kayak|canoe|sup|paddle|rafting)/.test(text)) return "paddle";
  return "all";
};

const getCityToursRoute = (
  countrySlug: string,
  citySlug: string,
  tours: Engine2Tour[],
): string | null => {
  if (countrySlug === "united-states") {
    const stateSlug = tours.find((tour) => tour.sourceProvinceSlug)?.sourceProvinceSlug;
    return stateSlug ? `/destinations/${stateSlug}/${citySlug}/tours` : null;
  }
  return `/destinations/${countrySlug}/${citySlug}/tours`;
};

const sortTours = (tours: Engine2Tour[]) =>
  [...tours].sort((a, b) => {
    const aAny = a as unknown as {
      ratingCount?: number;
      ratingValue?: number;
      price?: number;
    };
    const bAny = b as unknown as {
      ratingCount?: number;
      ratingValue?: number;
      price?: number;
    };

    const byCount = (bAny.ratingCount ?? 0) - (aAny.ratingCount ?? 0);
    if (byCount !== 0) return byCount;

    const byValue = (bAny.ratingValue ?? 0) - (aAny.ratingValue ?? 0);
    if (byValue !== 0) return byValue;

    const byImage = Number(Boolean(b.images.hero || b.seo.ogImage)) - Number(Boolean(a.images.hero || a.seo.ogImage));
    if (byImage !== 0) return byImage;

    return Number(Boolean(b.pricing?.price)) - Number(Boolean(a.pricing?.price));
  });

export default function GeneratedWorldGuideRoute({
  countrySlug,
  citySlug,
}: {
  countrySlug: string;
  citySlug: string;
}) {
  const guide = getGuide(countrySlug, citySlug);
  const [activity, setActivity] = useState<ActivityFilter>("all");

  if (!guide) {
    const entry = getRegistryEntry(countrySlug, citySlug);
    if (!entry || !entry.wikidataId) return null;

    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-3xl font-semibold">Guide coming soon</h1>
        <p className="mt-4 text-base text-[#405040]">
          We’re generating this city guide now. Please check back soon.
        </p>
      </main>
    );
  }

  const cityTours = useMemo(() => {
    const candidates = getAllEngine2Tours().filter(
      (tour) =>
        tour.sourceCitySlug === citySlug ||
        tour.seo.canonicalPath.includes(`/${citySlug}/tours/`),
    );
    return sortTours(candidates);
  }, [citySlug]);

  const filteredTours = cityTours.filter((tour) => {
    if (activity === "all") return true;
    return getActivityType(tour) === activity;
  });

  const topTours = filteredTours.slice(0, 10).map((tour) => ({
    card: toTourCardModel(tour),
    href: tour.seo.canonicalPath,
  }));
  const allToursPath = getCityToursRoute(countrySlug, citySlug, cityTours);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 text-[#1f2a1f]">
      <header>
        <p className="text-xs uppercase tracking-wide text-[#5f7a5f]">Guide</p>
        <h1 className="mt-2 text-4xl font-bold">{guide.seoTitle}</h1>
        <p className="mt-4 text-lg text-[#334433]">{guide.intro}</p>
        {guide.leadImageUrl ? (
          <Image
            src={guide.leadImageUrl}
            fallbackSrc="/hero.jpg"
            alt={`${guide.city} skyline`}
            className="mt-6 h-auto w-full rounded-xl object-cover"
            loading="lazy"
          />
        ) : null}
      </header>

      <section className="mt-8 rounded-2xl border border-[#dde7dd] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">Book a Tour</h2>
          {allToursPath ? (
            <label className="flex items-center gap-2 text-sm text-[#405040]">
              <span>View all tours in {guide.city}</span>
              <select
                className="rounded-lg border border-[#cfdccf] bg-white px-3 py-2 text-sm"
                defaultValue=""
                onChange={(event) => {
                  if (!event.target.value) return;
                  window.location.assign(event.target.value);
                }}
              >
                <option value="">Select</option>
                <option value={allToursPath}>{guide.city} Tours</option>
              </select>
            </label>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["all", "All"],
            ["cycling", "Cycling"],
            ["hiking", "Hiking"],
            ["paddle", "Paddle Sports"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setActivity(value as ActivityFilter)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                activity === value
                  ? "bg-[#2f8a3d] text-white"
                  : "bg-[#eef4ee] text-[#2b3b2b]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex gap-4 overflow-x-auto pb-3">
          {topTours.length ? (
            topTours.map((tour) => (
              <div key={tour.card.id} className="min-w-[280px] max-w-[280px]">
                <TourCard tour={tour.card} href={tour.href} />
              </div>
            ))
          ) : (
            <p className="text-sm text-[#405040]">No tours found for this filter yet.</p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Top things to do</h2>
        <ul className="mt-4 space-y-4">
          {guide.topThings.map((item) => (
            <li key={item.title} className="rounded-lg border border-[#dde7dd] p-4">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1 text-[#405040]">{item.description}</p>
            </li>
          ))}
        </ul>
      </section>

      {guide.neighborhoods?.length ? (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Neighborhoods to explore</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-[#405040]">
            {guide.neighborhoods.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10 grid gap-8 md:grid-cols-3">
        <div>
          <h2 className="text-xl font-semibold">When to go</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-[#405040]">
            {guide.whenToGo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Getting around</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-[#405040]">
            {guide.gettingAround.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Day trips</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-[#405040]">
            {guide.dayTrips.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-12 border-t border-[#dde7dd] pt-6">
        <h2 className="text-xl font-semibold">Sources</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-[#405040]">
          <li>
            <a className="underline" href={guide.wikipediaUrl} target="_blank" rel="noreferrer">
              Wikipedia ({guide.wikipediaTitle})
            </a>
          </li>
          <li>
            <a
              className="underline"
              href={`https://www.wikidata.org/wiki/${guide.wikidataId}`}
              target="_blank"
              rel="noreferrer"
            >
              Wikidata ({guide.city} {guide.wikidataId})
            </a>
          </li>
          {guide.facts?.officialWebsite ? (
            <li>
              <a className="underline" href={guide.facts.officialWebsite} target="_blank" rel="noreferrer">
                {guide.city} tourism official site
              </a>
            </li>
          ) : null}
        </ul>
      </section>
    </main>
  );
}
