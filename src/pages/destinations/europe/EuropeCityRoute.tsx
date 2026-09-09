import RouteRedirect from "../../../components/RouteRedirect";
import CityTemplate from "../../../templates/CityTemplate";
import {
  getFallbackCityBySlugs,
  getFallbackStateBySlug,
} from "../../../data/tourFallbacks";
import { getDestinationCityAlias } from "../../../data/destinationAliases";
import { getEuropeInternalStateSlugs } from "../../../data/europeIndex";

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

  if (!state || !city) {
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
