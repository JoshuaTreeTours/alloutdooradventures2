import { Link } from "wouter";

import ClientOnlyMap from "../components/maps/ClientOnlyMap";
import type { City, StateDestination, Tour } from "../data/destinations";

const hasMatchingTag = (tags: string[], matches: string[]) =>
  tags.some((tag) => matches.includes(tag));

export default function CityPage({
  state,
  city,
  tours,
}: {
  state: StateDestination;
  city: City;
  tours: Tour[];
}) {
  const filteredTours = tours.filter(
    (tour) =>
      tour.stateSlug === state.slug &&
      hasMatchingTag(tour.tags, city.categoryTags)
  );

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${city.image})` }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-4 px-6 py-16 text-white">
          <Link href={`/destinations/states/${state.slug}`}>
            <a className="text-xs uppercase tracking-[0.3em] text-white/80">
              {state.name}
            </a>
          </Link>
          <div>
            <h1 className="text-3xl md:text-5xl font-semibold">{city.name}</h1>
            <p className="mt-4 max-w-2xl text-sm md:text-base text-white/90">
              {city.shortDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {city.categoryTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em]"
              >
                {tag.replace(/-/g, " ")}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
          Outdoor highlights in {city.name}
        </h2>
        <p className="mt-4 text-sm md:text-base text-[#405040] leading-relaxed">
          {city.intro}
        </p>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {city.activities.map((activity) => (
            <li
              key={activity}
              className="rounded-2xl border border-black/10 bg-white/80 p-5 text-sm text-[#405040]"
            >
              {activity}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-col gap-2 text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
              Tours & outings
            </span>
            <h2 className="text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
              Tours that match {city.name}
            </h2>
            <p className="text-sm md:text-base text-[#405040]">
              These curated experiences pair well with the landscapes and outdoor
              vibes around {city.name}.
            </p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {filteredTours.length > 0 ? (
              filteredTours.map((tour) => (
                <div
                  key={tour.id}
                  className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
                >
                  <h3 className="text-base font-semibold text-[#1f2a1f]">
                    {tour.name}
                  </h3>
                  <p className="mt-3 text-sm text-[#405040] leading-relaxed">
                    {tour.description}
                  </p>
                  <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
                    {tour.duration}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-black/20 bg-white/70 p-6 text-sm text-[#405040]">
                New tours are being added for {city.name}. Check back soon or
                explore nearby adventures in {state.name}.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="flex flex-col gap-2 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            Map
          </span>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
            {city.name} on the map
          </h2>
        </div>
        <div className="mt-8">
          <ClientOnlyMap
            center={[city.lat, city.lng]}
            zoom={11}
            markers={[
              {
                name: city.name,
                position: [city.lat, city.lng],
                description: city.shortDescription,
              },
            ]}
            heightClassName="h-72"
          />
        </div>
      </section>
    </main>
  );
}
