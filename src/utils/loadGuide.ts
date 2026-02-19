import nevadaGuide from "../data/guides/us/nevada/index.json";
import { loadUsCityGuide as loadUsCityGuideFromRegistry } from "./guides/loadGuide";

export type GuideSeoLinks = {
  wikipedia?: string;
  officialTourism?: string;
  reference?: string;
};

export type GuidePageData = {
  title: string;
  country: string;
  state: string;
  city?: string;
  slug: string;
  hero: {
    image: string;
    alt: string;
    headline: string;
    subheadline: string;
  };
  overview: string[];
  highlights: Array<{ title: string; description: string }>;
  thingsToDo: Array<{ title: string; description: string }>;
  bestTimeToVisit: {
    title: string;
    bullets: string[];
  };
  travelTips: string[];
  tours: {
    stateSlug: string;
    citySlug?: string;
    limit?: number;
    title?: string;
  };
  faq?: Array<{ q: string; a: string }>;
  seoLinks: GuideSeoLinks;
};

export const loadGuide = (key: string) => {
  if (key === "us/nevada/index") {
    return nevadaGuide as GuidePageData;
  }

  const [country, stateSlug, citySlug] = key.split("/");
  if (country !== "us" || !stateSlug || !citySlug) {
    return undefined;
  }

  return loadUsCityGuideFromRegistry(stateSlug, citySlug);
};

export const loadUsCityGuide = (stateSlug: string, citySlug: string) =>
  loadUsCityGuideFromRegistry(stateSlug, citySlug);

export const loadUsStateGuide = (stateSlug: string) =>
  stateSlug === "nevada" ? (nevadaGuide as GuidePageData) : undefined;

export const getGuidePlaceName = (guide: GuidePageData) =>
  guide.city ?? guide.state;

export const getValidSameAsLinks = ({ seoLinks }: GuidePageData) =>
  [seoLinks.wikipedia, seoLinks.officialTourism, seoLinks.reference].filter(
    (url): url is string => Boolean(url && /^https?:\/\//.test(url))
  );
