import CityTourDetailRoute from "./CityTourDetailRoute";

type LosAngelesTourDetailRouteProps = {
  params: {
    slug: string;
  };
};

export default function LosAngelesTourDetailRoute({
  params,
}: LosAngelesTourDetailRouteProps) {
  return (
    <CityTourDetailRoute
      params={{ citySlug: "los-angeles", tourSlug: params.slug }}
    />
  );
}
