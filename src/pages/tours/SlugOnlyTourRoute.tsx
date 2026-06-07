import RouteRedirect from "../../components/RouteRedirect";
import { getAllEngine2Tours } from "../../engine2/data/loadEngine2";
import { getCityTourDetailPath, tours } from "../../data/tours";
import { getFlagstaffTourBySlug } from "../../data/flagstaffTours";
import type { Tour } from "../../data/tours.types";
import FlagstaffTourDetailRoute from "./FlagstaffTourDetailRoute";

type SlugOnlyTourRouteProps = {
  params: {
    tourSlug: string;
  };
};

const hasDestinationRouteData = (tour: Tour) =>
  Boolean(
    tour.slug?.trim() &&
    tour.destination?.stateSlug?.trim() &&
    tour.destination?.citySlug?.trim()
  );

const isFlagstaffTour = (tour: Tour) =>
  tour.destination.stateSlug === "arizona" &&
  tour.destination.citySlug === "flagstaff";

const isCanonicalDestinationTourPath = (path: string, tourSlug: string) => {
  const parts = path.split("/").filter(Boolean);
  return (
    parts[0] === "destinations" &&
    parts.includes("tours") &&
    parts.at(-1) === tourSlug
  );
};

export const resolveSlugOnlyTourCanonicalPath = (tourSlug: string) => {
  const legacyFlagstaffTour = getFlagstaffTourBySlug(tourSlug);
  if (legacyFlagstaffTour) {
    return null;
  }

  const engine2Tour = getAllEngine2Tours().find(
    tour =>
      tour.slug === tourSlug &&
      isCanonicalDestinationTourPath(tour.seo.canonicalPath, tourSlug)
  );

  if (engine2Tour) {
    return engine2Tour.seo.canonicalPath;
  }

  const destinationTour = tours.find(
    tour =>
      tour.slug === tourSlug &&
      hasDestinationRouteData(tour) &&
      !isFlagstaffTour(tour)
  );

  return destinationTour ? getCityTourDetailPath(destinationTour) : null;
};

export default function SlugOnlyTourRoute({ params }: SlugOnlyTourRouteProps) {
  const legacyFlagstaffTour = getFlagstaffTourBySlug(params.tourSlug);
  if (legacyFlagstaffTour) {
    return <FlagstaffTourDetailRoute params={params} />;
  }

  const canonicalPath = resolveSlugOnlyTourCanonicalPath(params.tourSlug);
  if (canonicalPath) {
    return <RouteRedirect to={canonicalPath} />;
  }

  return <FlagstaffTourDetailRoute params={params} />;
}
