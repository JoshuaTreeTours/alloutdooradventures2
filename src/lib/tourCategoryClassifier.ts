export const TOUR_ACTIVITY_CATEGORIES = [
  { slug: "cycling", label: "Cycling" },
  { slug: "hiking", label: "Hiking" },
  { slug: "walking-tours", label: "Walking Tours" },
  { slug: "paddle-sports", label: "Paddle Sports" },
  { slug: "water-sports", label: "Water Sports" },
  { slug: "sailing", label: "Sailing" },
  { slug: "fishing", label: "Fishing" },
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
      /\b(?:jet ski|jetski|waverunner|wave runner|parasail|parasailing|wakeboard|tubing|water ski|speedboat|powerboat|snorkel|snorkeling|swim (?:with|among|amongst)(?: [a-z]+){0,4} fish|coral reef snorkeling|reef snorkeling|underwater viewing)\b/,
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
    slug: "fishing",
    signals: [
      /\b(?:fishing charter|deep sea fishing|sportfishing|sport fishing|fly fishing|reef fishing|angling|lake fishing|river fishing|fishing trip|catch(?:ing)? fish|fishing)\b/,
    ],
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
      /\b(?:wine|winery|vineyard|tasting|food tour|food walk|food walking|culinary|brewery|beer|distillery|pizza|pasta|gelato|donut|chocolate|taco)\b/,
    ],
  },
  {
    slug: "hiking",
    signals: [
      /\b(?:hike|hiking|trek|trekking|nature walk|canyon walk|mountain walk|national park walk|trail hike|hiking trail|trail walk|nature trail|forest trail|guided trail|glacier hike)\b/,
    ],
  },
  {
    slug: "walking-tours",
    signals: [
      /\b(?:walking tour|guided walk|walking outing|city walk|history walk|historic walk|ghost walk|architecture walk|neighborhood walk|street art walk|cultural walk|urban exploration walk|walk of fame|on foot)\b/,
    ],
  },
  {
    slug: "sightseeing-city-tours",
    signals: [
      /\b(?:sightseeing|city tour|trolley|bus tour|hop[- ]on hop[- ]off|landmarks|highlights tour)\b/,
    ],
  },
];

const SOURCE_CATEGORY_TO_ACTIVITY: Record<string, TourActivityCategorySlug> = {
  cycling: "cycling",
  "bike-tours": "cycling",
  "bike-tour": "cycling",
  "bicycle-tour": "cycling",
  "cycling-tour": "cycling",
  hiking: "hiking",
  "hiking-tours": "hiking",
  "hiking-tour": "hiking",
  fishing: "fishing",
  "fishing-charter": "fishing",
  "deep-sea-fishing": "fishing",
  sportfishing: "fishing",
  "sport-fishing": "fishing",
  "fly-fishing": "fishing",
  "reef-fishing": "fishing",
  angling: "fishing",
  "lake-fishing": "fishing",
  "river-fishing": "fishing",
  canoeing: "paddle-sports",
  "paddle-sports": "paddle-sports",
  "paddle-tour": "paddle-sports",
  "boat-tour": "sailing",
  "snorkeling-tour": "water-sports",
  "off-road-tour": "jeep-off-road",
  "wildlife-tour": "wildlife",
  "food-and-drink-tour": "food-wine",
  "food-wine": "food-wine",
  "air-tour": "air-tours",
  "sightseeing-tour": "sightseeing-city-tours",
  "sightseeing-city-tours": "sightseeing-city-tours",
  "walking-tour": "walking-tours",
  "walking-tours": "walking-tours",
};

const CATEGORY_PRIORITY = CATEGORY_SIGNAL_PATTERNS.map(pattern => pattern.slug);

const SIGHTSEEING_SLUG: TourActivityCategorySlug = "sightseeing-city-tours";
const WALKING_TOURS_SLUG: TourActivityCategorySlug = "walking-tours";
const HIKING_SLUG: TourActivityCategorySlug = "hiking";
const FOOD_WINE_SLUG: TourActivityCategorySlug = "food-wine";

