import type { Tour } from "./tours.types";

const HIKING_CATEGORY_SLUGS = new Set([
  "hiking",
  "hiking-tour",
  "hiking-tours",
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

const NON_HIKING_ACTIVITY_PATTERN =
  /\b(bike|biking|bicycle|cycling|e-bike|ebike|mountain bike|boat|boating|duffy|kayak|canoe|paddle|sail|sailing|cruise|whaler|jet ski|horse|horseback|trail ride|food|pizza|pasta|gelato|wine|beer|brew|cooking|history|historic|ghost|yoga|tarot|firearm|permit|rental)\b/i;

const WALKING_ACTIVITY_PATTERN = /\b(walking tour|walk)\b/i;

const HIKING_TITLE_PATTERN = /\bhik(?:e|ing)\b/i;

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

const hasHikingLabel = (tour: Tour) => {
  const labels = [
    tour.primaryCategory,
    ...(tour.tags ?? []),
    ...(tour.tagPills ?? []),
  ]
    .map(normalize)
    .filter(Boolean);

  return labels.some(label => HIKING_CATEGORY_SLUGS.has(label));
};

const hasGovernedEngine6HikingClassification = (tour: Tour) =>
  tour.engine === "engine6" && isHikingPrimary(tour);

const hasCyclingSignal = (tour: Tour) => {
  const categories = getNormalizedCategories(tour);

  return (
    tour.activitySlugs.includes("cycling") ||
    tour.activitySlugs.includes("bike-tours") ||
    hasAny(categories, CYCLING_CATEGORY_SLUGS)
  );
};

const hasNonHikingActivitySignal = (tour: Tour) => {
  const classifierText = [
    tour.title,
    tour.primaryCategory,
    ...(tour.categories ?? []),
    ...(tour.tags ?? []),
    ...(tour.tagPills ?? []),
    ...tour.activitySlugs,
  ].join(" ");

  if (
    hasCyclingSignal(tour) ||
    NON_HIKING_ACTIVITY_PATTERN.test(classifierText)
  ) {
    return true;
  }

  return (
    WALKING_ACTIVITY_PATTERN.test(classifierText) &&
    !HIKING_TITLE_PATTERN.test(tour.title)
  );
};

const hasStrictHikingSignal = (tour: Tour) =>
  hasGovernedEngine6HikingClassification(tour) ||
  hasHikingLabel(tour) ||
  HIKING_TITLE_PATTERN.test(tour.title);

const matchesStrictHikingActivity = (tour: Tour) => {
  if (!hasStrictHikingSignal(tour)) {
    return false;
  }

  if (hasGovernedEngine6HikingClassification(tour)) {
    return true;
  }

  return !hasNonHikingActivitySignal(tour);
};

const hasVisibleHikingBadge = (tour: Tour) =>
  (tour.tagPills ?? []).some(label =>
    HIKING_CATEGORY_SLUGS.has(normalize(label))
  );

export const withCategoryPageActivityBadge = (
  tour: Tour,
  activitySlug: string
): Tour => {
  if (
    activitySlug !== "hiking" ||
    hasGovernedEngine6HikingClassification(tour) ||
    hasVisibleHikingBadge(tour)
  ) {
    return tour;
  }

  return {
    ...tour,
    tagPills: ["Hiking", ...(tour.tagPills ?? [])],
  };
};

export const matchesCategoryPageActivity = (
  tour: Tour,
  activitySlug: string
) => {
  if (activitySlug !== "hiking") {
    return tour.activitySlugs.includes(activitySlug);
  }

  return matchesStrictHikingActivity(tour);
};
