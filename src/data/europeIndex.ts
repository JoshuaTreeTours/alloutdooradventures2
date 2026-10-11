import { getCanonicalDestinationCitySlug } from "./destinationAliases";
import { EUROPE_COUNTRIES, slugify } from "./tourCatalog";
import {
  getAllRouteBackedTourEntries,
  type UnifiedCityTour,
} from "./tours";
import type { Tour } from "./tours.types";
import { resolveTourHeroImage } from "../utils/hero";

export type EuropeCountrySummary = {
  name: string;
  slug: string;
  tourCount: number;
  image: string;
};

export type EuropeCitySummary = {
  name: string;
  slug: string;
  countrySlug: string;
  tourCount: number;
  image: string;
  internalStateSlugs: string[];
};

const europeCountryNamesBySlug = new Map(
  EUROPE_COUNTRIES.map(country => [slugify(country), country])
);
const europeCountrySlugs = new Set(europeCountryNamesBySlug.keys());
const UK_INTERNAL_STATE_SLUGS = new Set([
  "england",
  "scotland",
  "wales",
  "northern-ireland",
]);

const resolveEuropeCountrySlug = (tour: Tour) => {
  const destinationCountrySlug = slugify(tour.destination.country || "");
  if (europeCountrySlugs.has(destinationCountrySlug)) {
    return destinationCountrySlug;
  }

  const stateSlug = slugify(
    tour.destination.stateSlug || tour.destination.state || ""
  );
  if (europeCountrySlugs.has(stateSlug)) {
    return stateSlug;
  }

  if (UK_INTERNAL_STATE_SLUGS.has(stateSlug)) {
    return "united-kingdom";
  }

  return null;
};

const canonicalCitySlugFor = (entry: UnifiedCityTour) =>
  getCanonicalDestinationCitySlug(
    entry.tour.destination.stateSlug,
    entry.tour.destination.citySlug
  );

const europeRouteEntries = getAllRouteBackedTourEntries().filter(entry =>
  Boolean(resolveEuropeCountrySlug(entry.tour))
);

const entriesByCountry = europeRouteEntries.reduce<
  Record<string, UnifiedCityTour[]>
>((accumulator, entry) => {
  const countrySlug = resolveEuropeCountrySlug(entry.tour);
  if (!countrySlug) return accumulator;
  if (!accumulator[countrySlug]) accumulator[countrySlug] = [];
  accumulator[countrySlug].push(entry);
  return accumulator;
}, {});

export const toursByCountry = Object.fromEntries(
  Object.entries(entriesByCountry).map(([countrySlug, entries]) => [
    countrySlug,
    entries.map(entry => entry.tour),
  ])
) as Record<string, Tour[]>;

export const countriesWithTours: EuropeCountrySummary[] = Object.entries(
  entriesByCountry
)
  .map(([slug, entries]) => ({
    name:
      europeCountryNamesBySlug.get(slug) ??
      entries[0]?.tour.destination.country ??
      entries[0]?.tour.destination.state ??
      slug,
    slug,
    tourCount: entries.length,
    image:
      entries
        .map(entry => resolveTourHeroImage(entry.tour))
        .find(Boolean) || "",
  }))
  .filter(country => country.tourCount > 0)
  .sort((a, b) => a.name.localeCompare(b.name));

export const citiesByCountry = Object.fromEntries(
  Object.entries(entriesByCountry).map(([countrySlug, entries]) => {
    const byCity = new Map<string, UnifiedCityTour[]>();

    for (const entry of entries) {
      const citySlug = canonicalCitySlugFor(entry);
      if (!citySlug) continue;
      const bucket = byCity.get(citySlug);
      if (bucket) bucket.push(entry);
      else byCity.set(citySlug, [entry]);
    }

    const cities: EuropeCitySummary[] = Array.from(byCity.entries())
      .map(([citySlug, cityEntries]) => ({
        name:
          cityEntries.find(entry => canonicalCitySlugFor(entry) === citySlug)
            ?.tour.destination.city || citySlug.replace(/-/g, " "),
        slug: citySlug,
        countrySlug,
        tourCount: cityEntries.length,
        image:
          cityEntries
            .map(entry => resolveTourHeroImage(entry.tour))
            .find(Boolean) || "",
        internalStateSlugs: Array.from(
          new Set(
            cityEntries
              .map(entry => entry.tour.destination.stateSlug)
              .filter(Boolean)
          )
        ),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return [countrySlug, cities];
  })
) as Record<string, EuropeCitySummary[]>;

export const getEuropeCountryTourEntries = (
  countrySlug: string
): UnifiedCityTour[] => entriesByCountry[countrySlug] ?? [];

export const getEuropeCityTourEntries = (
  countrySlug: string,
  citySlug: string
): UnifiedCityTour[] => {
  const entries = entriesByCountry[countrySlug] ?? [];
  return entries.filter(entry => canonicalCitySlugFor(entry) === citySlug);
};

export const getEuropeInternalStateSlugs = (
  countrySlug: string,
  citySlug: string
) => {
  const city = (citiesByCountry[countrySlug] ?? []).find(
    entry => entry.slug === citySlug
  );
  if (city?.internalStateSlugs.length) {
    return city.internalStateSlugs;
  }

  return countrySlug === "united-kingdom"
    ? ["united-kingdom", "england", "scotland", "wales", "northern-ireland"]
    : [countrySlug];
};
