import { stripEngine6AdmissionArtifacts } from "./seo";

export const ENGINE6_SUPPLIER_NARRATIVE_MARKETING_PATTERNS = [
  /\bone of the best\b/i,
  /\ban unforgettable experience\b/i,
  /\b(?:joy and happiness|happiness and joy)\b/i,
  /\bdon't miss\b/i,
  /\bdo not miss\b/i,
  /\bmust-?see\b/i,
  /\bwe encourage you\b/i,
  /\bperfect for everyone\b/i,
  /\bour experienced guides?\b/i,
  /\b(?:book now|book today)\b/i,
  /\bready for an adventure\b/i,
  /\b(?:trip of a lifetime|once in a lifetime)\b/i,
  /\bbucket list\b/i,
  /\b(?:don't wait|act now|limited time)\b/i,
  /\b(?:#1 attraction|number one attraction)\b/i,
  /\bthe only (?:pirate ship|company|operator|tour)\b/i,
  /\bwe(?:'re| are) (?:the only|proud to)\b/i,
  /\bjoin us (?:for|on|as)\b/i,
  /\bwe guarantee\b/i,
  /\b(?:amazing|awesome|incredible|spectacular|breathtaking|unforgettable)\s+(?:experience|adventure|journey|tour|trip)\b/i,
] as const;

export const ENGINE6_SUPPLIER_NARRATIVE_BOILERPLATE_SENTENCE_PATTERNS = [
  /^book now\b/i,
  /^ready for an adventure\b/i,
  /^don't miss\b/i,
  /^do not miss\b/i,
  /^we encourage you\b/i,
  /^join us\b/i,
  /^perfect for everyone\b/i,
  /^our experienced guides?\b/i,
  /^there(?:'s| is) plenty to see and do\b/i,
  /^we(?:'re| are) (?:the only|proud to|located at)\b/i,
  /^the best sightseeing\b/i,
  /^everyone can come to enjoy\b/i,
] as const;

const ENGINE6_SUPPLIER_NARRATIVE_INLINE_REPLACEMENTS: Array<
  [RegExp, string]
> = [
  [/\bone of the best\b[^,.;!?]*/gi, ""],
  [/\ban unforgettable experience\b/gi, ""],
  [/\b(?:joy and happiness|happiness and joy)\b/gi, ""],
  [/\bdon't miss\b/gi, "includes"],
  [/\bdo not miss\b/gi, "includes"],
  [/\bmust-?see\b/gi, "notable"],
  [/\bwe encourage you to\b/gi, "the route includes"],
  [/\bwe encourage you\b/gi, "the route includes"],
  [/\bperfect for everyone\b/gi, ""],
  [/\bour experienced guides?\b/gi, "the guide"],
  [/\b(?:book now|book today)\b[^.!?]*/gi, ""],
  [/\bready for an adventure\b[^.!?]*/gi, ""],
  [/\b(?:trip of a lifetime|once in a lifetime)\b/gi, ""],
  [/\bbucket list\b/gi, "notable"],
  [/\bjoin us (?:for|on|as)\b/gi, "the route includes"],
  [/\bwe guarantee\b/gi, ""],
  [/\bthe best sightseeing\b[^.!?]*/gi, "sightseeing"],
  [/\bwe have the only\b/gi, "the route includes"],
  [/\beveryone can come to enjoy\b/gi, ""],
  [/\b(?:amazing|awesome|incredible|spectacular|breathtaking|unforgettable)\s+(?:experience|adventure|journey|outing)\b/gi, "outdoor outing"],
];

const normalizeWhitespace = (value: string) =>
  value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/([,;])\s*([,;])+/g, "$1")
    .replace(/\(\s*\)/g, "")
    .replace(/\s+-(\s+|$)/g, " ")
    .trim();

const normalizeSentenceEnding = (value: string) => {
  const trimmed = value.replace(/[,:;\s-]+$/g, "").trim();
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};

const splitSupplierNarrativeSentences = (value: string) =>
  value
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const normalizeForDuplicateComparison = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isDuplicateSupplierIntro = (first: string, second: string) => {
  const normalizedFirst = normalizeForDuplicateComparison(first);
  const normalizedSecond = normalizeForDuplicateComparison(second);
  if (!normalizedFirst || !normalizedSecond) return false;
  if (normalizedFirst === normalizedSecond) return true;
  if (
    normalizedFirst.length >= 24 &&
    normalizedSecond.startsWith(normalizedFirst.slice(0, 24))
  ) {
    return true;
  }
  if (
    normalizedSecond.length >= 24 &&
    normalizedFirst.startsWith(normalizedSecond.slice(0, 24))
  ) {
    return true;
  }
  return false;
};

const stripSupplierNarrativeMarketingPhrases = (sentence: string) => {
  let cleaned = sentence;
  for (const [pattern, replacement] of ENGINE6_SUPPLIER_NARRATIVE_INLINE_REPLACEMENTS) {
    cleaned = cleaned.replace(pattern, replacement);
  }
  return normalizeWhitespace(cleaned);
};

const isSupplierNarrativeBoilerplateSentence = (sentence: string) => {
  const normalized = normalizeWhitespace(sentence);
  if (!normalized) return true;
  if (ENGINE6_SUPPLIER_NARRATIVE_BOILERPLATE_SENTENCE_PATTERNS.some(pattern =>
    pattern.test(normalized)
  )) {
    return true;
  }

  const stripped = stripSupplierNarrativeMarketingPhrases(normalized);
  if (!stripped) return true;

  const wordCount = stripped.split(/\s+/).filter(Boolean).length;
  return wordCount < 4;
};

export const hasEngine6SupplierNarrativeMarketingBoilerplate = (
  value: string
) =>
  ENGINE6_SUPPLIER_NARRATIVE_MARKETING_PATTERNS.some(pattern =>
    pattern.test(value)
  );

export const normalizeEngine6SupplierNarrativeText = (
  value: string | null | undefined
): string => {
  const cleaned = stripEngine6AdmissionArtifacts(String(value ?? ""))
    .replace(/<[^>]*>/g, " ")
    .replace(/\.\.\.+/g, ".")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "";

  const sentences = splitSupplierNarrativeSentences(cleaned)
    .map(stripSupplierNarrativeMarketingPhrases)
    .filter(sentence => !isSupplierNarrativeBoilerplateSentence(sentence))
    .map(normalizeSentenceEnding)
    .filter(Boolean);

  const dedupedSentences = sentences.filter((sentence, index) => {
    if (index === 0) return true;
    return !isDuplicateSupplierIntro(sentences[index - 1] ?? "", sentence);
  });

  return normalizeWhitespace(dedupedSentences.join(" "));
};

export const normalizeEngine6SupplierNarrativeDescription = (
  value: string | null | undefined
): string => {
  const normalized = normalizeEngine6SupplierNarrativeText(value);
  if (!normalized) {
    return normalizeWhitespace(String(value ?? ""));
  }
  return normalizeSentenceEnding(normalized);
};
