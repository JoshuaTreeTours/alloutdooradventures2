type ActivityClassifierInput = {
  title: string;
  description?: string;
  tags?: string[];
};

type ActivityClassification = {
  hasWalkingIntent: boolean;
  hasDisqualifier: boolean;
  isHiking: boolean;
  nonWalkingCategory?: "cycling" | "canoeing" | "day-adventures";
  isFoodOnly: boolean;
  matches: {
    walkingIntent: string[];
    disqualifiers: string[];
    food: string[];
  };
};

const WALKING_INTENT_KEYWORDS = [
  "hike",
  "hiking",
  "trek",
  "trekking",
  "trail",
  "trails",
  "nature walk",
  "walk",
  "walking",
  "walking tour",
  "guided walk",
  "rainforest walk",
  "canyon hike",
  "summit",
  "peak",
  "waterfall hike",
  "national park hike",
  "bushwalk",
  "ramble",
  "stroll",
];

const CYCLING_KEYWORDS = ["bike", "bicycle", "cycling", "e-bike", "ebike"];

const WATER_KEYWORDS = [
  "kayak",
  "canoe",
  "rafting",
  "sup",
  "paddle",
  "boat",
  "cruise",
  "sailing",
  "snorkel",
  "scuba",
  "fishing",
];

const DAY_ADVENTURE_KEYWORDS = [
  "hummer",
  "jeep",
  "atv",
  "buggy",
  "helicopter",
  "segway",
  "motorcycle",
  "horse",
];

const FOOD_KEYWORDS = [
  "food",
  "food tour",
  "food crawl",
  "cocktail",
  "bar crawl",
  "donut",
  "donuts",
  "taco",
  "pizza",
  "brunch",
  "beer",
  "brewery",
  "wine",
  "tasting",
  "lunch",
  "dinner",
];

const HIKING_DISQUALIFY_KEYWORDS = [
  ...CYCLING_KEYWORDS,
  ...WATER_KEYWORDS,
  ...DAY_ADVENTURE_KEYWORDS,
  ...FOOD_KEYWORDS,
];

const normalizeText = (value: string) => value.toLowerCase();

const buildClassifierText = ({ title, description, tags }: ActivityClassifierInput) =>
  normalizeText([title, description, tags?.join(" ")].filter(Boolean).join(" "));

const getMatches = (text: string, keywords: string[]) =>
  keywords.filter((keyword) => text.includes(keyword));

export const classifyActivity = (
  input: ActivityClassifierInput,
): ActivityClassification => {
  const text = buildClassifierText(input);
  const walkingIntentMatches = getMatches(text, WALKING_INTENT_KEYWORDS);
  const disqualifierMatches = getMatches(text, HIKING_DISQUALIFY_KEYWORDS);
  const foodMatches = getMatches(text, FOOD_KEYWORDS);
  const hasWalkingIntent = walkingIntentMatches.length > 0;
  const hasDisqualifier = disqualifierMatches.length > 0;
  const hasCycling = getMatches(text, CYCLING_KEYWORDS).length > 0;
  const hasWater = getMatches(text, WATER_KEYWORDS).length > 0;
  const hasDayAdventure = getMatches(text, DAY_ADVENTURE_KEYWORDS).length > 0;
  const hasFood = foodMatches.length > 0;

  const isHiking = hasWalkingIntent && !hasDisqualifier;
  const nonWalkingCategory = hasCycling
    ? "cycling"
    : hasWater
      ? "canoeing"
      : hasDayAdventure
        ? "day-adventures"
        : "day-adventures";
  const isFoodOnly = hasFood && !hasCycling && !hasWater && !hasDayAdventure;

  return {
    hasWalkingIntent,
    hasDisqualifier,
    isHiking,
    nonWalkingCategory: isHiking ? undefined : nonWalkingCategory,
    isFoodOnly,
    matches: {
      walkingIntent: walkingIntentMatches,
      disqualifiers: disqualifierMatches,
      food: foodMatches,
    },
  };
};
