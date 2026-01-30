import type { City } from "./destinations";
import { states } from "./destinations";

export type CityGuideRecord = {
  country: string;
  state: string;
  stateSlug: string;
  city: string;
  citySlug: string;
  route: string;
  regionType: "state";
  cityData: City;
};

export const allCityGuideRecords: CityGuideRecord[] = states.flatMap((state) =>
  state.cities.map((city) => ({
    country: "United States",
    state: state.name,
    stateSlug: state.slug,
    city: city.name,
    citySlug: city.slug,
    route: `/guides/us/${state.slug}/${city.slug}`,
    regionType: "state",
    cityData: city,
  })),
);
