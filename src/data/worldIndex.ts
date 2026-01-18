import type { Tour } from "./tours.types";
import { tours } from "./tours";
import { countriesWithTours } from "./europeIndex";
import { US_STATES, slugify } from "./tourCatalog";

export type WorldCountrySummary = {
  name: string;
  slug: string;
  tourCount: number;
};

const europeCountrySlugs = new Set(countriesWithTours.map((country) => country.slug));
const usStateSlugs = new Set(US_STATES.map((state) => slugify(state)));
const excludedCountrySlugs = new Set([
  ...europeCountrySlugs,
  ...usStateSlugs,
  "australia",
  "united-states",
]);

const getDestinationSlug = (tour: Tour) =>
  tour.destination.stateSlug || slugify(tour.destination.state);

export const worldTours = tours.filter(
  (tour) => !excludedCountrySlugs.has(getDestinationSlug(tour)),
);

export const worldToursByCountry = worldTours.reduce<Record<string, Tour[]>>(
  (accumulator, tour) => {
    const key = getDestinationSlug(tour);
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(tour);
    return accumulator;
  },
  {},
);

export const worldCountriesWithTours: WorldCountrySummary[] = Object.entries(
  worldToursByCountry,
).map(([slug, toursForCountry]) => ({
  name: toursForCountry[0]?.destination.state ?? slug,
  slug,
  tourCount: toursForCountry.length,
}))
  .sort((a, b) => a.name.localeCompare(b.name));
