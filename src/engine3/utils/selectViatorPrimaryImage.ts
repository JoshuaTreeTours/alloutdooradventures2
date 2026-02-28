import { isAllowedImageUrl, normalizeImageUrl } from "./isAllowedImageUrl";

const REJECT_SCORE = -9999;

const normalizeCandidate = (value?: string): string | null => {
  const normalized = normalizeImageUrl(value);
  if (!normalized) {
    return null;
  }

  return isAllowedImageUrl(normalized) ? normalized : null;
};

export const scoreViatorPrimaryImage = (url: string): number => {
  const lower = url.toLowerCase();

  if (lower.includes("globalnav")) return REJECT_SCORE;
  if (lower.includes("fallback-")) return REJECT_SCORE;
  if (lower.includes("_100x100")) return REJECT_SCORE;
  if (lower.includes("sprite")) return REJECT_SCORE;
  if (lower.includes("/icons/")) return REJECT_SCORE;
  if (lower.includes("logo")) return REJECT_SCORE;

  let score = 0;

  if (lower.includes("dynamic-media.tacdn.com")) score += 200;
  if (lower.includes("media.tacdn.com")) score += 150;

  const match = lower.match(/(\d{3,4})x(\d{3,4})/);
  if (match) {
    score += Number(match[1]);
  }

  return score;
};

type SelectViatorPrimaryImageInput = {
  primaryImageUrl?: string;
  imageUrls?: string[];
  fallbackImageUrl: string;
};

export const selectViatorPrimaryImage = ({
  primaryImageUrl,
  imageUrls,
  fallbackImageUrl,
}: SelectViatorPrimaryImageInput): string => {
  const deduped = Array.from(
    new Set([primaryImageUrl, ...(imageUrls ?? [])].filter(Boolean))
  );

  const normalized = deduped
    .map(url => normalizeCandidate(url))
    .filter((url): url is string => Boolean(url));

  let winner: string | null = null;
  let winnerScore = REJECT_SCORE;

  for (const url of normalized) {
    const score = scoreViatorPrimaryImage(url);
    if (score > winnerScore) {
      winner = url;
      winnerScore = score;
    }
  }

  return winner && winnerScore > REJECT_SCORE ? winner : fallbackImageUrl;
};
