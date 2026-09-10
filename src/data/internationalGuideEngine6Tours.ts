import { engine6ListingTours } from "../engine6/listing";
import { getInternationalGuideCitySlugGroup } from "./internationalGuideAliases";
import type { Tour } from "./tours.types";

const getEngine6CountrySlugCandidates = (
  countrySlug: string,
  citySlug?: string,
): string[] => {
  if (countrySlug === "united-kingdom") {
    return citySlug === "edinburgh"
      ? ["scotland"]
      : ["united-kingdom", "scotland"];
  }

  return [countrySlug];
};

export const isEngine6GuideTour = (tour: Tour) => tour.engine === "engine6";

export const getInternationalEngine6CityGuideTours = (
  countrySlug: string,
  citySlug: string,
): Tour[] => {
  const countryCandidates = new Set(
    getEngine6CountrySlugCandidates(countrySlug, citySlug),
  );
  const citySlugGroup = new Set(
    getInternationalGuideCitySlugGroup(countrySlug, citySlug),
  );

  return engine6ListingTours.filter(
    tour =>
      isEngine6GuideTour(tour) &&
      countryCandidates.has(tour.destination.stateSlug) &&
      citySlugGroup.has(tour.destination.citySlug),
  );
};

export const getInternationalEngine6CountryGuideTours = (
  countrySlug: string,
): Tour[] => {
  const countryCandidates = new Set(
    getEngine6CountrySlugCandidates(countrySlug),
  );

  return engine6ListingTours.filter(
    tour =>
      isEngine6GuideTour(tour) &&
      countryCandidates.has(tour.destination.stateSlug),
  );
};

export const withEngine6OnlyInternationalCityTopTours = (
  guide: import("./guideData").GuideContent,
  countrySlug: string,
  citySlug: string,
): import("./guideData").GuideContent => {
  const engine6Tours = getInternationalEngine6CityGuideTours(
    countrySlug,
    citySlug,
  );

  return {
    ...guide,
    featuredTours: (engine6Tours.length ? engine6Tours : guide.featuredTours).slice(
      0,
      12,
    ),
  };
};

export const withEngine6OnlyInternationalCountryTopTours = (
  guide: import("./guideData").GuideContent,
  countrySlug: string,
): import("./guideData").GuideContent => {
  const engine6Tours = getInternationalEngine6CountryGuideTours(countrySlug);

  return {
    ...guide,
    featuredTours: (engine6Tours.length ? engine6Tours : guide.featuredTours).slice(
      0,
      12,
    ),
  };
};
