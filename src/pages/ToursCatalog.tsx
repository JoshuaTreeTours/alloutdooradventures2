import type { ChangeEvent } from "react";
import { Link } from "wouter";

import {
  ACTIVITY_PAGES,
  EUROPE_CITIES,
  US_STATES,
  slugify,
} from "../data/tourCatalog";

export default function ToursCatalog() {
  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!event.target.value) {
      return;
    }

    window.location.assign(`/tours/us/${slugify(event.target.value)}`);
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
          Tour catalog
        </span>
        <h1 className="text-3xl font-semibold text-[#2f4a2f] md:text-4xl">
          Browse tours by activity or destination
        </h1>
        <p className="max-w-3xl text-sm text-[#405040] md:text-base">
          This catalog is designed to grow with your tour inventory. Start with
          activity categories and region lists, then connect each destination to
          your tour pages and booking links as they go live.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/tours"
            className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129]"
          >
            Tours home
          </Link>
          <Link
            href="/destinations"
            className="inline-flex items-center justify-center rounded-md bg-black/5 px-4 py-2 text-sm font-semibold text-[#2f4a2f] transition hover:bg-black/10"
          >
            Destinations
          </Link>
        </div>
      </header>

      <section className="mt-12">
        <div className="flex flex-col gap-2 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            Activity focus
          </span>
          <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            Tour styles your travelers ask for most
          </h2>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {ACTIVITY_PAGES.map((category) => (
            <Link
              key={category.title}
              href={`/tours/activities/${category.slug}`}
            >
              <a className="flex h-full flex-col justify-between rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div>
                  <h3 className="text-base font-semibold text-[#1f2a1f]">
                    {category.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#405040]">
                    {category.description}
                  </p>
                </div>
                <span className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
                  Explore {category.title} →
                </span>
              </a>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="flex flex-col gap-2 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            United States
          </span>
          <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            All 50 states
          </h2>
          <p className="text-sm text-[#405040] md:text-base">
            Link each state to a future tour hub as you build inventory.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-md">
          <label
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a8a6b]"
            htmlFor="catalog-state-select"
          >
            Select a state
          </label>
          <div className="mt-2 rounded-xl border border-black/10 bg-white/80 px-4 py-3 shadow-sm">
            <select
              id="catalog-state-select"
              className="w-full bg-transparent text-sm font-semibold text-[#2f4a2f]"
              defaultValue=""
              onChange={handleStateChange}
            >
              <option value="" disabled>
                Choose a state
              </option>
              {US_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="flex flex-col gap-2 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            Europe
          </span>
          <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            Major cities to populate next
          </h2>
          <p className="text-sm text-[#405040] md:text-base">
            Use these as placeholders for city pages and specific tour listings.
          </p>
        </div>
        <div className="mt-8 space-y-4">
          {EUROPE_CITIES.map((region) => (
            <details
              key={region.region}
              className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm"
            >
              <summary className="cursor-pointer list-none text-base font-semibold text-[#1f2a1f]">
                {region.region}
              </summary>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {region.cities.map((city) => (
                  <Link key={city} href={`/tours/europe/${slugify(city)}`}>
                    <a className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-[#2f4a2f] transition hover:border-[#2f4a2f]/40 hover:bg-white/90">
                      {city}
                    </a>
                  </Link>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
