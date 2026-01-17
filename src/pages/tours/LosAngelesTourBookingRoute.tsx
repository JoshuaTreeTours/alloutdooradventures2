import CityTourBookingRoute from "./CityTourBookingRoute";

type LosAngelesTourBookingRouteProps = {
  params: {
    slug: string;
  };
};

export default function LosAngelesTourBookingRoute({
  params,
}: LosAngelesTourBookingRouteProps) {
  return (
    <CityTourBookingRoute
      params={{ citySlug: "los-angeles", tourSlug: params.slug }}
    />
  );
}
