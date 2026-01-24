import CityGuideRoute from "./CityGuideRoute";

type CityGuideWorldRouteProps = {
  params: {
    countrySlug: string;
    citySlug: string;
  };
};

export default function CityGuideWorldRoute({
  params,
}: CityGuideWorldRouteProps) {
  return (
    <CityGuideRoute
      params={{ parentSlug: params.countrySlug, citySlug: params.citySlug }}
      regionType="country"
    />
  );
}
