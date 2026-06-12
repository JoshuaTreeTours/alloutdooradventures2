import { getGuideCountries } from "../../data/guideData";
import { isUsCountryAlias } from "./usCountryAliases";

export type InternationalCountryGuide = {
  name: string;
  slug: string;
  cityCount: number;
  tourCount?: number;
};

export const getInternationalCountries = (): InternationalCountryGuide[] =>
  getGuideCountries()
    .filter(
      country => country.cities.length > 0 && !isUsCountryAlias(country.slug)
    )
    .map(country => ({
      name: country.name,
      slug: country.slug,
      cityCount: country.cities.length,
      tourCount: country.tourCount,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
