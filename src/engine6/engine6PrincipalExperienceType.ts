/**
 * Canonical principal experience types for Engine6 Paragon hero integrity governance.
 * Future experience types (ATV, zipline, whale watching, etc.) normalize into this
 * taxonomy automatically via pattern matching — no destination-specific rules.
 */

export type Engine6PrincipalExperienceType =
  | "driving-tour"
  | "rafting"
  | "scenic-float"
  | "hiking"
  | "wildlife-tour"
  | "bike-tour"
  | "kayak-rental"
  | "helicopter-tour"
  | "food-wine-cultural-tour"
  | "boat-tour"
  | "atv-tour"
  | "horseback-riding"
  | "zipline"
  | "snowmobile"
  | "hot-air-balloon"
  | "whale-watching"
  | "scuba-diving"
  | "national-park-tour"
  | "neutral-destination"
  | "generic-tour";

export type Engine6ExperienceFamily =
  | "land-vehicle"
  | "water-adventure"
  | "aerial"
  | "foot"
  | "wildlife"
  | "food-culture"
  | "neutral";

const EXPERIENCE_TYPE_ALIASES: Record<string, Engine6PrincipalExperienceType> =
  {
    "driving-tour": "driving-tour",
    "driving-tours": "driving-tour",
    "scenic-drive": "driving-tour",
    "van-tour": "driving-tour",
    "suv-tour": "driving-tour",
    "bus-tour": "driving-tour",
    "private-tour": "national-park-tour",
    "day-tour": "national-park-tour",
    rafting: "rafting",
    "white-water-rafting": "rafting",
    "whitewater-rafting": "rafting",
    "scenic-float": "scenic-float",
    float: "scenic-float",
    "river-float": "scenic-float",
    hiking: "hiking",
    "hiking-tour": "hiking",
    trek: "hiking",
    "wildlife-tour": "wildlife-tour",
    wildlife: "wildlife-tour",
    "wildlife-safari": "wildlife-tour",
    "wildlife-watching": "wildlife-tour",
    "bike-tour": "bike-tour",
    "e-bike": "bike-tour",
    ebike: "bike-tour",
    cycling: "bike-tour",
    "kayak-rental": "kayak-rental",
    kayak: "kayak-rental",
    "paddleboard-rental": "kayak-rental",
    sup: "kayak-rental",
    paddle: "kayak-rental",
    "helicopter-tour": "helicopter-tour",
    helicopter: "helicopter-tour",
    "air-tour": "helicopter-tour",
    "food-wine-cultural-tour": "food-wine-cultural-tour",
    "food-tour": "food-wine-cultural-tour",
    "wine-tour": "food-wine-cultural-tour",
    "cultural-tour": "food-wine-cultural-tour",
    "boat-tour": "boat-tour",
    boat: "boat-tour",
    cruise: "boat-tour",
    "atv-tour": "atv-tour",
    atv: "atv-tour",
    "horseback-riding": "horseback-riding",
    horseback: "horseback-riding",
    zipline: "zipline",
    "zip-line": "zipline",
    snowmobile: "snowmobile",
    "hot-air-balloon": "hot-air-balloon",
    balloon: "hot-air-balloon",
    "whale-watching": "whale-watching",
    "scuba-diving": "scuba-diving",
    scuba: "scuba-diving",
    "national-park-tour": "national-park-tour",
    "park-tour": "national-park-tour",
    "neutral-destination": "neutral-destination",
    "generic-tour": "generic-tour",
  };

const EXPERIENCE_FAMILY: Record<
  Engine6PrincipalExperienceType,
  Engine6ExperienceFamily
> = {
  "driving-tour": "land-vehicle",
  "atv-tour": "land-vehicle",
  snowmobile: "land-vehicle",
  "bike-tour": "land-vehicle",
  "horseback-riding": "land-vehicle",
  rafting: "water-adventure",
  "scenic-float": "water-adventure",
  "kayak-rental": "water-adventure",
  "boat-tour": "water-adventure",
  "scuba-diving": "water-adventure",
  "helicopter-tour": "aerial",
  "hot-air-balloon": "aerial",
  zipline: "aerial",
  hiking: "foot",
  "wildlife-tour": "wildlife",
  "whale-watching": "wildlife",
  "food-wine-cultural-tour": "food-culture",
  "national-park-tour": "land-vehicle",
  "neutral-destination": "neutral",
  "generic-tour": "neutral",
};

