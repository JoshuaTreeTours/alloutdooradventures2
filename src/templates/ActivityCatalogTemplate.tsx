import type { ChangeEvent } from "react";
import { Link } from "wouter";

import Image from "../components/Image";
import TourCard from "../components/TourCard";
import { countriesWithTours } from "../data/europeIndex";
import {
  US_STATES,
  WORLD_DESTINATIONS,
  slugify,
} from "../data/tourCatalog";
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

      <section
        className="mx-auto max-w-6xl space-y-8 px-6 pb-16"
        aria-label="International destinations"
      >
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            International
          </span>
          <h2 className="mt-2 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            Find {title.toLowerCase()} tours worldwide
          </h2>
          <p className="mt-3 text-sm text-[#405040] md:text-base">
            Jump into Europe or explore other global destinations as we expand
            our activity catalog.
          </p>
        </div>

        <div className="space-y-6">
          <details className="group rounded-2xl border border-[#d6decf] bg-white/80 p-6 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-[#2f4a2f]">
              <span>Europe</span>
              <span
                aria-hidden="true"
                className="text-[#7a8a6b] transition-transform duration-200 group-open:rotate-180"
              >
                ▾
              </span>
            </summary>
            <p className="mt-2 text-sm text-[#405040] md:text-base">
              Browse every country we plan to support, from alpine escapes to
              coastal rides.
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-[#2f4a2f] sm:grid-cols-2 lg:grid-cols-3">
              {countriesWithTours.map((country) => (
                <li key={country.slug}>
                  <a
                    className="flex items-center gap-2 rounded-full border border-[#d6decf] px-4 py-2 transition hover:border-[#2f4a2f] hover:text-[#1f2a1f]"
                    href={`/destinations/europe/${country.slug}`}
                  >
                    {country.name}
                  </a>
                </li>
              ))}
            </ul>
          </details>

          <details className="group rounded-2xl border border-[#d6decf] bg-white/80 p-6 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-[#2f4a2f]">
              <span>Other international countries</span>
              <span
                aria-hidden="true"
                className="text-[#7a8a6b] transition-transform duration-200 group-open:rotate-180"
              >
                ▾
              </span>
            </summary>
            <p className="mt-2 text-sm text-[#405040] md:text-base">
              Keep an eye on the next wave of global tour hubs and partner
              regions.
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-[#2f4a2f] sm:grid-cols-2 lg:grid-cols-3">
              {WORLD_DESTINATIONS.map((destination) => (
                <li key={destination}>
                  <a
                    className="flex items-center gap-2 rounded-full border border-[#d6decf] px-4 py-2 transition hover:border-[#2f4a2f] hover:text-[#1f2a1f]"
                    href={`/tours/${activitySlug}/world/${slugify(destination)}`}
                  >
                    {destination}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </section>
    </main>
  );
}
