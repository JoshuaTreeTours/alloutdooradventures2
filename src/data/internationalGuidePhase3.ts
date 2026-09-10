import type { GuideContent, GuideListItem } from "./guideData";
import { getCanonicalDestinationCitySlug } from "./destinationAliases";
import {
  deepenInternationalPoiNarrative,
  enhanceInternationalGuidePhase2,
  INTERNATIONAL_PARAGON_PHASE2_GUIDE_KEYS,
} from "./internationalGuidePhase2";
import { ASIA_PACIFIC_PHASE3_PROFILES } from "./internationalGuidePhase3/asiaPacific";
import { AUSTRALIA_PHASE3_PROFILES } from "./internationalGuidePhase3/australia";
import { CANADA_PHASE3_PROFILES } from "./internationalGuidePhase3/canada";
import { EUROPE_CENTRAL_PHASE3_PROFILES } from "./internationalGuidePhase3/europeCentral";
import { EUROPE_ITALY_PHASE3_PROFILES } from "./internationalGuidePhase3/europeItaly";
import { EUROPE_NORDIC_UK_PHASE3_PROFILES } from "./internationalGuidePhase3/europeNordicUk";
import { EUROPE_SPAIN_MAJOR_PHASE3_PROFILES } from "./internationalGuidePhase3/europeSpainMajor";
import { EUROPE_SPAIN_REGIONAL_PHASE3_PROFILES } from "./internationalGuidePhase3/europeSpainRegional";
import { LATIN_AMERICA_PHASE3_PROFILES } from "./internationalGuidePhase3/latinAmerica";
import type { InternationalGuidePhase3Profile } from "./internationalGuidePhase3/types";

const profiles: Record<string, InternationalGuidePhase3Profile> = {
  ...ASIA_PACIFIC_PHASE3_PROFILES,
  ...AUSTRALIA_PHASE3_PROFILES,
  ...CANADA_PHASE3_PROFILES,
  ...EUROPE_CENTRAL_PHASE3_PROFILES,
  ...EUROPE_ITALY_PHASE3_PROFILES,
  ...EUROPE_NORDIC_UK_PHASE3_PROFILES,
  ...EUROPE_SPAIN_MAJOR_PHASE3_PROFILES,
  ...EUROPE_SPAIN_REGIONAL_PHASE3_PROFILES,
  ...LATIN_AMERICA_PHASE3_PROFILES,
};

const MIN_SEED_SENTENCES = 2;
const MIN_SEED_DESCRIPTION_LENGTH = 150;
const MIN_FINAL_SENTENCES = 4;
const MIN_FINAL_DESCRIPTION_LENGTH = 340;

const BANNED_PHASE3_PHRASES = [
  "quick way to add variety",
  "easy change of scenery",
  "recognized destination connected to tours",
  "build this stop into the day",
  "generic checklist item",
  "practical stop for understanding",
  "regional park and preserve trails",
  "spend time here for views, short walks, and context",
  "works well as an orientation stop before exploring",
];

const sentenceCount = (value: string) =>
  (value.match(/[.!?](?:\s|$)/g) ?? []).length;

const assertSeedQuality = (
  key: string,
  profile: InternationalGuidePhase3Profile,
) => {
  if (sentenceCount(profile.overview) < 2) {
    throw new Error(`${key} Phase 3 guide overview is too thin.`);
  }
  if (profile.pois.length < 6) {
    throw new Error(`${key} Phase 3 guide requires at least six asserted POIs.`);
  }

  const seen = new Set<string>();
  for (const poi of profile.pois) {
    const normalized = poi.title.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) {
      throw new Error(`${key} Phase 3 guide contains a duplicate or empty POI title.`);
    }
    seen.add(normalized);

    if (
      sentenceCount(poi.description) < MIN_SEED_SENTENCES ||
      poi.description.length < MIN_SEED_DESCRIPTION_LENGTH
    ) {
      throw new Error(`${key} Phase 3 guide POI seed is too thin: ${poi.title}`);
    }

    const combined = `${poi.title} ${poi.description}`.toLowerCase();
    const banned = BANNED_PHASE3_PHRASES.find(phrase =>
      combined.includes(phrase),
    );
    if (banned) {
      throw new Error(`${key} Phase 3 guide contains banned boilerplate: ${banned}`);
    }
  }
};

const assertFinalPoiQuality = (key: string, pois: GuideListItem[]) => {
  for (const poi of pois) {
    if (
      sentenceCount(poi.description) < MIN_FINAL_SENTENCES ||
      poi.description.length < MIN_FINAL_DESCRIPTION_LENGTH
    ) {
      throw new Error(
        `${key} Phase 3 POI failed final depth requirements: ${poi.title}`,
      );
    }
  }
};

export const getInternationalPhase3ProfileKey = (
  countrySlug: string,
  citySlug: string,
) =>
  `${countrySlug}/${getCanonicalDestinationCitySlug(countrySlug, citySlug)}`;

export const enhanceInternationalGuidePhase3 = (
  countrySlug: string,
  citySlug: string,
  guide: GuideContent,
): GuideContent => {
  const phase2 = enhanceInternationalGuidePhase2(countrySlug, citySlug, guide);
  const key = getInternationalPhase3ProfileKey(countrySlug, citySlug);
  const profile = profiles[key];
  if (!profile) return phase2;

  assertSeedQuality(key, profile);

  const pois = profile.pois.map(poi => ({
    title: poi.title,
    description: deepenInternationalPoiNarrative(
      phase2.name,
      poi.title,
      poi.description,
    ),
  }));

  assertFinalPoiQuality(key, pois);

  return {
    ...phase2,
    intro: profile.overview,
    topThingsToDo: pois,
    thingsToDoSections: [
      {
        title: `Why ${phase2.name} is worth exploring`,
        paragraphs: [profile.context],
      },
      {
        title: `How to plan ${phase2.name}`,
        paragraphs: [profile.planning],
      },
    ],
    bestTimeToVisit: profile.season,
    whatToPack: profile.pack,
  };
};

export const INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS = Object.freeze(
  Object.keys(profiles).sort(),
);

export const INTERNATIONAL_PARAGON_PHASE3_GUIDE_KEYS = Object.freeze(
  Array.from(
    new Set([
      ...INTERNATIONAL_PARAGON_PHASE2_GUIDE_KEYS,
      ...INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS,
    ]),
  ).sort(),
);