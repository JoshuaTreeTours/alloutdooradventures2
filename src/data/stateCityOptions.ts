import { getStateBySlug } from "./destinations";
import { tours } from "./tours";
import { slugify } from "../utils/slugify";

export type StateCityOption = {
  name: string;
  slug: string;
};

export const getStateCityOptions = (stateSlug: string): StateCityOption[] => {
  const bySlug = new Map<string, StateCityOption>();
  const state = getStateBySlug(stateSlug);

  state?.cities.forEach(city => {
    const citySlug = city.slug.trim();
    const cityName = city.name.trim();
    if (!citySlug || !cityName) {
      return;
    }

    bySlug.set(citySlug, {
      name: cityName,
      slug: citySlug,
    });
  });

  tours
    .filter(tour => tour.engine === "engine6" && tour.destination.stateSlug === stateSlug)
    .forEach(tour => {
      const cityName = tour.destination.city.trim();
      const citySlug = (tour.destination.citySlug || slugify(cityName)).trim();
      if (!cityName || !citySlug) {
        return;
      }

      if (!bySlug.has(citySlug)) {
        bySlug.set(citySlug, {
          name: cityName,
          slug: citySlug,
        });
      }
    });

  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
};
