export const CITY_TIER1_SLUGS = [
  "palm-springs",
  "joshua-tree",
  "santa-barbara",
  "los-angeles",
  "san-diego",
  "san-francisco",
  "newport-beach",
  "laguna-beach",
  "anaheim",
  "long-beach",
  "san-jose",
  "sacramento",
  "seattle",
  "portland",
  "las-vegas",
  "phoenix",
  "denver",
  "chicago",
  "new-york",
  "miami",
  "boston",
  "washington",
  "nashville",
  "orlando",
  "philadelphia",
];

const tier1Set = new Set(CITY_TIER1_SLUGS);

export const isTier1City = (citySlug: string) => tier1Set.has(citySlug);
