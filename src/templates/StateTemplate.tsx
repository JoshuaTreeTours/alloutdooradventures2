import { Link } from "wouter";

import DestinationCard from "../components/DestinationCard";
import Image from "../components/Image";
import MapEmbed from "../components/maps/MapEmbed";
import type { Destination, StateDestination } from "../data/destinations";

const buildCityDestination = (
  stateSlug: string,
  city: StateDestination["cities"][number]
): Destination => ({
  name: city.name,
  stateSlug,
  description: city.shortDescription,
  image: city.heroImages[0],
  href: `/destinations/states/${stateSlug}/cities/${city.slug}`,
});

export default function StateTemplate({ state }: { state: StateDestination }) {
  const paragraphs = state.longDescription.split("\n\n");
  const mapLocations = state.cities.map((city) => ({
    label: city.name,
    lat: city.lat,
    lng: city.lng,
  }));

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <section className="relative overflow-hidden bg-[#2f4a2f]">
        <Image
          src={state.heroImage}
          fallbackSrc="/hero.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-20 text-white">
          <Link href="/destinations">
            <a className="text-xs uppercase tracking-[0.3em] text-white/80">
              Destinations
            </a>
          </Link>
          <div>
            <h1 className="text-3xl md:text-5xl font-semibold">
              {state.name}
            </h1>
            <p className="mt-4 max-w-2xl text-sm md:text-base text-white/90">
              {state.intro}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {state.topRegions.map((category) => (
              <span
                key={category.title}
                className="rounded-full bg-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em]"
              >
                {category.title}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
          Why visit {state.name}
        </h2>
        <div className="mt-6 space-y-5 text-sm md:text-base text-[#405040] leading-relaxed">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex flex-col gap-3 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            Top regions
          </span>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
            Explore {state.name} by region
          </h2>
          <p className="text-sm md:text-base text-[#405040]">
            Each region offers a different flavor of adventure, from coastal loops
            to alpine escapes.
          </p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {state.topRegions.map((category) => (
            <div
              key={category.title}
              className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm"
            >
              <h3 className="text-base font-semibold text-[#1f2a1f]">
                {category.title}
              </h3>
              <p className="mt-3 text-sm text-[#405040] leading-relaxed">
                {category.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-6 pb-16"
        aria-label="Featured cities"
      >
        <div className="flex flex-col gap-2 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            Featured cities
          </span>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
            Plan a basecamp in {state.name}
          </h2>
          <p className="text-sm md:text-base text-[#405040]">
            Pick a city to start building your itinerary of trails, tours, and
            memorable outdoor days.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {state.cities.map((city) => (
            <DestinationCard
              key={city.slug}
              destination={buildCityDestination(state.slug, city)}
              ctaLabel="Explore city"
              headingLevel="h3"
            />
          ))}
        </div>
      </section>

      <section className="bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-3 text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
              Map overview
            </span>
            <h2 className="text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
              Map of featured cities
            </h2>
            <p className="text-sm md:text-base text-[#405040]">
              See how the featured cities connect across {state.name} and start
              planning a scenic route.
            </p>
          </div>
          <div className="mt-8">
            <MapEmbed
              title={`${state.name} featured cities map`}
              locations={mapLocations}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
