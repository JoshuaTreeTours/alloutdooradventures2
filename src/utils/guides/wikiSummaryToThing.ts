import { getWikipediaSummary } from "../wiki/wikiRest";

export type WikiThingToDo = {
  title: string;
  description: string;
  wikiUrl?: string;
};

const trimToWordRange = (text: string, min = 45, max = 75) => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= max && words.length >= min) return text;
  if (words.length > max)
    return `${words.slice(0, max).join(" ").replace(/[;,]$/, "")}.`;
  return text;
};

const paraphraseSummary = (title: string, extract: string, city: string) => {
  const cleanExtract = extract.replace(/\s+/g, " ").trim();
  const firstSentence = cleanExtract.split(/(?<=[.!?])\s+/)[0] ?? cleanExtract;

  const factual = `${title} is a notable place in or around ${city}. ${firstSentence}`;
  const practical = `Plan time here for walking, photos, and nearby local stops that pair well in the same part of town.`;
  const logistics = `Aim for earlier or late-day visits when possible to get better light and lighter crowds.`;

  return trimToWordRange(`${factual} ${practical} ${logistics}`);
};

export const wikiSummaryToThing = async (
  title: string,
  city: string
): Promise<WikiThingToDo | null> => {
  const summary = await getWikipediaSummary(title);
  if (!summary?.extract) return null;

  return {
    title: summary.title?.trim() || title,
    description: paraphraseSummary(
      summary.title?.trim() || title,
      summary.extract,
      city
    ),
    wikiUrl: summary.pageUrl,
  };
};
