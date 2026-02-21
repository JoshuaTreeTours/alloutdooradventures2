import { cleanWikiLanguage } from "../cleanWikiLanguage";
import { getWikipediaSummary } from "../wiki/wikiRest";

export type WikiThingToDo = {
  title: string;
  description: string;
  wikiUrl?: string;
  imageUrl?: string | null;
};

const MIN_WORDS_TARGET = 120;
const MAX_WORDS = 180;
const BANNED_PHRASES = [
  /practical stop/i,
  /orientation point/i,
  /high-impact stop/i,
  /travelers comparing/i,
  /balanced itinerary/i,
  /easy recommendation/i,
];

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

const splitSentences = (text: string) =>
  text
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(line => line.trim())
    .filter(Boolean);

const trimToWordLimit = (text: string, max = MAX_WORDS) => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= max) return text;
  return `${words
    .slice(0, max)
    .join(" ")
    .replace(/[,:;\-]+$/g, "")}.`;
};

const toCanonicalWikiUrl = (title: string, pageUrl?: string) => {
  if (pageUrl?.trim()) return pageUrl.trim();
  const normalized = title.trim().replace(/\s+/g, "_");
  if (!normalized) return undefined;
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(normalized).replace(/%5F/g, "_")}`;
};

const buildDescription = (title: string, city: string, extract: string) => {
  const factualSentences = splitSentences(extract).filter(
    sentence => !BANNED_PHRASES.some(pattern => pattern.test(sentence))
  );

  const lead = `${title} is a notable site in ${city}, with documented significance in local history, geography, or cultural development.`;

  let description = [lead, ...factualSentences.slice(0, 8)]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  description = trimToWordLimit(cleanWikiLanguage(description));

  if (wordCount(description) >= MIN_WORDS_TARGET) {
    return description;
  }

  // For short extracts, keep factual text concise instead of inventing generic filler.
  return description;
};

export const wikiSummaryToThing = async (
  title: string,
  city: string
): Promise<WikiThingToDo | null> => {
  const summary = await getWikipediaSummary(title);
  if (!summary?.extract) return null;

  const resolvedTitle = summary.title?.trim() || title;
  const wikiUrl = toCanonicalWikiUrl(resolvedTitle, summary.pageUrl);
  if (!wikiUrl) return null;

  const description = buildDescription(resolvedTitle, city, summary.extract);
  if (
    !description ||
    BANNED_PHRASES.some(pattern => pattern.test(description))
  ) {
    return null;
  }

  return {
    title: resolvedTitle,
    description,
    wikiUrl,
    imageUrl: summary.imageUrl,
  };
};
