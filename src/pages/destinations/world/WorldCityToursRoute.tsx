import RouteRedirect from "../../../components/RouteRedirect";
import { getDestinationCityAlias } from "../../../data/destinationAliases";
import CityToursIndexRoute from "../states/tours/CityToursIndexRoute";

type WorldCityToursRouteProps = {
  params: {
    countrySlug: string;
    citySlug: string;
  };
};

export default function WorldCityToursRoute({
  params,
}: WorldCityToursRouteProps) {
  const alias = getDestinationCityAlias(params.countrySlug, params.citySlug);

  if (alias) {
    return (
      <RouteRedirect
        to={`/destinations/world/${params.countrySlug}/cities/${alias.canonicalCitySlug}/tours`}
      />
    );
  }

  return (
    <CityToursIndexRoute
      params={{ stateSlug: params.countrySlug, citySlug: params.citySlug }}
      basePathOverride={`/destinations/world/${params.countrySlug}`}
    />
  );
}
