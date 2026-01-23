import CityTemplate from "../../../templates/CityTemplate";
import {
  getFallbackCityBySlugs,
  getFallbackStateBySlug,
} from "../../../data/tourFallbacks";

type EuropeCityRouteProps = {
  params: {
    countrySlug: string;
    citySlug: string;
  };
};

export default function EuropeCityRoute({ params }: EuropeCityRouteProps) {
  const state = getFallbackStateBySlug(params.countrySlug);
  const city = getFallbackCityBySlugs(params.countrySlug, params.citySlug);

  if (!state || !city) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">City not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that city. Head back to the country page to keep
          exploring.
        </p>
      </main>
    );
  }

  return (
    <CityTemplate
      state={state}
      city={city}
      stateHrefOverride={`/destinations/europe/${params.countrySlug}`}
    />
  );
}
