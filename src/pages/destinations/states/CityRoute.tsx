import CityTemplate from "../../../templates/CityTemplate";
import { getCityBySlugs, getStateBySlug } from "../../../data/destinations";
import {
  getFallbackCityBySlugs,
  getFallbackStateBySlug,
} from "../../../data/tourFallbacks";
import { flagstaffTours } from "../../../data/flagstaffTours";

type CityRouteProps = {
  params: {
    stateSlug: string;
    citySlug: string;
  };
};

export default function CityRoute({ params }: CityRouteProps) {
  const state =
    getStateBySlug(params.stateSlug) ??
    getFallbackStateBySlug(params.stateSlug);
  const city =
    getCityBySlugs(params.stateSlug, params.citySlug) ??
    getFallbackCityBySlugs(params.stateSlug, params.citySlug);

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

  const toursOverride =
    state.slug === "arizona" && city.slug === "flagstaff"
      ? flagstaffTours
      : undefined;

  return <CityTemplate state={state} city={city} toursOverride={toursOverride} />;
}
