import { buildCountryGuide } from "../../data/guideData";
import { getGuideStates } from "./guideRegistry";
import { hasUsGuide } from "./guideIndex";

export type ResolvedUsGuideHref = {
  href: string;
  hasCityGuide: boolean;
  stateSlug: string;
  citySlug: string;
};

const buildUsStateGuideHref = (stateSlug: string) => `/guides/us/${stateSlug}`;

const buildUsCityGuideHref = (stateSlug: string, citySlug: string) =>
  `${buildUsStateGuideHref(stateSlug)}/${citySlug}`;

export const hasUsStateGuide = (stateSlug: string): boolean =>
  getGuideStates().includes(stateSlug);

export const resolveUsGuideHref = (
  stateSlug: string,
  citySlug: string
): ResolvedUsGuideHref => {
  const hasCityGuide = hasUsGuide(stateSlug, citySlug);

  return {
    href: hasCityGuide
      ? buildUsCityGuideHref(stateSlug, citySlug)
      : buildUsStateGuideHref(stateSlug),
    hasCityGuide,
    stateSlug,
    citySlug,
  };
};

export const resolveMissingUsCityGuideRedirect = (
  stateSlug: string,
  citySlug: string
): string | null => {
  if (hasUsGuide(stateSlug, citySlug)) {
    return null;
  }

  if (!hasUsStateGuide(stateSlug)) {
    return null;
  }

  return buildUsStateGuideHref(stateSlug);
};

export type ResolvedInternationalGuideHref = {
  href: string;
  countryHref: string;
  hasCityGuide: boolean;
  countrySlug: string;
  citySlug: string;
};

const buildInternationalCountryGuideHref = (countrySlug: string) =>
  `/guides/world/${countrySlug}`;

const buildInternationalCityGuideHref = (
  countrySlug: string,
  citySlug: string
) => `${buildInternationalCountryGuideHref(countrySlug)}/${citySlug}`;

export const hasInternationalCountryGuide = (countrySlug: string): boolean =>
  Boolean(buildCountryGuide(countrySlug));

const RETAINED_INTERNATIONAL_CITY_GUIDES = new Set(["france/paris"]);

export const hasInternationalCityGuide = (
  countrySlug: string,
  citySlug: string
): boolean =>
  RETAINED_INTERNATIONAL_CITY_GUIDES.has(`${countrySlug}/${citySlug}`);

export const resolveInternationalGuideHref = (
  countrySlug: string,
  citySlug: string
): ResolvedInternationalGuideHref => {
  const countryHref = buildInternationalCountryGuideHref(countrySlug);
  const hasCityGuide = hasInternationalCityGuide(countrySlug, citySlug);

  return {
    href: hasCityGuide
      ? buildInternationalCityGuideHref(countrySlug, citySlug)
      : countryHref,
    countryHref,
    hasCityGuide,
    countrySlug,
    citySlug,
  };
};

export const resolveMissingInternationalCityGuideRedirect = (
  countrySlug: string,
  citySlug: string
): string | null => {
  if (hasInternationalCityGuide(countrySlug, citySlug)) {
    return null;
  }

  if (!hasInternationalCountryGuide(countrySlug)) {
    return null;
  }

  return buildInternationalCountryGuideHref(countrySlug);
};
