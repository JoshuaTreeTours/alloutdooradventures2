const META_DENYLIST = [
  "viator",
  "published",
  "normalized",
  "product fields",
  "assembled",
  "this overview",
  "indicates",
  "listed for the tour",
  "these highlights describe",
  "inclusions listed",
  "third-party",
  "data",
  "api",
] as const;

const SENTENCE_SPLIT = /(?<=[.!?])\s+/;

export const containsMetaLanguage = (value?: string | null): boolean => {
  if (typeof value !== "string") {
    return false;
  }

  const lowered = value.toLowerCase();
  return META_DENYLIST.some(token => lowered.includes(token));
};

export const sanitizeAuthorityOverview = (value?: string | null): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const sentences = value
    .split(SENTENCE_SPLIT)
    .map(sentence => sentence.trim())
    .filter(Boolean)
    .filter(sentence => !containsMetaLanguage(sentence));

  if (!sentences.length) {
    return null;
  }

  const cleaned = sentences
    .join(" ")
    .replace(/\b(Highlights?|Inclusions?)\s+(include|includes|included)\b/gi, "The route features")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.length > 0 ? cleaned : null;
};
