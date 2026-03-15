import DestinationLandingTemplate from "../../templates/DestinationLandingTemplate";
import { getStateBySlug } from "../../data/destinations";
import { getFallbackStateBySlug } from "../../data/tourFallbacks";
import { getToursByState } from "../../data/tours";
import Engine6HiloPilotListingSection from "../../engine6/components/Engine6HiloPilotListingSection";

type StateLandingRouteProps = {
  params: {
    stateSlug: string;
  };
};

export default function StateLandingRoute({ params }: StateLandingRouteProps) {
  const state =
    getStateBySlug(params.stateSlug) ??
    getFallbackStateBySlug(params.stateSlug);

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

  const tours = getToursByState(state.slug);

  return (
    <>
      {state.slug === "hawaii" ? (
        <Engine6HiloPilotListingSection heading="Featured Engine6 Hawaii tour" />
      ) : null}
      <DestinationLandingTemplate state={state} tours={tours} />
    </>
  );
}
