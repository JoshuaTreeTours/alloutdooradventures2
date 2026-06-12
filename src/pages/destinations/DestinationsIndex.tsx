import { Link } from "wouter";

import DestinationCard from "../../components/DestinationCard";
import Seo from "../../components/Seo";
import { countriesWithTours } from "../../data/europeIndex";
import { destinations } from "../../data/destinations";
import { getGuideCountryBySlug, getGuideStates } from "../../data/guideData";
import { WORLD_DESTINATIONS, slugify } from "../../data/tourCatalog";
import { getStaticPageSeo } from "../../utils/seo";
import { resolveUsGuideHref } from "../../utils/guides/guideResolver";
import { getLiveCountryOrGuideHref } from "../../utils/destinations/liveInternationalDestinations";

const getRegionLabel = (region: string) => {
  if (region === "West") return "West Coast";
  if (region === "Northeast") return "East Coast";
  return region;
};

const regionOrder = ["West", "Northeast", "Deep South"];

export default function DestinationsIndex() {
  const seo = getStaticPageSeo("/destinations");
  const guideStateLookup = new Map(
    getGuideStates().map(state => [state.slug, state])
  );
  const guideCityLimit = 6;

  const destinationsByRegion = destinations.reduce<
    Record<string, typeof destinations>
  >((accumulator, destination) => {
    const region = destination.region ?? "Other";
    accumulator[region] = accumulator[region] ?? [];
    accumulator[region].push(destination);
    return accumulator;
  }, {});

  const rockyMountainStates = destinations.filter(destination =>
    ["montana", "colorado"].includes(destination.stateSlug)
  );
  const guideHighlights = Array.from(guideStateLookup.values()).slice(0, 10);
  const tourStates = [...destinations]
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 10);

  const europeDestinationCards = countriesWithTours.map(country => ({
    name: country.name,
    stateSlug: country.slug,
    description: `${country.tourCount} tours available`,
    image: country.image,
    href: `/destinations/europe/${country.slug}`,
  }));
  const liveWorldDestinationLinks = WORLD_DESTINATIONS.map(destination => {
    const countrySlug = slugify(destination);
    const href = getLiveCountryOrGuideHref({
      countrySlug,
      hasCountryGuide: Boolean(getGuideCountryBySlug(countrySlug)),
    });

    return href ? { name: destination, href } : null;
  }).filter((link): link is { name: string; href: string } => Boolean(link));

  const renderGuideLinks = (stateSlug: string, stateName: string) => {
    const guideState = guideStateLookup.get(stateSlug);
    if (!guideState?.cities.length) {
      return null;
    }

    const visibleCities = guideState.cities.slice(0, guideCityLimit);
    const hasMoreGuides = guideState.cities.length > guideCityLimit;

    return (
      <div className="rounded-2xl border border-black/10 bg-white/80 p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
          Available Guides in {stateName}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#2f4a2f]">
          {visibleCities.map(city => (
            <Link
              key={`${stateSlug}-${city.slug}`}
              href={resolveUsGuideHref(stateSlug, city.slug).href}
            >
              <a className="rounded-full border border-[#2f4a2f]/15 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f] transition hover:bg-[#f0f4ee]">
                {city.name} guide
              </a>
            </Link>
          ))}
        </div>
        <div className="mb-1 mt-6">
          <Link href={`/guides/us/${stateSlug}`}>
            <a className="text-sm font-semibold text-[#2f4a2f] underline underline-offset-4">
              {hasMoreGuides
                ? `View all ${stateName} guides`
                : `${stateName} travel guide`}
            </a>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <>
      {seo ? (
        <Seo
          title={seo.title}
          description={seo.description}
          url={seo.url}
          image={seo.image}
        />
      ) : null}
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-16">
        <section className="flex flex-col items-center text-center">
          <span className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
            Destinations
          </span>
          <h1 className="mt-3 text-3xl font-semibold text-[#2f4a2f] md:text-4xl">
            Explore U.S. outdoor destinations
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#405040] md:text-base">
            Explore our curated destinations across the American West,
            Northeast, and Deep South. Each state is packed with signature
            landscapes, iconic trails, and local favorites ready for your next
            adventure.
          </p>
        </section>

        <section className="mt-10">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm">
              <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
                Guides in the United States
              </span>
              <h2 className="mt-2 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
                Explore U.S. guides
              </h2>
              <p className="mt-3 text-sm text-[#405040] md:text-base">
                Start with a state guide or drill into city-specific planning.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm text-[#2f4a2f]">
                {guideHighlights.map(state => (
                  <Link key={state.slug} href={`/guides/us/${state.slug}`}>
                    <a className="rounded-full border border-[#2f4a2f]/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition hover:bg-[#f0f4ee]">
                      {state.name} guide
                    </a>
                  </Link>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/guides">
                  <a className="text-sm font-semibold text-[#2f4a2f] underline underline-offset-4">
                    View all guides
                  </a>
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm">
              <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
                Tours in the United States
              </span>
              <h2 className="mt-2 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
                Browse U.S. tours by state
              </h2>
              <p className="mt-3 text-sm text-[#405040] md:text-base">
                Jump into state tour hubs or browse the full tour index.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm text-[#2f4a2f]">
                {tourStates.map(state => (
                  <Link
                    key={state.stateSlug}
                    href={`/destinations/states/${state.stateSlug}`}
                  >
                    <a className="rounded-full border border-[#2f4a2f]/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition hover:bg-[#f0f4ee]">
                      {state.name} tours
                    </a>
                  </Link>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/tours">
                  <a className="text-sm font-semibold text-[#2f4a2f] underline underline-offset-4">
                    View all tours
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 flow-root space-y-16" aria-label="States">
          {rockyMountainStates.length ? (
            <div className="border-t border-[#d6decf] pt-8 first:border-t-0 first:pt-0">
              <div className="mb-6 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
                  Rocky Mountain
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
                  Featured Rocky Mountain States
                </h2>
              </div>
              <div className="grid items-start gap-8 md:grid-cols-2">
                {rockyMountainStates.map(state => (
                  <div
                    key={`rocky-mountain-${state.name}`}
                    className="flex flex-col gap-4"
                  >
                    <DestinationCard
                      destination={state}
                      ctaLabel="Discover"
                      headingLevel="h3"
                      descriptionVariant="featured"
                    />
                    {renderGuideLinks(state.stateSlug, state.name)}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {regionOrder
            .filter(region => destinationsByRegion[region]?.length)
            .map(region => (
              <div
                key={region}
                className="clear-both border-t border-[#d6decf] pt-10"
              >
                <div className="mb-6 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
                    {getRegionLabel(region)}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
                    {getRegionLabel(region)} destinations
                  </h2>
                </div>
                <div className="grid items-start gap-8">
                  {destinationsByRegion[region].map(state => (
                    <div
                      key={`${region}-${state.name}`}
                      className="flex flex-col gap-4"
                    >
                      <DestinationCard
                        destination={state}
                        ctaLabel="View adventures"
                        headingLevel="h3"
                        descriptionVariant="featured"
                      />
                      {renderGuideLinks(state.stateSlug, state.name)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </section>

        <section
          className="mt-16 space-y-10 border-t border-[#d6decf] pt-10"
          aria-label="International destinations"
        >
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
              International
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
              Explore global destinations
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm text-[#405040] md:text-base">
              Preview upcoming country hubs to inspire your next adventure
              beyond the United States.
            </p>
          </div>

          <div className="space-y-10">
            <div>
              <div className="mb-6 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
                  Europe
                </p>
                <h3 className="mt-3 text-xl font-semibold text-[#2f4a2f] md:text-2xl">
                  Europe tour hubs
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {europeDestinationCards.map(country => (
                  <DestinationCard
                    key={country.stateSlug}
                    destination={country}
                    ctaLabel="View adventures"
                    headingLevel="h3"
                  />
                ))}
              </div>
            </div>

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
                {liveWorldDestinationLinks.map(destination => (
                  <li key={destination.name}>
                    <a
                      className="flex items-center gap-2 rounded-full border border-[#d6decf] px-4 py-2 transition hover:border-[#2f4a2f] hover:text-[#1f2a1f]"
                      href={destination.href}
                    >
                      {destination.name}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </section>
      </main>
    </>
  );
}
