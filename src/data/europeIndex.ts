import { getAllEngine2Tours } from "../engine2/data/loadEngine2";
import { EUROPE_COUNTRIES, slugify } from "./tourCatalog";
import type { Tour } from "./tours.types";
import { tours } from "./tours";
import { resolveTourHeroImage } from "../utils/hero";

export type EuropeCountrySummary = {
  name: string;
  slug: string;
  tourCount: number;
  image: string;
};

const europeCountrySlugs = new Set(EUROPE_COUNTRIES.map((country) => slugify(country)));

const europeTours = tours.filter(tour =>
  europeCountrySlugs.has(tour.destination.stateSlug)
);

export const toursByCountry = europeTours.reduce<Record<string, Tour[]>>(
  (accumulator, tour) => {
    const key = tour.destination.stateSlug;
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(tour);
    return accumulator;
  },
  {}
);
const europeCountryNamesBySlug = new Map(
  EUROPE_COUNTRIES.map((country) => [slugify(country), country]),
);

const engine2EuropeCountsByCountry = getAllEngine2Tours().reduce<Map<string, number>>(
  (counts, tour) => {
    const countrySlug = slugify(tour.geo.country || tour.sourceCountrySlug || "");
    if (!europeCountrySlugs.has(countrySlug)) {
      return counts;
    }

    counts.set(countrySlug, (counts.get(countrySlug) ?? 0) + 1);
    return counts;
  },
  new Map(),
);

const engine2EuropeImageByCountry = getAllEngine2Tours().reduce<Map<string, string>>(
  (images, tour) => {
    const countrySlug = slugify(tour.geo.country || tour.sourceCountrySlug || "");
    if (!europeCountrySlugs.has(countrySlug) || images.has(countrySlug)) {
      return images;
    }

    const image = tour.images.hero?.trim() || tour.seo.ogImage?.trim();
    if (image) {
      images.set(countrySlug, image);
    }

    return images;
  },
  new Map(),
);

export const countriesWithTours: EuropeCountrySummary[] = Array.from(
  new Set([...Object.keys(toursByCountry), ...engine2EuropeCountsByCountry.keys()]),
)
  .filter((slug) => europeCountrySlugs.has(slug))
  .map((slug) => {
    const fallbackTours = toursByCountry[slug] ?? [];
    const fallbackCount = fallbackTours.length;
    const engine2Count = engine2EuropeCountsByCountry.get(slug) ?? 0;

    return {
      name: fallbackTours[0]?.destination.state ?? europeCountryNamesBySlug.get(slug) ?? slug,
      slug,
      tourCount: fallbackCount + engine2Count,
      image:
        resolveTourHeroImage(fallbackTours[0]) ||
        engine2EuropeImageByCountry.get(slug) ||
        "",
    };
  })
  .filter((country) => country.tourCount > 0)
  .sort((a, b) => a.name.localeCompare(b.name));
