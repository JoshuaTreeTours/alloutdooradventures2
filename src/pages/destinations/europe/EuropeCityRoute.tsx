import { Link } from "wouter";

import RouteRedirect from "../../../components/RouteRedirect";
import Seo from "../../../components/Seo";
import TourCard from "../../../components/TourCard";
import CityTemplate from "../../../templates/CityTemplate";
import {
  getFallbackCityBySlugs,
  getFallbackStateBySlug,
} from "../../../data/tourFallbacks";
import { getDestinationCityAlias } from "../../../data/destinationAliases";
import {
  getEuropeCityTourEntries,
  getEuropeInternalStateSlugs,
} from "../../../data/europeIndex";

type EuropeCityRouteProps = {
  params: {
    countrySlug: string;
    citySlug: string;
  };
};

export default function EuropeCityRoute({ params }: EuropeCityRouteProps) {
  const alias = getDestinationCityAlias(params.countrySlug, params.citySlug);

  if (alias) {
    return (
      <RouteRedirect
        to={`/destinations/europe/${params.countrySlug}/cities/${alias.canonicalCitySlug}`}
      />
    );
  }

  const location = getEuropeInternalStateSlugs(
    params.countrySlug,
    params.citySlug
  )
    .map(stateSlug => ({
      stateSlug,
      state: getFallbackStateBySlug(stateSlug),
      city: getFallbackCityBySlugs(stateSlug, params.citySlug),
    }))
    .find(entry => entry.state && entry.city);

  const state = location?.state;
  const city = location?.city;

  if (state && city) {
    return (
      <CityTemplate
        state={state}
        city={city}
        stateHrefOverride={`/destinations/europe/${params.countrySlug}`}
        cityToursHrefOverride={`/destinations/europe/${params.countrySlug}/cities/${city.slug}/tours`}
        seoUrlOverride={`/destinations/europe/${params.countrySlug}/cities/${city.slug}`}
        guideParentSlugOverride={params.countrySlug}
        guideRegionTypeOverride="country"
      />
    );
  }

  const entries = getEuropeCityTourEntries(params.countrySlug, params.citySlug);
  if (!entries.length) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">City not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that city. Head back to the country page to keep
          exploring.
        </p>
      </main>
    );
  }

  const firstTour = entries[0].tour;
  const cityName = firstTour.destination.city || params.citySlug.replace(/-/g, " ");
  const countryName =
    firstTour.destination.country || params.countrySlug.replace(/-/g, " ");
  const countryPath = `/destinations/europe/${params.countrySlug}`;
  const cityPath = `${countryPath}/cities/${params.citySlug}`;
  const toursPath = `${cityPath}/tours`;
  const title = `${cityName}, ${countryName} Outdoor Guide | All Outdoor Adventures`;
  const description = `Discover tours, attractions, and outdoor experiences in ${cityName}, ${countryName}, with active local inventory and trip-planning ideas.`;

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo title={title} description={description} url={cityPath} />
      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-14">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/80">
            <Link href="/destinations">
              <a>Destinations</a>
            </Link>
            <span>/</span>
            <Link href="/destinations/europe">
              <a>Europe</a>
            </Link>
            <span>/</span>
            <Link href={countryPath}>
              <a>{countryName}</a>
            </Link>
            <span>/</span>
            <span className="text-white">{cityName}</span>
          </div>
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/80">
              Europe city hub
            </p>
            <h1 className="text-3xl font-semibold md:text-5xl">
              {cityName} outdoor adventures
            </h1>
            <p className="max-w-3xl text-sm text-white/90 md:text-base">
              {description}
            </p>
            <Link href={toursPath}>
              <a className="inline-flex rounded-full border border-white/40 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/20">
                View all {cityName} tours
              </a>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            Active local inventory
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            Tours and experiences in {cityName}
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {entries.slice(0, 12).map(({ tour, href }) => (
            <TourCard key={`${tour.id}:${href}`} tour={tour} href={href} />
          ))}
        </div>
      </section>
    </main>
  );
}
