import { hasHighSimilarity } from "./checkDescriptionSimilarity";
import { cleanLandmarkText } from "./cleanLandmarkText";
import { fallbackLandmarkDescription } from "./fallbackLandmarkDescription";
import { paraphraseWikiSummary } from "./paraphraseWikiSummary";
import { validateNoBoilerplate } from "./validateNoBoilerplate";
import { fetchWikiSummary } from "../wiki/wikiSummary";

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

  const toAuthoritativeDescription = (
    description: string,
    wikiSummaryText?: string
  ) => {
    if (tier !== "tier1") return description;

    let rewritten = cleanLandmarkText(description)
      .replace(/visitors experience/gi, "The area offers")
      .replace(/is recognized as/gi, "is")
      .replace(/is known for/gi, "features")
      .replace(
        /provides a practical orientation point/gi,
        "serves as a major landmark"
      );

    if (rewritten.split(/\s+/).filter(Boolean).length < 60 && wikiSummaryText) {
      const firstSentence = wikiSummaryText
        .split(".")
        .slice(0, 1)
        .join(".")
        .trim();
      if (firstSentence) {
        rewritten = `${rewritten} ${firstSentence}`.trim();
      }
    }

    if (/article|coverage|dataset/i.test(rewritten)) {
      console.warn("Non-authoritative text detected", landmarkName);
    }

    return rewritten;
  };

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

      const cleanedCandidate = toAuthoritativeDescription(
        candidate,
        summary.extract
      );

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
