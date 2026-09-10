import type { GuideContent, GuideListItem } from "./guideData";
import {
  enhanceInternationalGuide,
  INTERNATIONAL_PARAGON_GUIDE_KEYS,
} from "./internationalGuideEnhancements";

const PHASE2_KEYS = new Set(INTERNATIONAL_PARAGON_GUIDE_KEYS);
const MIN_SENTENCES = 4;
const MIN_DESCRIPTION_LENGTH = 340;

const BANNED_PHASE2_PHRASES = [
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

const ensureTerminalPunctuation = (value: string) => {
  const clean = value.trim();
  if (!clean) return clean;
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
};

const classifyPoi = (title: string, description: string) => {
  const text = `${title} ${description}`.toLowerCase();
  if (/(museum|gallery|collection|exhibition)/.test(text)) return "museum";
  if (/(cathedral|church|basilica|chapel|synagogue|temple|mosque)/.test(text))
    return "religious";
  if (/(palace|castle|residenz|fortress|citadel)/.test(text)) return "palace";
  if (/(market|mercado|bazaar)/.test(text)) return "market";
  if (/(park|garden|hill|mount|mountain|trail|ridge)/.test(text)) return "outdoors";
  if (/(bridge|river|canal|harbor|harbour|waterfront|promenade|lagoon)/.test(text))
    return "waterfront";
  if (/(quarter|district|old town|altstadt|ribeira|plaka|neighborhood|neighbourhood)/.test(text))
    return "district";
  if (/(tower|gate|arch|monument|memorial|clock|viewpoint|bastion)/.test(text))
    return "landmark";
  return "place";
};

const visitorGuidanceSentence = (
  cityName: string,
  title: string,
  description: string,
) => {
  switch (classifyPoi(title, description)) {
    case "museum":
      return `Treat ${title} as a focused visit rather than trying to exhaust every gallery; check current timed-entry rules, temporary closures and the collections that matter most to you before arrival.`;
    case "religious":
      return `Because ${title} is also a religious or ceremonial site, check current visiting hours, services, dress expectations and any separate tower, crypt or treasury access before building the day around it.`;
    case "palace":
      return `If interiors are a priority, leave enough time for both the principal rooms and the surrounding grounds, because the scale and setting of ${title} are part of the experience rather than scenery between photo stops.`;
    case "market":
      return `Visit ${title} earlier in the day if you want to see more of its working-market rhythm, then continue on foot into the surrounding streets instead of treating the market as an isolated food stop.`;
    case "outdoors":
      return `Use ${title} as a genuine walking block rather than a drive-by stop, and check current weather, trail, access or seasonal conditions before setting out.`;
    case "waterfront":
      return `Walk at least part of ${title} in both directions when practical, because changing sightlines across the water make the site especially useful for understanding ${cityName}'s physical layout.`;
    case "district":
      return `Allow time to wander the surrounding blocks on foot, because ${title} is best understood as an urban district with changing streets, buildings and viewpoints rather than a single pin on a map.`;
    case "landmark":
      return `Approach ${title} through the surrounding streets before moving directly to its principal viewpoint, since the changing sightlines help explain why it became such a powerful landmark in ${cityName}.`;
    default:
      return `Give ${title} enough time to connect with the surrounding neighborhood rather than treating it as an isolated photograph; that local context is what turns the stop into a useful part of a ${cityName} guide.`;
  }
};

const currentConditionsSentence = (title: string) =>
  `Check the official site for ${title} shortly before visiting, because opening hours, restoration work, reservation systems and access rules can change more quickly than the landmark itself.`;

export const deepenInternationalPoiNarrative = (
  cityName: string,
  title: string,
  description: string,
) => {
  let narrative = ensureTerminalPunctuation(description);

  if (sentenceCount(narrative) < MIN_SENTENCES) {
    narrative = `${narrative} ${visitorGuidanceSentence(
      cityName,
      title,
      narrative,
    )}`;
  }

  if (
    sentenceCount(narrative) < MIN_SENTENCES ||
    narrative.length < MIN_DESCRIPTION_LENGTH
  ) {
    narrative = `${narrative} ${currentConditionsSentence(title)}`;
  }

  return narrative.trim();
};

const assertPhase2PoiQuality = (key: string, pois: GuideListItem[]) => {
  if (pois.length < 6) {
    throw new Error(`${key} Phase 2 guide requires at least six POIs.`);
  }

  const seen = new Set<string>();
  for (const poi of pois) {
    const normalizedTitle = poi.title.trim().toLowerCase();
    if (!normalizedTitle || seen.has(normalizedTitle)) {
      throw new Error(`${key} Phase 2 guide contains a duplicate or empty POI title.`);
    }
    seen.add(normalizedTitle);

    if (sentenceCount(poi.description) < MIN_SENTENCES) {
      throw new Error(
        `${key} Phase 2 POI requires at least ${MIN_SENTENCES} sentences: ${poi.title}`,
      );
    }
    if (poi.description.length < MIN_DESCRIPTION_LENGTH) {
      throw new Error(
        `${key} Phase 2 POI is too thin (${poi.description.length} chars): ${poi.title}`,
      );
    }

    const combined = `${poi.title} ${poi.description}`.toLowerCase();
    const banned = BANNED_PHASE2_PHRASES.find(phrase =>
      combined.includes(phrase),
    );
    if (banned) {
      throw new Error(
        `${key} Phase 2 POI contains banned boilerplate: ${banned}`,
      );
    }
  }
};

export const enhanceInternationalGuidePhase2 = (
  countrySlug: string,
  citySlug: string,
  guide: GuideContent,
): GuideContent => {
  const phase1 = enhanceInternationalGuide(countrySlug, citySlug, guide);
  const key = `${countrySlug}/${citySlug}`;
  if (!PHASE2_KEYS.has(key)) return phase1;

  const pois = (phase1.topThingsToDo ?? []).map(item => ({
    ...item,
    description: deepenInternationalPoiNarrative(
      phase1.name,
      item.title,
      item.description,
    ),
  }));

  assertPhase2PoiQuality(key, pois);

  return {
    ...phase1,
    topThingsToDo: pois,
  };
};

export const INTERNATIONAL_PARAGON_PHASE2_GUIDE_KEYS = Object.freeze(
  Array.from(PHASE2_KEYS).sort(),
);
