import CityPage from "../../../templates/CityPage";
import {
  getCityBySlugs,
  getStateBySlug,
  tours,
} from "../../../data/destinations";

type CityRouteProps = {
  params: {
    stateSlug: string;
    citySlug: string;
  };
};

export default function CityRoute({ params }: CityRouteProps) {
  const state = getStateBySlug(params.stateSlug);
  const city = getCityBySlugs(params.stateSlug, params.citySlug);

  if (!state || !city) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">City not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that city. Head back to the state page to explore
          featured destinations.
        </p>
      </main>
    );
  }

  return <CityPage state={state} city={city} tours={tours} />;
}
