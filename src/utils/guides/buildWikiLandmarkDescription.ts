import { hasHighSimilarity } from "./checkDescriptionSimilarity";
import { fallbackLandmarkDescription } from "./fallbackLandmarkDescription";
import { paraphraseWikiSummary } from "./paraphraseWikiSummary";
import { validateNoBoilerplate } from "./validateNoBoilerplate";
import { fetchWikiSummary } from "../wiki/wikiSummary";
import { getWikidataEntity, searchWikidataEntity } from "../wiki/wikidata";

export type WikiDescResult = {
  description: string;
  wikiUrl?: string | null;
  usedWiki: boolean;
};

const FACT_PATTERNS = [
  /\b\d{4}\b/g,
  /\b\d+(?:\.\d+)?\s?(?:acre|acres|mile|miles|km|meter|meters|foot|feet|ft|square|sq|hectare|hectares|%)\b/gi,
  /\b(?:opened|built|founded|established|completed|designated|renovated|expanded|constructed)\b/gi,
  /\b(?:architect|architects|neighborhood|neighbourhood|district|boulevard|avenue|style|campus|collection|tower|pier|beach|museum|gallery|observatory)\b/gi,
  /\b(?:National Historic Landmark|World Heritage Site|state park|national park)\b/gi,
];

const countFactSignals = (text: string) => {
  const matches = new Set<string>();

  FACT_PATTERNS.forEach(pattern => {
    const found = text.match(pattern) ?? [];
    found.forEach(value => matches.add(value.toLowerCase()));
  });

  return matches.size;
};

const isValidCandidate = (description: string, existingDescriptions: string[]) =>
  validateNoBoilerplate(description) &&
  countFactSignals(description) >= 2 &&
  !hasHighSimilarity(description, existingDescriptions, 0.85);

const dedupeTitles = (titles: string[]) => {
  const seen = new Set<string>();
  const deduped: string[] = [];

  titles.forEach(title => {
    const normalized = title.toLowerCase().replace(/_/g, " ").trim();
    if (!normalized || seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    deduped.push(title);
  });

  return deduped;
};

const wikipediaCandidates = (landmarkName: string, cityName: string, stateName: string) =>
  dedupeTitles([
    `${landmarkName}`,
    `${landmarkName} (${cityName})`,
    `${landmarkName} (${cityName}, ${stateName})`,
    `${landmarkName}, ${cityName}`,
    `${landmarkName}, ${stateName}`,
    `${landmarkName} ${cityName}`,
  ]);

const wikidataCandidates = async (
  landmarkName: string,
  cityName: string,
  stateName: string
): Promise<string[]> => {
  const searches = [
    `${landmarkName} ${cityName} ${stateName}`,
    `${landmarkName} ${cityName}`,
    landmarkName,
  ];

  for (const query of searches) {
    const match = await searchWikidataEntity(query);
    if (!match?.id) {
      continue;
    }

    const entity = await getWikidataEntity(match.id);
    const title = entity?.sitelinks?.enwiki?.title;
    if (title) {
      return [title];
    }
  }

  return [];
};


const normalizeLandmarkName = (name: string) =>
  name
    .replace(/^(?:explore|visit|see|discover|experience)\s+/i, "")
    .replace(/\s+in\s+.+$/i, "")
    .trim();

export async function buildWikiLandmarkDescription(args: {
  landmarkName: string;
  cityName: string;
  stateName: string;
  existingDescriptions?: string[];
}): Promise<WikiDescResult> {
  const { landmarkName, cityName, stateName, existingDescriptions = [] } = args;
  const normalizedLandmark = normalizeLandmarkName(landmarkName);
  const candidateTitles = dedupeTitles([
    ...wikipediaCandidates(normalizedLandmark, cityName, stateName),
    ...(await wikidataCandidates(normalizedLandmark, cityName, stateName)),
  ]);

  let bestFromWiki: { description: string; wikiUrl: string | null } | null = null;

  for (const candidateTitle of candidateTitles) {
    const summary = await fetchWikiSummary(candidateTitle);
    if (!summary.extract) {
      continue;
    }

    for (let attempt = 0; attempt < 4; attempt += 1) {
      const candidate = paraphraseWikiSummary({
        landmarkName: normalizedLandmark,
        cityName,
        stateName,
        extract: summary.extract,
        variant: attempt,
      });

      if (!validateNoBoilerplate(candidate)) {
        continue;
      }

      if (!bestFromWiki || countFactSignals(candidate) > countFactSignals(bestFromWiki.description)) {
        bestFromWiki = {
          description: candidate,
          wikiUrl: summary.url,
        };
      }

      if (isValidCandidate(candidate, existingDescriptions)) {
        return {
          description: candidate,
          wikiUrl: summary.url,
          usedWiki: true,
        };
      }
    }
  }

  if (bestFromWiki && !hasHighSimilarity(bestFromWiki.description, existingDescriptions, 0.9)) {
    return {
      description: bestFromWiki.description,
      wikiUrl: bestFromWiki.wikiUrl,
      usedWiki: true,
    };
  }

  return {
    description: fallbackLandmarkDescription({ landmarkName: normalizedLandmark, cityName, stateName }),
    wikiUrl: null,
    usedWiki: false,
  };
}
