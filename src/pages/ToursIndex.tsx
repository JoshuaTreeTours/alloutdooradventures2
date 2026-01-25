import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

import RegionDropdownButton from "../components/RegionDropdownButton";
import Seo from "../components/Seo";
import TourCard from "../components/TourCard";
import { countriesWithTours } from "../data/europeIndex";
import { worldCountriesWithTours } from "../data/worldIndex";
import { tours } from "../data/tours";
import {
  ACTIVITY_PAGES,
  ADVENTURE_ACTIVITY_PAGES,
  US_STATES,
} from "../data/tourCatalog";
import { buildMetaDescription } from "../utils/seo";

export default function ToursIndex() {
  const title = "All Tours | All Outdoor Adventures";
  const description = buildMetaDescription(
    "Browse every outdoor tour in our catalog, with filters for activity, destination, and local guide partners.",
    "Find curated experiences, from day tours to multi-day adventures, across the United States and worldwide.",
  );
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedActivitySlug, setSelectedActivitySlug] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const countryOptions = useMemo(() => {
    const options = [
      ...countriesWithTours.map((country) => ({
        name: country.name,
        slug: `europe:${country.slug}`,
      })),
      ...worldCountriesWithTours.map((country) => ({
        name: country.name,
        slug: `world:${country.slug}`,
      })),
    ];
    return options.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const stateOptions = useMemo(() => US_STATES, []);
  const US_STATE_SET = useMemo(() => new Set(US_STATES), []);
  const isUSState = (state?: string) => !!state && US_STATE_SET.has(state);
  const isUSTour = (tour: (typeof tours)[number]) => {
    const country = tour?.destination?.country as string | undefined;
    return !country || country === "United States" || country === "USA";
  };

  const normalizeActivitySlug = (slugOrLabel: string) => {
    const labelToSlug: Record<string, string> = {
      Hiking: "hiking",
      Cycling: "cycling",
      "Paddle Sports": "paddle-sports",
      "Day Tours": "day-tours",
    };
    const slugToSlug: Record<string, string> = {
      canoeing: "paddle-sports",
      detours: "day-tours",
      "day-adventures": "day-tours",
    };
    return slugToSlug[slugOrLabel] ?? labelToSlug[slugOrLabel] ?? slugOrLabel;
  };

  const baseTours = useMemo(() => {
    if (!isUSState(selectedState)) {
      return tours;
    }

    return tours.filter(
      (tour) =>
        tour?.destination?.state === selectedState &&
        isUSTour(tour),
    );
  }, [tours, selectedState, US_STATE_SET]);

  const cityOptions = useMemo(() => {
    if (!selectedState || !isUSState(selectedState)) {
      return [];
    }
    const cities = baseTours
      .map((tour) => tour.destination?.city)
      .filter(Boolean);
    return Array.from(new Set(cities)).sort();
  }, [baseTours, selectedState]);

  const activityOptions = useMemo(() => {
    const activities = [...ADVENTURE_ACTIVITY_PAGES, ...ACTIVITY_PAGES];
    const mapped = activities.map((activity) => ({
      slug: normalizeActivitySlug(activity.slug),
      label: activity.title,
    }));
    const uniqueBySlug = new Map<string, { slug: string; label: string }>();
    mapped.forEach((activity) => {
      if (!uniqueBySlug.has(activity.slug)) {
        uniqueBySlug.set(activity.slug, activity);
      }
    });
    return Array.from(uniqueBySlug.values());
  }, [normalizeActivitySlug]);

  const getTourActivitySlug = (tour: (typeof tours)[number]) =>
    normalizeActivitySlug(tour.primaryCategory ?? tour.activitySlugs[0] ?? "");

  useEffect(() => {
    setSelectedCity("");
  }, [selectedState]);

  useEffect(() => {
    if (selectedCity && !cityOptions.includes(selectedCity)) {
      setSelectedCity("");
    }
  }, [selectedCity, cityOptions]);

  const filteredTours = useMemo(() => {
    return baseTours.filter((tour) => {
      const matchesCity = selectedCity
        ? tour.destination?.city === selectedCity
        : true;
      const activitySlug = getTourActivitySlug(tour);
      const matchesActivity = selectedActivitySlug
        ? activitySlug === selectedActivitySlug
        : true;
      return matchesCity && matchesActivity;
    });
  }, [baseTours, selectedCity, selectedActivitySlug]);

  useEffect(() => {
    if (!import.meta.env?.DEV) {
      return;
    }
    const anomalies = tours.filter(
      (tour) => isUSState(tour?.destination?.state) && !isUSTour(tour),
    );
    if (anomalies.length > 0) {
      console.error(
        "[ToursIndex] US state tours with non-US country detected:",
        anomalies.map((tour) => `${tour.slug} (${tour.title})`),
      );
    }
    if (selectedActivitySlug !== "hiking") {
      return;
    }
    filteredTours.forEach((tour) => {
      if (getTourActivitySlug(tour) !== "hiking") {
        console.error(
          "[ToursIndex] Hiking filter violation:",
          tour.slug,
          tour.title,
        );
      }
    });
  }, [filteredTours, selectedActivitySlug]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <Seo title={title} description={description} url="/tours" />
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#2f4a2f]">
          Tours
        </h1>
        <p className="mt-3 max-w-2xl text-sm md:text-base text-[#405040] leading-relaxed">
          Browse tours by destination or activity. Filter the live inventory
          below to see which adventures are available in each city.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/destinations"
            className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#294129] transition"
          >
            Explore Destinations
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-black/5 px-4 py-2 text-sm font-semibold text-[#2f4a2f] hover:bg-black/10 transition"
          >
            Home
          </Link>
        </div>
      </header>

      <section className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm">
        <div className="space-y-4">
          <RegionDropdownButton
            label="Select a country…"
            options={countryOptions}
            selectedName={
              countryOptions.find((country) => country.slug === selectedCountry)
                ?.name
            }
            onSelect={(slug) => {
              const [region, countrySlug] = slug.split(":");
              if (!countrySlug) {
                return;
              }
              setSelectedCountry(slug);
              const basePath =
                region === "world" ? "/destinations/world" : "/destinations/europe";
              window.location.assign(`${basePath}/${countrySlug}`);
            }}
          />
          {selectedCountry ? (
            <div className="mt-2">
              <Link
                href={
                  selectedCountry.startsWith("world:")
                    ? `/destinations/world/${selectedCountry.replace("world:", "")}`
                    : `/destinations/europe/${selectedCountry.replace("europe:", "")}/tours`
                }
              >
                <a className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
                  View all country tours →
                </a>
              </Link>
            </div>
          ) : null}
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
            United States
          </p>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <RegionDropdownButton
              label="Choose a state"
              options={stateOptions.map((state) => ({
                name: state,
                slug: state,
              }))}
              selectedName={selectedState || undefined}
              onSelect={(slug) => {
                setSelectedState(slug);
                setSelectedCity("");
              }}
            />
            <RegionDropdownButton
              label="Choose a city"
              options={cityOptions.map((city) => ({
                name: city,
                slug: city,
              }))}
              selectedName={selectedCity || undefined}
              onSelect={(slug) => setSelectedCity(slug)}
            />
            <RegionDropdownButton
              label="Choose an activity"
              options={activityOptions.map((activity) => ({
                name: activity.label,
                slug: activity.slug,
              }))}
              selectedName={
                activityOptions.find(
                  (activity) => activity.slug === selectedActivitySlug,
                )?.label
              }
              onSelect={(slug) => setSelectedActivitySlug(normalizeActivitySlug(slug))}
            />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between text-sm text-[#405040]">
          <p className="font-semibold">
            {filteredTours.length} tours available
          </p>
          <Link href="/destinations">
            <a className="font-semibold text-[#2f4a2f]">Browse destinations →</a>
          </Link>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </section>
    </main>
  );
}
