import { isAllowedImageUrl, normalizeImageUrl } from "./isAllowedImageUrl";

const REJECT_SCORE = -9999;

const normalizeCandidate = (value?: string): string | null => {
  const normalized = normalizeImageUrl(value);
  if (!normalized) {
    return null;
  }

  return isAllowedImageUrl(normalized) ? normalized : null;
};

export const scoreImage = (url: string): number => {
  const u = url.toLowerCase();
  let score = 0;

  if (u.includes("globalnav")) return REJECT_SCORE;
  if (u.includes("fallback-")) return REJECT_SCORE;
  if (u.includes("_100x100")) return REJECT_SCORE;
  if (u.includes("sprite")) return REJECT_SCORE;
  if (u.includes("/icons/")) return REJECT_SCORE;
  if (u.includes("logo")) return REJECT_SCORE;

  if (u.includes("dynamic-media.tacdn.com")) score += 200;
  if (u.includes("media.tacdn.com")) score += 150;

  const match = u.match(/(\d{3,4})x(\d{3,4})/);
  if (match) {
    score += Number(match[1]);
  }

  return score;
};

type SelectViatorHeroImageInput = {
  title: string;
  city?: string;
  state?: string;
  primaryImageUrl?: string;
  imageUrls?: string[];
  fallbackImageUrl: string;
};

export const selectViatorHeroImage = ({
  primaryImageUrl,
  imageUrls,
  fallbackImageUrl,
}: SelectViatorHeroImageInput): string => {
  const deduped = Array.from(
    new Set([primaryImageUrl, ...(imageUrls ?? [])].filter(Boolean))
  );

  const normalized = deduped
    .map(url => normalizeCandidate(url))
    .filter((url): url is string => Boolean(url));

  let winner: string | null = null;
  let winnerScore = REJECT_SCORE;

  for (const url of normalized) {
    const nextScore = scoreImage(url);
    if (nextScore > winnerScore) {
      winner = url;
      winnerScore = nextScore;
    }
  }

  return winner && winnerScore > REJECT_SCORE ? winner : fallbackImageUrl;
};
