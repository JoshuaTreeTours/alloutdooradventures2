import { Link } from "wouter";

import DestinationCard from "../components/DestinationCard";
import ClientOnlyMap from "../components/maps/ClientOnlyMap";
import type { Destination, StateDestination } from "../data/destinations";

const buildCityDestination = (
  stateSlug: string,
  city: StateDestination["cities"][number]
): Destination => ({
  name: city.name,
  stateSlug,
  description: city.shortDescription,
  image: city.image,
  href: `/destinations/states/${stateSlug}/${city.slug}`,
});

const getMapCenter = (cities: StateDestination["cities"]) => {
  if (cities.length === 0) {
    return [39.5, -116.8] as [number, number];
  }

  const totals = cities.reduce(
    (acc, city) => {
      acc.lat += city.lat;
      acc.lng += city.lng;
      return acc;
    },
    { lat: 0, lng: 0 }
  );

  return [totals.lat / cities.length, totals.lng / cities.length] as [
    number,
    number,
  ];
};

export default function StatePage({ state }: { state: StateDestination }) {
  const paragraphs = state.longDescription.split("\n\n");
  const markers = state.cities.map((city) => ({
    name: city.name,
    position: [city.lat, city.lng] as [number, number],
    description: city.shortDescription,
  }));

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <section className="relative overflow-hidden bg-[#2f4a2f]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${state.heroImage})` }}
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
              {state.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {state.categories.map((category) => (
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
          Why {state.name} belongs on your adventure list
        </h2>
        <div className="mt-6 space-y-5 text-sm md:text-base text-[#405040] leading-relaxed">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
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
              Special categories
            </span>
            <h2 className="text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
              Signature ways to explore {state.name}
            </h2>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {state.specialCategories.map((category) => (
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
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-3 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            Map overview
          </span>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
            Featured city map
          </h2>
          <p className="text-sm md:text-base text-[#405040]">
            Browse the featured cities and see how each adventure basecamp fits
            into your route.
          </p>
        </div>
        <div className="mt-8">
          <ClientOnlyMap
            center={getMapCenter(state.cities)}
            zoom={6}
            markers={markers}
          />
        </div>
      </section>
    </main>
  );
}
