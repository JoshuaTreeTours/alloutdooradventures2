import { buildSeoLinks } from "./buildSeoLinks";
import { cleanLandmarkText } from "./cleanLandmarkText";
import { getGuideRecord } from "./guideRegistry";
import { isImageEmbedGuide } from "./isImageEmbedGuide";
import { resolveGuideHeroImage } from "./resolveGuideHeroImage";
import {
  buildCityGuideDisplayTitle,
  buildCityGuideH1,
  buildCityGuideIntroParagraphs,
} from "./cityGuideTitles";
import type { GuidePageData } from "../loadGuide";

const sanitizeWikiTitle = (value: string) =>
  value
    .trim()
    .replace(/^https?:\/\/en\.wikipedia\.org\/wiki\//i, "")
    .replace(/^\/wiki\//i, "")
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_()'\-.,]/g, "");

const resolveWikiUrl = (thing: GuidePageData["thingsToDo"][number]) => {
  if (thing.wikiUrl?.trim()) {
    return thing.wikiUrl.trim();
  }

  const candidate = thing as Record<string, unknown>;
  const rawTitle = [
    candidate.wikiTitle,
    candidate.wikiSlug,
    candidate.wikipediaTitle,
  ].find(value => typeof value === "string" && value.trim().length > 0) as
    | string
    | undefined;

  if (!rawTitle) {
    return undefined;
  }

  const sanitized = sanitizeWikiTitle(rawTitle);
  return sanitized
    ? `https://en.wikipedia.org/wiki/${encodeURIComponent(sanitized).replace(
        /%5F/g,
        "_"
      )}`
    : undefined;
};

export const withResolvedGuideData = (guide: GuidePageData): GuidePageData => {
  const heroSelection = resolveGuideHeroImage(guide);

  const shouldSkipRewrite =
    guide.tier !== "tier2" ||
    isImageEmbedGuide(guide) ||
    heroSelection.source !== "generic";
  const normalizedThings = guide.thingsToDo.map(item => {
    const wikiUrl = resolveWikiUrl(item);
    const description = shouldSkipRewrite
      ? item.description
      : cleanLandmarkText(item.description, {
          landmarkName: item.title,
          city: guide.city,
          state: guide.state,
        });

    return {
      ...item,
      description,
      ...(wikiUrl ? { wikiUrl } : {}),
    };
  });

  return {
    ...guide,
    title: guide.city ? buildCityGuideDisplayTitle(guide.city) : guide.title,
    overview:
      guide.city && guide.overview.length
        ? [
            buildCityGuideIntroParagraphs(guide.city).primary,
            ...guide.overview.slice(1),
          ]
        : guide.overview,
    hero: {
      ...guide.hero,
      image: heroSelection.image,
      alt: heroSelection.alt,
      headline: guide.city ? buildCityGuideH1(guide.city) : guide.hero.headline,
    },
    seoLinks: buildSeoLinks({
      city: guide.city ?? guide.state,
      state: guide.state,
      overrides: guide.seoLinks,
    }),
    thingsToDo: normalizedThings,
  };
};

export const loadUsCityGuide = (stateSlug: string, citySlug: string) => {
  const record = getGuideRecord(stateSlug, citySlug);
  return record ? withResolvedGuideData(record.dataImport) : undefined;
};
