import { Link } from "wouter";

import Seo from "../../components/Seo";
import { getEngine2MexicoTours } from "../../engine2/data/loadEngine2";

export default function MexicoDestinationRoute() {
  const tours = getEngine2MexicoTours();
  const cities = Array.from(
    new Map(tours.map(tour => [tour.sourceCitySlug, tour.geo.city])).entries(),
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Seo
        title="Mexico Tours | All Outdoor Adventures"
        description="Explore guided Mexico tours across top destinations."
      />
      <h1 className="text-3xl font-semibold">Mexico tours</h1>
      <p className="mt-3 max-w-3xl text-sm text-[#405040] md:text-base">
        Browse available guided adventures in Mexico.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-[#2f4a2f]">Top cities</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {cities.map(([citySlug, cityName]) => (
            <a
              key={citySlug}
              href={`/destinations/mexico/${citySlug}/tours`}
              className="rounded-full border border-[#2f4a2f]/15 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f] transition hover:bg-[#f0f4ee]"
            >
              {cityName}
            </a>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-[#2f4a2f]">Featured tours</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tours.slice(0, 12).map(tour => (
            <Link key={tour.id} href={tour.seo.canonicalPath}>
              <a className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow">
                <p className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
                  {tour.geo.city}
                </p>
                <h3 className="mt-2 text-sm font-semibold text-[#1f2a1f]">
                  {tour.name}
                </h3>
              </a>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
