import DestinationCard from "../../components/DestinationCard";
import { destinations } from "../../data/destinations";

export default function DestinationsIndex() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-20 pt-16">
      <section className="flex flex-col items-center text-center">
        <span className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
          Destinations
        </span>
        <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-[#2f4a2f]">
          Explore the American West
        </h1>
        <p className="mt-3 max-w-2xl text-sm md:text-base text-[#405040] leading-relaxed">
          Explore our curated destinations across the American West. Each state
          is packed with signature landscapes, iconic trails, and local favorites
          ready for your next adventure.
        </p>
      </section>

      <section className="mt-10 grid gap-6" aria-label="States">
        {destinations.map((state) => (
          <DestinationCard
            key={state.name}
            destination={state}
            ctaLabel="View adventures"
            headingLevel="h2"
            descriptionVariant="featured"
          />
        ))}
      </section>
    </main>
  );
}
