export const CITY_TIER1_SLUGS = [
  "san-diego",
  "san-francisco",
  "seattle",
  "portland",
  "new-york",
  "boston",
  "washington",
];

const tier1Set = new Set(CITY_TIER1_SLUGS);

export const isTier1City = (citySlug: string) => tier1Set.has(citySlug);
