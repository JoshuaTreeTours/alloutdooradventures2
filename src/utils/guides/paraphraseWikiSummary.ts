import { extractFactSignals } from "./validateWikiSpecificity";

const splitSentences = (text: string) =>
  text
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

const toSentence = (text: string) => text.replace(/[.!?]*$/, "").trim() + ".";
const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

const compress = (text: string, maxWords: number) => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(" ").replace(/[,:;\-]+$/g, "")}.`;
};

const stripLeadingName = (sentence: string, landmarkName: string) =>
  sentence.replace(new RegExp(`^${landmarkName}\\s+(is|was)\\s+`, "i"), "");

export function paraphraseWikiSummary(args: {
  extract: string;
  landmarkName: string;
  cityName: string;
  stateName?: string;
  tier: "tier1" | "tier2";
}): { text: string; sentenceCount: number; wordCount: number; factSignals: string[] } {
  const { extract, landmarkName, cityName, stateName, tier } = args;
  const source = splitSentences(extract);
  const location = stateName ? `${cityName}, ${stateName}` : cityName;

  const s1 = toSentence(
    `${landmarkName} is ${stripLeadingName(source[0] ?? "a notable site", landmarkName)}`
  );
  const s2 = toSentence(
    `It is located in ${location}${source[1] ? `, where ${source[1].replace(/[.!?]*$/, "")}` : ""}`
  );

  if (tier === "tier2") {
    const detail = source[2] ? toSentence(source[2]) : "";
    const joined = compress([s1, s2, detail].filter(Boolean).join(" "), 90);
    return {
      text: joined,
      sentenceCount: splitSentences(joined).length,
      wordCount: wordCount(joined),
      factSignals: extractFactSignals(extract),
    };
  }

  const detailSentences = source.slice(2, 5).map(toSentence);
  while (detailSentences.length < 3) {
    detailSentences.push(
      toSentence(`${landmarkName} includes features that are documented in its public history and layout`)
    );
  }

  const s6 = toSentence(
    source[5]
      ? `${source[5].replace(/^It\s+/i, "Visitors can ")}`
      : `Visitors can observe how ${landmarkName} functions within ${cityName}'s daily civic and cultural activity`
  );

  const final = [s1, s2, ...detailSentences.slice(0, 3), s6].join(" ");

  return {
    text: final,
    sentenceCount: splitSentences(final).length,
    wordCount: wordCount(final),
    factSignals: extractFactSignals(extract),
  };
}
