import { CITY_TIER1_SLUGS } from "../../data/cityTier1";
import type { GuidePageData } from "../loadGuide";
import { isImageEmbedGuide } from "./isImageEmbedGuide";

export type TopGuideCandidate = Partial<GuidePageData> & {
  tier?: "tier1" | "tier2";
  slug?: string;
  citySlug?: string;
};

export const TOP_50_GUIDE_SLUGS = CITY_TIER1_SLUGS;

const topSlugSet = new Set(TOP_50_GUIDE_SLUGS);

const parseCitySlugFromRoute = (slug?: string) => {
  if (!slug) return "";
  const parts = slug.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
};

export const isTopGuide = (guide: TopGuideCandidate): boolean => {
  if (!guide || typeof guide !== "object") return false;
  if (guide.tier === "tier1") return true;

  const citySlug = (guide.citySlug || parseCitySlugFromRoute(guide.slug)).trim();
  if (citySlug && topSlugSet.has(citySlug)) return true;

  return isImageEmbedGuide(guide as GuidePageData);
};
