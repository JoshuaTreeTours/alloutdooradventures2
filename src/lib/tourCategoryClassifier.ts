export const TOUR_ACTIVITY_CATEGORIES = [
  { slug: "cycling", label: "Cycling" },
  { slug: "hiking", label: "Hiking" },
  { slug: "horseback-riding", label: "Horseback Riding" },
  { slug: "walking-tours", label: "Walking Tours" },
  { slug: "paddle-sports", label: "Paddle Sports" },
  { slug: "water-sports", label: "Water Sports" },
  { slug: "sailing", label: "Sailing" },
  { slug: "boating", label: "Boating" },
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
      /\b(?:jet ski|jetski|waverunner|wave runner|parasail|parasailing|wakeboard|tubing|water ski|snorkel|snorkeling|scuba|swim (?:with|among|amongst)(?: [a-z]+){0,4} fish|coral reef snorkeling|reef snorkeling|underwater viewing)\b/,
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
      /\b(?:kayak|kayaking|canoe|canoeing|paddleboard|stand up paddle|sup|rafting|river float)\b/,
    ],
  },
  {
    slug: "sailing",
    signals: [
      /\b(?:sailing|sailboat|sail boat|schooner|schooner sail|schooner sailing|sailing charter|sailing lesson|sunset sail|catamaran sail|catamaran sailing|yacht sailing|sailing excursion)\b/,
    ],
  },
  {
    slug: "boating",
    signals: [
      /\b(?:boat tour|sightseeing boat tour|sightseeing cruise|harbou?r cruise|bay cruise|riverboat(?: sightseeing)? cruise|river cruise|lake cruise|canal cruise|brunch cruise|dinner cruise|holiday cruise|cocoa cruise|pirate (?:boat|cruise)|ferry|ferry tickets|ferry tour|speedboat(?: adventure| sightseeing)?(?: tour)?|speed boat(?: adventure| sightseeing)?(?: tour)?|jet boat(?: adventure| tour)?|adventure boat|duffy boat|electric boat|pontoon boat|private boat (?:charter|cruise)|boat with a captain|yacht charter|yacht cruise|cruise on yacht|amphibious boat|amphibious seal tour|duck boat|seal tour|water taxi(?:[- ]style)? sightseeing tour|dinner boat|boat cruise|boat rental|party barge cruise|sandbar cruise|fort lauderdale cruise)\b/,
    ],
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
      /\b(?:wildlife|whale|dolphin|orca|sea life|marine wildlife|wildlife cruise|manatee|seal|turtle|bear|birding|safari|bison|elk|animal)\b/,
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
      /\b(?:wine|winery|vineyard|tasting|food cruise|food tour|food walk|food walking|culinary|brewery|beer|distillery|pizza|pasta|gelato|donut|chocolate|taco)\b/,
    ],
  },
  {
    slug: "horseback-riding",
    signals: [
      /\b(?:horseback|horse|pack trip|trail ride|riding stable|ranch ride|horseback riding|horseback tour|horse riding|equestrian tour|cowboy ride|mule ride|pony ride)\b/,
    ],
  },
  {
    slug: "hiking",
    signals: [
      /\b(?:hike|hiking|trek|trekking|scramble|scrambling|glacier hike|nature trail|trail hike|hiking trail|forest trail|canyon trail|mountain trail|backcountry trail|guided trail)\b/,
    ],
  },
  {
    slug: "walking-tours",
    signals: [
      /\b(?:walking tour|guided walk|walking outing|city walk|history walk|historical walk|historic walk|mansions tour|ghost walk|architecture walk|architectural walk|neighborhood walk|street art walk|food walk|food walking|culinary walk|culture walk|cultural walk|urban exploration walk|walk of fame|on foot)\b/,
    ],
  },
  {
    slug: "sightseeing-city-tours",
    signals: [
      /\b(?:sightseeing|city tour|private city tour|private (?:[a-z0-9]+ ){0,6}tour|trolley|bus tour|van tour|suv tour|hop[- ]on hop[- ]off|landmarks|highlights tour|day trip|road trip|limo ride|shopping cart limo|gocar|go car)\b/,
    ],
  },
];

