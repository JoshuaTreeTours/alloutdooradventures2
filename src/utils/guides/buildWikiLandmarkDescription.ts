import { fetchWikiSummary } from "../wiki/wikiSummary";

export type WikiDescResult = {
  description: string;
  wikiUrl?: string | null;
  imageUrl?: string | null;
  usedWiki: boolean;
};

const normalizeSummary = (value: string) =>
  value.replace(/\s+/g, " ").trim().toLowerCase();

export async function buildWikiLandmarkDescription(args: {
  landmarkName: string;
  cityName: string;
  stateName: string;
  tier?: "tier1" | "tier2";
  existingDescriptions?: string[];
  forceAuthorityRewrite?: boolean;
}): Promise<WikiDescResult | null> {
  const {
    landmarkName,
    cityName,
    stateName,
    existingDescriptions = [],
  } = args;

  const seen = new Set(existingDescriptions.map(normalizeSummary));

  const candidateTitles = [
    `${landmarkName}`,
    `${landmarkName} (${cityName})`,
    `${landmarkName}, ${cityName}`,
    `${landmarkName}, ${stateName}`,
  ];

  for (const candidateTitle of candidateTitles) {
    const summary = await fetchWikiSummary(candidateTitle);
    const wikiSummaryText = summary.extract?.trim();

    if (!wikiSummaryText) {
      continue;
    }

    const summaryText = wikiSummaryText
      .split(". ")
      .slice(0, 3)
      .join(". ")
      .replace(/\s+/g, " ")
      .trim();

    if (!summaryText) {
      continue;
    }

    const normalized = normalizeSummary(summaryText);
    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);

    return {
      description: `${summaryText}. Source: Wikipedia → ${summary.url}`,
      wikiUrl: summary.url,
      imageUrl: summary.imageUrl,
      usedWiki: true,
    };
  }

  return null;
}
