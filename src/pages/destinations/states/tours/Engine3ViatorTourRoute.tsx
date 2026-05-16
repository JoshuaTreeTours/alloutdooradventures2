import Engine3ViatorTourPage from "../../../../components/viator/Engine3ViatorTourPage";
import { getEngine3ViatorTour } from "../../../../data/viator/engine3Tours";

type Engine3ViatorTourRouteProps = {
  params: {
    stateSlug: string;
    citySlug: string;
    tourSlug: string;
    viatorProductCode?: string;
  };
};

export default function Engine3ViatorTourRoute({
  params,
}: Engine3ViatorTourRouteProps) {
  const tour = getEngine3ViatorTour(
    params.stateSlug,
    params.citySlug,
    params.tourSlug,
    params.viatorProductCode
  );

  if (!tour || tour.source !== "viator") {
    return null;
  }

  return <Engine3ViatorTourPage tour={tour} />;
}