const SOURCE_CATEGORY_TO_ACTIVITY: Record<string, TourActivityCategorySlug> = {
  cycling: "cycling",
  "bike-tours": "cycling",
  "bike-tour": "cycling",
  "bicycle-tour": "cycling",
  "cycling-tour": "cycling",
  "horseback-riding": "horseback-riding",
  "horseback-tour": "horseback-riding",
  "horse-riding": "horseback-riding",
  "equestrian-tour": "horseback-riding",
  "trail-ride": "horseback-riding",
  "ranch-ride": "horseback-riding",
  "mule-ride": "horseback-riding",
  "pony-ride": "horseback-riding",
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
  "boat-tour": "boating",
  "sightseeing-boat-tour": "boating",
  "harbor-cruise": "boating",
  "harbour-cruise": "boating",
  "bay-cruise": "boating",
  "river-cruise": "boating",
  "lake-cruise": "boating",
  "canal-cruise": "boating",
  "speedboat-tour": "boating",
  "speed-boat-tour": "boating",
  "private-boat-charter": "boating",
  "yacht-cruise": "boating",
  "yacht-charter": "boating",
  "duffy-boat": "boating",
  "pontoon-boat": "boating",
  "ferry-tour": "boating",
  "jet-boat": "boating",
  boating: "boating",
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
const HORSEBACK_RIDING_SLUG: TourActivityCategorySlug = "horseback-riding";
const FOOD_WINE_SLUG: TourActivityCategorySlug = "food-wine";
const SAILING_SLUG: TourActivityCategorySlug = "sailing";
const BOATING_SLUG: TourActivityCategorySlug = "boating";
const CYCLING_SLUG: TourActivityCategorySlug = "cycling";
const JEEP_OFF_ROAD_SLUG: TourActivityCategorySlug = "jeep-off-road";
const WILDLIFE_SLUG: TourActivityCategorySlug = "wildlife";

const TRUE_HIKING_PATTERN =
  /\b(?:hike|hiking|trek|trekking|scramble|scrambling|canyon hike|mountain hike|national park hike|trail hike|hiking trail|nature trail|forest trail|canyon trail|mountain trail|backcountry trail|guided trail|glacier hike)\b/;

const HIKING_PRIMARY_EXCLUSION_PATTERN =
  /\b(?:boat|kayak|kayaking|canoe|canoeing|paddleboard|stand up paddle|\bsup\b|rental|rentals|cruise|bar crawl|pub crawl|subway|city tour|bike|bicycle|e[- ]?bike|ebike|cycling|horseback|horse riding|charter|sailing|sailboat|sail boat|ferry|food tour|food walk|food walking)\b/;

const WALKING_TOUR_PATTERN =
  /\b(?:walking tour|guided walk|walking outing|city walk|history walk|historical walk|historic walk|mansions tour|ghost walk|architecture walk|architectural walk|neighborhood walk|street art walk|food walk|food walking|culinary walk|culture walk|cultural walk|urban exploration walk|walk of fame|on foot)\b/;

const FOOD_PRIMARY_PATTERN =
  /\b(?:food cruise|food tour|food walk|food walking|culinary|wine|winery|vineyard|tasting|brewery|beer|distillery|pizza|pasta|gelato|donut|chocolate|taco)\b/;

const FOOD_WINE_ALLOWED_PRIMARY_PATTERN =
  /\b(?:food|wine|beer|brewery|breweries|brewpub|pub crawl|spirits?|cocktails?|bourbon|whiskey|whisky|tequila|distillery|distilleries|culinary|cuisine|cooking class|chef|dining|dinner|lunch|brunch|tasting|tastings|vineyard|winery|wineries|food market|farmers market|market tour|pizza|pasta|gelato|donut|doughnut|chocolate|taco|seafood|bites?)\b/;

const NON_FOOD_PRIMARY_INTENT_PATTERN =
  /\b(?:jet ski|jetski|waverunner|wave runner|snorkel|snorkeling|scuba|parasail|parasailing|kayak|kayaking|canoe|paddleboard|stand up paddle|\bsup\b|rafting|sailing|sailboat|sail boat|schooner|sunset sail|catamaran|yacht|boat tour|sightseeing boat tour|harbou?r cruise|bay cruise|river cruise|lake cruise|canal cruise|boat rental|speedboat|speed boat|jet boat|ferry|whale|dolphin|orca|manatee|seal|turtle|wildlife|fishing|bike tour|bicycle tour|e[- ]?bike tour|ebike tour|cycling|hike|hiking|walking tour|city tour|sightseeing|bus tour|van tour|suv tour|trolley|jeep|off[- ]?road|atv|utv|horseback|helicopter|airplane|flightseeing|stargazing)\b/;

const HORSEBACK_RIDING_PATTERN =
  /\b(?:horseback|horse|pack trip|trail ride|riding stable|ranch ride|horseback riding|horseback tour|horse riding|equestrian tour|cowboy ride|mule ride|pony ride)\b/;

const EXPLICIT_WATERCRAFT_DOMINANCE_PATTERN =
  /\b(?:kayak|kayaking|canoe|canoeing|paddleboard|stand up paddle|\bsup\b|rafting|river float|jet ski|jetski|waverunner|wave runner|boat tour|sightseeing boat tour|harbou?r cruise|bay cruise|river cruise|lake cruise|canal cruise|boat rental|speedboat|speed boat|jet boat|sailing|sailboat|sail boat|schooner|catamaran|yacht|snorkel|snorkeling|scuba)\b/;

const NON_HORSEBACK_RIDING_PATTERN =
  /\b(?:carriage ride|carriage rides|horse carriage|horsedrawn carriage|horse drawn carriage|horse racing|horse race|race track|racetrack|spectator|ranch tour|ranch tours|historical tour|historic tour|rail trail ride|atv trail ride|ez[- ]?raider)\b/;

const MARINE_WILDLIFE_PRIMARY_PATTERN =
  /\b(?:sea life viewing|marine wildlife|wildlife cruise|(?:whales?|dolphins?|orcas?|manatees?|seals?|turtles?)(?: [a-z0-9]+){0,3} (?:watch|watching|viewing|spotting|cruise|tour|sail)|watch(?:ing)? (?:whales?|dolphins?|orcas?|manatees?|seals?|turtles?))\b/;

const AMPHIBIOUS_SEAL_TOUR_PATTERN =
  /\b(?:amphibious seal tour|duck boat|seal tour)\b/;

const EXPLICIT_SAILING_INTENT_PATTERN =
  /\b(?:sailing|sailboat|sail boat|schooner|schooner sail|schooner sailing|sailing charter|sailing lesson|sunset sail|catamaran sail|catamaran sailing|yacht sailing|sailing excursion)\b/;

const NON_SAILING_PRIMARY_PATTERN =
  /\b(?:sightseeing boat tour|sightseeing cruise|harbou?r cruise|bay cruise|riverboat(?: sightseeing)? cruise|river cruise|lake cruise|canal cruise|brunch cruise|dinner cruise|holiday cruise|cocoa cruise|pirate (?:boat|cruise)|ferry|ferry tickets|boat rental|duffy boat|electric boat|pontoon boat|speedboat|speed boat|jet boat|parasail|parasailing|private boat (?:charter|cruise)|boat with a captain|city tour|day trip|road trip|bus tour|van tour|suv tour)\b/;

const EXPLICIT_BOATING_VESSEL_PATTERN =
  /\b(?:boat tour|sightseeing boat tour|sightseeing cruise|harbou?r cruise|bay cruise|riverboat(?: sightseeing)? cruise|river cruise|lake cruise|canal cruise|brunch cruise|dinner cruise|holiday cruise|cocoa cruise|pirate (?:boat|cruise)|ferry|ferry tickets|ferry tour|yacht charter|yacht cruise|cruise on yacht|duffy boat|electric boat|pontoon boat|speedboat(?: adventure| sightseeing)?(?: tour)?|speed boat(?: adventure| sightseeing)?(?: tour)?|jet boat(?: adventure| tour)?|private boat (?:charter|cruise)|boat with a captain|amphibious (?:seal|duck) tour|amphibious boat|duck boat|seal tour|water taxi(?:[- ]style)? sightseeing tour|dinner boat|boat cruise|boat rental|party barge cruise|sandbar cruise|fort lauderdale cruise)\b/;

const LAND_PRIMARY_BOATING_EXCLUSION_PATTERN =
  /\b(?:land[- ]based city tour|private city tour|city tour|road trip|day trip|national park day trip|gocar|go car|limo ride|shopping cart limo|bike tour|bicycle tour|e[- ]?bike tour|ebike tour|walking tour|bus tour|van tour|suv tour|jeep tour|off[- ]?road tour)\b/;

const BOATING_SOURCE_CATEGORY_PATTERN =
  /\b(?:boat tour|sightseeing boat tour|sightseeing cruise|harbou?r cruise|bay cruise|riverboat(?: sightseeing)? cruise|river cruise|lake cruise|canal cruise|brunch cruise|dinner cruise|holiday cruise|cocoa cruise|pirate (?:boat|cruise)|ferry|ferry tickets|ferry tour|yacht charter|yacht cruise|cruise on yacht|duffy boat|pontoon boat|speedboat|speed boat|jet boat|private boat (?:charter|cruise)|boat with a captain|amphibious seal tour|duck boat|boat rental|fort lauderdale cruise)\b/;

const BICYCLE_RENTAL_ADDON_PATTERN =
  /\b(?:free )?(?:bike|bicycle|e[- ]?bike|ebike) rental\b/;

const STRONG_FISHING_PATTERN =
  /\b(?:fishing charter|deep sea fishing|sportfishing|sport fishing|fly fishing|reef fishing|angling|lake fishing|river fishing|fishing trip|catch(?:ing)? fish)\b/;

const SNORKELING_WATER_SPORTS_PATTERN =
  /\b(?:snorkel|snorkeling|scuba|swim (?:with|among|amongst)(?: [a-z]+){0,4} fish|coral reef snorkeling|reef snorkeling|underwater viewing)\b/;

const FISHING_SLUG: TourActivityCategorySlug = "fishing";
const PADDLE_SPORTS_SLUG: TourActivityCategorySlug = "paddle-sports";
const WATER_SPORTS_SLUG: TourActivityCategorySlug = "water-sports";

const PADDLE_CORE_INTENT_PATTERN =
  /\b(?:kayak|kayaking|canoe|canoeing|paddleboard|stand up paddle|\bsup\b)\b/;

const NON_PADDLE_ALWAYS_EXCLUSION_PATTERN =
  /\b(?:catamaran|dinner boat|dinner cruise|ocean boat|airboat|space center|kennedy|nasa|shelling)\b/;

const NON_PADDLE_BOAT_PRIMARY_PATTERN = /\b(?:boat tour)\b/;

const NEGATED_HIKING_PATTERN = /\b(?:instead of|rather than|without) hiking\b/;

const HORSEBACK_SUPPRESSED_BY_RIDING_INTENT_SLUGS: TourActivityCategorySlug[] =
  [
    HIKING_SLUG,
    WALKING_TOURS_SLUG,
    SIGHTSEEING_SLUG,
    PADDLE_SPORTS_SLUG,
    BOATING_SLUG,
    WATER_SPORTS_SLUG,
  ];

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

const orderPrimaryFirst = (
  slugs: TourActivityCategorySlug[],
  primaryIntentSlugs: TourActivityCategorySlug[] = []
) =>
  [...slugs].sort((a, b) => {
    const primaryA = primaryIntentSlugs.includes(a);
    const primaryB = primaryIntentSlugs.includes(b);

    if (primaryA && !primaryB) return -1;
    if (primaryB && !primaryA) return 1;

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
  const titleIntentText = normalizeTourCategoryText(input.title ?? "");
  const contentIntentText = buildClassifierText({ ...input, categories: [] });
  const primaryIntentText = normalizeTourCategoryText(
    [input.title, ...(input.categories ?? [])].filter(Boolean).join(" ")
  );
  const matched: TourActivityCategorySlug[] = [];
  const primaryIntentMatched: TourActivityCategorySlug[] = [];

  for (const sourceCategory of input.categories ?? []) {
    if (!sourceCategory) continue;
    const mapped = SOURCE_CATEGORY_TO_ACTIVITY[toSimpleSlug(sourceCategory)];
    if (mapped) {
      pushUnique(matched, mapped);
      pushUnique(primaryIntentMatched, mapped);
    }
  }

  for (const categoryPattern of CATEGORY_SIGNAL_PATTERNS) {
    if (categoryPattern.signals.some(signal => signal.test(normalizedText))) {
      pushUnique(matched, categoryPattern.slug);
    }

    if (
      categoryPattern.signals.some(signal => signal.test(primaryIntentText))
    ) {
      pushUnique(primaryIntentMatched, categoryPattern.slug);
    }
  }

  if (
    matched.includes(WALKING_TOURS_SLUG) &&
    WALKING_TOUR_PATTERN.test(normalizedText) &&
    !TRUE_HIKING_PATTERN.test(titleIntentText)
  ) {
    pushUnique(primaryIntentMatched, WALKING_TOURS_SLUG);
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
      slug === CYCLING_SLUG &&
      BICYCLE_RENTAL_ADDON_PATTERN.test(normalizedText) &&
      EXPLICIT_BOATING_VESSEL_PATTERN.test(primaryIntentText)
    ) {
      return false;
    }

    if (
      slug === HORSEBACK_RIDING_SLUG &&
      NON_HORSEBACK_RIDING_PATTERN.test(normalizedText)
    ) {
      return false;
    }

    if (
      slug === HORSEBACK_RIDING_SLUG &&
      EXPLICIT_WATERCRAFT_DOMINANCE_PATTERN.test(titleIntentText) &&
      !HORSEBACK_RIDING_PATTERN.test(titleIntentText)
    ) {
      return false;
    }

    if (
      HORSEBACK_SUPPRESSED_BY_RIDING_INTENT_SLUGS.includes(slug) &&
      HORSEBACK_RIDING_PATTERN.test(titleIntentText) &&
      !NON_HORSEBACK_RIDING_PATTERN.test(normalizedText) &&
      !EXPLICIT_WATERCRAFT_DOMINANCE_PATTERN.test(titleIntentText)
    ) {
      return false;
    }

    if (
      slug === FOOD_WINE_SLUG &&
      WALKING_TOUR_PATTERN.test(primaryIntentText)
    ) {
      return false;
    }

    if (
      slug === FOOD_WINE_SLUG &&
      !FOOD_WINE_ALLOWED_PRIMARY_PATTERN.test(primaryIntentText)
    ) {
      return false;
    }

    if (
      slug === FOOD_WINE_SLUG &&
      NON_FOOD_PRIMARY_INTENT_PATTERN.test(primaryIntentText) &&
      !FOOD_PRIMARY_PATTERN.test(
        input.title ? normalizeTourCategoryText(input.title) : ""
      )
    ) {
      return false;
    }

    if (
      slug === WALKING_TOURS_SLUG &&
      TRUE_HIKING_PATTERN.test(titleIntentText)
    ) {
      return false;
    }

    if (
      slug === WALKING_TOURS_SLUG &&
      HIKING_PRIMARY_EXCLUSION_PATTERN.test(primaryIntentText) &&
      !WALKING_TOUR_PATTERN.test(normalizedText)
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

    if (slug === SAILING_SLUG) {
      if (!EXPLICIT_SAILING_INTENT_PATTERN.test(primaryIntentText)) {
        return false;
      }

      if (NON_SAILING_PRIMARY_PATTERN.test(primaryIntentText)) {
        return false;
      }

      if (
        matched.includes(WILDLIFE_SLUG) &&
        MARINE_WILDLIFE_PRIMARY_PATTERN.test(primaryIntentText)
      ) {
        return false;
      }
    }

    if (
      slug === WILDLIFE_SLUG &&
      AMPHIBIOUS_SEAL_TOUR_PATTERN.test(normalizedText) &&
      !/\b(?:watch|watching|viewing|spotting|wildlife|marine wildlife)\b/.test(
        primaryIntentText
      )
    ) {
      return false;
    }

    if (slug === PADDLE_SPORTS_SLUG) {
      if (NON_PADDLE_ALWAYS_EXCLUSION_PATTERN.test(primaryIntentText)) {
        return false;
      }

      if (
        NON_PADDLE_BOAT_PRIMARY_PATTERN.test(primaryIntentText) &&
        !PADDLE_CORE_INTENT_PATTERN.test(primaryIntentText)
      ) {
        return false;
      }
    }

    if (slug === BOATING_SLUG) {
      const hasPrimaryWildlifeMatch =
        matched.includes(WILDLIFE_SLUG) &&
        (!AMPHIBIOUS_SEAL_TOUR_PATTERN.test(normalizedText) ||
          /\b(?:watch|watching|viewing|spotting|wildlife|marine wildlife)\b/.test(
            primaryIntentText
          ));

      const hasExplicitBoatingIntent =
        EXPLICIT_BOATING_VESSEL_PATTERN.test(primaryIntentText) ||
        BOATING_SOURCE_CATEGORY_PATTERN.test(normalizedText);
      const hasLandBasedPrimary =
        LAND_PRIMARY_BOATING_EXCLUSION_PATTERN.test(primaryIntentText) ||
        matched.includes(JEEP_OFF_ROAD_SLUG) ||
        (matched.includes(CYCLING_SLUG) &&
          !EXPLICIT_BOATING_VESSEL_PATTERN.test(primaryIntentText));
      const hasPrimarySailingMatch =
        matched.includes(SAILING_SLUG) &&
        EXPLICIT_SAILING_INTENT_PATTERN.test(primaryIntentText) &&
        !NON_SAILING_PRIMARY_PATTERN.test(primaryIntentText);

      if (
        !hasExplicitBoatingIntent ||
        hasLandBasedPrimary ||
        hasPrimaryWildlifeMatch ||
        matched.includes(FISHING_SLUG) ||
        hasPrimarySailingMatch ||
        FOOD_PRIMARY_PATTERN.test(primaryIntentText) ||
        (matched.includes(HIKING_SLUG) &&
          TRUE_HIKING_PATTERN.test(primaryIntentText)) ||
        matched.includes(PADDLE_SPORTS_SLUG) ||
        matched.includes(WATER_SPORTS_SLUG)
      ) {
        return false;
      }
    }

    if (
      slug === SIGHTSEEING_SLUG &&
      matched.includes(BOATING_SLUG) &&
      EXPLICIT_BOATING_VESSEL_PATTERN.test(primaryIntentText) &&
      !LAND_PRIMARY_BOATING_EXCLUSION_PATTERN.test(primaryIntentText)
    ) {
      return false;
    }

    if (slug === HIKING_SLUG && NEGATED_HIKING_PATTERN.test(normalizedText)) {
      return false;
    }

    if (slug === HIKING_SLUG && !TRUE_HIKING_PATTERN.test(contentIntentText)) {
      return false;
    }

    if (
      slug === HIKING_SLUG &&
      HIKING_PRIMARY_EXCLUSION_PATTERN.test(primaryIntentText)
    ) {
      return false;
    }

    if (slug === HIKING_SLUG && matched.includes(WALKING_TOURS_SLUG)) {
      return TRUE_HIKING_PATTERN.test(primaryIntentText);
    }

    return true;
  });

  const matchedCategorySlugs = orderPrimaryFirst(
    priorityFilteredMatches,
    primaryIntentMatched
  );
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
