import { CITY_TIER1_SLUGS } from "../../data/cityTier1";
import type { GuidePageData } from "../loadGuide";
import { isImageEmbedGuide } from "./isImageEmbedGuide";

export const protectedGuideSlugs: Set<string> = new Set(CITY_TIER1_SLUGS);

type GuideLike = Partial<GuidePageData> & {
  slug?: string;
  citySlug?: string;
  heroImage?: string;
  images?: unknown[];
  gallery?: unknown[];
  imageEmbed?: unknown;
  cardImage?: string;
};

const routeCitySlug = (slug?: string) => {
  if (!slug) return "";
  const parts = slug.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
};

const hasHeroImageSections = (guide: GuideLike) =>
  Boolean(
    (Array.isArray(guide.images) && guide.images.length) ||
      (Array.isArray(guide.gallery) && guide.gallery.length) ||
      guide.imageEmbed ||
      (typeof guide.cardImage === "string" && guide.cardImage.trim())
  );

export const isProtectedGuide = (guide: GuideLike): boolean => {
  if (!guide || typeof guide !== "object") return false;

  if (guide.tier === "tier1") return true;

  const citySlug = (guide.citySlug || routeCitySlug(guide.slug)).trim();
  if (citySlug && protectedGuideSlugs.has(citySlug)) return true;

  if (hasHeroImageSections(guide)) return true;

  return isImageEmbedGuide(guide as GuidePageData);
};
