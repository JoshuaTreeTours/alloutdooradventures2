import DestinationLandingTemplate from "../../templates/DestinationLandingTemplate";
import { getStateBySlug } from "../../data/destinations";
import { getToursByDestination } from "../../data/tourRegistry";

type StateLandingRouteProps = {
  params: {
    stateSlug: string;
  };
};

export default function StateLandingRoute({ params }: StateLandingRouteProps) {
  const state = getStateBySlug(params.stateSlug);

  if (!state) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Destination not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that destination. Explore our destinations list to
          pick another state.
        </p>
      </main>
    );
  }

  const tours = getToursByDestination(state.slug);

  return <DestinationLandingTemplate state={state} tours={tours} />;
}
