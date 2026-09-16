import { getStateBySlug } from "./destinations";
import { getNationalParkDestinationsByState } from "./nationalParkDestinations";
import { getAllRouteBackedTourEntries } from "./tours";
import { slugify } from "../utils/slugify";

export type StateCityOption = {
  name: string;
  slug: string;
};

const PREFERRED_LOWERCASE_WORDS = new Set(["and", "of", "the"]);

const US_STATE_SLUGS = new Set([
  "alabama", "alaska", "arizona", "arkansas", "california", "colorado",
  "connecticut", "delaware", "florida", "georgia", "hawaii", "idaho",
  "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana",
  "maine", "maryland", "massachusetts", "michigan", "minnesota",
  "mississippi", "missouri", "montana", "nebraska", "nevada",
  "new-hampshire", "new-jersey", "new-mexico", "new-york",
  "north-carolina", "north-dakota", "ohio", "oklahoma", "oregon",
  "pennsylvania", "rhode-island", "south-carolina", "south-dakota",
  "tennessee", "texas", "utah", "vermont", "virginia", "washington",
  "west-virginia", "wisconsin", "wyoming", "district-of-columbia",
]);

const preferredDisplayNameScore = (name: string) =>
  name.split(/\s+/).filter(word => PREFERRED_LOWERCASE_WORDS.has(word)).length;

const shouldUseCityName = (currentName: string, candidateName: string) =>
  preferredDisplayNameScore(candidateName) >
  preferredDisplayNameScore(currentName);

const isGeographyConsistentForStateSelector = (
  stateSlug: string,
  destination: {
    country?: string;
    state?: string;
    stateSlug: string;
  }
) => {
  if (!US_STATE_SLUGS.has(stateSlug)) {
    return true;
  }

  const countrySlug = slugify(destination.country || "United States");
  const destinationStateSlug = slugify(destination.state || "");
  const isUnitedStates =
    countrySlug === "united-states" || countrySlug === "usa" || countrySlug === "us";

  return (
    isUnitedStates &&
    destination.stateSlug === stateSlug &&
    destinationStateSlug === stateSlug
  );
};

export const getStateCityOptions = (stateSlug: string): StateCityOption[] => {
  const bySlug = new Map<string, StateCityOption>();
  const staticCitySlugs = new Set<string>();
  const protectedDisplaySlugs = new Set<string>();
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

  getNationalParkDestinationsByState(stateSlug).forEach(park => {
    protectedDisplaySlugs.add(park.citySlug);
    bySlug.set(park.citySlug, {
      name: park.name,
      slug: park.citySlug,
    });
  });

  getAllRouteBackedTourEntries()
    .filter(
      entry =>
        entry.tour.destination.stateSlug === stateSlug &&
        isGeographyConsistentForStateSelector(stateSlug, entry.tour.destination)
    )
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
        !protectedDisplaySlugs.has(citySlug) &&
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
