import { getGuideCountries } from "../../data/guideData";

export type InternationalCountryGuide = {
  name: string;
  slug: string;
  cityCount: number;
  tourCount?: number;
};

export const getInternationalCountries = (): InternationalCountryGuide[] =>
  getGuideCountries()
    .filter(country => country.cities.length > 0)
    .map(country => ({
      name: country.name,
      slug: country.slug,
      cityCount: country.cities.length,
      tourCount: country.tourCount,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
