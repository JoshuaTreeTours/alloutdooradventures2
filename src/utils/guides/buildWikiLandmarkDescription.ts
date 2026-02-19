import { hasHighSimilarity } from "./checkDescriptionSimilarity";
import { fallbackLandmarkDescription } from "./fallbackLandmarkDescription";
import { paraphraseWikiSummary } from "./paraphraseWikiSummary";
import { validateNoBoilerplate } from "./validateNoBoilerplate";
import { fetchWikiSummary } from "../wiki/wikiSummary";

export type WikiDescResult = {
  description: string;
  wikiUrl?: string | null;
  usedWiki: boolean;
};

export async function buildWikiLandmarkDescription(args: {
  landmarkName: string;
  cityName: string;
  stateName: string;
  tier: "tier1" | "tier2";
  existingDescriptions?: string[];
}): Promise<WikiDescResult> {
  const { landmarkName, cityName, stateName, tier, existingDescriptions = [] } =
    args;
  const maxWords = tier === "tier1" ? 120 : 90;
  const minWords = tier === "tier1" ? 60 : 1;
  const sentenceRange: [number, number] = tier === "tier1" ? [3, 3] : [2, 3];

  const candidateTitles = [
    `${landmarkName}`,
    `${landmarkName} (${cityName})`,
    `${landmarkName}, ${cityName}`,
    `${landmarkName}, ${stateName}`,
  ];

  for (const candidateTitle of candidateTitles) {
    const summary = await fetchWikiSummary(candidateTitle);
    if (!summary.extract) {
      continue;
    }

    let best = "";
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const candidate = paraphraseWikiSummary({
        landmarkName,
        cityName,
        stateName,
        extract: summary.extract,
        maxWords,
        maxSentences: 3,
        variant: attempt,
      });

      if (!validateNoBoilerplate(candidate)) {
        continue;
      }

      const words = candidate.trim().split(/\s+/).filter(Boolean).length;
      const sentences = candidate
        .split(/(?<=[.!?])\s+/)
        .map(sentence => sentence.trim())
        .filter(Boolean).length;

      if (
        words < minWords ||
        words > maxWords ||
        sentences < sentenceRange[0] ||
        sentences > sentenceRange[1]
      ) {
        continue;
      }

      if (!hasHighSimilarity(candidate, existingDescriptions)) {
        return {
          description: candidate,
          wikiUrl: summary.url,
          usedWiki: true,
        };
      }

      if (!best || candidate.length > best.length) {
        best = candidate;
      }
    }

    if (best) {
      return {
        description: best,
        wikiUrl: summary.url,
        usedWiki: true,
      };
    }
  }

  return {
    description: fallbackLandmarkDescription({ landmarkName, cityName, stateName }),
    wikiUrl: null,
    usedWiki: false,
  };
}
