import { getCityBySlugs, getStateBySlug } from "./destinations";
import { slugify, US_STATES } from "./tourCatalog";
import { tours } from "./tours";
import type { Tour } from "./tours.types";

export type GuideImage = {
  src: string;
  alt: string;
  category: "cityscape" | "lifestyle" | "scenic";
};

const FALLBACK_IMAGES = [
  "/hero.jpg",
  "/images/hiking-hero3.jpg",
  "/images/cycling-hero.jpg",
  "/images/canoe-hero.jpg",
  "/images/hiking-hero.jpg",
  "/images/hiking-hero2.jpg",
  "/images/connecticut.webp",
];

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

const pickImage = (
  candidates: string[],
  fallback: string[],
  seen: Set<string>,
) => {
  const pool = [...candidates, ...fallback];

  for (const image of pool) {
    if (!image || seen.has(image)) {
      continue;
    }

    seen.add(image);
    return image;
  }

  return null;
};

export const getGuideImages = (
  citySlug: string,
  stateSlug?: string,
  countrySlug?: string,
): GuideImage[] => {
  const cityName = getCityDisplayName(citySlug, stateSlug, countrySlug);
  const city = stateSlug ? getCityBySlugs(stateSlug, citySlug) : null;
  const state = stateSlug ? getStateBySlug(stateSlug) : null;
  const tourImages = uniqueImages(
    getCityTours(citySlug, stateSlug, countrySlug).flatMap((tour) => [
      tour.heroImage,
      ...(tour.galleryImages ?? []),
    ]),
  );
  const cityImages = uniqueImages(city?.heroImages ?? []);
  const stateImage = state?.heroImage;
  const fallbackImages = uniqueImages([stateImage, ...FALLBACK_IMAGES]);
  const seen = new Set<string>();

  const selections: GuideImage[] = [];

  const cityscape = pickImage(
    [...tourImages, ...cityImages],
    fallbackImages,
    seen,
  );
  if (cityscape) {
    selections.push({
      src: cityscape,
      alt: buildAltText(cityName, "cityscape"),
      category: "cityscape",
    });
  }

  const lifestyle = pickImage(
    [...cityImages, ...tourImages],
    fallbackImages,
    seen,
  );
  if (lifestyle) {
    selections.push({
      src: lifestyle,
      alt: buildAltText(cityName, "lifestyle"),
      category: "lifestyle",
    });
  }

  const scenic = pickImage(
    [stateImage ?? "", ...tourImages],
    fallbackImages,
    seen,
  );
  if (scenic) {
    selections.push({
      src: scenic,
      alt: buildAltText(cityName, "scenic"),
      category: "scenic",
    });
  }

  if (selections.length < 3) {
    for (const image of fallbackImages) {
      if (selections.length >= 3) {
        break;
      }

      if (!image || seen.has(image)) {
        continue;
      }

      seen.add(image);
      selections.push({
        src: image,
        alt: `${cityName} travel highlight`,
        category: "scenic",
      });
    }
  }

  return selections.slice(0, 3);
};
