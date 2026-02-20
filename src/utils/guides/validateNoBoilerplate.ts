import { CITY_ABOUT_BLOCKED_PATTERNS } from "./buildCityAboutSection";

const BLACKLIST = [
  /one of the most valuable things to do/i,
  /balanced itinerary/i,
  /travelers comparing attractions/i,
  /easy recommendation/i,
  /plan for 60 to 150 minutes/i,
  /you should/i,
  /pair this with nearby dining/i,
  /established network of cultural and public places/i,
  /identifiable physical features/i,
  /city-level events across the year/i,
  /civic references/i,
  /clear sense of place/i,
  ...CITY_ABOUT_BLOCKED_PATTERNS,
];

const normalizeSentence = (sentence: string) =>
  sentence
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const sentenceSplit = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const similarity = (a: string, b: string) => {
  const aTokens = new Set(
    normalizeSentence(a)
      .split(" ")
      .filter(token => token.length > 3)
  );
  const bTokens = new Set(
    normalizeSentence(b)
      .split(" ")
      .filter(token => token.length > 3)
  );
  if (!aTokens.size || !bTokens.size) return 0;

  const overlap = Array.from(aTokens).filter(token =>
    bTokens.has(token)
  ).length;
  return overlap / Math.min(aTokens.size, bTokens.size);
};

export const hasBlockedPhrases = (text: string): boolean =>
  BLACKLIST.some(pattern => pattern.test(text));

export const hasRepeatedSentencesAcrossSections = (
  sections: string[]
): boolean => {
  const sectionSentences = sections.map(section => sentenceSplit(section));

  for (
    let sectionIndex = 0;
    sectionIndex < sectionSentences.length;
    sectionIndex += 1
  ) {
    for (
      let compareIndex = sectionIndex + 1;
      compareIndex < sectionSentences.length;
      compareIndex += 1
    ) {
      for (const sentence of sectionSentences[sectionIndex]) {
        for (const otherSentence of sectionSentences[compareIndex]) {
          if (similarity(sentence, otherSentence) >= 0.8) {
            return true;
          }
        }
      }
    }
  }

  return false;
};

export const validateNoBoilerplate = (description: string): boolean =>
  !hasBlockedPhrases(description);
