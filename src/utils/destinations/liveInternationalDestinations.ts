import { countriesWithTours } from "../../data/europeIndex";
import { worldCountriesWithTours } from "../../data/worldIndex";

const normalizeSlug = (value: string) => value.trim().toLowerCase();

const europeDestinationSlugs = new Set(
  countriesWithTours.map(country => country.slug)
);
const worldDestinationSlugs = new Set(
  worldCountriesWithTours.map(country => country.slug)
);

export const getGeneratedCountryDestinationHref = (
  countrySlug: string
): string | null => {
  const normalizedSlug = normalizeSlug(countrySlug);

  if (europeDestinationSlugs.has(normalizedSlug)) {
    return `/destinations/europe/${normalizedSlug}`;
  }

  if (normalizedSlug === "mexico") {
    return "/destinations/mexico";
  }

  if (normalizedSlug === "peru") {
    return "/destinations/peru";
  }

  if (normalizedSlug === "brazil") {
    return "/destinations/brazil";
  }

  if (normalizedSlug === "japan") {
    return "/destinations/japan";
  }

  if (worldDestinationSlugs.has(normalizedSlug)) {
    return `/destinations/world/${normalizedSlug}`;
  }

  return null;
};

export const hasGeneratedCountryDestination = (countrySlug: string): boolean =>
  getGeneratedCountryDestinationHref(countrySlug) !== null;

export const getGeneratedCountryCategoryHref = (
  countrySlug: string,
  routeSlug: string
): string | null => {
  const countryHref = getGeneratedCountryDestinationHref(countrySlug);
  if (!countryHref) {
    return null;
  }

  if (
    countryHref.startsWith("/destinations/europe/") ||
    countryHref.startsWith("/destinations/world/")
  ) {
    return `${countryHref}/${routeSlug}`;
  }

  return countryHref;
};

export const getGeneratedCityDestinationHref = (
  countrySlug: string,
  citySlug: string
): string | null => {
  const countryHref = getGeneratedCountryDestinationHref(countrySlug);
  if (!countryHref) {
    return null;
  }

  if (countryHref.startsWith("/destinations/europe/")) {
    return `/destinations/europe/${normalizeSlug(countrySlug)}/cities/${citySlug}`;
  }

  if (countryHref.startsWith("/destinations/world/")) {
    return `/destinations/world/${normalizeSlug(countrySlug)}/cities/${citySlug}`;
  }

  if (countryHref === "/destinations/mexico") {
    return `/destinations/mexico/${citySlug}`;
  }

  if (countryHref === "/destinations/peru") {
    return `/destinations/peru/${citySlug}`;
  }

  if (countryHref === "/destinations/brazil") {
    return `/destinations/brazil/${citySlug}`;
  }

  if (countryHref === "/destinations/japan") {
    return `/destinations/japan/${citySlug}`;
  }

  return null;
};

export const getGeneratedCityToursHref = (
  countrySlug: string,
  citySlug: string
): string | null => {
  const cityHref = getGeneratedCityDestinationHref(countrySlug, citySlug);
  return cityHref ? `${cityHref}/tours` : null;
};

export const getLiveCountryOrGuideHref = ({
  countrySlug,
  hasCountryGuide,
}: {
  countrySlug: string;
  hasCountryGuide?: boolean;
}): string | null =>
  getGeneratedCountryDestinationHref(countrySlug) ??
  (hasCountryGuide ? `/guides/world/${normalizeSlug(countrySlug)}` : null);
