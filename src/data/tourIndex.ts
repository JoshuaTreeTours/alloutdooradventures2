import { EUROPE_COUNTRIES, US_STATES, slugify } from "./tourCatalog";
import { tours } from "./tours";
import type { Tour } from "./tours.types";

export type GuidePlace =
  | {
      type: "state";
      slug: string;
      name: string;
    }
  | {
      type: "country";
      slug: string;
      name: string;
    }
  | {
      type: "city";
      slug: string;
      name: string;
      parentSlug: string;
      parentName: string;
      regionType: "state" | "country";
    };

export type GuideCitySummary = {
  name: string;
  slug: string;
  tourCount: number;
};

const US_STATE_SLUGS = new Set(US_STATES.map((state) => slugify(state)));
const EUROPE_COUNTRY_SLUGS = new Set(
  EUROPE_COUNTRIES.map((country) => slugify(country)),
);

const isUsStateTour = (tour: Tour) => {
  if (US_STATE_SLUGS.has(tour.destination.stateSlug)) {
    return true;
  }

  return US_STATE_SLUGS.has(slugify(tour.destination.state));
};

const getCountryFromTour = (tour: Tour) => {
  if (tour.destination.country) {
    return {
      name: tour.destination.country,
      slug: slugify(tour.destination.country),
    };
  }

  if (!isUsStateTour(tour) && tour.destination.state) {
    return {
      name: tour.destination.state,
      slug: tour.destination.stateSlug || slugify(tour.destination.state),
    };
  }

  return null;
};

const matchesActivity = (tour: Tour, activitySlug: string) =>
  tour.activitySlugs.includes(activitySlug) ||
  tour.categories?.includes(activitySlug) ||
  tour.primaryCategory === activitySlug;

const buildCitySummaries = (tourList: Tour[]): GuideCitySummary[] => {
  const cities = new Map<string, GuideCitySummary>();

  tourList.forEach((tour) => {
    const key = tour.destination.citySlug;
    if (!key) {
      return;
    }

    const existing = cities.get(key);
    if (existing) {
      existing.tourCount += 1;
      return;
    }

    cities.set(key, {
      name: tour.destination.city,
      slug: tour.destination.citySlug,
      tourCount: 1,
    });
  });

  return Array.from(cities.values());
};

const getToursForPlace = (place: GuidePlace): Tour[] => {
  if (place.type === "state") {
    return tours.filter(
      (tour) =>
        tour.destination.stateSlug === place.slug && isUsStateTour(tour),
    );
  }

  if (place.type === "country") {
    return tours.filter((tour) => getCountryFromTour(tour)?.slug === place.slug);
  }

  return tours.filter((tour) => {
    if (tour.destination.citySlug !== place.slug) {
      return false;
    }

    if (place.regionType === "state") {
      return tour.destination.stateSlug === place.parentSlug && isUsStateTour(tour);
    }

    return getCountryFromTour(tour)?.slug === place.parentSlug;
  });
};

const scoreTour = (tour: Tour) => {
  const reviewCount = tour.badges?.reviewCount ?? 0;
  const rating = tour.badges?.rating ?? 0;
  const likelyToSellOut = tour.badges?.likelyToSellOut ? 1 : 0;
  return { reviewCount, rating, likelyToSellOut };
};

const compareTours = (a: Tour, b: Tour) => {
  const scoreA = scoreTour(a);
  const scoreB = scoreTour(b);

  if (scoreA.likelyToSellOut !== scoreB.likelyToSellOut) {
    return scoreB.likelyToSellOut - scoreA.likelyToSellOut;
  }

  if (scoreA.reviewCount !== scoreB.reviewCount) {
    return scoreB.reviewCount - scoreA.reviewCount;
  }

  if (scoreA.rating !== scoreB.rating) {
    return scoreB.rating - scoreA.rating;
  }

  const titleCompare = a.title.localeCompare(b.title);
  if (titleCompare !== 0) {
    return titleCompare;
  }

  return a.id.localeCompare(b.id);
};

export const getTourCountsForActivities = (
  place: GuidePlace,
  activitySlugs: string[],
) => {
  const toursForPlace = getToursForPlace(place);

  return activitySlugs.reduce<Record<string, number>>((acc, slug) => {
    acc[slug] = toursForPlace.filter((tour) => matchesActivity(tour, slug)).length;
    return acc;
  }, {});
};

export const getTopToursForPlace = (
  place: GuidePlace,
  {
    min = 3,
    max = 6,
    activitySlug,
  }: { min?: number; max?: number; activitySlug?: string } = {},
) => {
  const toursForPlace = getToursForPlace(place);
  const filteredTours = activitySlug
    ? toursForPlace.filter((tour) => matchesActivity(tour, activitySlug))
    : toursForPlace;
  const sortedTours = [...filteredTours].sort(compareTours);
  const limit = Math.min(sortedTours.length, max);
  if (sortedTours.length <= min) {
    return sortedTours;
  }

  return sortedTours.slice(0, limit);
};

export const getTopCitiesForPlace = (
  place: Extract<GuidePlace, { type: "state" | "country" }>,
  limit = 6,
): GuideCitySummary[] => {
  const toursForPlace = getToursForPlace(place);
  return buildCitySummaries(toursForPlace)
    .sort((a, b) => b.tourCount - a.tourCount)
    .slice(0, limit);
};

export const isEuropeCountrySlug = (countrySlug: string) =>
  EUROPE_COUNTRY_SLUGS.has(countrySlug);

export const getAllToursHref = (place: GuidePlace) => {
  if (place.type === "state") {
    return `/destinations/states/${place.slug}/tours`;
  }

  if (place.type === "country") {
    return isEuropeCountrySlug(place.slug)
      ? `/destinations/europe/${place.slug}`
      : `/destinations/world/${place.slug}`;
  }

  if (place.regionType === "state") {
    return `/destinations/states/${place.parentSlug}/cities/${place.slug}/tours`;
  }

  return isEuropeCountrySlug(place.parentSlug)
    ? `/destinations/europe/${place.parentSlug}/cities/${place.slug}/tours`
    : `/destinations/world/${place.parentSlug}/cities/${place.slug}/tours`;
};
