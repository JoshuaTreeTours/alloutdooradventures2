export const GUIDE_CITY_ALLOWLIST_US: Record<string, string[] | "ALL"> = {
  hawaii: "ALL",
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
    "naples",
    "key-west",
    "key-largo",
    "islamorada",
    "st-augustine",
    "sarasota",
    "clearwater",
    "destin",
    "panama-city-beach",
    "fort-lauderdale",
    "daytona-beach",
  ],
  connecticut: ["new-london", "east-lyme", "essex"],
  georgia: ["savannah", "atlanta", "helen", "tybee-island", "augusta"],
  louisiana: ["new-orleans", "baton-rouge", "lafayette"],
  maryland: ["baltimore", "ocean-city"],
  massachusetts: [
    "boston",
    "cambridge",
    "salem",
    "nantucket",
    "oak-bluffs",
    "falmouth",
  ],
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

export const isGuideCityAllowedUS = (
  stateSlug: string,
  citySlug: string
): boolean => {
  const stateAllowlist = GUIDE_CITY_ALLOWLIST_US[stateSlug];

  if (!stateAllowlist || stateAllowlist === "ALL") {
    return true;
  }

  return stateAllowlist.includes(citySlug);
};
