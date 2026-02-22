export const GUIDE_CITY_ALLOWLIST_US: Record<string, string[] | "ALL"> = {
  hawaii: ["haleiwa", "hanalei", "hilo", "honolulu"],
  tennessee: [
    "nashville",
    "chattanooga",
    "johnson-city",
    "franklin",
    "sevierville",
  ],
  florida: [
    "miami",
    "miami-beach",
    "orlando",
    "tampa",
    "key-west",
    "st-augustine",
    "clearwater",
    "destin",
    "fort-lauderdale",
    "daytona-beach",
  ],
  connecticut: ["new-london", "east-lyme", "essex"],
  georgia: ["savannah", "atlanta", "helen", "tybee-island", "augusta"],
  louisiana: ["new-orleans", "baton-rouge", "lafayette"],
  maryland: ["baltimore", "ocean-city"],
  massachusetts: ["boston", "cambridge", "salem", "nantucket"],
  "new-jersey": ["atlantic-city", "wildwood-crest", "ocean-city"],
  california: [
    "los-angeles",
    "san-diego",
    "san-francisco",
    "santa-barbara",
    "napa",
    "sonoma",
    "palm-springs",
    "laguna-beach",
    "newport-beach",
    "joshua-tree",
  ],
};

const GUIDE_CITY_BLOCKLIST_US: Record<string, string[]> = {
  hawaii: [
    "kahului",
    "kailua-kona",
    "kihei",
    "lahaina",
    "waikoloa-village",
    "wailea-makena",
  ],
  alaska: ["homer", "palmer", "seward"],
  utah: ["bryce-canyon-city", "hurricane", "springdale", "st-george"],
  florida: [
    "clearwater",
    "daytona-beach",
    "destin",
    "islamorada",
    "key-largo",
    "miami-beach",
    "naples",
    "panama-city-beach",
    "sarasota",
    "st-augustine",
  ],
  "new-hampshire": ["freedom", "laconia", "new-castle", "weare", "wolfeboro"],
  "new-mexico": ["abiquiu", "los-ranchos-de-albuquerque", "santa-fe-foothills"],
  "new-york": [
    "catskill",
    "freeport",
    "hancock",
    "ithaca",
    "lansing",
    "montauk",
    "napanach",
    "napanock",
    "queens",
    "staten-island",
    "warwick",
  ],
  "north-carolina": ["black-mountain", "elkin", "ronda"],
  pennsylvania: [
    "airville",
    "hawley",
    "levittown",
    "new-stanton",
    "newville",
    "ohiopyle",
    "wrightsville",
  ],
  "south-carolina": [
    "aiken",
    "bluffton",
    "johns-island",
    "saint-helena-island",
    "winnsboro",
  ],
  vermont: [
    "braintree",
    "bridgewater",
    "charleston",
    "fairlee",
    "hartford",
    "plymouth",
    "royalton",
    "springfield",
    "thetford",
    "waterbury",
    "windsor",
    "woodford",
  ],
  wisconsin: ["darlington", "fish-creek", "sister-bay", "sturgeon-bay"],
};

export const isGuideCityBlockedUS = (
  stateSlug: string,
  citySlug: string
): boolean => Boolean(GUIDE_CITY_BLOCKLIST_US[stateSlug]?.includes(citySlug));

export const isGuideCityAllowedUS = (
  stateSlug: string,
  citySlug: string
): boolean => {
  if (isGuideCityBlockedUS(stateSlug, citySlug)) {
    return false;
  }

  const stateAllowlist = GUIDE_CITY_ALLOWLIST_US[stateSlug];

  if (!stateAllowlist || stateAllowlist === "ALL") {
    return true;
  }

  return stateAllowlist.includes(citySlug);
};
