import type { ChangeEvent } from "react";
import { Link } from "wouter";

import Image from "../components/Image";
import TourCard from "../components/TourCard";
import { EUROPE_CITIES, US_STATES, slugify } from "../data/tourCatalog";
import { getToursByActivity } from "../data/tours";

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
  const activityTours = getToursByActivity(activitySlug);
  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!event.target.value) {
      return;
    }

    window.location.assign(
      `/tours/${activitySlug}/us/${slugify(event.target.value)}`
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
              {US_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            Featured tours
          </span>
          <h2 className="mt-3 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            {title} tours you can book now
          </h2>
          <p className="mt-3 text-sm text-[#405040] md:text-base">
            Filtered from the live tour inventory so each activity page stays
            up to date.
          </p>
        </div>
        {activityTours.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {activityTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-center text-sm text-[#405040]">
            New {title.toLowerCase()} tours are on the way. Check back soon.
          </p>
        )}
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
          ))}
        </div>
      </section>
    </main>
  );
}
