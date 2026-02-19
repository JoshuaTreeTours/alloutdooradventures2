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

const withFallback = (args: {
  landmarkName: string;
  cityName: string;
  stateName: string;
}) => {
  const { landmarkName, cityName, stateName } = args;
  return `${landmarkName} is a well-known landmark in ${cityName}, ${stateName}. It is regularly included in city itineraries for its location, recognizability, and ties to local history.`;
};

export const paraphraseWikiSummary = (args: {
  landmarkName: string;
  cityName: string;
  stateName: string;
  extract: string;
  variant?: number;
}): string => {
  const { landmarkName, cityName, stateName, extract, variant = 0 } = args;
  const source = splitSentences(extract);

  if (!source.length) {
    return withFallback({ landmarkName, cityName, stateName });
  }

  const rotations = [
    [0, 1, 2, 3],
    [0, 2, 1, 3],
    [1, 0, 2, 3],
  ];

  const order = rotations[variant % rotations.length];
  const picked = order
    .map(index => source[index])
    .filter((sentence): sentence is string => Boolean(sentence))
    .slice(0, 4);

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

  let candidate = unique.join(" ");
  if (wordCount(candidate) < 80) {
    const remaining = source
      .slice(4)
      .map(sentence => sentence.replace(/\s+/g, " ").replace(/\.*$/, "."));

    for (const sentence of remaining) {
      candidate = `${candidate} ${sentence}`.trim();
      if (wordCount(candidate) >= 80) {
        break;
      }
    }
  }

  if (!candidate) {
    return withFallback({ landmarkName, cityName, stateName });
  }

  if (wordCount(candidate) > 120) {
    return trimToWordLimit(candidate, 120);
  }

  return candidate;
};
