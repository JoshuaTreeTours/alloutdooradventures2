import { useMemo, useState, type ChangeEvent } from "react";
import { Link } from "wouter";

import Image from "../components/Image";
import { EUROPE_CITIES, US_STATES, slugify } from "../data/tourCatalog";

type ActivityCatalogTemplateProps = {
  title: string;
  description: string;
  image: string;
  activitySlug: string;
};

export default function ActivityCatalogTemplate({
  title,
  description,
  image,
  activitySlug,
}: ActivityCatalogTemplateProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredStates = useMemo(
    () =>
      US_STATES.filter((state) =>
        state.toLowerCase().includes(normalizedSearch)
      ),
    [normalizedSearch]
  );

  const filteredRegions = useMemo(
    () =>
      EUROPE_CITIES.map((region) => ({
        ...region,
        cities: region.cities.filter((city) =>
          city.toLowerCase().includes(normalizedSearch)
        ),
      })).filter((region) => region.cities.length > 0),
    [normalizedSearch]
  );

  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!event.target.value) {
      return;
    }

    window.location.assign(
      `/tours/${activitySlug}/us/${slugify(event.target.value)}`
    );
  };

  const handleInternationalChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!event.target.value) {
      return;
    }

    window.location.assign(
      `/tours/${activitySlug}/europe/${slugify(event.target.value)}`
    );
  };

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <section className="relative overflow-hidden bg-[#2f4a2f]">
        <Image
          src={image}
          fallbackSrc="/hero.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-20 text-white">
          <span className="text-xs uppercase tracking-[0.3em] text-white/80">
            Activity guide
          </span>
          <div className="max-w-2xl space-y-3">
            <h1 className="text-3xl font-semibold md:text-5xl">{title}</h1>
            <p className="text-sm text-white/90 md:text-base">{description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/tours/catalog"
              className="inline-flex items-center justify-center rounded-md bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/25"
            >
              Back to catalog
            </Link>
            <Link
              href="/tours"
              className="inline-flex items-center justify-center rounded-md bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/15"
            >
              Tours home
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            Searchable index
          </span>
          <h2 className="mt-3 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            Find destinations fast
          </h2>
          <p className="mt-3 text-sm text-[#405040] md:text-base">
            Filter the state and international lists with a quick search.
          </p>
        </div>
        <div className="mx-auto mt-6 max-w-xl">
          <label
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a8a6b]"
            htmlFor={`${activitySlug}-search`}
          >
            Search destinations
          </label>
          <div className="mt-2 rounded-xl border border-black/10 bg-white/80 px-4 py-3 shadow-sm">
            <input
              id={`${activitySlug}-search`}
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search states or cities"
              className="w-full bg-transparent text-sm font-semibold text-[#2f4a2f] placeholder:text-[#7a8a6b]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            United States
          </span>
          <h2 className="mt-3 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            {title} by state
          </h2>
          <p className="mt-3 text-sm text-[#405040] md:text-base">
            These links are placeholders until each state has its tour lineup.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-md">
          <label
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a8a6b]"
            htmlFor={`${activitySlug}-state-select`}
          >
            Select a state
          </label>
          <div className="mt-2 rounded-xl border border-black/10 bg-white/80 px-4 py-3 shadow-sm">
            <select
              id={`${activitySlug}-state-select`}
              className="w-full bg-transparent text-sm font-semibold text-[#2f4a2f]"
              defaultValue=""
              onChange={handleStateChange}
            >
              <option value="" disabled>
                Choose a state
              </option>
              {filteredStates.length > 0 ? (
                filteredStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No matches found
                </option>
              )}
            </select>
          </div>
        </div>
        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7a8a6b]">
            State index
          </h3>
          {filteredStates.length > 0 ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStates.map((state) => (
                <Link
                  key={state}
                  href={`/tours/${activitySlug}/us/${slugify(state)}`}
                >
                  <a className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-[#2f4a2f] transition hover:border-[#2f4a2f]/40 hover:bg-white/90">
                    {state}
                  </a>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#405040]">
              No states match that search yet.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            Europe
          </span>
          <h2 className="mt-3 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            Major cities to populate next
          </h2>
          <p className="mt-3 text-sm text-[#405040] md:text-base">
            Add tour listings to each city when partnerships are ready.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-md">
          <label
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a8a6b]"
            htmlFor={`${activitySlug}-international-select`}
          >
            Select an international destination
          </label>
          <div className="mt-2 rounded-xl border border-black/10 bg-white/80 px-4 py-3 shadow-sm">
            <select
              id={`${activitySlug}-international-select`}
              className="w-full bg-transparent text-sm font-semibold text-[#2f4a2f]"
              defaultValue=""
              onChange={handleInternationalChange}
            >
              <option value="" disabled>
                Choose a city
              </option>
              {filteredRegions.length > 0 ? (
                filteredRegions.map((region) => (
                  <optgroup key={region.region} label={region.region}>
                    {region.cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </optgroup>
                ))
              ) : (
                <option value="" disabled>
                  No matches found
                </option>
              )}
            </select>
          </div>
        </div>
        <div className="mt-8 space-y-4">
          {filteredRegions.length > 0 ? (
            filteredRegions.map((region) => (
              <details
                key={region.region}
                className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm"
              >
                <summary className="cursor-pointer list-none text-base font-semibold text-[#1f2a1f]">
                  {region.region}
                </summary>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {region.cities.map((city) => (
                    <Link
                      key={city}
                      href={`/tours/${activitySlug}/europe/${slugify(city)}`}
                    >
                      <a className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-[#2f4a2f] transition hover:border-[#2f4a2f]/40 hover:bg-white/90">
                        {city}
                      </a>
                    </Link>
                  ))}
                </div>
              </details>
            ))
          ) : (
            <p className="text-sm text-[#405040]">
              No international destinations match that search yet.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
