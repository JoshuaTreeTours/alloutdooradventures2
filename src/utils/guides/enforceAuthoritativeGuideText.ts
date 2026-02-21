const BANNED_PHRASES = [
  "prominent landmark",
  "recognized as part of the city’s physical and cultural landscape",
  "recognized as part of the city's physical and cultural landscape",
  "known for identifiable design features",
  "long-standing local relevance across civic life",
  "coverage for",
  "cites dated milestones",
  "the same article set",
  "cross-links",
  "design briefs",
  "engineering records",
  "planning archives",
  "keep the narrative evidence-based",
];

const META_PATTERNS = [
  /\baccording to\b/gi,
  /\bthis article\b/gi,
  /\bsource\s*:?\b/gi,
  /\bcoverage\b/gi,
];

const DEFAULT_FALLBACK =
  "This area is a popular base for outdoor activities, day trips, and guided experiences. Use this guide to plan neighborhoods, top sights, and the best ways to spend one to three days.";

const splitSentences = (text: string): string[] =>
  text
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const trimToWords = (text: string, maxWords: number) => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ").replace(/[,:;\-]+$/g, "")}.`;
};

export const cleanCannedPhrases = (text: string): string => {
  if (!text) return "";

  let cleaned = text;
  for (const phrase of BANNED_PHRASES) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleaned = cleaned.replace(new RegExp(escaped, "gi"), "");
  }

  for (const pattern of META_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }

  cleaned = cleaned
    .replace(/\bsource\b\s*[:\-]?\s*https?:\/\/\S+/gi, "")
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
};

export const isTier1ProtectedGuide = (tier?: "tier1" | "tier2") =>
  tier !== "tier2";

export const rewriteOnlyForNonTier1 = (args: {
  tier?: "tier1" | "tier2";
  originalText: string;
  rewrite: (text: string) => string;
}) => {
  if (isTier1ProtectedGuide(args.tier)) {
    return args.originalText;
  }

  return args.rewrite(args.originalText);
};

export const rewriteCityIntroFromWiki = (args: {
  cityName: string;
  stateName?: string;
  countryName?: string;
  wikiText?: string | null;
}): string => {
  const { cityName, stateName, countryName = "United States", wikiText } = args;

  const cleanedWiki = cleanCannedPhrases(wikiText ?? "");
  const wikiSentences = splitSentences(cleanedWiki).filter(
    sentence => !/\b(source|according to|article|coverage)\b/i.test(sentence)
  );

  if (!wikiSentences.length) {
    return DEFAULT_FALLBACK;
  }

  const location = stateName ? `${cityName}, ${stateName}` : `${cityName}, ${countryName}`;
  const lead = `${location} is a destination with a distinct local identity, easy access to major sights, and a strong mix of neighborhoods, culture, and outdoor experiences.`;
  const draw = wikiSentences[0] ?? "";
  const activity = wikiSentences[1]
    ? `Visitors can plan time around ${wikiSentences[1].replace(/^[A-Z][^\s]*\s+(is|are)\s+/i, "").replace(/\.$/, "").toLowerCase()}.`
    : `Visitors can combine signature landmarks, local food areas, and nearby parks or waterfront routes in the same day.`;
  const planning = wikiSentences[2]
    ? `For trip planning, ${wikiSentences[2].charAt(0).toLowerCase()}${wikiSentences[2].slice(1)}`
    : `Most travelers can cover core highlights in one to three days by grouping stops by neighborhood.`;

  const intro = cleanCannedPhrases([lead, draw, activity, planning].join(" "));
  const bounded = trimToWords(intro, 180);

  if (wordCount(bounded) < 120 && wikiSentences[3]) {
    return trimToWords(`${bounded} ${wikiSentences[3]}`, 180);
  }

  return bounded;
};

export const rewriteLandmarkFromWiki = (args: {
  landmarkName: string;
  cityName: string;
  stateName?: string;
  wikiText?: string | null;
  tier?: "tier1" | "tier2";
}): string => {
  const { landmarkName, cityName, stateName, wikiText, tier = "tier1" } = args;
  const cleanedWiki = cleanCannedPhrases(wikiText ?? "");
  const wikiSentences = splitSentences(cleanedWiki).filter(
    sentence => !/\b(source|according to|article|coverage)\b/i.test(sentence)
  );

  const minWords = tier === "tier2" ? 35 : 60;
  const maxWords = tier === "tier2" ? 70 : 100;

  const location = stateName ? `${cityName}, ${stateName}` : cityName;
  const lead = `${landmarkName} is a notable stop in ${location}.`;

  const base = [
    lead,
    wikiSentences[0] ??
      `${landmarkName} is a popular place to spend time outdoors, explore nearby neighborhoods, and add a focused stop to a city itinerary.`,
    wikiSentences[1] ??
      `Visitors typically come for views, walkable surroundings, and easy pairing with other highlights in ${cityName}.`,
  ]
    .filter(Boolean)
    .join(" ");

  let rewritten = trimToWords(cleanCannedPhrases(base), maxWords);

  if (wordCount(rewritten) < minWords && wikiSentences[2]) {
    rewritten = trimToWords(`${rewritten} ${wikiSentences[2]}`, maxWords);
  }

  return rewritten;
};
