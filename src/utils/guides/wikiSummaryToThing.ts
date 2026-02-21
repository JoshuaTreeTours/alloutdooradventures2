import { getWikipediaSummary } from "../wiki/wikiRest";
import { cleanWikiLanguage } from "../cleanWikiLanguage";

export type WikiThingToDo = {
  title: string;
  description: string;
  wikiUrl?: string;
  imageUrl?: string | null;
};

const MIN_WORDS = 80;
const MAX_WORDS = 150;
const BANNED_PHRASES = [
  /practical stop/i,
  /orientation point/i,
  /high-impact stop/i,
  /travelers comparing/i,
  /balanced itinerary/i,
  /easy recommendation/i,
];

const trimToWordLimit = (text: string, max = MAX_WORDS) => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= max) return text;
  return `${words.slice(0, max).join(" ").replace(/[;,]$/, "")}.`;
};

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

const toCanonicalWikiUrl = (title: string, pageUrl?: string) => {
  if (pageUrl?.trim()) {
    return pageUrl.trim();
  }

  const normalized = title.trim().replace(/\s+/g, "_");
  if (!normalized) {
    return undefined;
  }

  return `https://en.wikipedia.org/wiki/${encodeURIComponent(
    normalized
  ).replace(/%5F/g, "_")}`;
};

const expandWithContext = (title: string, city: string, summary: string) =>
  `${summary} ${title} also helps explain how ${city} developed, because its physical setting and public role connect local history, geography, and community identity across different periods of growth.`;

const paraphraseSummary = (title: string, extract: string, city: string) => {
  const cleanExtract = extract.replace(/\s+/g, " ").trim();
  const sentences = cleanExtract
    .split(/(?<=[.!?])\s+/)
    .map(line => line.trim())
    .filter(Boolean)
    .slice(0, 5)
    .filter(line => !BANNED_PHRASES.some(pattern => pattern.test(line)));

  const lead = `${title} is an important place in ${city}, with clear ties to local history, geography, or cultural life.`;
  let description = [lead, ...sentences].join(" ").trim();

  if (wordCount(description) < MIN_WORDS) {
    description = expandWithContext(title, city, description);
  }

  return trimToWordLimit(description);
};

export const wikiSummaryToThing = async (
  title: string,
  city: string
): Promise<WikiThingToDo | null> => {
  const summary = await getWikipediaSummary(title);
  if (!summary?.extract) return null;

  const wikiUrl = toCanonicalWikiUrl(
    summary.title?.trim() || title,
    summary.pageUrl
  );
  if (!wikiUrl) return null;

  const description = cleanWikiLanguage(
    paraphraseSummary(summary.title?.trim() || title, summary.extract, city)
  );

  return {
    title: summary.title?.trim() || title,
    description: `${description}\n\nSource: ${wikiUrl}`,
    wikiUrl,
    imageUrl: summary.imageUrl,
  };
};
