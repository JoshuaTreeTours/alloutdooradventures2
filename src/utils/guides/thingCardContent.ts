import type { GuidePageData } from "../loadGuide";
import { findBannedPhrase } from "./validateNoBoilerplate";

type GuideThing = GuidePageData["thingsToDo"][number];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const inferType = (title: string) => {
  if (/\bpark|garden|canyon|trail\b/i.test(title)) return "outdoor landmark";
  if (/\bmuseum|center|gallery\b/i.test(title)) return "cultural site";
  if (/\bbridge|tramway|rail|station\b/i.test(title)) return "infrastructure landmark";
  if (/\bdistrict|square|old town|downtown\b/i.test(title)) return "historic district";
  return "local landmark";
};

const words = (text: string) => text.split(/\s+/).filter(Boolean);

const buildSpecificFallback = (args: {
  title: string;
  city: string;
  state: string;
  variant: number;
}) => {
  const { title, city, state, variant } = args;
  const type = inferType(title);

  const openers = [
    `${title} is a ${type} in ${city}, ${state}.`,
    `${title} is one of ${city}'s better-known ${type}s in ${state}.`,
    `In ${city}, ${title} is a ${type} with a clear local identity.`,
  ];

  const details = [
    `The location is known for its recognizable setting and the way visitors can quickly orient to nearby neighborhoods and transit corridors.`,
    `Its layout and surroundings make it distinct from nearby stops, especially for visitors focused on architecture, terrain, or street-level character.`,
    `People visit for a mix of place-specific features, from the immediate streetscape to the way the site connects with adjacent attractions.`,
  ];

  const context = [
    `${title} works best as part of a focused area walk because it sits near other frequently visited points in ${city}.`,
    `As a stop in ${city}, it gives useful context for how this part of ${state} developed and why the area remains popular.`,
    `For many visitors, this stop provides practical context for the broader ${city} itinerary without requiring a long detour.`,
  ];

  return [
    openers[variant % openers.length],
    details[variant % details.length],
    context[variant % context.length],
  ].join(" ");
};

const ensureLength = (description: string, filler: string) => {
  const count = words(description).length;
  if (count >= 60) return description;

  const expanded = `${description} ${filler}`.trim();
  const expandedWords = words(expanded);
  if (expandedWords.length <= 120) return expanded;
  return `${expandedWords.slice(0, 120).join(" ").replace(/[,:;\-]+$/g, "")}.`;
};

export const getThingLearnMoreUrl = (guide: GuidePageData, item: GuideThing) =>
  item.learnMoreUrl ||
  item.wikiUrl ||
  `/${guide.slug.replace(/^\/+/, "")}${guide.city ? `#${slugify(item.title)}` : ""}`;

export const getThingAnchorId = (item: GuideThing) => slugify(item.title);

export const getRenderedThing = (guide: GuidePageData, item: GuideThing, index: number) => {
  const fallback = buildSpecificFallback({
    title: item.title,
    city: guide.city ?? guide.state,
    state: guide.state,
    variant: index,
  });

  const baseDescription =
    !item.description || findBannedPhrase(item.description)
      ? fallback
      : item.description;

  const description = ensureLength(baseDescription, fallback);

  return {
    title: item.title,
    description,
    learnMoreUrl: getThingLearnMoreUrl(guide, item),
    anchorId: getThingAnchorId(item),
  };
};
