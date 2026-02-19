import lasVegasGuide from "../data/guides/us/nevada/las-vegas.json";
import nevadaGuide from "../data/guides/us/nevada/index.json";
import newYorkGuide from "../data/guides/us/new-york/new-york.json";

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

const guideRegistry: Record<string, GuidePageData> = {
  "us/new-york/new-york": newYorkGuide as GuidePageData,
  "us/nevada/las-vegas": lasVegasGuide as GuidePageData,
  "us/nevada/index": nevadaGuide as GuidePageData,
};

export const loadGuide = (key: keyof typeof guideRegistry) =>
  guideRegistry[key];

export const loadUsCityGuide = (stateSlug: string, citySlug: string) =>
  guideRegistry[`us/${stateSlug}/${citySlug}`];

export const loadUsStateGuide = (stateSlug: string) =>
  guideRegistry[`us/${stateSlug}/index`];

export const getGuidePlaceName = (guide: GuidePageData) =>
  guide.city ?? guide.state;

export const getValidSameAsLinks = ({ seoLinks }: GuidePageData) =>
  [seoLinks.wikipedia, seoLinks.officialTourism, seoLinks.reference].filter(
    (url): url is string => Boolean(url && /^https?:\/\//.test(url))
  );
