import RouteRedirect from "../../../components/RouteRedirect";
import { getDestinationCityAlias } from "../../../data/destinationAliases";
import { getEuropeInternalStateSlugs } from "../../../data/europeIndex";
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

  const internalStateSlug =
    getEuropeInternalStateSlugs(params.countrySlug, params.citySlug)[0] ??
    params.countrySlug;

  return (
    <CityToursIndexRoute
      params={{ stateSlug: internalStateSlug, citySlug: params.citySlug }}
      basePathOverride={`/destinations/europe/${params.countrySlug}`}
    />
  );
}
