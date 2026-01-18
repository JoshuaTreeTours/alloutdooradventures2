import type { Tour } from "./tours.types";
import { europeTours } from "./europeTours";

export type EuropeCountrySummary = {
  name: string;
  slug: string;
  tourCount: number;
};

export const toursByCountry = europeTours.reduce<Record<string, Tour[]>>(
  (accumulator, tour) => {
    const key = tour.destination.stateSlug;
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(tour);
    return accumulator;
  },
  {},
);

export const countriesWithTours: EuropeCountrySummary[] = Object.entries(
  toursByCountry,
).map(([slug, tours]) => ({
  name: tours[0]?.destination.state ?? slug,
  slug,
  tourCount: tours.length,
}))
  .sort((a, b) => a.name.localeCompare(b.name));
