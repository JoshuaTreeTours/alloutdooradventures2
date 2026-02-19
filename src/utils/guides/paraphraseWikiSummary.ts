import { extractFactSignals } from "./validateWikiSpecificity";

const splitSentences = (text: string) =>
  text
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const toSentence = (text: string) => `${text.replace(/[.!?]+$/g, "").trim()}.`;

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

const clampWords = (text: string, maxWords: number) => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(" ").replace(/[,:;\-]+$/g, "")}.`;
};

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

  const definition = source[0] ?? `${landmarkName} is a landmark in ${location}`;
  const locationSentence = source[1]
    ? `It is located in ${location}, and ${source[1].replace(/^It\s+(is|was)\s+/i, "").replace(/^it\s+/i, "")}`
    : `It is located in ${location}`;

  if (tier === "tier2") {
    const details = source.slice(2, 4).map(sentence => sentence.replace(/^It\s+/i, "")).join(" ");
    const output = clampWords(
      [
        toSentence(definition.replace(new RegExp(`^${landmarkName}\\s+`, "i"), `${landmarkName} `)),
        toSentence(locationSentence),
        details ? toSentence(details) : "",
      ]
        .filter(Boolean)
        .join(" "),
      110
    );

    return {
      text: output,
      sentenceCount: splitSentences(output).length,
      wordCount: wordCount(output),
      factSignals: extractFactSignals(extract),
    };
  }

  const details = source.slice(2, 6).map(sentence => toSentence(sentence.replace(/^It\s+/i, "")));
  const assembled = [
    toSentence(definition.replace(new RegExp(`^${landmarkName}\\s+`, "i"), `${landmarkName} `)),
    toSentence(locationSentence),
    ...details,
  ];

  const output = clampWords(assembled.join(" "), 150);

  return {
    text: output,
    sentenceCount: splitSentences(output).length,
    wordCount: wordCount(output),
    factSignals: extractFactSignals(extract),
  };
}
