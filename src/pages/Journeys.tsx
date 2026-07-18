import { useMemo, useState } from "react";
import { Link } from "wouter";

import Image from "../components/Image";
import Seo from "../components/Seo";
import { getTourDetailPath, tours } from "../data/tours";
import type { Tour } from "../data/tours.types";
import { getAllEngine2Tours } from "../engine2/data/loadEngine2";
import { engine6ListingTours } from "../engine6/listing";
import { engine6ResolvedTours } from "../engine6/registry";
import { resolveTourHeroImage } from "../utils/hero";
import { isUsCountryAlias } from "../utils/guides/usCountryAliases";
import { getStaticPageSeo } from "../utils/seo";
import { slugify } from "../utils/slugify";

const durationBuckets = [
  { label: "2–3 days", value: "2-3" },
  { label: "4–7 days", value: "4-7" },
  { label: "8+ days", value: "8+" },
];

const multiDayTriggers = ["multi-day", "multi day", "overnight"];
const normalizeOptionValue = (value: string) => slugify(value.trim().toLowerCase());
const AFRICA_ENGINE2_MAP: Record<string, { country: string; city: string }> = {
  "517094": { country: "Tanzania", city: "Zanzibar" },
};

const normalizeDurationDays = (value: number) => {
  if (!Number.isFinite(value) || value < 1 || value > 60) return undefined;
  return value;
};

const extractDurationDays = (text?: string | null) => {
  if (!text) return undefined;

  const normalized = text.toLowerCase();
  const overnightMatch = normalized.match(/(\d+)\s*d\s*\/\s*(\d+)\s*n/);
  if (overnightMatch) return normalizeDurationDays(Number(overnightMatch[1]));

  const rangeMatch = normalized.match(/(\d+)\s*(?:-|–|to)\s*(\d+)\s*days?/);
  if (rangeMatch) return normalizeDurationDays(Number(rangeMatch[1]));

  const hyphenatedDayMatch = normalized.match(/\b(\d+)\s*-\s*day\b/);
  if (hyphenatedDayMatch) return normalizeDurationDays(Number(hyphenatedDayMatch[1]));

  const dayMatch = normalized.match(/\b(\d+)\s*days?\b/);
  if (dayMatch) return normalizeDurationDays(Number(dayMatch[1]));

  // Compact forms are valid only for realistic one- or two-digit durations.
  // This prevents product codes such as 5680DAY from becoming "5680 days."
  const compactMatch = normalized.match(/\b(\d{1,2})\s*d\b/);
  if (compactMatch) return normalizeDurationDays(Number(compactMatch[1]));

  const hoursMatch = normalized.match(/\b(\d+(?:\.\d+)?)\s*hours?\b/);
  if (hoursMatch) return normalizeDurationDays(Math.ceil(Number(hoursMatch[1]) / 24));

  return undefined;
};

const getTourDurationDays = (tour: Tour) => {
  const sources = [
    tour.badges?.duration,
    tour.badges?.tagline,
    tour.title,
    tour.slug?.replace(/-/g, " "),
  ];

  for (const source of sources) {
    const durationDays = extractDurationDays(source);
    if (durationDays !== undefined) return durationDays;
  }

  if (multiDayTriggers.some(trigger => tour.title.toLowerCase().includes(trigger))) {
    return 2;
  }

  return undefined;
};

const isMultiDayTour = (tour: Tour, durationDays?: number) => {
  if (durationDays !== undefined) return durationDays > 1;

  const combined = `${tour.title} ${tour.slug}`.toLowerCase();
  if (combined.includes("full day") || combined.includes("day-long")) return false;
  return multiDayTriggers.some(trigger => combined.includes(trigger));
};

const formatPriceFrom = (priceFrom?: string) => {
  if (!priceFrom) return null;
  return /^from\b/i.test(priceFrom.trim()) ? priceFrom.trim() : `From ${priceFrom.trim()}`;
};

type JourneyCardProps = {
  tour: Tour;
  durationDays?: number;
};

