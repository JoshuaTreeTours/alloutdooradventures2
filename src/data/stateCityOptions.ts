import { getStateBySlug } from "./destinations";
import { getAllRouteBackedTourEntries } from "./tours";
import { slugify } from "../utils/slugify";

export type StateCityOption = {
  name: string;
  slug: string;
};

const PREFERRED_LOWERCASE_WORDS = new Set(["and", "of", "the"]);

const preferredDisplayNameScore = (name: string) =>
  name.split(/\s+/).filter(word => PREFERRED_LOWERCASE_WORDS.has(word)).length;

const shouldUseCityName = (currentName: string, candidateName: string) =>
  preferredDisplayNameScore(candidateName) >
  preferredDisplayNameScore(currentName);

export const getStateCityOptions = (stateSlug: string): StateCityOption[] => {
  const bySlug = new Map<string, StateCityOption>();
  const staticCitySlugs = new Set<string>();
  const state = getStateBySlug(stateSlug);

  state?.cities.forEach(city => {
    const citySlug = city.slug.trim();
    const cityName = city.name.trim();
    if (!citySlug || !cityName) {
      return;
    }

    staticCitySlugs.add(citySlug);
    bySlug.set(citySlug, {
      name: cityName,
      slug: citySlug,
    });
  });

  getAllRouteBackedTourEntries()
    .filter(entry => entry.tour.destination.stateSlug === stateSlug)
    .forEach(entry => {
      const cityName = entry.tour.destination.city.trim();
      const citySlug = (
        entry.tour.destination.citySlug || slugify(cityName)
      ).trim();
      if (!cityName || !citySlug) {
        return;
      }

      const existing = bySlug.get(citySlug);

      if (!existing) {
        bySlug.set(citySlug, {
          name: cityName,
          slug: citySlug,
        });
        return;
      }

      if (
        !staticCitySlugs.has(citySlug) &&
        shouldUseCityName(existing.name, cityName)
      ) {
        bySlug.set(citySlug, {
          name: cityName,
          slug: citySlug,
        });
      }
    });

  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
};
