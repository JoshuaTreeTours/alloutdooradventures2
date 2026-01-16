import DestinationCard from "../../components/DestinationCard";
import { destinations } from "../../data/destinations";

export default function DestinationsIndex() {
  const getRegionLabel = (region: string) => {
    if (region === "West") return "West Coast";
    if (region === "Northeast") return "East Coast";
    return region;
  };

  const regionOrder = ["West", "Northeast", "Deep South"];
  const destinationsByRegion = destinations.reduce<Record<string, typeof destinations>>(
    (accumulator, destination) => {
      const region = destination.region ?? "Other";
      accumulator[region] = accumulator[region] ?? [];
      accumulator[region].push(destination);
      return accumulator;
    },
    {},
  );
  const rockyMountainStates = destinations.filter((destination) =>
    ["montana", "colorado"].includes(destination.stateSlug),
  );

  return (
    <main className="mx-auto max-w-6xl px-6 pb-20 pt-16">
      <section className="flex flex-col items-center text-center">
        <span className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
          Destinations
        </span>
        <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-[#2f4a2f]">
          Explore U.S. outdoor destinations
        </h1>
        <p className="mt-3 max-w-2xl text-sm md:text-base text-[#405040] leading-relaxed">
          Explore our curated destinations across the American West, Northeast,
          and Deep South. Each state is packed with signature landscapes, iconic
          trails, and local favorites ready for your next adventure.
        </p>
      </section>

      <section className="mt-10 space-y-12" aria-label="States">
        {rockyMountainStates.length > 0 ? (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
                Rocky Mountain
              </span>
              <h2 className="mt-2 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
                Featured Rocky Mountain States
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {rockyMountainStates.map((state) => (
                <DestinationCard
                  key={`rocky-mountain-${state.name}`}
                  destination={state}
                  ctaLabel="Discover"
                  headingLevel="h3"
                  descriptionVariant="featured"
                />
              ))}
            </div>
          </div>
        ) : null}
        {regionOrder
          .filter((region) => destinationsByRegion[region]?.length)
          .map((region) => (
            <div key={region} className="space-y-6">
              <div className="text-center">
                <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
                  {getRegionLabel(region)}
                </span>
                <h2 className="mt-2 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
                  {getRegionLabel(region)} destinations
                </h2>
              </div>
              <div className="grid gap-6">
                {destinationsByRegion[region].map((state) => (
                  <DestinationCard
                    key={`${region}-${state.name}`}
                    destination={state}
                    ctaLabel="View adventures"
                    headingLevel="h3"
                    descriptionVariant="featured"
                  />
                ))}
              </div>
            </div>
          ))}
      </section>
    </main>
  );
}
