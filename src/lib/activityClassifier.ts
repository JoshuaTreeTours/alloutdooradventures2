type ActivityClassifierInput = {
  title: string;
  description?: string;
  tags?: string[];
};

type ActivityClassification = {
  hasWalkingIntent: boolean;
  hasDisqualifier: boolean;
  isHiking: boolean;
  nonWalkingCategory?: "cycling" | "canoeing" | "day-adventures" | "detours";
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
  "day hike",
  "trek",
  "trail",
  "walk",
  "walking",
  "walking tour",
  "guided walk",
  "guided hike",
  "nature walk",
  "summit",
  "canyon",
  "mountain",
  "ridge",
  "overlook",
];

const CYCLING_KEYWORDS = [
  "bike",
  "biking",
  "cycling",
  "e-bike",
  "ebike",
  "road ride",
  "gravel",
  "mtb",
  "mountain bike",
];

const WATER_KEYWORDS = [
  "canoe",
  "paddling",
  "paddle",
  "river trip",
  "lake paddle",
  "water trail",
  "swamp paddle",
  "bayou paddle",
  "kayak",
  "rafting",
  "raft",
  "float",
  "boat",
  "snorkel",
  "snorkeling",
  "sailing",
  "river cruise",
  "lake cruise",
];

const DAY_ADVENTURE_KEYWORDS = [
  "jeep",
  "off-road",
  "off road",
  "4x4",
  "atv",
  "utv",
  "motorized",
  "helicopter",
  "flight",
  "air tour",
  "airboat",
  "bus",
  "train",
  "rail",
  "safari",
  "snowmobile",
  "sled",
  "tram",
  "gondola",
];

const FOOD_KEYWORDS = [
  "food tour",
  "food crawl",
  "food tasting",
  "tasting",
  "wine",
  "winery",
  "wine tasting",
  "beer",
  "brewery",
  "brewpub",
  "distillery",
  "whiskey",
  "bourbon",
  "tequila",
  "cocktail",
  "bar crawl",
  "donut",
  "taco",
  "dinner",
  "lunch",
  "breakfast",
  "culinary",
  "cuisine",
  "restaurant",
  "cheese",
  "chocolate",
  "coffee",
  "dessert",
  "market",
];

const NON_HIKING_ATTRACTION_KEYWORDS = [
  "art",
  "workshop",
  "class",
  "studio",
  "museum",
  "zoo",
  "aquarium",
  "festival",
  "event",
  "show",
  "concert",
  "attraction",
  "hunt",
  "hunting",
];

const HIKING_DISQUALIFY_KEYWORDS = [
  ...CYCLING_KEYWORDS,
  ...WATER_KEYWORDS,
  ...DAY_ADVENTURE_KEYWORDS,
  ...FOOD_KEYWORDS,
  ...NON_HIKING_ATTRACTION_KEYWORDS,
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
        : "detours";
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