const JourneyCard = ({ tour, durationDays }: JourneyCardProps) => {
  const heroImage = resolveTourHeroImage(tour);
  const locationLabel = tour.destination.state
    ? `${tour.destination.city}, ${tour.destination.state}`
    : tour.destination.country
      ? `${tour.destination.city}, ${tour.destination.country}`
      : tour.destination.city;
  const detailHref = getTourDetailPath(tour);
  const rating = tour.badges?.rating;
  const reviewCount = tour.badges?.reviewCount;
  const priceFrom = formatPriceFrom(tour.badges?.priceFrom);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-black/10 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={detailHref}>
        <a className="absolute inset-0 z-10" aria-label={`View ${tour.title}`} />
      </Link>
      <div className="relative h-56 w-full overflow-hidden bg-black/5 sm:h-64">
        {heroImage ? (
          <Image
            src={heroImage}
            fallbackSrc={heroImage}
            alt={tour.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        {durationDays ? (
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
            {durationDays} {durationDays === 1 ? "day" : "days"}
          </span>
        ) : null}
      </div>
      <div className="relative z-20 flex flex-1 flex-col gap-4 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
            {locationLabel}
          </p>
          <h3 className="mt-3 text-lg font-semibold text-[#1f2a1f]">{tour.title}</h3>
          {rating !== undefined || priceFrom ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#405040]">
              {rating !== undefined ? (
                <span className="inline-flex items-center gap-1 font-medium">
                  <span aria-hidden="true" className="text-[#c6922e]">★</span>
                  {rating.toFixed(1)}
                  {reviewCount !== undefined ? ` (${reviewCount.toLocaleString()})` : ""}
                </span>
              ) : null}
              {priceFrom ? (
                <span className="font-semibold text-[#1f2a1f]">{priceFrom}</span>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="mt-auto">
          <Link href={detailHref}>
            <a className="inline-flex items-center justify-center rounded-full bg-[#2f8a3d] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:bg-[#287a35]">
              Book
            </a>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default function Journeys() {
  const seo = getStaticPageSeo("/journeys");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");

  const nativeEngine6ProductCodes = useMemo(
    () => new Set(engine6ResolvedTours.map(tour => tour.productCode)),
    []
  );

  const allJourneyCandidates = useMemo(() => {
    const engine6DurationByProductCode = new Map(
      engine6ResolvedTours.map(tour => [tour.productCode, tour.durationText ?? null])
    );

    const preferredMultiDayTours = engine6ListingTours
      .filter(tour => Boolean(tour.productCode && nativeEngine6ProductCodes.has(tour.productCode)))
      .map(tour => ({
        ...tour,
        badges: {
          ...tour.badges,
          duration: engine6DurationByProductCode.get(tour.productCode ?? "") ?? undefined,
        },
      }))
      .filter(tour => {
        const durationDays = getTourDurationDays(tour);
        return durationDays !== undefined && durationDays >= 2;
      });

    const engine2International = getAllEngine2Tours()
      .map(tour => ({ tour, mapped: AFRICA_ENGINE2_MAP[tour.id] }))
      .filter(({ tour, mapped }) => !isUsCountryAlias(mapped?.country ?? tour.geo.country))
      .map(tour => ({
        id: `engine2-${tour.tour.id}`,
        slug: tour.tour.slug,
        title: tour.tour.name,
        destination: {
          city: tour.mapped?.city ?? tour.tour.geo.city,
          state: tour.mapped?.country ?? tour.tour.geo.country,
          country: tour.mapped?.country ?? tour.tour.geo.country,
          citySlug: slugify(tour.mapped?.city ?? tour.tour.sourceCitySlug),
          stateSlug: slugify(tour.mapped?.country ?? tour.tour.geo.country),
        },
        heroImage: tour.tour.images.hero ?? "",
        badges: {},
        bookingProvider: "fareharbor" as const,
        bookingUrl: tour.tour.booking.bookingUrl,
        activitySlugs: ["adventure", "multi-day"],
        longDescription: "",
      })) as Tour[];

    const orderedCandidates = [
      ...preferredMultiDayTours,
      ...tours.filter(tour => tour.engine !== "engine6"),
      ...engine2International,
    ];

    return Array.from(new Map(orderedCandidates.map(tour => [tour.id, tour])).values());
  }, [nativeEngine6ProductCodes]);

  const multiDayTours = useMemo(
    () =>
      allJourneyCandidates
        .map(tour => {
          const durationDays = getTourDurationDays(tour);
          return {
            tour,
            durationDays,
            isMultiDay: isMultiDayTour(tour, durationDays),
          };
        })
        .filter(({ isMultiDay }) => isMultiDay),
    [allJourneyCandidates]
  );

  const regionOptions = useMemo(() => {
    const uniqueRegions = new Set<string>();
    multiDayTours.forEach(({ tour }) => {
      const region = tour.destination.state || tour.destination.country;
      if (region) uniqueRegions.add(region);
    });
    return Array.from(uniqueRegions).sort((a, b) => a.localeCompare(b));
  }, [multiDayTours]);

  const filteredTours = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return multiDayTours.filter(({ tour, durationDays }) => {
      if (selectedRegion !== "all") {
        const region = tour.destination.state || tour.destination.country;
        if (region !== selectedRegion) return false;
      }

      if (selectedDuration !== "all") {
        if (durationDays === undefined) return false;
        if (selectedDuration === "2-3" && (durationDays < 2 || durationDays > 3)) return false;
        if (selectedDuration === "4-7" && (durationDays < 4 || durationDays > 7)) return false;
        if (selectedDuration === "8+" && durationDays < 8) return false;
      }

      if (!normalizedSearch) return true;

      return [
        tour.title,
        tour.destination.city,
        tour.destination.state,
        tour.destination.country,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [multiDayTours, searchTerm, selectedDuration, selectedRegion]);

  return (
    <>
      {seo ? (
        <Seo title={seo.title} description={seo.description} url={seo.url} image={seo.image} />
      ) : null}
      <main className="mx-auto max-w-6xl px-6 py-16 text-[#1f2a1f]">
        <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">Journeys</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Multi-day tours</h1>
        <p className="mt-4 max-w-3xl text-sm text-[#405040] md:text-base">
          Browse our curated list of multi-day tours spanning the US and international
          destinations. Use the search tools to find the perfect itinerary by location,
          duration, or tour name.
        </p>

        <section className="mt-10 rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <label className="flex flex-1 flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
              Search
              <input
                type="search"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Search multi-day tours by location or name…"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-normal text-[#1f2a1f] shadow-sm focus:border-[#2f4a2f] focus:outline-none"
              />
            </label>
            <label className="flex flex-1 flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
              Region
              <select
                value={selectedRegion}
                onChange={event => setSelectedRegion(event.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-normal text-[#1f2a1f] shadow-sm focus:border-[#2f4a2f] focus:outline-none"
              >
                <option value="all">All regions</option>
                {regionOptions
                  .filter((region, index, array) => {
                    const normalized = normalizeOptionValue(region);
                    return (
                      normalized.length > 0 &&
                      array.findIndex(item => normalizeOptionValue(item) === normalized) === index
                    );
                  })
                  .map(region => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
              Duration
              <select
                value={selectedDuration}
                onChange={event => setSelectedDuration(event.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-normal text-[#1f2a1f] shadow-sm focus:border-[#2f4a2f] focus:outline-none"
              >
                <option value="all">All durations</option>
                {durationBuckets.map(bucket => (
                  <option key={bucket.value} value={bucket.value}>
                    {bucket.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="mt-4 text-sm text-[#405040]">
            Showing {filteredTours.length} multi-day tour{filteredTours.length === 1 ? "" : "s"}.
          </p>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          {filteredTours.map(({ tour, durationDays }) => (
            <JourneyCard key={tour.id} tour={tour} durationDays={durationDays} />
          ))}
        </section>

        <section className="mt-16 rounded-3xl border border-[#2f8a3d]/30 bg-[#f3fbf5] px-6 py-10 text-center">
          <h2 className="text-2xl font-semibold text-[#1f2a1f]">
            Design a journey that’s entirely yours
          </h2>
          <p className="mt-3 text-sm text-[#405040]">
            Tell us what you have in mind and we’ll craft a custom multi-day itinerary with
            the right pace, lodging, and adventure mix.
          </p>
          <div className="mt-6 flex justify-center">
            <Link href="/contact">
              <a className="inline-flex items-center gap-2 rounded-full bg-[#2f8a3d] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:bg-[#287a35]">
                Start a custom journey
              </a>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
