import { Link } from "wouter";

import Seo from "../../../components/Seo";
import { countriesWithTours } from "../../../data/europeIndex";
import { buildMetaDescription } from "../../../utils/seo";

export default function EuropeIndex() {
  const title = "Europe Tours & Destinations | All Outdoor Adventures";
  const description = buildMetaDescription(
    "Browse European tour hubs with curated outdoor adventures, from alpine escapes to coastal journeys across top countries.",
    "Explore Europe destinations with active tour inventory and plan trips with trusted local guides and booking-ready experiences.",
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-[#1f2a1f]">
      <Seo title={title} description={description} url="/destinations/europe" />
      <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
        Europe
      </p>
      <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
        Europe tour hubs
      </h1>
      <p className="mt-4 max-w-2xl text-sm text-[#405040] md:text-base">
        Explore curated European destinations with active tour inventory and
        new experiences added each season.
      </p>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {countriesWithTours.map((country) => (
          <Link key={country.slug} href={`/destinations/europe/${country.slug}`}>
            <a className="rounded-2xl border border-[#d6decf] bg-white/80 p-5 text-sm text-[#2f4a2f] shadow-sm transition hover:border-[#2f4a2f] hover:text-[#1f2a1f]">
              <div className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
                {country.tourCount} tours
              </div>
              <div className="mt-2 text-lg font-semibold">{country.name}</div>
            </a>
          </Link>
        ))}
      </section>
    </main>
  );
}
