const POSITIVE_KEYWORDS = [
  "jeep",
  "red-jeep",
  "offroad",
  "4x4",
  "fault",
  "andreas",
  "metate",
  "ranch",
  "canyon",
  "slot",
];

const NEGATIVE_KEYWORDS = ["downtown", "street", "skyline", "hotel", "resort"];

const scoreImage = (url: string) => {
  const normalized = url.toLowerCase();
  let score = 0;

  for (const keyword of POSITIVE_KEYWORDS.slice(0, 4)) {
    if (normalized.includes(keyword)) {
      score += 4;
    }
  }

  for (const keyword of POSITIVE_KEYWORDS.slice(4)) {
    if (normalized.includes(keyword)) {
      score += 4;
    }
  }

  for (const keyword of NEGATIVE_KEYWORDS) {
    if (normalized.includes(keyword)) {
      score -= 5;
    }
  }

  if (
    normalized.includes("palm") &&
    !normalized.includes("canyon") &&
    !normalized.includes("desert")
  ) {
    score -= 4;
  }

  return score;
};

export function selectBestHeroImage(input: {
  title: string;
  images: string[];
}): string | undefined {
  if (!input.images.length) {
    return undefined;
  }

  const titleLower = input.title.toLowerCase();
  const ranked = input.images
    .map(url => {
      let score = scoreImage(url);
      if (
        titleLower.includes("jeep") &&
        /(jeep|offroad|4x4|red-jeep)/.test(url.toLowerCase())
      ) {
        score += 2;
      }
      if (
        /(fault|andreas|metate|ranch|canyon)/.test(titleLower) &&
        /(fault|andreas|metate|ranch|canyon|slot)/.test(url.toLowerCase())
      ) {
        score += 2;
      }
      return { url, score };
    })
    .sort((a, b) => b.score - a.score);

  return ranked[0] && ranked[0].score >= 2 ? ranked[0].url : undefined;
}
