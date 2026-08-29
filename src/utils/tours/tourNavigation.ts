import { EUROPE_COUNTRIES, US_STATES, slugify } from "../../data/tourCatalog";

const US_STATE_SLUGS = new Set(US_STATES.map(state => slugify(state)));
const INTERNATIONAL_COUNTRY_SLUGS = new Set(
  EUROPE_COUNTRIES.map(country => slugify(country))
);

export const isUsDestinationSlug = (slug: string): boolean =>
  US_STATE_SLUGS.has(slug.trim().toLowerCase());

export const isKnownInternationalCountrySlug = (slug: string): boolean => {
  const normalizedSlug = slug.trim().toLowerCase();
  return (
    INTERNATIONAL_COUNTRY_SLUGS.has(normalizedSlug) ||
    normalizedSlug === "canada" ||
    normalizedSlug === "mexico" ||
    normalizedSlug === "peru"
  );
};

const normalizeCountrySlug = (value?: string | null) =>
  value?.trim().toLowerCase() || "";

export const resolveSafeTourListHref = ({
  canonicalPath,
  countrySlug,
  stateSlug,
  citySlug,
}: {
  canonicalPath?: string | null;
  countrySlug?: string | null;
  stateSlug?: string | null;
  citySlug?: string | null;
}): string => {
  const normalizedCanonicalPath = canonicalPath?.trim() ?? "";

  const worldCanadaTourMatch = normalizedCanonicalPath.match(
    /^\/destinations\/world\/canada\//
  );
  if (worldCanadaTourMatch) {
    return "/destinations/world/canada";
  }

  const worldCityTourMatch = normalizedCanonicalPath.match(
    /^(\/destinations\/world\/[^/]+\/cities\/[^/]+)\/tours\/[^/]+$/
  );
  if (worldCityTourMatch?.[1]) {
    return `${worldCityTourMatch[1]}/tours`;
  }

  const worldCountryTourMatch = normalizedCanonicalPath.match(
    /^\/destinations\/world\/([^/]+)\//
  );
  if (worldCountryTourMatch?.[1]) {
    return `/destinations/world/${worldCountryTourMatch[1]}`;
  }

  const normalizedStateSlug = normalizeCountrySlug(stateSlug);
  const normalizedCitySlug = normalizeCountrySlug(citySlug);
  const normalizedCountrySlug = normalizeCountrySlug(countrySlug);

  if (normalizedStateSlug && normalizedCitySlug) {
    if (
      isUsDestinationSlug(normalizedStateSlug) ||
      normalizedStateSlug === "mexico" ||
      normalizedStateSlug === "peru"
    ) {
      return `/destinations/${normalizedStateSlug}/${normalizedCitySlug}/tours`;
    }

    if (isKnownInternationalCountrySlug(normalizedCountrySlug)) {
      return `/destinations/world/${normalizedCountrySlug}`;
    }

    if (isKnownInternationalCountrySlug(normalizedStateSlug)) {
      return `/destinations/world/${normalizedStateSlug}`;
    }

    return `/destinations/${normalizedStateSlug}/${normalizedCitySlug}/tours`;
  }

  return "/destinations";
};
