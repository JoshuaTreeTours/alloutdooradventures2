import type { WikiFileInfo } from "./wikiClient";

const BLOCKED_TOKENS = [
  "map",
  "diagram",
  "logo",
  "flag",
  "coat of arms",
  "seal",
];

const hasBlockedToken = (value: string) => {
  const normalized = value.toLowerCase();
  return BLOCKED_TOKENS.some(token => normalized.includes(token));
};

const tokenize = (value: string) =>
  value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

export const selectBestWikiImage = (
  candidates: WikiFileInfo[],
  context: { city?: string; region?: string },
): WikiFileInfo | null => {
  const cityTokens = tokenize(context.city ?? "");
  const regionTokens = tokenize(context.region ?? "");

  const ranked = candidates
    .filter(candidate => !hasBlockedToken(candidate.fileTitle))
    .map(candidate => {
      const title = candidate.fileTitle.toLowerCase();
      const hasLocationToken = [...cityTokens, ...regionTokens].some(token =>
        title.includes(token),
      );
      const resolutionScore = (candidate.width ?? 0) >= 1200 ? 3 : 0;
      const photoLikeScore = /(landscape|mountain|canyon|desert|valley|park)/.test(
        title,
      )
        ? 2
        : 0;

      return {
        candidate,
        score: (hasLocationToken ? 4 : 0) + resolutionScore + photoLikeScore,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.candidate.fileTitle.localeCompare(b.candidate.fileTitle);
    });

  return ranked[0]?.candidate ?? null;
};