const TRUE_HIKING_PATTERN =
  /\b(?:hike|hiking|trek|trekking|canyon hike|canyon walk|mountain hike|mountain walk|national park hike|national park walk|trail hike|hiking trail|trail walk|nature trail|forest trail|guided trail|glacier hike)\b/;

const FOOD_PRIMARY_PATTERN =
  /\b(?:food tour|food walk|food walking|culinary|wine|winery|vineyard|tasting|brewery|beer|distillery|pizza|pasta|gelato|donut|chocolate|taco)\b/;

const STRONG_FISHING_PATTERN =
  /\b(?:fishing charter|deep sea fishing|sportfishing|sport fishing|fly fishing|reef fishing|angling|lake fishing|river fishing|fishing trip|catch(?:ing)? fish)\b/;

const SNORKELING_WATER_SPORTS_PATTERN =
  /\b(?:snorkel|snorkeling|swim (?:with|among|amongst)(?: [a-z]+){0,4} fish|coral reef snorkeling|reef snorkeling|underwater viewing)\b/;

const FISHING_SLUG: TourActivityCategorySlug = "fishing";

const EXPLICIT_HIKING_PATTERN = /\b(?:hike|hiking|trek|trekking)\b/;

const NON_HIKING_PRIMARY_PATTERN =
  /\b(?:bike|bicycle|e[- ]?bike|ebike|cycling|pedal|jeep|hummer|4x4|off[- ]?road|offroad|atv|utv|buggy|kayak|canoe|paddle|sup|snorkel|boat|sail|sailing|yacht|catamaran|cruise|jet ski|jetski|fishing|angling|horse|horseback|zipline|zip line|segway|airplane|flightseeing|aerial)\b/;

const NEGATED_HIKING_PATTERN = /\b(?:instead of|rather than|without) hiking\b/;

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

  for (const sourceCategory of input.categories ?? []) {
    appendIfPresent(parts, sourceCategory);
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
  const transitFilteredMatches = isTransitSightseeingTour
    ? matched.filter(
        slug =>
          slug === SIGHTSEEING_SLUG ||
          slug === FOOD_WINE_SLUG ||
          slug === "stargazing"
      )
    : matched;

  const priorityFilteredMatches = transitFilteredMatches.filter(slug => {
    if (
      slug === WALKING_TOURS_SLUG &&
      FOOD_PRIMARY_PATTERN.test(normalizedText)
    ) {
      return false;
    }

    if (
      slug === WALKING_TOURS_SLUG &&
      TRUE_HIKING_PATTERN.test(normalizedText)
    ) {
      return false;
    }

    if (
      slug === WALKING_TOURS_SLUG &&
      NON_HIKING_PRIMARY_PATTERN.test(normalizedText)
    ) {
      return false;
    }

    if (
      slug === FISHING_SLUG &&
      FOOD_PRIMARY_PATTERN.test(normalizedText) &&
      !STRONG_FISHING_PATTERN.test(normalizedText)
    ) {
      return false;
    }

    if (
      slug === FISHING_SLUG &&
      SNORKELING_WATER_SPORTS_PATTERN.test(normalizedText) &&
      !STRONG_FISHING_PATTERN.test(normalizedText)
    ) {
      return false;
    }

    if (slug === HIKING_SLUG && NEGATED_HIKING_PATTERN.test(normalizedText)) {
      return false;
    }

    if (slug === HIKING_SLUG && matched.includes(WALKING_TOURS_SLUG)) {
      return TRUE_HIKING_PATTERN.test(normalizedText);
    }

    if (
      slug === HIKING_SLUG &&
      NON_HIKING_PRIMARY_PATTERN.test(normalizedText) &&
      !EXPLICIT_HIKING_PATTERN.test(normalizedText)
    ) {
      return false;
    }

    return true;
  });

  const matchedCategorySlugs = orderPrimaryFirst(priorityFilteredMatches);
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
