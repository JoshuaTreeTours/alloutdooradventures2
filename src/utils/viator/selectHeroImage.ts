const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "from",
  "to",
  "in",
  "of",
  "and",
  "tour",
]);

const POSITIVE_BOOSTERS = [
  "san",
  "andreas",
  "fault",
  "jeep",
  "off-road",
  "offroad",
  "red",
  "canyon",
  "desert",
  "metate",
  "ranch",
  "coachella",
];

const NEGATIVE_KEYWORDS = [
  "downtown",
  "street",
  "palm",
  "skyline",
  "city",
  "hotel",
  "resort",
  "avenue",
];

const hasAny = (value: string, keywords: string[]) =>
  keywords.some(keyword => value.includes(keyword));

const isCityGeneric = (url: string) => {
  const normalized = url.toLowerCase();
  return hasAny(normalized, NEGATIVE_KEYWORDS);
};

const scoreImage = (url: string, positiveKeywords: string[]) => {
  const normalized = url.toLowerCase();
  let score = 0;

  for (const keyword of positiveKeywords) {
    if (normalized.includes(keyword)) {
      score += 3;
    }
  }

  for (const keyword of NEGATIVE_KEYWORDS) {
    if (normalized.includes(keyword)) {
      score -= 4;
    }
  }

  if (/(jeep|offroad|4x4)/.test(normalized)) {
    score += 2;
  }

  if (/(fault|andreas)/.test(normalized)) {
    score += 2;
  }

  if (
    normalized.includes("palm") &&
    !normalized.includes("desert") &&
    !normalized.includes("canyon")
  ) {
    score -= 3;
  }

  return score;
};

export function selectHeroImage(input: {
  title: string;
  destinationSlug: string;
  images: string[];
  destinationFallbackHero?: string;
  genericOffroadFallback: string;
}): string {
  const titleWords = input.title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(word => word && !STOPWORDS.has(word));

  const positiveKeywords = Array.from(
    new Set([
      ...titleWords,
      input.destinationSlug.toLowerCase(),
      ...POSITIVE_BOOSTERS,
    ])
  );

  const scored = input.images.map(url => ({
    url,
    score: scoreImage(url, positiveKeywords),
  }));

  scored.sort((a, b) => b.score - a.score);

  if (scored.length && scored[0].score > 0) {
    return scored[0].url;
  }

  if (
    input.destinationFallbackHero &&
    !isCityGeneric(input.destinationFallbackHero)
  ) {
    return input.destinationFallbackHero;
  }

  return input.genericOffroadFallback;
}
