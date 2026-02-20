const WIKI_PHRASE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/according to wikipedia/gi, ""],
  [/from wikipedia/gi, ""],
  [/wikipedia (page|entry|summary|article)/gi, "source"],
  [/based on wikipedia/gi, ""],
  [/information from wikipedia/gi, ""],
  [/wikipedia data/gi, "source data"],
  [/wiki source/gi, "source"],
  [/wikipedia/gi, ""],
  [/\bwiki\b/gi, ""],
  [
    /this listing links to the source page so you can verify[^.]*\./gi,
    "See the source link for details.",
  ],
  [
    /information from the source is available[^.]*\./gi,
    "See the source link for details.",
  ],
];

export function cleanWikiLanguage(text: string): string {
  if (!text) return text;

  let cleaned = text;

  WIKI_PHRASE_REPLACEMENTS.forEach(([pattern, replacement]) => {
    cleaned = cleaned.replace(pattern, replacement);
  });

  return cleaned
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}
