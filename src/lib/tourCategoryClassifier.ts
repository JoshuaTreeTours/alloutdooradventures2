export const TOUR_ACTIVITY_CATEGORIES = [
  { slug: "cycling", label: "Cycling" },
  { slug: "hiking", label: "Hiking" },
  { slug: "paddle-sports", label: "Paddle Sports" },
  { slug: "water-sports", label: "Water Sports" },
  { slug: "sailing", label: "Sailing" },
  { slug: "jeep-off-road", label: "Jeep & Off-Road" },
  { slug: "wildlife", label: "Wildlife" },
  { slug: "stargazing", label: "Stargazing" },
  { slug: "food-wine", label: "Food & Wine" },
  { slug: "air-tours", label: "Air Tours" },
  { slug: "sightseeing-city-tours", label: "Sightseeing & City Tours" },
] as const;

export type TourActivityCategorySlug =
  (typeof TOUR_ACTIVITY_CATEGORIES)[number]["slug"];

export type TourActivityCategory = {
  slug: TourActivityCategorySlug;
  label: string;
};

export type TourCategoryClassificationInput = {
  title?: string | null;
  overview?: string | null;
  description?: string | null;
  highlights?: Array<string | null | undefined> | null;
  itinerary?: Array<
    | string
    | null
    | undefined
    | {
        title?: string | null;
        description?: string | null;
        sectionLabel?: string | null;
      }
  > | null;
  categories?: Array<string | null | undefined> | null;
};

export type TourCategoryClassification = {
  primaryDisplayCategory: string | null;
  activityCategories: TourActivityCategory[];
  matchedCategorySlugs: TourActivityCategorySlug[];
  normalizedText: string;
};

const CATEGORY_BY_SLUG = new Map<
  TourActivityCategorySlug,
  TourActivityCategory
>(TOUR_ACTIVITY_CATEGORIES.map(category => [category.slug, category]));

const CATEGORY_SIGNAL_PATTERNS: Array<{
  slug: TourActivityCategorySlug;
  signals: RegExp[];
}> = [
  {
    slug: "cycling",
    signals: [/\b(?:bike|bicycle|e[- ]?bike|ebike|cycling|pedal)\b/],
  },
  {
    slug: "water-sports",
    signals: [
      /\b(?:jet ski|jetski|waverunner|wave runner|parasail|parasailing|wakeboard|tubing|water ski|speedboat|powerboat)\b/,
    ],
  },
  {
    slug: "jeep-off-road",
    signals: [/\b(?:jeep|hummer|4x4|off[- ]?road|offroad|atv|utv|buggy)\b/],
  },
  {
    slug: "air-tours",
    signals: [
      /\b(?:helicopter|airplane|flightseeing|aerial|balloon|seaplane)\b/,
    ],
  },
  {
    slug: "paddle-sports",
    signals: [
      /\b(?:kayak|kayaking|canoe|paddleboard|stand up paddle|sup|rafting|river float)\b/,
    ],
  },
  {
    slug: "sailing",
    signals: [/\b(?:sail|sailing|yacht|catamaran|schooner)\b/],
  },
  {
    slug: "wildlife",
    signals: [
      /\b(?:wildlife|whale|dolphin|bear|birding|safari|bison|elk|animal)\b/,
    ],
  },
  {
    slug: "stargazing",
    signals: [
      /\b(?:stargazing|star gazing|astronomy|telescope|night sky|milky way)\b/,
    ],
  },
  {
    slug: "food-wine",
    signals: [
      /\b(?:wine|winery|vineyard|tasting|food tour|culinary|brewery|beer|distillery)\b/,
    ],
  },
  {
    slug: "hiking",
    signals: [
      /\b(?:hike|hiking|trek|nature walk|canyon walk|trail hike|hiking trail|trail walk|guided trail)\b/,
    ],
  },
  {
    slug: "sightseeing-city-tours",
    signals: [
      /\b(?:sightseeing|city tour|trolley|bus tour|walking tour|hop[- ]on hop[- ]off|landmarks|highlights tour)\b/,
    ],
  },
];

