import { buildSeoLinks } from "./buildSeoLinks";
import { buildCityAboutFactGroups } from "./buildCityAboutBlurb";
import { getGuideRecord } from "./guideRegistry";
import { selectCityHeroFromTours } from "./selectCityHeroFromTours";
import type { GuidePageData } from "../loadGuide";

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
    aboutCity: {
      ...guide.aboutCity,
      factGroups: buildCityAboutFactGroups({
        cityName: guide.city,
        stateName: guide.state,
        countryName: guide.country,
        wikiSummaryText: guide.aboutCity?.wikiSummaryText,
        wikiExtractText: guide.aboutCity?.wikiExtractText,
        thingsToDo: guide.thingsToDo,
      }),
    },
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
