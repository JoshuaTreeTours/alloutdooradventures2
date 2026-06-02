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

const PADDLE_CATEGORY_SLUGS = new Set([
  "paddle-tour",
  "kayak-tour",
  "kayaking-tour",
  "canoe-tour",
  "canoeing-tour",
  "sup-tour",
]);

const BOAT_CATEGORY_SLUGS = new Set(["boat-tour", "snorkeling-tour"]);

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

const ACTIVITY_RELEVANCE_CATEGORY_SLUGS: Record<string, Set<string>> = {
  cycling: CYCLING_CATEGORY_SLUGS,
  hiking: HIKING_CATEGORY_SLUGS,
  canoeing: PADDLE_CATEGORY_SLUGS,
};

const getEnginePlacementRank = (tour: Tour) => {
  if (tour.engine === "engine6") return 5;
  if (tour.engine === "engine4") return 4;
  if (tour.engine === "engine3") return 3;
  if (tour.engine === "engine2") return 2;
  return 1;
};

const normalizeDuplicateKeyPart = (value: string | undefined | null) =>
  normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getCategoryDuplicateKey = (tour: Tour) =>
  [
    normalizeDuplicateKeyPart(tour.destination.stateSlug),
    normalizeDuplicateKeyPart(tour.destination.citySlug),
    normalizeDuplicateKeyPart(tour.title),
  ].join("/");

export const getCategoryPageActivityRelevance = (
  tour: Tour,
  activitySlug: string
) => {
  const primaryCategory = normalize(tour.primaryCategory);
  const categories = getNormalizedCategories(tour);
  const categorySlugs = ACTIVITY_RELEVANCE_CATEGORY_SLUGS[activitySlug];

  if (activitySlug === "hiking") {
    if (hasGovernedEngine6HikingClassification(tour) || isHikingPrimary(tour)) {
      return 3;
    }

    if (hasHikingLabel(tour) || HIKING_TITLE_PATTERN.test(tour.title)) {
      return 2;
    }

    return tour.activitySlugs.includes(activitySlug) ? 1 : 0;
  }

  if (activitySlug === "canoeing") {
    if (PADDLE_CATEGORY_SLUGS.has(primaryCategory)) {
      return 3;
    }

    if (hasAny(categories, PADDLE_CATEGORY_SLUGS)) {
      return 2;
    }

    if (
      BOAT_CATEGORY_SLUGS.has(primaryCategory) ||
      hasAny(categories, BOAT_CATEGORY_SLUGS)
    ) {
      return 1;
    }

    return tour.activitySlugs.includes(activitySlug) ? 1 : 0;
  }

  if (categorySlugs?.has(primaryCategory)) {
    return 3;
  }

  if (categorySlugs && hasAny(categories, categorySlugs)) {
    return 2;
  }

  return tour.activitySlugs.includes(activitySlug) ? 1 : 0;
};

const preferCategoryDuplicate = (
  current: { tour: Tour; index: number },
  candidate: { tour: Tour; index: number },
  activitySlug: string
) => {
  if (
    current.tour.engine !== "engine6" &&
    candidate.tour.engine === "engine6"
  ) {
    return candidate;
  }

  if (
    current.tour.engine === "engine6" &&
    candidate.tour.engine !== "engine6"
  ) {
    return current;
  }

  const currentRelevance = getCategoryPageActivityRelevance(
    current.tour,
    activitySlug
  );
  const candidateRelevance = getCategoryPageActivityRelevance(
    candidate.tour,
    activitySlug
  );

  if (candidateRelevance !== currentRelevance) {
    return candidateRelevance > currentRelevance ? candidate : current;
  }

  const currentRank = getEnginePlacementRank(current.tour);
  const candidateRank = getEnginePlacementRank(candidate.tour);

  if (candidateRank !== currentRank) {
    return candidateRank > currentRank ? candidate : current;
  }

  return candidate.index < current.index ? candidate : current;
};

export const sortCategoryPageActivityTours = (
  activityTours: Tour[],
  activitySlug: string
) => {
  const dedupedByProduct = new Map<string, { tour: Tour; index: number }>();

  activityTours.forEach((tour, index) => {
    const key = getCategoryDuplicateKey(tour);
    const current = dedupedByProduct.get(key);
    const candidate = { tour, index };

    dedupedByProduct.set(
      key,
      current
        ? preferCategoryDuplicate(current, candidate, activitySlug)
        : candidate
    );
  });

  return Array.from(dedupedByProduct.values())
    .sort((a, b) => {
      const relevanceDelta =
        getCategoryPageActivityRelevance(b.tour, activitySlug) -
        getCategoryPageActivityRelevance(a.tour, activitySlug);

      if (relevanceDelta !== 0) {
        return relevanceDelta;
      }

      const rankDelta =
        getEnginePlacementRank(b.tour) - getEnginePlacementRank(a.tour);

      if (rankDelta !== 0) {
        return rankDelta;
      }

      return a.index - b.index;
    })
    .map(entry => entry.tour);
};
