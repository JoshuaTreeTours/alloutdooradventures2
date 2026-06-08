import type { GuidePageData } from "../loadGuide";
import {
  PROTECTED_US_GUIDE_CITY_SLUGS,
  isProtectedUsCityGuide,
} from "./guideRetentionPolicy";

export const protectedGuideSlugs: Set<string> = PROTECTED_US_GUIDE_CITY_SLUGS;

type GuideLike = {
  tier?: "tier1" | "tier2";
  slug?: string;
  citySlug?: string;
  city?: string;
};

const routeCitySlug = (slug?: string) => {
  if (!slug) return "";
  const parts = slug.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
};

export const isProtectedGuide = (guide: GuideLike): boolean => {
  if (!guide || typeof guide !== "object") return false;

  const citySlug = (guide.citySlug || routeCitySlug(guide.slug)).trim();
  return isProtectedUsCityGuide(citySlug, guide as Partial<GuidePageData>);
};
