import { hasHighSimilarity } from "./checkDescriptionSimilarity";
import { fallbackLandmarkDescription } from "./fallbackLandmarkDescription";
import { validateNoBoilerplate } from "./validateNoBoilerplate";
import { fetchWikiSummary } from "../wiki/wikiSummary";
import {
  isTier1ProtectedGuide,
  rewriteOnlyForNonTier1,
  rewriteLandmarkFromWiki,
} from "./enforceAuthoritativeGuideText";

export type WikiDescResult = {
  description: string;
  wikiUrl?: string | null;
  imageUrl?: string | null;
  usedWiki: boolean;
};

export async function buildWikiLandmarkDescription(args: {
  landmarkName: string;
  cityName: string;
  stateName: string;
  tier?: "tier1" | "tier2";
  existingDescriptions?: string[];
}): Promise<WikiDescResult> {
  const {
    landmarkName,
    cityName,
    stateName,
    tier,
    existingDescriptions = [],
  } = args;

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
    for (let attempt = 0; attempt < 2; attempt += 1) {
      if (isTier1ProtectedGuide(tier)) {
        return {
          description: summary.extract,
          wikiUrl: summary.url,
          imageUrl: summary.imageUrl,
          usedWiki: true,
        };
      }

      const queryText =
        attempt === 0
          ? summary.extract
          : `${summary.extract} ${summary.extract.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ")}`;

      const candidate = rewriteOnlyForNonTier1({
        tier,
        originalText: queryText,
        rewrite: text =>
          rewriteLandmarkFromWiki({
            landmarkName,
            cityName,
            stateName,
            wikiText: text,
            tier: "tier2",
          }),
      });

      if (!validateNoBoilerplate(candidate)) {
        continue;
      }

      const cleanedCandidate = candidate;

      if (!hasHighSimilarity(cleanedCandidate, existingDescriptions)) {
        return {
          description: cleanedCandidate,
          wikiUrl: summary.url,
          imageUrl: summary.imageUrl,
          usedWiki: true,
        };
      }

      if (!best || cleanedCandidate.length > best.length) {
        best = cleanedCandidate;
      }
    }

    if (best) {
      return {
        description: best,
        wikiUrl: summary.url,
        imageUrl: summary.imageUrl,
        usedWiki: true,
      };
    }
  }

  return {
    description: fallbackLandmarkDescription({
      landmarkName,
      cityName,
      stateName,
    }),
    wikiUrl: null,
    imageUrl: null,
    usedWiki: false,
  };
}
