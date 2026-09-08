import { getGuideStates } from "./guideRegistry";
import { hasUsGuide } from "./guideIndex";
import { resolveInternationalGuideBreadcrumb } from "./internationalGuideBreadcrumbs";
import {
  isKnownInternationalCountrySlug,
  isUsDestinationSlug,
} from "../tours/tourNavigation";
import { slugify } from "../slugify";

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

export type ResolvedDestinationGuideHref = {
  href: string;
  isInternational: boolean;
};

export const resolveDestinationCountrySlug = ({
  stateSlug,
  countrySlug,
  countryName,
}: {
  stateSlug: string;
  countrySlug?: string | null;
  countryName?: string | null;
}): string => {
  const normalizedStateSlug = stateSlug.trim().toLowerCase();
  const explicitCountrySlug = (countrySlug ?? "").trim().toLowerCase();
  const namedCountrySlug = countryName?.trim() ? slugify(countryName) : "";

  // Some legacy international inventory stores a province/region in stateSlug
  // and leaves countrySlug blank. Prefer the actual country name when it maps
  // to a supported international country so Alberta does not become a
  // fictitious /destinations/world/alberta country.
  if (
    namedCountrySlug &&
    isKnownInternationalCountrySlug(namedCountrySlug)
  ) {
    return namedCountrySlug;
  }

  return explicitCountrySlug || normalizedStateSlug;
};

export const resolveDestinationGuideHref = ({
  stateSlug,
  citySlug,
  countrySlug,
  countryName,
  cityName,
}: {
  stateSlug: string;
  citySlug: string;
  countrySlug?: string | null;
  countryName?: string | null;
  cityName?: string | null;
}): ResolvedDestinationGuideHref => {
  const normalizedStateSlug = stateSlug.trim().toLowerCase();
  const normalizedCitySlug = citySlug.trim().toLowerCase();
  const normalizedCountrySlug = resolveDestinationCountrySlug({
    stateSlug,
    countrySlug,
    countryName,
  });

  if (isUsDestinationSlug(normalizedStateSlug)) {
    return {
      href: resolveUsGuideHref(normalizedStateSlug, normalizedCitySlug).href,
      isInternational: false,
    };
  }

  const guideBreadcrumb = resolveInternationalGuideBreadcrumb({
    countrySlug: normalizedCountrySlug,
    citySlug: normalizedCitySlug,
    countryName,
    cityName,
  });

  return {
    href:
      guideBreadcrumb?.url ??
      (normalizedCountrySlug
        ? `/destinations/world/${normalizedCountrySlug}`
        : "/guides/world"),
    isInternational: true,
  };
};
