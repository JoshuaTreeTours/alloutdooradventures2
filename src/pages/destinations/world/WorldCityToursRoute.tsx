import RouteRedirect from "../../../components/RouteRedirect";
import {
  getDestinationCityAlias,
  resolveUsDestinationPath,
} from "../../../data/destinationAliases";
import { isUsCountryAlias } from "../../../utils/guides/usCountryAliases";
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
  if (isUsCountryAlias(params.countrySlug)) {
    return (
      <RouteRedirect to={resolveUsDestinationPath(params.citySlug, "/tours")} />
    );
  }

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
