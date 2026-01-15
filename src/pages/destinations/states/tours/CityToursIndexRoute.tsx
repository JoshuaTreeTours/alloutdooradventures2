import { Link } from "wouter";

import Image from "../../../../components/Image";
import { getCityBySlugs, getStateBySlug } from "../../../../data/destinations";
import { getCityTours } from "../../../../data/cityTours";

type CityToursIndexRouteProps = {
  params: {
    stateSlug: string;
    citySlug: string;
  };
};

export default function CityToursIndexRoute({
  params,
}: CityToursIndexRouteProps) {
  const state = getStateBySlug(params.stateSlug);
  const city = getCityBySlugs(params.stateSlug, params.citySlug);

  if (!state || !city) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Tours not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that city. Head back to destinations to keep
          exploring.
        </p>
      </main>
    );
  }

  const tours = getCityTours(city.name);
  const cityHref = `/destinations/states/${state.slug}/cities/${city.slug}`;
  const toursHref = `/destinations/${state.slug}/${city.slug}/tours`;
  const heroImage = city.heroImages[0] ?? "/hero.jpg";

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/80">
            <Link href="/destinations">
              <a>Destinations</a>
            </Link>
            <span>/</span>
            <Link href={`/destinations/states/${state.slug}`}>
              <a>{state.name}</a>
            </Link>
            <span>/</span>
            <Link href={cityHref}>
              <a>{city.name}</a>
            </Link>
            <span>/</span>
            <span className="text-white">Tours</span>
          </div>
          <div>
            <h1 className="text-3xl font-semibold md:text-5xl">
              Tours in {city.name}
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-white/90 md:text-base">
              Browse a few guided experiences to validate FareHarbor booking
              flow, affiliates, and iOS Safari behavior.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
          <Image
            src={heroImage}
            fallbackSrc="/hero.jpg"
            alt={`${city.name} hero`}
            className="h-64 w-full object-cover md:h-80"
          />
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tours.map((tour) => (
            <div
              key={tour.slug}
              className="flex h-full flex-col rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
            >
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
                  {tour.duration}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[#1f2a1f]">
                  {tour.name}
                </h2>
                <p className="mt-3 text-sm text-[#405040]">{tour.summary}</p>
                <ul className="mt-4 space-y-2 text-sm text-[#405040]">
                  {tour.highlights.map((highlight) => (
                    <li key={highlight}>• {highlight}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`${toursHref}/${tour.slug}`}
                >
                  <a className="inline-flex items-center justify-center rounded-md bg-black/5 px-4 py-2 text-sm font-semibold text-[#2f4a2f] transition hover:bg-black/10">
                    Tour details
                  </a>
                </Link>
                <Link
                  href={`${toursHref}/${tour.slug}/book`}
                >
                  <a
                    className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129]"
                    onClick={() =>
                      console.log(
                        `[Book click] ${city.name} · ${tour.name}`
                      )
                    }
                  >
                    Book
                  </a>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
