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

const buildStateHistory = (stateName: string) => [
  `${stateName} has long been shaped by Indigenous stewardship and the deep relationship between people and landscape. Seasonal migrations, trade routes, and cultural traditions followed rivers, mountain passes, and coastal corridors that still guide travelers today.`,
  `As exploration expanded, the state became known for its dramatic terrain and outdoor promise. Conservation efforts in the late 19th and early 20th centuries protected landmark valleys, shorelines, and wilderness areas, setting the stage for modern adventure travel.`,
  `Today, ${stateName} continues to blend heritage with recreation. Scenic byways trace historic routes, working towns anchor trail networks, and new generations of stewards are protecting the landscapes that make outdoor experiences possible.`,
];

export default function StateTemplate({ state }: { state: StateDestination }) {
  const paragraphs = state.longDescription.split("\n\n");
  const mapLocations = state.cities.map((city) => ({
    label: city.name,
    lat: city.lat,
    lng: city.lng,
  }));
  const historyHighlights = buildStateHistory(state.name);

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
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/80">
              {state.description}
            </p>
            <h1 className="text-3xl font-semibold md:text-5xl">
              {state.name}
            </h1>
            <p className="max-w-2xl text-sm text-white/90 md:text-base">
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
          {state.featuredDescription ? (
            <div className="max-w-3xl rounded-2xl border border-white/20 bg-white/10 p-5 text-sm text-white/90 md:text-base">
              {state.featuredDescription}
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                Featured regions
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {state.topRegions.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                Featured cities
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {state.cities.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                Best for
              </p>
              <p className="mt-2 text-base font-semibold">
                {state.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-col gap-2 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            State overview
          </span>
          <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            Why visit {state.name}
          </h2>
          <p className="text-sm text-[#405040] md:text-base">
            {state.description}
          </p>
        </div>
        <div className="mt-8 space-y-5 text-sm leading-relaxed text-[#405040] md:text-base">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
                  State history
                </span>
                <h2 className="mt-3 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
                  A brief history of {state.name}
                </h2>
              </div>
              <div className="space-y-4 text-sm leading-relaxed text-[#405040] md:text-base">
                {historyHighlights.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm">
              <h3 className="text-base font-semibold text-[#1f2a1f]">
                Quick travel snapshot
              </h3>
              <ul className="mt-4 space-y-4 text-sm text-[#405040]">
                <li>
                  <span className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
                    Signature regions
                  </span>
                  <p className="mt-1 font-semibold text-[#2f4a2f]">
                    {state.topRegions.map((region) => region.title).join(", ")}
                  </p>
                </li>
                <li>
                  <span className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
                    Featured cities
                  </span>
                  <p className="mt-1 font-semibold text-[#2f4a2f]">
                    {state.cities.map((city) => city.name).join(", ")}
                  </p>
                </li>
                <li>
                  <span className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
                    Travel focus
                  </span>
                  <p className="mt-1 font-semibold text-[#2f4a2f]">
                    {state.featuredDescription ?? state.description}
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-3 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            Top regions
          </span>
          <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            Explore {state.name} by region
          </h2>
          <p className="text-sm text-[#405040] md:text-base">
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
              <p className="mt-3 text-sm leading-relaxed text-[#405040]">
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
          <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            Plan a basecamp in {state.name}
          </h2>
          <p className="text-sm text-[#405040] md:text-base">
            Pick a city to start building your itinerary of trails, tours, and
            memorable outdoor days.
          </p>
        </div>
        <div className="mt-10 flex flex-col gap-6">
          {state.cities.map((city) => (
            <DestinationCard
              key={city.slug}
              destination={buildCityDestination(state.slug, city)}
              ctaLabel="Explore city"
              headingLevel="h3"
              descriptionVariant="featured"
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
            <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
              Map of featured cities
            </h2>
            <p className="text-sm text-[#405040] md:text-base">
              See how the featured cities connect across {state.name} and start
              planning a scenic route.
            </p>
          </div>
          <div className="mt-8">
            <MapEmbed
              title={`${state.name} featured cities map`}
              locations={mapLocations}
              query={state.name}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
