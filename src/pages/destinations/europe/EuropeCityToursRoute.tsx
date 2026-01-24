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
  return (
    <CityToursIndexRoute
      params={{ stateSlug: params.countrySlug, citySlug: params.citySlug }}
      basePathOverride={`/destinations/europe/${params.countrySlug}`}
    />
  );
}
