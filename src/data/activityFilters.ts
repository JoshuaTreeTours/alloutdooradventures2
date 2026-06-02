import type { Tour } from "./tours.types";

const HIKING_CATEGORY_SLUGS = new Set([
  "hiking",
  "hiking-tour",
  "hiking-tours",
]);

const WALKING_CATEGORY_SLUGS = new Set([
  "walking",
  "walking-tour",
  "walking-tours",
  "guided-walk",
  "guided-walks",
]);

const CYCLING_CATEGORY_SLUGS = new Set([
  "cycling",
  "cycling-tour",
  "cycling-tours",
  "bike-tour",
  "bike-tours",
  "bicycle-tour",
  "bicycle-tours",
  "e-bike-tour",
  "e-bike-tours",
  "ebike-tour",
  "ebike-tours",
  "mountain-bike-tour",
  "mountain-bike-tours",
]);

const normalize = (value: string | undefined | null) =>
  value?.trim().toLowerCase() ?? "";

const getNormalizedCategories = (tour: Tour) =>
  [tour.primaryCategory, ...(tour.categories ?? [])]
    .map(normalize)
    .filter(Boolean);

const hasAny = (values: string[], candidates: Set<string>) =>
  values.some(value => candidates.has(value));

const isHikingPrimary = (tour: Tour) =>
  HIKING_CATEGORY_SLUGS.has(normalize(tour.primaryCategory));

const hasHikingOrWalkingSignal = (tour: Tour) => {
  const categories = getNormalizedCategories(tour);

  return (
    tour.activitySlugs.includes("hiking") ||
    hasAny(categories, HIKING_CATEGORY_SLUGS) ||
    hasAny(categories, WALKING_CATEGORY_SLUGS)
  );
};

const hasCyclingSignal = (tour: Tour) => {
  const categories = getNormalizedCategories(tour);

  return (
    tour.activitySlugs.includes("cycling") ||
    tour.activitySlugs.includes("bike-tours") ||
    hasAny(categories, CYCLING_CATEGORY_SLUGS)
  );
};

export const matchesCategoryPageActivity = (
  tour: Tour,
  activitySlug: string
) => {
  if (activitySlug !== "hiking") {
    return tour.activitySlugs.includes(activitySlug);
  }

  if (isHikingPrimary(tour)) {
    return true;
  }

  if (hasCyclingSignal(tour)) {
    return false;
  }

  return hasHikingOrWalkingSignal(tour);
};
