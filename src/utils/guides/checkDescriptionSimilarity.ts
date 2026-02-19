const STOP_WORDS = new Set([
  "the",
  "and",
  "in",
  "of",
  "to",
  "a",
  "is",
  "for",
  "with",
  "on",
  "it",
  "its",
  "as",
  "at",
  "from",
  "this",
  "that",
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
  if (!setA.size && !setB.size) return 1;

  const intersection = Array.from(setA).filter(token => setB.has(token)).length;
  const union = new Set([...Array.from(setA), ...Array.from(setB)]).size;
  return union ? intersection / union : 0;
};

export const maxSimilarityAgainst = (candidate: string, existing: string[]): number =>
  existing.reduce(
    (max, current) => Math.max(max, jaccardSimilarity(candidate, current)),
    0
  );

export const hasHighSimilarity = (
  candidate: string,
  existing: string[],
  threshold = 0.7
): boolean => maxSimilarityAgainst(candidate, existing) > threshold;
