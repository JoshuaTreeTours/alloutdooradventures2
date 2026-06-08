import { getRetainedUsGuideCityKeys } from "./guideRetentionPolicy";

export const GUIDE_CITY_ALLOWLIST_US: Record<string, string[] | "ALL"> = {};

export const isGuideCityBlockedUS = (
  stateSlug: string,
  citySlug: string
): boolean => !getRetainedUsGuideCityKeys().has(`${stateSlug}/${citySlug}`);

export const isGuideCityAllowedUS = (
  stateSlug: string,
  citySlug: string
): boolean => getRetainedUsGuideCityKeys().has(`${stateSlug}/${citySlug}`);
