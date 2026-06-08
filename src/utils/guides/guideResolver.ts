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
