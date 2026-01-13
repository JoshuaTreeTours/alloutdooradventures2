import DestinationCard from "../../components/DestinationCard";
import { destinations } from "../../data/destinations";

export default function DestinationsIndex() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="text-center">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#2f4a2f]">
          Destinations
        </h1>
        <p className="mt-4 text-sm md:text-base text-[#405040]">
          Explore our curated destinations across the American West. Choose a state
          to start planning your next adventure.
        </p>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-2" aria-label="States">
        {destinations.map((state) => (
          <DestinationCard
            key={state.name}
            destination={state}
            ctaLabel="View adventures"
            headingLevel="h2"
            imageLoading="eager"
          />
        ))}
      </section>
    </main>
  );
}
