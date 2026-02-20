import { hasHighSimilarity } from "./checkDescriptionSimilarity";
import { fallbackLandmarkDescription } from "./fallbackLandmarkDescription";
import { paraphraseWikiSummary } from "./paraphraseWikiSummary";
import { validateNoBoilerplate } from "./validateNoBoilerplate";
import { fetchWikiSummary } from "../wiki/wikiSummary";

export type WikiDescResult = {
  name: string;
  description: string;
  wikiUrl?: string | null;
  usedWiki: boolean;
};

export const TIER1_ATTRACTION_COUNT = 8;
export const ENABLE_IMAGES = false;

export async function buildWikiLandmarkDescription(args: {
  landmarkName: string;
  cityName: string;
  stateName: string;
  existingDescriptions?: string[];
}): Promise<WikiDescResult> {
  const { landmarkName, cityName, stateName, existingDescriptions = [] } = args;
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
        variant: attempt,
      });

      if (!validateNoBoilerplate(candidate)) {
        continue;
      }

      if (!hasHighSimilarity(candidate, existingDescriptions)) {
        return {
          name: landmarkName,
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
        name: landmarkName,
        description: best,
        wikiUrl: summary.url,
        usedWiki: true,
      };
    }
  }

  return {
    name: landmarkName,
    description: fallbackLandmarkDescription({ landmarkName, cityName, stateName }),
    wikiUrl: null,
    usedWiki: false,
  };
}
