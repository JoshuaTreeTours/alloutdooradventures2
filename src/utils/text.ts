const REVIEW_KEYWORDS =
  /(recent travelers|out of 5|reviews?|stars?|\b\d(?:\.\d)?\s*out of\s*5\b)/i;

const CLAUSE_SEPARATORS = [
  {
    regex: new RegExp(`\\s*\\([^)]*${REVIEW_KEYWORDS.source}[^)]*\\)\\s*`, "gi"),
    replacement: " ",
  },
  {
    regex: new RegExp(
      `\\s*[–—-][^–—-]*${REVIEW_KEYWORDS.source}[^–—-]*[–—-]?\\s*`,
      "gi",
    ),
    replacement: " ",
  },
  {
    regex: new RegExp(`\\s*,[^,]*${REVIEW_KEYWORDS.source}[^,]*,?\\s*`, "gi"),
    replacement: " ",
  },
  {
    regex: new RegExp(`\\s*;[^;]*${REVIEW_KEYWORDS.source}[^;]*;?\\s*`, "gi"),
    replacement: " ",
  },
];

const splitSentences = (text: string) => text.match(/[^.!?]+[.!?]*/g) ?? [];

const cleanupText = (text: string) =>
  text
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([,.;:!?]){2,}/g, "$1")
    .trim();

export const stripReviewMentions = (text: string) => {
  if (!text) {
    return text;
  }

  let sanitized = text;
  CLAUSE_SEPARATORS.forEach(({ regex, replacement }) => {
    sanitized = sanitized.replace(regex, replacement);
  });

  const sentences = splitSentences(sanitized)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .filter((sentence) => !REVIEW_KEYWORDS.test(sentence));

  return cleanupText(sentences.join(" "));
};
