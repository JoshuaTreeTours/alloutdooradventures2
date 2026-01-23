type ActivityClassifierInput = {
  title: string;
  description?: string;
  tags?: string[];
  explicitCategory?: string;
};

type ActivityClassification = {
  isHiking: boolean;
  nonWalkingCategory?: "cycling" | "canoeing";
  isFoodOnly: boolean;
};

const HIKING_ALLOW_KEYWORDS = [
  "hike",
  "hiking",
  "trek",
  "trail",
  "walking",
  "walk",
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

const CANOEING_KEYWORDS = [
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
];

const HIKING_DISQUALIFY_KEYWORDS = [
  ...CYCLING_KEYWORDS,
  ...CANOEING_KEYWORDS,
];

const NON_WALKING_ACTIVITY_KEYWORDS = [
  ...HIKING_DISQUALIFY_KEYWORDS,
  "horseback",
  "horseback ride",
  "atv",
  "utv",
  "4x4",
  "jeep",
  "off-road",
  "motorized",
  "helicopter",
  "flight",
  "sky",
  "air tour",
  "zipline",
  "climb",
  "climbing",
  "ski",
  "snowmobile",
  "tram",
  "gondola",
  "rail",
  "train",
  "bus",
];

const FOOD_ONLY_KEYWORDS = [
  "food tour",
  "food tasting",
  "tasting",
  "wine",
  "winery",
  "beer",
  "brewery",
  "brewpub",
  "distillery",
  "whiskey",
  "bourbon",
  "tequila",
  "cocktail",
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

const normalizeText = (value: string) => value.toLowerCase();

const buildClassifierText = ({
  title,
  description,
  tags,
  explicitCategory,
}: ActivityClassifierInput) =>
  normalizeText(
    [title, description, tags?.join(" "), explicitCategory].filter(Boolean).join(" "),
  );

const includesAny = (text: string, keywords: string[]) =>
  keywords.some((keyword) => text.includes(keyword));

export const classifyActivity = (
  input: ActivityClassifierInput,
): ActivityClassification => {
  const text = buildClassifierText(input);
  const hasHikingAllow = includesAny(text, HIKING_ALLOW_KEYWORDS);
  const hasCycling = includesAny(text, CYCLING_KEYWORDS);
  const hasCanoeing = includesAny(text, CANOEING_KEYWORDS);
  const hasHikingDisqualifier = includesAny(text, HIKING_DISQUALIFY_KEYWORDS);
  const hasNonWalking = includesAny(text, NON_WALKING_ACTIVITY_KEYWORDS);
  const hasFood = includesAny(text, FOOD_ONLY_KEYWORDS);

  const isHiking = hasHikingAllow && !hasHikingDisqualifier;
  const nonWalkingCategory = hasCycling
    ? "cycling"
    : hasCanoeing
      ? "canoeing"
      : undefined;
  const isFoodOnly = hasFood && !(hasHikingAllow || hasNonWalking);

  return {
    isHiking,
    nonWalkingCategory,
    isFoodOnly,
  };
};
