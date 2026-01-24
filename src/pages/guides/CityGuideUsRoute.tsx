import CityGuideRoute from "./CityGuideRoute";

type CityGuideUsRouteProps = {
  params: {
    stateSlug: string;
    citySlug: string;
  };
};

export default function CityGuideUsRoute({ params }: CityGuideUsRouteProps) {
  return (
    <CityGuideRoute
      params={{ parentSlug: params.stateSlug, citySlug: params.citySlug }}
      regionType="state"
    />
  );
}
