const cleanText = (text: string) =>
  text
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\([^)]*\bcitation needed\b[^)]*\)/gi, "")
    .replace(/\s+/g, " ")
    .trim();

const splitSentences = (text: string) =>
  cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

const trimToWordLimit = (text: string, maxWords: number) => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return text;
  }

  return `${words.slice(0, maxWords).join(" ").replace(/[,:;\-]+$/g, "")}.`;
};

export const paraphraseWikiSummary = (args: {
  extract: string;
  variant?: number;
}): string => {
  const { extract, variant = 0 } = args;
  const source = splitSentences(extract);

  if (!source.length) {
    return cleanText(extract);
  }

  const rotations = [
    [0, 1, 2, 3, 4, 5],
    [1, 0, 2, 4, 3, 5],
    [2, 0, 1, 3, 4, 5],
    [0, 2, 1, 4, 3, 5],
  ];

  const order = rotations[variant % rotations.length];
  const picked = order
    .map(index => source[index])
    .filter((sentence): sentence is string => Boolean(sentence));

  const unique: string[] = [];
  const seen = new Set<string>();
  picked.forEach(sentence => {
    const normalized = sentence.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
    if (!normalized || seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    unique.push(sentence.replace(/\s+/g, " ").replace(/\.*$/, "."));
  });

  const candidate = unique.join(" ").trim();
  if (!candidate) {
    return cleanText(extract);
  }

  if (wordCount(candidate) > 170) {
    return trimToWordLimit(candidate, 170);
  }

  return candidate;
};

export const cleanWikipediaExtract = (extract: string, maxWords = 170) => {
  const cleaned = cleanText(extract);
  if (!cleaned) {
    return "";
  }

  return trimToWordLimit(cleaned, maxWords);
};

export const wikiWordCount = wordCount;
