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

const NON_CITY_COUNTRY_SLUGS = new Set(["united-states", "usa", "us"]);

// Final rendered-selector safety gate. These are confirmed bad memberships in
// source collections; filtering here prevents polluted static or generated
// records from ever reaching the native city picker.
const BLOCKED_CITY_SLUGS_BY_STATE: Record<string, Set<string>> = {
  california: new Set([
    "phoenix",
    "portsmouth",
    "puerto-vallarta",
    "ensenada",
  ]),
};

const isAdministrativeLabelForStateSelector = (
  stateSlug: string,
  citySlug: string
) => {
  const normalizedCitySlug = slugify(citySlug);

  if (NON_CITY_COUNTRY_SLUGS.has(normalizedCitySlug)) {
    return true;
  }

  // A different U.S. state name must never appear as a city under the selected
  // state. This catches taxonomy leaks such as "New York" under Vermont while
  // leaving the selected state's own slug untouched.
  return (
    US_STATE_SLUGS.has(stateSlug) &&
    US_STATE_SLUGS.has(normalizedCitySlug) &&
    normalizedCitySlug !== stateSlug
  );
};

const isBlockedStateCity = (stateSlug: string, citySlug: string) =>
  (BLOCKED_CITY_SLUGS_BY_STATE[stateSlug]?.has(citySlug) ?? false) ||
  isAdministrativeLabelForStateSelector(stateSlug, citySlug);

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
    if (city.stateSlug !== stateSlug) {
      return;
    }

    const citySlug = city.slug.trim();
    const cityName = city.name.trim();
    if (!citySlug || !cityName || isBlockedStateCity(stateSlug, citySlug)) {
      return;
    }

    staticCitySlugs.add(citySlug);
    bySlug.set(citySlug, {
      name: cityName,
      slug: citySlug,
    });
  });

  getNationalParkDestinationsByState(stateSlug).forEach(park => {
    if (isBlockedStateCity(stateSlug, park.citySlug)) {
      return;
    }
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
      if (!cityName || !citySlug || isBlockedStateCity(stateSlug, citySlug)) {
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

  return [...bySlug.values()]
    .filter(city => !isBlockedStateCity(stateSlug, city.slug))
    .sort((a, b) => a.name.localeCompare(b.name));
};
