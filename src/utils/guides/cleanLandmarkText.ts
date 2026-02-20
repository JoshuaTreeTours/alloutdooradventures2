const BANNED_PATTERNS = [
  /coverage for .*?\./gi,
  /the same article set references .*?\./gi,
  /distinct article language .*?\./gi,
  /cross-?links? .*?\./gi,
  /article set .*?\./gi,
  /dataset .*?\./gi,
  /this article .*?\./gi,
  /coverage .*?\./gi,
  /evidence-based .*?\./gi,
  /\breferences?\b/gi,
  /\barchives?\b/gi,
  /\bsources?\b/gi,
];

const METRIC_PATTERNS = [
  /\b\d[\d,]*(?:\.\d+)?\s*(?:acres?|sq\.?\s*ft\.?|square\s+(?:feet|foot|miles?))\b/gi,
  /\b\d[\d,]*(?:\.\d+)?\s*(?:miles?|mi\.?|kilometers?|km)\b/gi,
  /\bcapacity\s*(?:of\s*)?\d[\d,]*\b/gi,
  /\bseats?\s*(?:up\s*to\s*)?\d[\d,]*\b/gi,
];

const wordCount = (text: string) =>
  text.trim().split(/\s+/).filter(Boolean).length;

export const LANDMARK_MIN_WORDS = 45;
export const LANDMARK_MAX_WORDS = 75;

const trimToMaxWords = (text: string, maxWords: number) => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return text.trim();
  }

  return `${words.slice(0, maxWords).join(" ").replace(/[;,]$/, "")}.`;
};

const getTailSentences = (
  city: string,
  state: string,
  entityType?: string
): string[] => {
  const placeSentence = `It is a reliable stop for first-time visitors and a good way to understand ${city}, ${state} and its local character.`;
  const planningSentence = `Most visitors can pair this stop with nearby neighborhoods or downtown streets to build a clear, low-stress day plan.`;

  switch (entityType) {
    case "park":
    case "beach":
    case "mountain":
    case "river":
      return [
        `The surrounding area usually offers straightforward walking routes and practical access points for a short visit.`,
        placeSentence,
        planningSentence,
      ];
    case "museum":
    case "historic":
      return [
        `The site gives visitors clear context on how local history and culture shape the city today.`,
        placeSentence,
        planningSentence,
      ];
    default:
      return [
        `It works well as an orientation stop before exploring nearby neighborhoods, food, and other city highlights.`,
        placeSentence,
        planningSentence,
      ];
  }
};

export function cleanLandmarkText(text: string): string {
  if (!text) return text;

  let cleaned = text;

  for (const pattern of BANNED_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }

  for (const pattern of METRIC_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }

  cleaned = cleaned
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .replace(/\(\s*\)/g, "")
    .replace(/\babout\s+from\b/gi, "from")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}

export function ensureLength(
  text: string,
  city: string,
  state: string,
  entityType?: string,
  minWords = LANDMARK_MIN_WORDS,
  maxWords = LANDMARK_MAX_WORDS
): string {
  let result = trimToMaxWords(text, maxWords);
  if (wordCount(result) >= minWords) {
    return result;
  }

  const tails = getTailSentences(city, state, entityType);
  for (const sentence of tails) {
    if (wordCount(result) >= minWords) {
      break;
    }
    result = `${result.replace(/[\s.]+$/, "")}. ${sentence}`;
    result = trimToMaxWords(result, maxWords);
  }

  return result;
}
