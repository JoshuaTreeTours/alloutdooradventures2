import DestinationCard from "../../components/DestinationCard";
import {
  EUROPE_COUNTRIES,
  WORLD_DESTINATIONS,
  slugify,
} from "../../data/tourCatalog";
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

      <section className="mt-16 space-y-8" aria-label="International destinations">
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            International
          </span>
          <h2 className="mt-2 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            Explore global destinations
          </h2>
          <p className="mt-3 text-sm text-[#405040] md:text-base">
            Preview upcoming country hubs to inspire your next adventure beyond
            the United States.
          </p>
        </div>

        <div className="space-y-6">
          <details className="group rounded-2xl border border-[#d6decf] bg-white/80 p-6 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-[#2f4a2f]">
              <span>Europe</span>
              <span
                aria-hidden="true"
                className="text-[#7a8a6b] transition-transform duration-200 group-open:rotate-180"
              >
                ▾
              </span>
            </summary>
            <p className="mt-2 text-sm text-[#405040] md:text-base">
              Browse every country we plan to support, from alpine escapes to
              coastal rides.
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-[#2f4a2f] sm:grid-cols-2 lg:grid-cols-3">
              {EUROPE_COUNTRIES.map((country) => (
                <li key={country}>
                  <a
                    className="flex items-center gap-2 rounded-full border border-[#d6decf] px-4 py-2 transition hover:border-[#2f4a2f] hover:text-[#1f2a1f]"
                    href={`/tours/europe/${slugify(country)}`}
                  >
                    {country}
                  </a>
                </li>
              ))}
            </ul>
          </details>

          <details className="group rounded-2xl border border-[#d6decf] bg-white/80 p-6 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-[#2f4a2f]">
              <span>All other countries</span>
              <span
                aria-hidden="true"
                className="text-[#7a8a6b] transition-transform duration-200 group-open:rotate-180"
              >
                ▾
              </span>
            </summary>
            <p className="mt-2 text-sm text-[#405040] md:text-base">
              Keep an eye on the next wave of global tour hubs and partner
              regions.
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-[#2f4a2f] sm:grid-cols-2 lg:grid-cols-3">
              {WORLD_DESTINATIONS.map((destination) => (
                <li key={destination}>
                  <a
                    className="flex items-center gap-2 rounded-full border border-[#d6decf] px-4 py-2 transition hover:border-[#2f4a2f] hover:text-[#1f2a1f]"
                    href={`/tours/world/${slugify(destination)}`}
                  >
                    {destination}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </section>
    </main>
  );
}
