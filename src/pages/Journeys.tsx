import { useMemo, useState } from "react";
import { Link } from "wouter";

import Image from "../components/Image";
import Seo from "../components/Seo";
import { getCityTourBookingPath, getTourDetailPath, tours } from "../data/tours";
import type { Tour } from "../data/tours.types";
import { getStaticPageSeo } from "../utils/seo";

const JOURNEYS_FALLBACK_IMAGE = "/hero.jpg";

const durationBuckets = [
  { label: "2–3 days", value: "2-3" },
  { label: "4–7 days", value: "4-7" },
  { label: "8+ days", value: "8+" },
];

const multiDayTriggers = ["multi-day", "multi day", "overnight"];

const extractDurationDays = (text?: string) => {
  if (!text) {
    return undefined;
  }

  const normalized = text.toLowerCase();
  const overnightMatch = normalized.match(/(\d+)\s*d\s*\/\s*(\d+)\s*n/);
  if (overnightMatch) {
    const days = Number(overnightMatch[1]);
    return Number.isNaN(days) ? undefined : days;
  }

  const rangeMatch = normalized.match(/(\d+)\s*-\s*(\d+)\s*day/);
  if (rangeMatch) {
    const days = Number(rangeMatch[1]);
    return Number.isNaN(days) ? undefined : days;
  }

  const dayMatch = normalized.match(/\b(\d+)\s*day/);
  if (dayMatch) {
    const days = Number(dayMatch[1]);
    return Number.isNaN(days) ? undefined : days;
  }

  const compactMatch = normalized.match(/\b(\d+)\s*d\b/);
  if (compactMatch) {
    const days = Number(compactMatch[1]);
    return Number.isNaN(days) ? undefined : days;
  }

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
    if (durationDays !== undefined) {
      return durationDays;
    }
  }

  if (multiDayTriggers.some((trigger) => tour.title.toLowerCase().includes(trigger))) {
    return 2;
  }

  return undefined;
};

const isMultiDayTour = (tour: Tour, durationDays?: number) => {
  if (durationDays !== undefined) {
    return durationDays > 1;
  }

  const combined = `${tour.title} ${tour.slug}`.toLowerCase();
  if (combined.includes("full day") || combined.includes("day-long")) {
    return false;
  }

  return multiDayTriggers.some((trigger) => combined.includes(trigger));
};

const getCarouselImages = (tour: Tour) => {
  const images = [tour.heroImage, ...(tour.galleryImages ?? [])]
    .filter((image): image is string => Boolean(image))
    .filter((image, index, array) => array.indexOf(image) === index);

  return images.length ? images : [JOURNEYS_FALLBACK_IMAGE];
};

type JourneyCardProps = {
  tour: Tour;
  durationDays?: number;
};

