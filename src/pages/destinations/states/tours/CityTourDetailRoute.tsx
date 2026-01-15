import { Link } from "wouter";

import { getCityBySlugs, getStateBySlug } from "../../../../data/destinations";
import { getCityTours, getTourBySlug } from "../../../../data/cityTours";

type CityTourDetailRouteProps = {
  params: {
    stateSlug: string;
    citySlug: string;
    tourSlug: string;
  };
};

export default function CityTourDetailRoute({
  params,
}: CityTourDetailRouteProps) {
  const state = getStateBySlug(params.stateSlug);
  const city = getCityBySlugs(params.stateSlug, params.citySlug);

  if (!state || !city) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Tour not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that city. Head back to destinations to keep
          exploring.
        </p>
      </main>
    );
  }

  const tour = getTourBySlug(city.name, params.tourSlug);

  if (!tour) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Tour not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that tour. Head back to the tours list to keep
          exploring.
        </p>
        <div className="mt-6">
          <Link
            href={`/destinations/${state.slug}/${city.slug}/tours`}
          >
            <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129]">
              Back to tours
            </a>
          </Link>
        </div>
      </main>
    );
  }

  const relatedTours = getCityTours(city.name).filter(
    (item) => item.slug !== tour.slug
  );
  const cityHref = `/destinations/states/${state.slug}/cities/${city.slug}`;
  const toursHref = `/destinations/${state.slug}/${city.slug}/tours`;

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
            <Link
              href={toursHref}
            >
              <a>Tours</a>
            </Link>
            <span>/</span>
            <span className="text-white">{tour.name}</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              {tour.duration}
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
              {tour.name}
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-white/90 md:text-base">
              {tour.summary}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`${toursHref}/${tour.slug}/book`}
            >
              <a
                className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#2f4a2f] transition hover:bg-white/90"
                onClick={() =>
                  console.log(
                    `[Book click] ${city.name} · ${tour.name} (detail)`
                  )
                }
              >
                Book this tour
              </a>
            </Link>
            <Link
              href={toursHref}
            >
              <a className="inline-flex items-center justify-center rounded-md bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25">
                Back to tours
              </a>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="text-2xl font-semibold text-[#2f4a2f]">
              What you’ll experience
            </h2>
            <p className="mt-4 text-sm text-[#405040] leading-relaxed">
              This is a lightweight mock tour detail page so you can validate
              booking flow and affiliate attribution. Use it to confirm that the
              FareHarbor embed retains the short name across the iOS Safari
              checkout.
            </p>
            <p className="mt-4 text-sm text-[#405040] leading-relaxed">
              Expect a mix of guided time, scenic stops, and local context from
              your guide. The experience is designed to be approachable for
              most travelers.
            </p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#1f2a1f]">
              Highlights
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-[#405040]">
              {tour.highlights.map((highlight) => (
                <li key={highlight}>• {highlight}</li>
              ))}
            </ul>
            <p className="mt-6 text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
              Duration
            </p>
            <p className="mt-2 text-sm font-semibold text-[#1f2a1f]">
              {tour.duration}
            </p>
          </div>
        </div>
      </section>

      {relatedTours.length > 0 && (
        <section className="bg-white/60">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <h2 className="text-2xl font-semibold text-[#2f4a2f]">
              More tours in {city.name}
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedTours.map((related) => (
                <div
                  key={related.slug}
                  className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
                    {related.duration}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[#1f2a1f]">
                    {related.name}
                  </h3>
                  <p className="mt-3 text-sm text-[#405040]">
                    {related.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`${toursHref}/${related.slug}`}
                    >
                      <a className="inline-flex items-center justify-center rounded-md bg-black/5 px-4 py-2 text-sm font-semibold text-[#2f4a2f] transition hover:bg-black/10">
                        Tour details
                      </a>
                    </Link>
                    <Link
                      href={`${toursHref}/${related.slug}/book`}
                    >
                      <a
                        className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129]"
                        onClick={() =>
                          console.log(
                            `[Book click] ${city.name} · ${related.name} (related)`
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
          </div>
        </section>
      )}
    </main>
  );
}
