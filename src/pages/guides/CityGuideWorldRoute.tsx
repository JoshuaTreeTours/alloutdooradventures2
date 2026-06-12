import RouteRedirect from "../../components/RouteRedirect";
import { getInternationalGuideCityAlias } from "../../data/internationalGuideAliases";
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
  const alias = getInternationalGuideCityAlias(
    params.countrySlug,
    params.citySlug
  );

  if (alias) {
    const queryString =
      typeof window !== "undefined" ? window.location.search || "" : "";

    return (
      <RouteRedirect
        to={`/guides/world/${params.countrySlug}/${alias.canonicalCitySlug}${queryString}`}
      />
    );
  }

  return (
    <CityGuideRoute
      params={{ parentSlug: params.countrySlug, citySlug: params.citySlug }}
      regionType="country"
    />
  );
}
