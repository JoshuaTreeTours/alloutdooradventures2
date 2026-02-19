import type { GuidePageData } from "../loadGuide";
import { loadUsCityGuide } from "../loadGuide";
import { slugify } from "../slugify";

type ThingFact = {
  label: string;
  value: string;
};

export type ResolvedThingPage = {
  countrySlug: string;
  regionSlug: string;
  citySlug: string;
  thingSlug: string;
  thing: GuidePageData["thingsToDo"][number];
  guide: GuidePageData;
  sourceUrl?: string;
  paragraphs: string[];
  facts: ThingFact[];
};

export const buildThingToDoPath = ({
  countrySlug,
  regionSlug,
  citySlug,
  thingTitle,
}: {
  countrySlug: string;
  regionSlug: string;
  citySlug: string;
  thingTitle: string;
}) => `/guides/${countrySlug}/${regionSlug}/${citySlug}/${slugify(thingTitle)}`;

const splitDescriptionIntoParagraphs = (description: string) => {
  const normalized = description.trim();
  if (!normalized) {
    return [];
  }

  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

  if (sentences.length <= 2) {
    return [normalized];
  }

  const midpoint = Math.ceil(sentences.length / 2);
  return [
    sentences.slice(0, midpoint).join(" "),
    sentences.slice(midpoint).join(" "),
  ];
};

const extractFacts = ({
  description,
  city,
  state,
}: {
  description: string;
  city?: string;
  state: string;
}) => {
  const facts: ThingFact[] = [];

  const year = description.match(/\b(1[6-9]\d{2}|20\d{2})\b/)?.[1];
  if (year) {
    facts.push({ label: "Year", value: year });
  }

  const size = description.match(
    /\b\d[\d,.]*(?:\.\d+)?\s*(?:acres?|miles?|mi|km|square miles?)\b/i
  )?.[0];
  if (size) {
    facts.push({ label: "Size", value: size });
  }

  if (city || state) {
    facts.push({
      label: "Location",
      value: city ? `${city}, ${state}` : state,
    });
  }

  return facts;
};

export const resolveThingPage = ({
  countrySlug,
  regionSlug,
  citySlug,
  thingSlug,
}: {
  countrySlug: string;
  regionSlug: string;
  citySlug: string;
  thingSlug: string;
}): ResolvedThingPage | undefined => {
  if (countrySlug !== "us") {
    return undefined;
  }

  const guide = loadUsCityGuide(regionSlug, citySlug);
  if (!guide) {
    return undefined;
  }

  const thing = guide.thingsToDo.find(
    item => slugify(item.title) === thingSlug
  );

  if (!thing) {
    return undefined;
  }

  const sourceUrl = thing.sourceUrl ?? thing.source_url ?? thing.wikiUrl;

  return {
    countrySlug,
    regionSlug,
    citySlug,
    thingSlug,
    thing,
    guide,
    sourceUrl,
    paragraphs: splitDescriptionIntoParagraphs(thing.description),
    facts: extractFacts({
      description: thing.description,
      city: guide.city,
      state: guide.state,
    }),
  };
};
