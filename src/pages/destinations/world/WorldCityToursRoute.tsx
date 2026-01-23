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
  return (
    <CityToursIndexRoute
      params={{ stateSlug: params.countrySlug, citySlug: params.citySlug }}
      basePathOverride={`/destinations/world/${params.countrySlug}`}
    />
  );
}
