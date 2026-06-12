import { useMemo, useState } from "react";
import { Link } from "wouter";

import RegionDropdownButton from "../../components/RegionDropdownButton";
import TourCard from "../../components/TourCard";
import { countriesWithTours } from "../../data/europeIndex";
import { tours } from "../../data/tours";
import type { Tour } from "../../data/tours.types";
import { US_STATES, slugify } from "../../data/tourCatalog";
import { getAllEngine2Tours } from "../../engine2/data/loadEngine2";
import { isUsCountryAlias } from "../../utils/guides/usCountryAliases";

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

const getTourRegionSlug = (tour: Tour) =>
  tour.destination.stateSlug ||
  slugify(tour.destination.country ?? tour.destination.state);

const getTourRegionName = (tour: Tour) =>
  tour.destination.country || tour.destination.state || "Unknown";

const AFRICA_COUNTRY_SLUGS = new Set([
  "kenya",
  "tanzania",
  "ethiopia",
  "madagascar",
]);
const AFRICA_ENGINE2_MAP: Record<string, { country: string; city: string }> = {
  "517094": { country: "Tanzania", city: "Zanzibar" },
};

type RegionOption = { slug: string; name: string };

const normalizeOptionValue = (value: string) => slugify(value.trim().toLowerCase());

const dedupeAndSortOptions = (options: RegionOption[]) => {
  const byNormalized = new Map<string, RegionOption>();
  options.forEach((option) => {
    const normalized = normalizeOptionValue(option.slug || option.name);
    if (!normalized || byNormalized.has(normalized)) {
      return;
    }
    byNormalized.set(normalized, {
      slug: option.slug,
      name: option.name.trim(),
    });
  });
  return Array.from(byNormalized.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
};

export default function MultiDayLanding() {
  const [selectedState, setSelectedState] = useState("");
  const [selectedEurope, setSelectedEurope] = useState("");
  const [selectedAfrica, setSelectedAfrica] = useState("");
  const [selectedWorld, setSelectedWorld] = useState("");

  const multiDayTours = useMemo(
    () => {
      const engine2International = getAllEngine2Tours()
        .map((tour) => ({ tour, mapped: AFRICA_ENGINE2_MAP[tour.id] }))
        .filter(({ tour, mapped }) => !isUsCountryAlias(mapped?.country ?? tour.geo.country))
        .map((tour) => ({
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
        })) as Tour[];
      return [...tours, ...engine2International].filter((tour) =>
        isMultiDayTour(tour, getTourDurationDays(tour)),
      );
    },
    [],
  );
  const usStateMap = useMemo(
    () => new Map(US_STATES.map((state) => [slugify(state), state])),
    [],
  );
  const europeMap = useMemo(
    () => new Map(countriesWithTours.map((country) => [country.slug, country.name])),
    [],
  );

  const usOptions = useMemo(() => {
    const slugs = new Set<string>();
    multiDayTours.forEach((tour) => {
      const slug = getTourRegionSlug(tour);
      if (usStateMap.has(slug)) {
        slugs.add(slug);
      }
    });

    return dedupeAndSortOptions(
      Array.from(slugs)
      .map((slug) => ({
        slug,
        name: usStateMap.get(slug) ?? slug,
      }))
    );
  }, [multiDayTours, usStateMap]);

  const europeOptions = useMemo(() => {
    const slugs = new Set<string>();
    multiDayTours.forEach((tour) => {
      const slug = getTourRegionSlug(tour);
      if (europeMap.has(slug)) {
        slugs.add(slug);
      }
    });

    return dedupeAndSortOptions(
      Array.from(slugs)
      .map((slug) => ({
        slug,
        name: europeMap.get(slug) ?? slug,
      }))
    );
  }, [multiDayTours, europeMap]);

  const africaOptions = useMemo(() => {
    const destinationMap = new Map<string, string>();
    multiDayTours.forEach((tour) => {
      const slug = getTourRegionSlug(tour);
      if (!AFRICA_COUNTRY_SLUGS.has(slug)) {
        return;
      }
      if (!destinationMap.has(slug)) {
        destinationMap.set(slug, getTourRegionName(tour));
      }
    });
    return dedupeAndSortOptions(
      Array.from(destinationMap.entries()).map(([slug, name]) => ({
        slug,
        name,
      })),
    );
  }, [multiDayTours]);

  const worldOptions = useMemo(() => {
    const destinationMap = new Map<string, string>();
    multiDayTours.forEach((tour) => {
      const slug = getTourRegionSlug(tour);
      if (usStateMap.has(slug) || europeMap.has(slug) || AFRICA_COUNTRY_SLUGS.has(slug)) {
        return;
      }
      if (slug === "united-states" || (tour.destination.country || "").toLowerCase() === "united states") {
        return;
      }
      if (!destinationMap.has(slug)) {
        destinationMap.set(slug, getTourRegionName(tour));
      }
    });

    return dedupeAndSortOptions(
      Array.from(destinationMap.entries()).map(([slug, name]) => ({ slug, name })),
    );
  }, [multiDayTours, europeMap, usStateMap]);

  const selectedSlug = selectedState || selectedEurope || selectedAfrica || selectedWorld;
  const filteredTours = useMemo(() => {
    if (!selectedSlug) {
      return [];
    }
    return multiDayTours.filter(
      (tour) => getTourRegionSlug(tour) === selectedSlug,
    );
  }, [multiDayTours, selectedSlug]);

  const selectedLabel =
    usOptions.find((option) => option.slug === selectedState)?.name ||
    europeOptions.find((option) => option.slug === selectedEurope)?.name ||
    africaOptions.find((option) => option.slug === selectedAfrica)?.name ||
    worldOptions.find((option) => option.slug === selectedWorld)?.name;

  const hasSelection = Boolean(selectedSlug);

  const clearSelection = () => {
    setSelectedState("");
    setSelectedEurope("");
    setSelectedAfrica("");
    setSelectedWorld("");
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-[#1f2a1f]">
      <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
        Tours
      </p>
      <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
        Multi-Day Adventures
      </h1>
      <p className="mt-4 max-w-3xl text-sm text-[#405040] md:text-base">
        Plan longer itineraries with multi-day guided trips and overnights. Select
        a state or international destination to see available tours.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/tours">
          <a className="rounded-full border border-[#2f4a2f]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
            Back to tours
          </a>
        </Link>
      </div>

      <section className="mt-12 grid gap-6 lg:grid-cols-4">
        {usOptions.length > 0 ? (
        <div className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a8a6b]">
            United States
          </p>
          <h2 className="mt-3 text-lg font-semibold text-[#2f4a2f]">
            Multi-day tours by state
          </h2>
          <p className="mt-3 text-sm text-[#405040]">
            States are listed only when multi-day tours are available.
          </p>
          <div className="mt-6">
            <RegionDropdownButton
              label="Choose a state"
              options={usOptions}
              selectedName={
                usOptions.find((option) => option.slug === selectedState)?.name
              }
              onSelect={(slug) => {
                setSelectedState(slug);
                setSelectedEurope("");
                setSelectedAfrica("");
                setSelectedWorld("");
              }}
            />
          </div>
        </div>
        ) : null}
        {europeOptions.length > 0 ? (
        <div className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a8a6b]">
            Europe
          </p>
          <h2 className="mt-3 text-lg font-semibold text-[#2f4a2f]">
            European destinations
          </h2>
          <p className="mt-3 text-sm text-[#405040]">
            Select a country with multi-day tour availability.
          </p>
          <div className="mt-6">
            <RegionDropdownButton
              label="Select a country…"
              options={europeOptions}
              selectedName={
                europeOptions.find((option) => option.slug === selectedEurope)
                  ?.name
              }
              onSelect={(slug) => {
                setSelectedEurope(slug);
                setSelectedState("");
                setSelectedAfrica("");
                setSelectedWorld("");
              }}
            />
          </div>
        </div>
        ) : null}
        {africaOptions.length > 0 ? (
        <div className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a8a6b]">
            Africa
          </p>
          <h2 className="mt-3 text-lg font-semibold text-[#2f4a2f]">
            African destinations
          </h2>
          <p className="mt-3 text-sm text-[#405040]">
            Select an African country with multi-day tour availability.
          </p>
          <div className="mt-6">
            <RegionDropdownButton
              label="Select a country…"
              options={africaOptions}
              selectedName={
                africaOptions.find((option) => option.slug === selectedAfrica)
                  ?.name
              }
              onSelect={(slug) => {
                setSelectedAfrica(slug);
                setSelectedState("");
                setSelectedEurope("");
                setSelectedWorld("");
              }}
            />
          </div>
        </div>
        ) : null}
        {worldOptions.length > 0 ? (
        <div className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a8a6b]">
            Worldwide
          </p>
          <h2 className="mt-3 text-lg font-semibold text-[#2f4a2f]">
            Other global destinations
          </h2>
          <p className="mt-3 text-sm text-[#405040]">
            Explore multi-day tours outside the US and Europe.
          </p>
          <div className="mt-6">
            <RegionDropdownButton
              label="Select a country…"
              options={worldOptions}
              selectedName={
                worldOptions.find((option) => option.slug === selectedWorld)
                  ?.name
              }
              onSelect={(slug) => {
                setSelectedWorld(slug);
                setSelectedState("");
                setSelectedEurope("");
                setSelectedAfrica("");
              }}
            />
          </div>
        </div>
        ) : null}
      </section>

      <section className="mt-8 rounded-2xl border border-black/10 bg-white/70 p-6 text-sm text-[#405040]">
        {hasSelection ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-semibold text-[#2f4a2f]">
              {filteredTours.length} multi-day tour
              {filteredTours.length === 1 ? "" : "s"} in {selectedLabel}.
            </p>
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]"
            >
              Clear selection
            </button>
          </div>
        ) : (
          <p>Choose a state or international destination to see multi-day tours.</p>
        )}
      </section>

      {hasSelection ? (
        <section className="mt-8">
          {filteredTours.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-[#405040]">
              No multi-day tours are available for {selectedLabel} right now.
            </p>
          )}
        </section>
      ) : null}
    </main>
  );
}
