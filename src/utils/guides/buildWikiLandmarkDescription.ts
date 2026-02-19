import { hasHighSimilarity } from "./checkDescriptionSimilarity";
import {
  cleanWikipediaExtract,
  paraphraseWikiSummary,
  wikiWordCount,
} from "./paraphraseWikiSummary";
import { validateNoBoilerplate } from "./validateNoBoilerplate";
import {
  fetchWikiIntroExtract,
  fetchWikiSummary,
} from "../wiki/wikiSummary";
import { getWikidataEntity, searchWikidataEntity } from "../wiki/wikidata";

export type WikiDescResult = {
  description: string;
  wikiUrl?: string | null;
  usedWiki: boolean;
};

const MIN_WORDS = 100;

const FACT_PATTERNS = [
  /\b\d{4}\b/g,
  /\b\d+(?:\.\d+)?\s?(?:acre|acres|mile|miles|km|meter|meters|foot|feet|ft|square|sq|hectare|hectares|%)\b/gi,
  /\b(?:opened|built|founded|established|completed|designated|renovated|expanded|constructed|incorporated)\b/gi,
  /\b(?:architect|architects|neighborhood|neighbourhood|district|boulevard|avenue|style|campus|collection|tower|pier|beach|museum|gallery|observatory|bridge|landmark|park)\b/gi,
  /\b(?:National Historic Landmark|World Heritage Site|state park|national park|UNESCO)\b/gi,
];

const countFactSignals = (text: string) => {
  const matches = new Set<string>();

  FACT_PATTERNS.forEach(pattern => {
    const found = text.match(pattern) ?? [];
    found.forEach(value => matches.add(value.toLowerCase()));
  });

  return matches.size;
};

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

const wikipediaCandidates = (
  landmarkName: string,
  cityName: string,
  stateName: string
) =>
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

const passesRules = (description: string) =>
  validateNoBoilerplate(description) &&
  wikiWordCount(description) >= MIN_WORDS &&
  countFactSignals(description) >= 2;

const scoreCandidate = (description: string, existingDescriptions: string[]) => {
  const factSignals = countFactSignals(description);
  const words = wikiWordCount(description);
  const similarityPenalty = hasHighSimilarity(description, existingDescriptions, 0.85)
    ? 100
    : 0;

  return factSignals * 10 + Math.min(words, 160) - similarityPenalty;
};

const buildCandidatesFromExtract = (extract: string): string[] => {
  const fromParaphrase = Array.from({ length: 4 }, (_, variant) =>
    paraphraseWikiSummary({ extract, variant })
  );
  const cleaned = cleanWikipediaExtract(extract, 170);

  return dedupeTitles([...fromParaphrase, cleaned]);
};

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

  let best: { description: string; wikiUrl: string | null; score: number } | null =
    null;

  for (const title of candidateTitles) {
    const summary = await fetchWikiSummary(title);
    if (!summary.extract) {
      continue;
    }

    const candidates = buildCandidatesFromExtract(summary.extract);
    for (const candidate of candidates) {
      const score = scoreCandidate(candidate, existingDescriptions);
      if (!best || score > best.score) {
        best = { description: candidate, wikiUrl: summary.url, score };
      }

      if (
        passesRules(candidate) &&
        !hasHighSimilarity(candidate, existingDescriptions, 0.85)
      ) {
        return {
          description: candidate,
          wikiUrl: summary.url,
          usedWiki: true,
        };
      }
    }
  }

  for (const title of candidateTitles) {
    const intro = await fetchWikiIntroExtract(title);
    if (!intro.extract) {
      continue;
    }

    const cleaned = cleanWikipediaExtract(intro.extract, 170);
    const score = scoreCandidate(cleaned, existingDescriptions);
    if (!best || score > best.score) {
      best = { description: cleaned, wikiUrl: intro.url, score };
    }

    if (passesRules(cleaned) && !hasHighSimilarity(cleaned, existingDescriptions, 0.85)) {
      return {
        description: cleaned,
        wikiUrl: intro.url,
        usedWiki: true,
      };
    }
  }

  return {
    description: best?.description ?? "",
    wikiUrl: best?.wikiUrl ?? null,
    usedWiki: Boolean(best),
  };
}