const JourneyCard = ({ tour, durationDays }: JourneyCardProps) => {
  const [activeImage, setActiveImage] = useState(0);
  const images = useMemo(() => getCarouselImages(tour), [tour]);
  const locationLabel = tour.destination.state
    ? `${tour.destination.city}, ${tour.destination.state}`
    : tour.destination.country
      ? `${tour.destination.city}, ${tour.destination.country}`
      : tour.destination.city;
  const detailHref = getTourDetailPath(tour);
  const bookingHref = getCityTourBookingPath(tour);

  const hasMultipleImages = images.length > 1;
  const displayedIndex = ((activeImage % images.length) + images.length) % images.length;

  const handleNext = () => {
    setActiveImage((previous) => (previous + 1) % images.length);
  };

  const handlePrevious = () => {
    setActiveImage((previous) => (previous - 1 + images.length) % images.length);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-black/10 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={detailHref}>
        <a
          className="absolute inset-0 z-10"
          aria-label={`View ${tour.title}`}
        />
      </Link>
      <div className="relative h-56 w-full overflow-hidden bg-black/5 sm:h-64">
        <Image
          src={images[displayedIndex]}
          fallbackSrc={JOURNEYS_FALLBACK_IMAGE}
          alt={tour.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        {durationDays ? (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
            {durationDays} {durationDays === 1 ? "day" : "days"}
          </span>
        ) : null}
        {hasMultipleImages ? (
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevious}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-sm font-semibold text-[#2f4a2f] shadow-sm transition hover:bg-white"
              aria-label={`View previous image for ${tour.title}`}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-sm font-semibold text-[#2f4a2f] shadow-sm transition hover:bg-white"
              aria-label={`View next image for ${tour.title}`}
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
      <div className="relative z-20 flex flex-1 flex-col gap-4 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
            {locationLabel}
          </p>
          <h3 className="mt-3 text-lg font-semibold text-[#1f2a1f]">
            {tour.title}
          </h3>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-3">
          <Link href={detailHref}>
            <a className="inline-flex items-center justify-center rounded-full border border-[#2f4a2f]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f] transition hover:bg-[#eef4ea]">
              View details
            </a>
          </Link>
          <Link href={bookingHref}>
            <a className="inline-flex items-center justify-center rounded-full bg-[#2f8a3d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:bg-[#287a35]">
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

  const multiDayTours = useMemo(() => {
    return tours
      .map((tour) => {
        const durationDays = getTourDurationDays(tour);
        return {
          tour,
          durationDays,
          isMultiDay: isMultiDayTour(tour, durationDays),
        };
      })
      .filter(({ isMultiDay }) => isMultiDay);
  }, []);

  const regionOptions = useMemo(() => {
    const uniqueRegions = new Set<string>();

    multiDayTours.forEach(({ tour }) => {
      const region = tour.destination.state || tour.destination.country;
      if (region) {
        uniqueRegions.add(region);
      }
    });

    return Array.from(uniqueRegions).sort((a, b) => a.localeCompare(b));
  }, [multiDayTours]);

  const filteredTours = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return multiDayTours.filter(({ tour, durationDays }) => {
      if (selectedRegion !== "all") {
        const region = tour.destination.state || tour.destination.country;
        if (region !== selectedRegion) {
          return false;
        }
      }

      if (selectedDuration !== "all") {
        if (durationDays === undefined) {
          return false;
        }

        if (selectedDuration === "2-3" && (durationDays < 2 || durationDays > 3)) {
          return false;
        }

        if (selectedDuration === "4-7" && (durationDays < 4 || durationDays > 7)) {
          return false;
        }

        if (selectedDuration === "8+" && durationDays < 8) {
          return false;
        }
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchHaystack = [
        tour.title,
        tour.destination.city,
        tour.destination.state,
        tour.destination.country,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchHaystack.includes(normalizedSearch);
    });
  }, [multiDayTours, searchTerm, selectedDuration, selectedRegion]);

  return (
    <>
      {seo ? (
        <Seo
          title={seo.title}
          description={seo.description}
          url={seo.url}
          image={seo.image}
        />
      ) : null}
      <main className="mx-auto max-w-6xl px-6 py-16 text-[#1f2a1f]">
        <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
          Journeys
        </p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
          Multi-day tours
        </h1>
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
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search multi-day tours by location or name…"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-normal text-[#1f2a1f] shadow-sm focus:border-[#2f4a2f] focus:outline-none"
              />
            </label>
            <label className="flex flex-1 flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
              Region
              <select
                value={selectedRegion}
                onChange={(event) => setSelectedRegion(event.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-normal text-[#1f2a1f] shadow-sm focus:border-[#2f4a2f] focus:outline-none"
              >
                <option value="all">All regions</option>
                {regionOptions.map((region) => (
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
                onChange={(event) => setSelectedDuration(event.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-normal text-[#1f2a1f] shadow-sm focus:border-[#2f4a2f] focus:outline-none"
              >
                <option value="all">All durations</option>
                {durationBuckets.map((bucket) => (
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
            <JourneyCard
              key={tour.id}
              tour={tour}
              durationDays={durationDays}
            />
          ))}
        </section>

        <section className="mt-16 rounded-3xl border border-[#2f8a3d]/30 bg-[#f3fbf5] px-6 py-10 text-center">
          <h2 className="text-2xl font-semibold text-[#1f2a1f]">
            Design a journey that’s entirely yours
          </h2>
          <p className="mt-3 text-sm text-[#405040]">
            Tell us what you have in mind and we’ll craft a custom multi-day itinerary
            with the right pace, lodging, and adventure mix.
          </p>
          <div className="mt-6 flex justify-center">
            <a
              href="tel:+18553148687"
              aria-label="Contact us for a custom tour. Call 855-314-TOUR"
              className="inline-flex items-center gap-2 rounded-full bg-[#2f8a3d] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:bg-[#287a35]"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-white"
                >
                  <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1v3.49a1 1 0 01-.91 1 19.91 19.91 0 01-8.68-2.36 19.58 19.58 0 01-6-6A19.91 19.91 0 012 5.91a1 1 0 011-.91H6.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z" />
                </svg>
              </span>
              Contact us for a custom tour
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
