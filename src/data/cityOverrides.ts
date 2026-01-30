import type { GuideContent } from "./guideData";

export type CityGuideOverride = Partial<GuideContent>;

export const buildCityOverrideRoute = (input: {
  regionType: "state" | "country";
  parentSlug: string;
  citySlug: string;
}) =>
  input.regionType === "state"
    ? `/guides/us/${input.parentSlug}/${input.citySlug}`
    : `/guides/world/${input.parentSlug}/${input.citySlug}`;

export const cityOverrides: Record<string, CityGuideOverride> = {};
