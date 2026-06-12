import { slugify } from "../../data/tourCatalog";

const US_COUNTRY_ALIAS_VALUES = [
  "United States",
  "US",
  "U.S.",
  "USA",
  "usa",
  "united-states",
] as const;

export const US_COUNTRY_ALIAS_SLUGS = new Set(
  US_COUNTRY_ALIAS_VALUES.map(alias => slugify(alias))
);

export const isUsCountryAlias = (value: string | null | undefined) => {
  if (!value) {
    return false;
  }

  return US_COUNTRY_ALIAS_SLUGS.has(slugify(value));
};