const SOURCE_CATEGORY_TO_ACTIVITY: Record<string, TourActivityCategorySlug> = {
  cycling: "cycling",
  "bike-tour": "cycling",
  "bicycle-tour": "cycling",
  "cycling-tour": "cycling",
  hiking: "hiking",
  "hiking-tour": "hiking",
  canoeing: "paddle-sports",
  "paddle-tour": "paddle-sports",
  "boat-tour": "sailing",
  "snorkeling-tour": "water-sports",
  "off-road-tour": "jeep-off-road",
  "wildlife-tour": "wildlife",
  "food-and-drink-tour": "food-wine",
  "air-tour": "air-tours",
  "sightseeing-tour": "sightseeing-city-tours",
  "walking-tour": "sightseeing-city-tours",
};

const CATEGORY_PRIORITY = CATEGORY_SIGNAL_PATTERNS.map(pattern => pattern.slug);

const SIGHTSEEING_SLUG: TourActivityCategorySlug = "sightseeing-city-tours";

export const normalizeTourCategoryText = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9+.-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const appendIfPresent = (parts: string[], value: string | null | undefined) => {
  const trimmed = value?.trim();
  if (trimmed) parts.push(trimmed);
};

const buildClassifierText = (input: TourCategoryClassificationInput) => {
  const parts: string[] = [];
  appendIfPresent(parts, input.title);
  appendIfPresent(parts, input.overview);
  appendIfPresent(parts, input.description);

  for (const highlight of input.highlights ?? []) {
    appendIfPresent(parts, highlight);
  }

  for (const item of input.itinerary ?? []) {
    if (typeof item === "string") {
      appendIfPresent(parts, item);
      continue;
    }

    if (item) {
      appendIfPresent(parts, item.sectionLabel);
      appendIfPresent(parts, item.description);
    }
  }

  return normalizeTourCategoryText(parts.join(" "));
};

const toSimpleSlug = (value: string) =>
  normalizeTourCategoryText(value)
    .replace(/\band\b/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const pushUnique = <T>(items: T[], item: T) => {
  if (!items.includes(item)) items.push(item);
};

const orderPrimaryFirst = (slugs: TourActivityCategorySlug[]) =>
  [...slugs].sort((a, b) => {
    if (a === SIGHTSEEING_SLUG && b !== SIGHTSEEING_SLUG) return 1;
    if (b === SIGHTSEEING_SLUG && a !== SIGHTSEEING_SLUG) return -1;

    const priorityA = CATEGORY_PRIORITY.indexOf(a);
    const priorityB = CATEGORY_PRIORITY.indexOf(b);

    return priorityA - priorityB;
  });

export const classifyTourCategories = (
  input: TourCategoryClassificationInput
): TourCategoryClassification => {
  const normalizedText = buildClassifierText(input);
  const matched: TourActivityCategorySlug[] = [];

  for (const sourceCategory of input.categories ?? []) {
    if (!sourceCategory) continue;
    const mapped = SOURCE_CATEGORY_TO_ACTIVITY[toSimpleSlug(sourceCategory)];
    if (mapped) pushUnique(matched, mapped);
  }

  for (const categoryPattern of CATEGORY_SIGNAL_PATTERNS) {
    if (categoryPattern.signals.some(signal => signal.test(normalizedText))) {
      pushUnique(matched, categoryPattern.slug);
    }
  }

  const isTransitSightseeingTour =
    /\b(?:trolley|bus tour|hop[- ]on hop[- ]off)\b/.test(normalizedText) &&
    matched.includes(SIGHTSEEING_SLUG);
  const filteredMatches = isTransitSightseeingTour
    ? matched.filter(
        slug =>
          slug === SIGHTSEEING_SLUG ||
          slug === "food-wine" ||
          slug === "stargazing"
      )
    : matched;

  const matchedCategorySlugs = orderPrimaryFirst(filteredMatches);
  const activityCategories = matchedCategorySlugs
    .map(slug => CATEGORY_BY_SLUG.get(slug))
    .filter((category): category is TourActivityCategory => Boolean(category));

  return {
    primaryDisplayCategory: activityCategories[0]?.label ?? null,
    activityCategories,
    matchedCategorySlugs,
    normalizedText,
  };
};

export const getTourActivityCategoryLabel = (
  slug: TourActivityCategorySlug | string | null | undefined
) =>
  slug ? CATEGORY_BY_SLUG.get(slug as TourActivityCategorySlug)?.label : null;
