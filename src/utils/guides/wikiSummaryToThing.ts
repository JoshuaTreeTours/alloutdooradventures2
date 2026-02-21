import { getWikipediaSummary } from "../wiki/wikiRest";
import { cleanWikiLanguage } from "../cleanWikiLanguage";
import { cleanThingDescription } from "./cleanThingDescription";

export type WikiThingToDo = {
  title: string;
  description: string;
  wikiUrl?: string;
  imageUrl?: string | null;
};

const trimToWordRange = (text: string, min = 45, max = 75) => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= max && words.length >= min) return text;
  if (words.length > max)
    return `${words.slice(0, max).join(" ").replace(/[;,]$/, "")}.`;
  return text;
};

const toCanonicalWikiUrl = (title: string, pageUrl?: string) => {
  if (pageUrl?.trim()) {
    return pageUrl.trim();
  }

  const normalized = title.trim().replace(/\s+/g, "_");
  if (!normalized) {
    return undefined;
  }

  return `https://en.wikipedia.org/wiki/${encodeURIComponent(normalized).replace(
    /%5F/g,
    "_"
  )}`;
};

const paraphraseSummary = (title: string, extract: string, city: string) => {
  const cleanExtract = extract.replace(/\s+/g, " ").trim();
  const sentences = cleanExtract.split(/(?<=[.!?])\s+/).filter(Boolean);
  const firstSentence = sentences[0] ?? cleanExtract;
  const secondSentence = sentences[1] ?? "";

  const lead = `${title} is a landmark in or near ${city}.`;
  const knownFor = firstSentence;
  const concrete = secondSentence;

  return trimToWordRange([lead, knownFor, concrete].filter(Boolean).join(" "));
};

export const wikiSummaryToThing = async (
  title: string,
  city: string
): Promise<WikiThingToDo | null> => {
  const summary = await getWikipediaSummary(title);
  if (!summary?.extract) return null;

  return {
    title: summary.title?.trim() || title,
    description: cleanThingDescription(
      cleanWikiLanguage(
        paraphraseSummary(summary.title?.trim() || title, summary.extract, city)
      )
    ),
    wikiUrl: toCanonicalWikiUrl(summary.title?.trim() || title, summary.pageUrl),
    imageUrl: summary.imageUrl,
  };
};
