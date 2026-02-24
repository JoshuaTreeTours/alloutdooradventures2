const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toTrigrams = (value: string) => {
  const normalized = normalize(value);
  if (!normalized) {
    return new Set<string>();
  }

  const padded = `  ${normalized}  `;
  const grams = new Set<string>();
  for (let i = 0; i < padded.length - 2; i += 1) {
    grams.add(padded.slice(i, i + 3));
  }
  return grams;
};

export const jaccardTrigramSimilarity = (a: string, b: string) => {
  const aGrams = toTrigrams(a);
  const bGrams = toTrigrams(b);

  if (!aGrams.size && !bGrams.size) {
    return 1;
  }

  let intersection = 0;
  for (const gram of Array.from(aGrams)) {
    if (bGrams.has(gram)) {
      intersection += 1;
    }
  }

  const union = aGrams.size + bGrams.size - intersection;
  return union === 0 ? 0 : intersection / union;
};
