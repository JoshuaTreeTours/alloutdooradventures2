import RouteRedirect from "../../../components/RouteRedirect";
import CityTemplate from "../../../templates/CityTemplate";
import {
  getFallbackCityBySlugs,
  getFallbackStateBySlug,
} from "../../../data/tourFallbacks";
import {
  getDestinationCityAlias,
  resolveUsDestinationPath,
} from "../../../data/destinationAliases";
import { isUsCountryAlias } from "../../../utils/guides/usCountryAliases";

type WorldCityRouteProps = {
  params: {
    countrySlug: string;
    citySlug: string;
  };
};

export default function WorldCityRoute({ params }: WorldCityRouteProps) {
  if (isUsCountryAlias(params.countrySlug)) {
    return <RouteRedirect to={resolveUsDestinationPath(params.citySlug)} />;
  }

  const alias = getDestinationCityAlias(params.countrySlug, params.citySlug);
  const state = getFallbackStateBySlug(params.countrySlug);
  const city = getFallbackCityBySlugs(
    params.countrySlug,
    alias?.canonicalCitySlug ?? params.citySlug
  );

  if (alias) {
    return (
      <RouteRedirect
        to={`/destinations/world/${params.countrySlug}/cities/${alias.canonicalCitySlug}`}
      />
    );
  }

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
      stateHrefOverride={`/destinations/world/${params.countrySlug}`}
      seoUrlOverride={`/destinations/world/${params.countrySlug}/cities/${city.slug}`}
      guideParentSlugOverride={params.countrySlug}
      guideRegionTypeOverride="country"
    />
  );
}
