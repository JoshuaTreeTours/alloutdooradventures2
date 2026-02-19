const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "for",
  "from",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "with",
  "within",
  "into",
  "by",
  "their",
  "about",
]);

const tokenize = (input: string) =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map(token => token.trim())
    .filter(token => token.length > 1 && !STOP_WORDS.has(token));

export const jaccardSimilarity = (a: string, b: string): number => {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));

  if (!setA.size && !setB.size) {
    return 1;
  }

  const intersection = Array.from(setA).filter(token => setB.has(token)).length;
  const union = new Set([...Array.from(setA), ...Array.from(setB)]).size;
  return union === 0 ? 0 : intersection / union;
};

export const hasHighSimilarity = (
  candidate: string,
  existing: string[],
  threshold = 0.7
): boolean =>
  existing.some(description => jaccardSimilarity(candidate, description) > threshold);
