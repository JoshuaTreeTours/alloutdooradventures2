import { getCityBySlugs, getStateBySlug } from "./destinations";
import { slugify, US_STATES } from "./tourCatalog";
import { tours } from "./tours";
import type { Tour } from "./tours.types";

export type GuideImage = {
  src: string;
  alt: string;
  category: "cityscape" | "lifestyle" | "scenic";
};

const US_STATE_SLUGS = new Set(US_STATES.map((state) => slugify(state)));

const isUsStateTour = (tour: Tour) => {
  if (US_STATE_SLUGS.has(tour.destination.stateSlug)) {
    return true;
  }

  return US_STATE_SLUGS.has(slugify(tour.destination.state));
};

const getCityTours = (
  citySlug: string,
  stateSlug?: string,
  countrySlug?: string,
) =>
  tours.filter((tour) => {
    if (tour.destination.citySlug !== citySlug) {
      return false;
    }

    if (stateSlug) {
      return tour.destination.stateSlug === stateSlug;
    }

    if (!countrySlug) {
      return false;
    }

    if (tour.destination.country) {
      return slugify(tour.destination.country) === countrySlug;
    }

    if (!isUsStateTour(tour) && tour.destination.stateSlug) {
      return tour.destination.stateSlug === countrySlug;
    }

    return false;
  });

const isCountryMatch = (tour: Tour, countrySlug: string) => {
  if (tour.destination.country) {
    return slugify(tour.destination.country) === countrySlug;
  }

  if (!isUsStateTour(tour) && tour.destination.stateSlug) {
    return tour.destination.stateSlug === countrySlug;
  }

  return false;
};

const uniqueImages = (images: Array<string | undefined>) => {
  const seen = new Set<string>();
  const results: string[] = [];

  images.forEach((image) => {
    if (!image || seen.has(image)) {
      return;
    }

    seen.add(image);
    results.push(image);
  });

  return results;
};

const getCityDisplayName = (
  citySlug: string,
  stateSlug?: string,
  countrySlug?: string,
) => {
  if (stateSlug) {
    const city = getCityBySlugs(stateSlug, citySlug);
    if (city) {
      return city.name;
    }
  }

  const tourCity = getCityTours(citySlug, stateSlug, countrySlug)[0];
  if (tourCity) {
    return tourCity.destination.city;
  }

  return citySlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const buildAltText = (cityName: string, category: GuideImage["category"]) => {
  switch (category) {
    case "cityscape":
      return `${cityName} skyline and downtown streets`;
    case "lifestyle":
      return `${cityName} neighborhoods and local culture`;
    case "scenic":
      return `${cityName} outdoor scenery and landscapes`;
    default:
      return `${cityName} travel scene`;
  }
};

const getTourImages = (tourPool: Tour[]) =>
  uniqueImages(
    tourPool.flatMap((tour) => [tour.heroImage, ...(tour.galleryImages ?? [])]),
  );

const getStateTours = (stateSlug: string) =>
  tours.filter((tour) => tour.destination.stateSlug === stateSlug);

const getCountryTours = (countrySlug: string) =>
  tours.filter((tour) => isCountryMatch(tour, countrySlug));

const getRegionTours = (region: string) =>
  tours.filter((tour) => {
    const state = getStateBySlug(tour.destination.stateSlug);
    return state?.region === region;
  });

export const getGuideImages = (
  citySlug: string,
  stateSlug?: string,
  countrySlug?: string,
): GuideImage[] => {
  const cityName = getCityDisplayName(citySlug, stateSlug, countrySlug);
  const state = stateSlug ? getStateBySlug(stateSlug) : null;
  const region = state?.region;
  const cityImages = getTourImages(
    getCityTours(citySlug, stateSlug, countrySlug),
  );
  const stateImages = stateSlug
    ? getTourImages(getStateTours(stateSlug))
    : countrySlug
      ? getTourImages(getCountryTours(countrySlug))
      : [];
  const regionImages = region ? getTourImages(getRegionTours(region)) : [];
  const pool = uniqueImages([...cityImages, ...stateImages, ...regionImages]);
  const categories: GuideImage["category"][] = [
    "cityscape",
    "lifestyle",
    "scenic",
  ];

  return pool.slice(0, 3).map((src, index) => ({
    src,
    alt: buildAltText(cityName, categories[index] ?? "scenic"),
    category: categories[index] ?? "scenic",
  }));
};
