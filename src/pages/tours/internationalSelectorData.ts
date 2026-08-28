import type { Tour } from "../../data/tours.types";
import type {
  Engine2CanadaProvinceIndexEntry,
  Engine2Tour,
} from "../../engine2/data/loadEngine2";
import { EUROPE_COUNTRIES } from "../../data/tourCatalog";
import { slugify } from "../../utils/slugify";
import { isUsCountryAlias } from "../../utils/guides/usCountryAliases";

export const CANADA_COUNTRY_NAME = "Canada";
export const MEXICO_COUNTRY_NAME = "Mexico";
export const SCOTLAND_REGION_NAME = "Scotland";
export const SCOTLAND_REGION_SLUG = "scotland";

export type SelectorOption = {
  name: string;
  slug: string;
};

export type InternationalCitySelectorOption = SelectorOption & {
  countrySlug: string;
  route: string;
};

const normalizeSpacing = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const normalizeAscii = (value: string) =>
  normalizeSpacing(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const isMexicoCityAlias = (name: string) => {
  const normalized = normalizeAscii(name);
  return (
    normalized === "ciudad de mexico" ||
    normalized === "cdmx" ||
    normalized === "mexico city"
  );
};

export const normalizeMexicoCityName = (name: string): string =>
  isMexicoCityAlias(name) ? "Ciudad De México" : name;

export const isScotlandSelectorTour = (tour: Tour) =>
  tour.destination.stateSlug === SCOTLAND_REGION_SLUG ||
  (tour.destination.state ?? "").trim().toLowerCase() === SCOTLAND_REGION_SLUG;

export const getMexicoCityKey = (
  name: string,
  fallbackSlug?: string
): string => {
  const normalizedFallbackSlug = normalizeAscii(fallbackSlug ?? "");

  if (
    isMexicoCityAlias(name) ||
    normalizedFallbackSlug === "ciudad-de-mexico"
  ) {
    return slugify("Ciudad De México");
  }

  return slugify(name) || fallbackSlug || "";
};

export const buildInternationalCountryOptions = (
  internationalTours: Tour[],
  mexicoTours: Engine2Tour[]
): string[] => {
  const countrySet = new Set(
    internationalTours
      .map(tour => tour.destination.country)
      .filter(
        (country): country is string =>
          Boolean(country) && !isUsCountryAlias(country)
      )
  );

  if (mexicoTours.length) {
    countrySet.add(MEXICO_COUNTRY_NAME);
  }

  if (internationalTours.some(isScotlandSelectorTour)) {
    countrySet.add(SCOTLAND_REGION_NAME);
  }

  countrySet.add(CANADA_COUNTRY_NAME);
  return Array.from(countrySet).sort((a, b) => a.localeCompare(b));
};

export const buildInternationalCityOptions = ({
  selectedCountry,
  selectedCanadaProvinceSlug,
  internationalTours,
  canadaProvinces,
  mexicoTours,
}: {
  selectedCountry: string;
  selectedCanadaProvinceSlug: string;
  internationalTours: Tour[];
  canadaProvinces: Engine2CanadaProvinceIndexEntry[];
  mexicoTours: Engine2Tour[];
}): SelectorOption[] => {
  if (!selectedCountry) {
    return [];
  }

  if (selectedCountry === CANADA_COUNTRY_NAME) {
    const selectedProvince = canadaProvinces.find(
      province => province.provinceSlug === selectedCanadaProvinceSlug
    );
    if (!selectedProvince) {
      return [];
    }

    return selectedProvince.cities
      .map(city => ({ name: city.cityName, slug: city.citySlug }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  if (selectedCountry === SCOTLAND_REGION_NAME) {
    return Array.from(
      new Set(
        internationalTours
          .filter(isScotlandSelectorTour)
          .map(tour => tour.destination.city)
          .filter(Boolean)
      )
    )
      .sort((a, b) => a.localeCompare(b))
      .map(city => ({ name: city, slug: slugify(city) }));
  }

  if (selectedCountry === MEXICO_COUNTRY_NAME) {
    const byCityKey = new Map<string, SelectorOption>();

    mexicoTours.forEach(tour => {
      const cityName = normalizeMexicoCityName(tour.geo.city);
      const cityKey = getMexicoCityKey(tour.geo.city, tour.sourceCitySlug);

      if (!cityKey || byCityKey.has(cityKey)) {
        return;
      }

      byCityKey.set(cityKey, {
        name: cityName,
        slug: cityKey,
      });
    });

    return Array.from(byCityKey.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  return Array.from(
    new Set(
      internationalTours
        .filter(
          tour =>
            tour.destination.country === selectedCountry &&
            !isUsCountryAlias(tour.destination.country) &&
            !isScotlandSelectorTour(tour)
        )
        .map(tour => tour.destination.city)
    )
  )
    .sort((a, b) => a.localeCompare(b))
    .map(city => ({ name: city, slug: slugify(city) }));
};

const appendActivityFilterQuery = (route: string, activitySlug?: string) => {
  if (!activitySlug) {
    return route;
  }

  const separator = route.includes("?") ? "&" : "?";
  return `${route}${separator}activity=${encodeURIComponent(activitySlug)}`;
};

export const resolveInternationalCountrySelectionRoute = ({
  selectedCountry,
  activitySlug,
  europeCountrySlugs = EUROPE_COUNTRIES.map(country => slugify(country)),
}: {
  selectedCountry: string;
  activitySlug?: string;
  europeCountrySlugs?: string[];
}) => {
  if (!selectedCountry || isUsCountryAlias(selectedCountry)) {
    return null;
  }

  if (selectedCountry === CANADA_COUNTRY_NAME) {
    return activitySlug
      ? `/destinations/world/canada/activities/${activitySlug}`
      : "/destinations/world/canada";
  }

  if (selectedCountry === MEXICO_COUNTRY_NAME) {
    return appendActivityFilterQuery("/destinations/mexico", activitySlug);
  }

  if (selectedCountry === SCOTLAND_REGION_NAME) {
    return activitySlug
      ? `/destinations/${SCOTLAND_REGION_SLUG}?activity=${encodeURIComponent(activitySlug)}`
      : `/destinations/${SCOTLAND_REGION_SLUG}`;
  }

  const countrySlug = slugify(selectedCountry);
  const europeSlugSet = new Set(europeCountrySlugs);
  const basePath = europeSlugSet.has(countrySlug)
    ? `/destinations/europe/${countrySlug}`
    : `/destinations/world/${countrySlug}`;

  return activitySlug ? `${basePath}/${activitySlug}` : basePath;
};

export const resolveInternationalCitySelectionRoute = ({
  selectedCountry,
  selectedCanadaProvinceSlug = "",
  citySlug,
  activitySlug,
  europeCountrySlugs = EUROPE_COUNTRIES.map(country => slugify(country)),
}: {
  selectedCountry: string;
  selectedCanadaProvinceSlug?: string;
  citySlug: string;
  activitySlug?: string;
  europeCountrySlugs?: string[];
}) => {
  if (!selectedCountry || !citySlug) {
    return null;
  }

  if (selectedCountry === CANADA_COUNTRY_NAME && selectedCanadaProvinceSlug) {
    const cityPath = `/destinations/world/canada/${selectedCanadaProvinceSlug}/${citySlug}`;
    return activitySlug ? `${cityPath}/activities/${activitySlug}` : cityPath;
  }

  if (selectedCountry === MEXICO_COUNTRY_NAME) {
    return appendActivityFilterQuery(
      `/destinations/mexico/${citySlug}/tours`,
      activitySlug
    );
  }

  if (selectedCountry === SCOTLAND_REGION_NAME) {
    return appendActivityFilterQuery(
      `/destinations/${SCOTLAND_REGION_SLUG}/${citySlug}/`,
      activitySlug
    );
  }

  if (isUsCountryAlias(selectedCountry)) {
    return null;
  }

  const countrySlug = slugify(selectedCountry);
  const europeSlugSet = new Set(europeCountrySlugs);
  const basePath = europeSlugSet.has(countrySlug)
    ? `/destinations/europe/${countrySlug}`
    : `/destinations/world/${countrySlug}`;

  return appendActivityFilterQuery(
    `${basePath}/cities/${citySlug}/tours`,
    activitySlug
  );
};
