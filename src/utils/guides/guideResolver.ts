import { getGuideStates } from "./guideRegistry";
import { hasUsGuide } from "./guideIndex";
import { resolveInternationalGuideBreadcrumb } from "./internationalGuideBreadcrumbs";
import { isUsDestinationSlug } from "../tours/tourNavigation";

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
  const normalizedCountrySlug = (countrySlug ?? normalizedStateSlug)
    .trim()
    .toLowerCase();

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
