const SENTENCE_BANNED_PATTERNS = [
  /the same article set/i,
  /coverage for .* cites dated milestones/i,
  /cross-?links?\s+them\s+with/i,
  /\barticle\b/i,
  /\bcoverage\b/i,
  /\bdataset\b/i,
  /\bdesign briefs?\b/i,
  /\barchives?\b/i,
  /\brecords?\b/i,
  /\bengineering records\b/i,
  /\bplanning archives\b/i,
  /\bsource\s*:/i,
  /wikipedia says/i,
  /\baccording to\b/i,
  /\bthis page\b/i,
  /\bthis article\b/i,
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

const splitSentences = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const normalizeSentence = (sentence: string) =>
  sentence
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .replace(/\(\s*\)/g, "")
    .replace(/\babout\s+from\b/gi, "from")
    .replace(/\s+/g, " ")
    .trim();

const fallbackDescription = (
  landmarkName = "This place",
  city = "the city",
  state = ""
) => {
  const location = state ? `${city}, ${state}` : city;
  return `${landmarkName} is a well-known stop in ${location} that helps visitors understand the local character and layout. Visitors come here for a focused experience, easy pairing with nearby neighborhoods, and a practical way to shape a half-day plan.`;
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

export function cleanLandmarkText(
  text: string,
  context?: { landmarkName?: string; city?: string; state?: string }
): string {
  if (!text) {
    return fallbackDescription(
      context?.landmarkName,
      context?.city,
      context?.state
    );
  }

  let cleaned = text;

  for (const pattern of METRIC_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }

  const keptSentences = splitSentences(cleaned)
    .filter(sentence => !SENTENCE_BANNED_PATTERNS.some(pattern => pattern.test(sentence)))
    .map(normalizeSentence)
    .filter(Boolean);

  if (keptSentences.length < 2) {
    return fallbackDescription(
      context?.landmarkName,
      context?.city,
      context?.state
    );
  }

  return keptSentences.join(" ");
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
