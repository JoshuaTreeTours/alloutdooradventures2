import { Link } from "wouter";

import RouteRedirect from "../../../components/RouteRedirect";
import Seo from "../../../components/Seo";
import TourCard from "../../../components/TourCard";
import { getDestinationCityAlias } from "../../../data/destinationAliases";
import {
  getEuropeCityTourEntries,
  getEuropeInternalStateSlugs,
} from "../../../data/europeIndex";
import {
  getFallbackCityBySlugs,
  getFallbackStateBySlug,
} from "../../../data/tourFallbacks";
import CityToursIndexRoute from "../states/tours/CityToursIndexRoute";

type EuropeCityToursRouteProps = {
  params: {
    countrySlug: string;
    citySlug: string;
  };
};

export default function EuropeCityToursRoute({
  params,
}: EuropeCityToursRouteProps) {
  const alias = getDestinationCityAlias(params.countrySlug, params.citySlug);

  if (alias) {
    return (
      <RouteRedirect
        to={`/destinations/europe/${params.countrySlug}/cities/${alias.canonicalCitySlug}/tours`}
      />
    );
  }

  const internalStateSlugs = getEuropeInternalStateSlugs(
    params.countrySlug,
    params.citySlug
  );
  const legacyBackedLocation = internalStateSlugs
    .map(stateSlug => ({
      stateSlug,
      state: getFallbackStateBySlug(stateSlug),
      city: getFallbackCityBySlugs(stateSlug, params.citySlug),
    }))
    .find(entry => entry.state && entry.city);

  if (legacyBackedLocation) {
    return (
      <CityToursIndexRoute
        params={{
          stateSlug: legacyBackedLocation.stateSlug,
          citySlug: params.citySlug,
        }}
        basePathOverride={`/destinations/europe/${params.countrySlug}`}
      />
    );
  }

  const entries = getEuropeCityTourEntries(params.countrySlug, params.citySlug);
  if (!entries.length) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Tours not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find active tours for that city. Head back to Europe to
          keep exploring.
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
  const title = `${cityName} Tours & Activities | ${countryName}`;
  const description = `Find tours in ${cityName}, ${countryName}, including guided city experiences, day trips, attractions, and outdoor adventures.`;

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo title={title} description={description} url={toursPath} />
      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
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
            <Link href={cityPath}>
              <a>{cityName}</a>
            </Link>
            <span>/</span>
            <span className="text-white">Tours</span>
          </div>
          <div>
            <h1 className="text-3xl font-semibold md:text-5xl">
              All Tours in {cityName}
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-white/90 md:text-base">
              {description}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {entries.map(({ tour, href }) => (
            <TourCard key={`${tour.id}:${href}`} tour={tour} href={href} />
          ))}
        </div>
      </section>
    </main>
  );
}
