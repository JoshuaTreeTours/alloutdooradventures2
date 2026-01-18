import { useMemo, useState } from "react";
import { Link } from "wouter";

import AccordionSelect from "../components/AccordionSelect";
import TourCard from "../components/TourCard";
import { tours } from "../data/tours";
import { ACTIVITY_PAGES, ADVENTURE_ACTIVITY_PAGES } from "../data/tourCatalog";

export default function ToursIndex() {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");

  const stateOptions = useMemo(() => {
    const uniqueStates = Array.from(
      new Set(tours.map((tour) => tour.destination.state)),
    );
    return uniqueStates.sort();
  }, [tours]);

  const cityOptions = useMemo(() => {
    const filtered = tours.filter((tour) =>
      selectedState
        ? tour.destination.state === selectedState
        : true,
    );
    return Array.from(new Set(filtered.map((tour) => tour.destination.city))).sort();
  }, [selectedState]);

  const activityOptions = useMemo(() => {
    const activities = [...ADVENTURE_ACTIVITY_PAGES, ...ACTIVITY_PAGES];
    return activities.map((activity) => ({
      slug: activity.slug,
      label: activity.title,
    }));
  }, []);

  const filteredTours = useMemo(
    () =>
      tours.filter((tour) => {
        const matchesState = selectedState
          ? tour.destination.state === selectedState
          : true;
        const matchesCity = selectedCity
          ? tour.destination.city === selectedCity
          : true;
        const matchesActivity = selectedActivity
          ? tour.activitySlugs.includes(selectedActivity)
          : true;
        return matchesState && matchesCity && matchesActivity;
      }),
    [selectedState, selectedCity, selectedActivity],
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
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
        <div className="grid gap-4 md:grid-cols-3">
          <AccordionSelect
            id="tours-state"
            label="State"
            placeholder="All states"
            value={selectedState}
            options={[
              { label: "All states", value: "" },
              ...stateOptions.map((state) => ({
                label: state,
                value: state,
              })),
            ]}
            onSelect={(value) => {
              setSelectedState(value);
              setSelectedCity("");
            }}
          />
          <AccordionSelect
            id="tours-city"
            label="City"
            placeholder="All cities"
            value={selectedCity}
            options={[
              { label: "All cities", value: "" },
              ...cityOptions.map((city) => ({
                label: city,
                value: city,
              })),
            ]}
            onSelect={(value) => setSelectedCity(value)}
          />
          <AccordionSelect
            id="tours-activity"
            label="Activity"
            placeholder="All activities"
            value={selectedActivity}
            options={[
              { label: "All activities", value: "" },
              ...activityOptions.map((activity) => ({
                label: activity.label,
                value: activity.slug,
              })),
            ]}
            onSelect={(value) => setSelectedActivity(value)}
          />
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
