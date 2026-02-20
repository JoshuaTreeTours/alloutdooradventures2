import { buildSeoLinks } from "./buildSeoLinks";
import { buildCityAboutSection } from "./buildCityAboutSection";
import { getGuideRecord } from "./guideRegistry";
import { selectCityHeroFromTours } from "./selectCityHeroFromTours";
import {
  hasBlockedPhrases,
  hasRepeatedSentencesAcrossSections,
} from "./validateNoBoilerplate";
import type { GuidePageData } from "../loadGuide";

const isDev = import.meta.env.DEV;

const buildResolvedAboutCity = (guide: GuidePageData) => {
  if (!guide.city) return guide.aboutCity;
  if (
    !guide.wikiSummaryText &&
    !guide.wikiExtractText &&
    guide.aboutCity?.sections?.length
  ) {
    return guide.aboutCity;
  }

  const generated = buildCityAboutSection({
    cityName: guide.city,
    stateName: guide.state,
    countryName: guide.country,
    wikiSummaryText: guide.wikiSummaryText,
    wikiExtractText: guide.wikiExtractText,
  });

  const sections = [
    { heading: "Overview" as const, paragraphs: [generated.overview] },
    {
      heading: "Geography & setting" as const,
      paragraphs: [generated.geography],
    },
    { heading: "History (brief)" as const, paragraphs: [generated.history] },
    { heading: "Culture & identity" as const, paragraphs: [generated.culture] },
    {
      heading: "Outdoor / natural context" as const,
      paragraphs: [generated.outdoors],
    },
  ];

  if (isDev) {
    const sectionBodies = sections.map(section => section.paragraphs.join(" "));
    if (sectionBodies.some(hasBlockedPhrases)) {
      console.warn(
        `[guide/about] blocked phrase detected for ${guide.state}/${guide.city}`
      );
    }
    if (hasRepeatedSentencesAcrossSections(sectionBodies)) {
      console.warn(
        `[guide/about] repeated sentences detected for ${guide.state}/${guide.city}`
      );
    }
  }

  return {
    sourceUrl: guide.aboutCity?.sourceUrl,
    sections,
  };
};

const withResolvedGuideData = (guide: GuidePageData): GuidePageData => {
  const heroSelection = guide.city
    ? selectCityHeroFromTours(
        guide.tours.stateSlug,
        guide.tours.citySlug ?? "",
        guide.city,
        guide.state
      )
    : null;

  return {
    ...guide,
    aboutCity: buildResolvedAboutCity(guide),
    hero: {
      ...guide.hero,
      image: heroSelection?.imageUrl ?? guide.hero.image,
      alt: heroSelection?.alt ?? guide.hero.alt,
    },
    seoLinks: buildSeoLinks({
      city: guide.city ?? guide.state,
      state: guide.state,
      overrides: guide.seoLinks,
    }),
  };
};

export const loadUsCityGuide = (stateSlug: string, citySlug: string) => {
  const record = getGuideRecord(stateSlug, citySlug);
  return record ? withResolvedGuideData(record.dataImport) : undefined;
};
