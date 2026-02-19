const IMPORTANT_DATE_HINT = /\b(century|war|UNESCO|Olympics|founded|established|built in|opened in)\b/i;

const cleanText = (text: string) =>
  text
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\([^)]*\bcitation needed\b[^)]*\)/gi, "")
    .replace(/\s+/g, " ")
    .trim();

const splitSentences = (text: string) =>
  cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const removeNonEssentialDates = (sentence: string) => {
  if (IMPORTANT_DATE_HINT.test(sentence)) {
    return sentence;
  }

  return sentence
    .replace(/\b(1[6-9]\d{2}|20\d{2})\b/g, "")
    .replace(/\s+,/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const clampWordCount = (text: string, minWords: number, maxWords: number) => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return words.length >= minWords ? text : null;
  }

  const trimmed = words.slice(0, maxWords).join(" ").replace(/[,:;\-]+$/g, "");
  return `${trimmed}.`;
};

export const paraphraseWikiSummary = (args: {
  landmarkName: string;
  cityName: string;
  stateName: string;
  extract: string;
  maxWords: number;
  maxSentences: number;
  variant?: number;
}): string => {
  const {
    landmarkName,
    cityName,
    stateName,
    extract,
    maxWords,
    maxSentences,
    variant = 0,
  } = args;
  const source = splitSentences(extract).map(removeNonEssentialDates);

  const sentence1 =
    source[0] ||
    `${landmarkName} is a notable landmark in ${cityName}, ${stateName}, recognized as part of the city's built and cultural environment.`;

  const sentence2Base = source[1]
    ? `It is known for ${source[1].replace(/^[A-Z][^a-z]*/, "").replace(/^it\s+/i, "").replace(/\.$/, "")}.`
    : `It is known for its role in ${cityName}'s local identity, with strong associations to the area's history, architecture, or public life.`;

  const sentence3Base = source[2]
    ? `Visitors experience ${source[2].replace(/^it\s+/i, "").replace(/\.$/, "").toLowerCase()} while exploring the site and surrounding district.`
    : `Visitors experience distinct views, design details, and neighborhood context that make the site a clear reference point within ${cityName}.`;

  const sentence2Alt = sentence2Base.replace("It is known for", "The landmark is noted for");

  const extras = source.slice(3).join(" ");
  const sentence3Alt = extras
    ? `Visitors experience ${extras.replace(/\.$/, "").toLowerCase()} alongside the landmark's main features.`
    : sentence3Base;

  const ordered =
    variant % 2 === 1
      ? [sentence1, sentence3Base, sentence2Alt]
      : [sentence1, variant > 1 ? sentence2Alt : sentence2Base, variant > 1 ? sentence3Alt : sentence3Base];

  const candidate = ordered
    .map(s => s.replace(/\s+/g, " ").trim().replace(/\.*$/, "."))
    .slice(0, Math.max(1, maxSentences))
    .join(" ");

  const minWords = Math.min(60, maxWords);
  const clamped = clampWordCount(candidate, minWords, maxWords);
  if (clamped) {
    return clamped;
  }

  return `${sentence1} ${sentence2Base} ${sentence3Base}`
    .replace(/\s+/g, " ")
    .split(/\s+/)
    .slice(0, maxWords)
    .join(" ")
    .replace(/[,:;\-]+$/g, "")
    .concat(".");
};
