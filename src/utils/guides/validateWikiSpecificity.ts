const SPECIFIC_NOUNS = [
  "suspension bridge",
  "botanical garden",
  "art museum",
  "immigration station",
  "observatory",
  "cathedral",
  "waterfall",
  "zoo",
  "aquarium",
  "river",
  "harbor",
  "island",
  "tower",
  "park",
  "museum",
  "theater",
  "bridge",
  "garden",
];

const tokenize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const extractNumbers = (text: string) => text.match(/\b\d[\d,]*(?:\.\d+)?\b/g) ?? [];

const extractCapitalizedPhrases = (text: string) => {
  const matches = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\b/g) ?? [];
  return matches.filter(match => match.split(" ").length >= 2);
};

export function extractFactSignals(extract: string): string[] {
  const signals = new Set<string>();

  for (const number of extractNumbers(extract)) {
    signals.add(number.toLowerCase());
  }

  for (const phrase of extractCapitalizedPhrases(extract)) {
    signals.add(phrase.toLowerCase());
  }

  const lowered = extract.toLowerCase();
  for (const noun of SPECIFIC_NOUNS) {
    if (lowered.includes(noun)) signals.add(noun);
  }

  return Array.from(signals);
}

export function validateTier1Specificity(args: {
  text: string;
  factSignalsFromExtract: string[];
}): { ok: boolean; reason?: string } {
  const { text, factSignalsFromExtract } = args;
  if (factSignalsFromExtract.length === 0) return { ok: true };

  const loweredText = text.toLowerCase();
  const hits = factSignalsFromExtract.filter(signal => loweredText.includes(signal));

  if (hits.length >= 3) return { ok: true };

  return {
    ok: false,
    reason: `Specificity too low: matched ${hits.length}/3 fact signals`,
  };
}
