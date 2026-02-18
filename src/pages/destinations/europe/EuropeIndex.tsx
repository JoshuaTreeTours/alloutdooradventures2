import { countriesWithTours } from "../../../data/europeIndex";
import DestinationCard from "../../../components/DestinationCard";

export default function EuropeIndex() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-[#1f2a1f]">
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

      <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {countriesWithTours.map((country) => (
          <DestinationCard
            key={country.slug}
            ctaLabel="Discover"
            destination={{
              name: country.name,
              stateSlug: country.slug,
              description: `${country.tourCount} tours`,
              image: country.image,
              href: `/destinations/europe/${country.slug}`,
            }}
          />
        ))}
      </section>
    </main>
  );
}
