import { usGuideRegistry } from "./guideRegistry";

export type GuideKey = string;

export const buildUsGuideKey = (
  stateSlug: string,
  citySlug: string
): GuideKey => `us/${stateSlug}/${citySlug}`;

const usGuideIndex = new Set<GuideKey>(
  usGuideRegistry.map(record =>
    buildUsGuideKey(record.stateSlug, record.citySlug)
  )
);

export const loadUsGuideIndex = (): Set<GuideKey> => usGuideIndex;

export const hasUsGuide = (stateSlug: string, citySlug: string): boolean =>
  usGuideIndex.has(buildUsGuideKey(stateSlug, citySlug));
