import RouteRedirect from "../../../../components/RouteRedirect";
import {
  extractTourIdFromSlug,
  getTourById,
  getTourDetailPath,
} from "../../../../data/tours";

type CityTourDetailRouteProps = {
  params: {
    stateSlug: string;
    citySlug: string;
    tourSlug: string;
  };
};

export default function CityTourDetailRoute({
  params,
}: CityTourDetailRouteProps) {
  const requestedTourId = extractTourIdFromSlug(params.tourSlug);
  const tour = requestedTourId ? getTourById(requestedTourId) : null;

  if (tour) {
    return <RouteRedirect to={getTourDetailPath(tour)} />;
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
      <h1 className="text-2xl font-semibold">Listing not available</h1>
      <p className="mt-4 text-sm text-[#405040]">
        This listing could not be found. Please browse destinations to keep
        exploring.
      </p>
    </main>
  );
}
