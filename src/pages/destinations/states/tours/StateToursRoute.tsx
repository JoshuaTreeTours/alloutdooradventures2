import StateToursTemplate from "../../../../templates/StateToursTemplate";
import { getStateBySlug } from "../../../../data/destinations";

type StateToursRouteProps = {
  params: {
    stateSlug: string;
  };
};

export default function StateToursRoute({ params }: StateToursRouteProps) {
  const state = getStateBySlug(params.stateSlug);

  if (!state) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">State not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that destination. Explore our destinations list to
          pick another state.
        </p>
      </main>
    );
  }

  return <StateToursTemplate state={state} />;
}