const TITLE_INFERENCE_PATTERNS: Array<{
  pattern: RegExp;
  experienceType: Engine6PrincipalExperienceType;
}> = [
  { pattern: /\bwhite[- ]?water|\braft(?:ing|s)?\b/i, experienceType: "rafting" },
  {
    pattern: /\bscenic float|\bfloat trip|\briver float\b/i,
    experienceType: "scenic-float",
  },
  {
    pattern: /\bdriving tour|\bscenic drive|\bvan tour|\bsuv tour|\bred bus\b|\bgoing-to-the-sun road\b/i,
    experienceType: "driving-tour",
  },
  {
    pattern: /\bhike|\bhiking|\btrek\b|\btrail walk\b/i,
    experienceType: "hiking",
  },
  {
    pattern: /\bwildlife|\bbear|\bmoose|\bwolf watch|\bsafari\b/i,
    experienceType: "wildlife-tour",
  },
  {
    pattern: /\be-?bike|\bbike tour|\bcycling\b|\bbicycle\b/i,
    experienceType: "bike-tour",
  },
  {
    pattern: /\bkayak|\bpaddleboard|\bsup rental|\bcanoe\b/i,
    experienceType: "kayak-rental",
  },
  {
    pattern: /\bhelicopter|\bair tour|\bflightseeing\b/i,
    experienceType: "helicopter-tour",
  },
  {
    pattern: /\bfood tour|\bwine tasting|\bcultural tour|\bcraft beer\b/i,
    experienceType: "food-wine-cultural-tour",
  },
  {
    pattern: /\bboat tour|\bcruise|\bferry|\bsail\b/i,
    experienceType: "boat-tour",
  },
  {
    pattern: /\batv|\boff[- ]road|\butv\b/i,
    experienceType: "atv-tour",
  },
  {
    pattern: /\bhorseback|\bhorse ride\b/i,
    experienceType: "horseback-riding",
  },
  { pattern: /\bzipline|\bzip line\b/i, experienceType: "zipline" },
  { pattern: /\bsnowmobile\b/i, experienceType: "snowmobile" },
  {
    pattern: /\bhot air balloon|\bballoon ride\b/i,
    experienceType: "hot-air-balloon",
  },
  {
    pattern: /\bwhale watch|\bwhale watching\b/i,
    experienceType: "whale-watching",
  },
  { pattern: /\bscuba|\bdive tour\b/i, experienceType: "scuba-diving" },
];

const normalizeExperienceTypeKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-");

export const normalizeEngine6PrincipalExperienceType = (
  value: string | null | undefined
): Engine6PrincipalExperienceType => {
  const key = normalizeExperienceTypeKey(value ?? "");
  if (!key) {
    return "generic-tour";
  }

  return EXPERIENCE_TYPE_ALIASES[key] ?? "generic-tour";
};

export const inferEngine6PrincipalExperienceTypeFromProduct = (args: {
  experienceType?: string | null;
  title?: string | null;
  categoryLabel?: string | null;
  categories?: string[];
}): Engine6PrincipalExperienceType => {
  const fromSlot = normalizeEngine6PrincipalExperienceType(
    args.experienceType ?? ""
  );
  if (fromSlot !== "generic-tour" && fromSlot !== "national-park-tour") {
    return fromSlot;
  }

  const identity = [
    args.title ?? "",
    args.categoryLabel ?? "",
    ...(args.categories ?? []),
  ].join(" ");

  for (const { pattern, experienceType } of TITLE_INFERENCE_PATTERNS) {
    if (pattern.test(identity)) {
      return experienceType;
    }
  }

  if (fromSlot !== "generic-tour") {
    return fromSlot;
  }

  if (/\btour\b/i.test(identity)) {
    return "national-park-tour";
  }

  return "generic-tour";
};

export const resolveEngine6ExperienceFamily = (
  experienceType: Engine6PrincipalExperienceType
): Engine6ExperienceFamily => EXPERIENCE_FAMILY[experienceType];

export const areEngine6ExperienceTypesMateriallyCompatible = (args: {
  productExperienceType: Engine6PrincipalExperienceType;
  heroExperienceType: Engine6PrincipalExperienceType;
}): boolean => {
  if (
    args.productExperienceType === args.heroExperienceType ||
    args.heroExperienceType === "neutral-destination" ||
    args.productExperienceType === "neutral-destination"
  ) {
    return true;
  }

  if (
    args.heroExperienceType === "generic-tour" ||
    args.productExperienceType === "generic-tour"
  ) {
    return true;
  }

  const productFamily = resolveEngine6ExperienceFamily(
    args.productExperienceType
  );
  const heroFamily = resolveEngine6ExperienceFamily(args.heroExperienceType);

  if (productFamily === "neutral" || heroFamily === "neutral") {
    return true;
  }

  if (productFamily === heroFamily) {
    return true;
  }

  // National park driving/scenic tours may use neutral destination heroes.
  if (
    args.productExperienceType === "national-park-tour" &&
    args.heroExperienceType === "driving-tour"
  ) {
    return true;
  }

  if (
    args.productExperienceType === "driving-tour" &&
    args.heroExperienceType === "national-park-tour"
  ) {
    return true;
  }

  return false;
};

export const describeEngine6ExperienceTypeMismatch = (args: {
  productExperienceType: Engine6PrincipalExperienceType;
  heroExperienceType: Engine6PrincipalExperienceType;
}) =>
  `hero experience "${args.heroExperienceType}" materially misrepresents product experience "${args.productExperienceType}"`;
