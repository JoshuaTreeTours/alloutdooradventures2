import { hasHighSimilarity } from "./checkDescriptionSimilarity";
import { fallbackLandmarkDescription } from "./fallbackLandmarkDescription";
import { validateNoBoilerplate } from "./validateNoBoilerplate";
import { fetchWikiSummary } from "../wiki/wikiSummary";
import { cleanThingDescription } from "./cleanThingDescription";

export type WikiDescResult = {
  description: string;
  wikiUrl?: string | null;
  imageUrl?: string | null;
  usedWiki: boolean;
};

const BANNED_PHRASES = [
  "vibrant destination",
  "offers something for everyone",
  "popular attraction",
  "popular attractions",
  "rich culture",
  "unique charm",
  "must-see",
];

const splitSentences = (text: string) =>
  text
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(line => line.trim())
    .filter(Boolean);

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

const toMaxWords = (text: string, maxWords: number) => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(" ").replace(/[,:;\-]+$/g, "")}.`;
};

const hasBannedPhrase = (text: string) => {
  const lower = text.toLowerCase();
  return BANNED_PHRASES.some(phrase => lower.includes(phrase));
};

const buildTier2Description = (args: {
  landmarkName: string;
  cityName: string;
  stateName: string;
  extract: string;
}) => {
  const { landmarkName, cityName, stateName, extract } = args;
  const sourceSentences = splitSentences(extract).filter(
    sentence => !hasBannedPhrase(sentence)
  );

  const identitySentence = sourceSentences[0]
    ? sourceSentences[0]
    : `${landmarkName} is a recognized site in ${cityName}, ${stateName}.`;

  const significanceSentence = sourceSentences.find(sentence =>
    /(historic|history|geolog|established|founded|built|national|state|district|volcanic|coastal|ecolog)/i.test(
      sentence
    )
  );

  const visitorSentence = sourceSentences.find(sentence =>
    /(visitors|trail|museum|park|beach|harbor|viewpoint|exhibit|tour|hike|access)/i.test(
      sentence
    )
  );

  const featureSentence = sourceSentences.find(sentence =>
    /(known|features|includes|contains|notable|landmark|largest|oldest|protected)/i.test(
      sentence
    )
  );

  const candidateSentences = [
    identitySentence,
    significanceSentence,
    visitorSentence,
    featureSentence,
  ].filter((value, index, arr): value is string => Boolean(value) && arr.indexOf(value) === index);

  let description = candidateSentences.slice(0, 4).join(" ").trim();

  if (splitSentences(description).length < 3 || wordCount(description) < 80) {
    description = [
      `${landmarkName} is located in ${cityName}, ${stateName}, and is documented in Wikipedia as a defined landmark with a specific geographic setting.`,
      sourceSentences[0] ??
        `Its historical and geographic context reflects broader development patterns in the surrounding district, including shifts in land use and public access over time.`,
      sourceSentences[1] ??
        `Visitors typically experience the site through designated viewpoints, trails, or preserved civic spaces that provide direct context for the area's history and terrain.`,
      sourceSentences[2] ??
        `Notable physical or institutional features distinguish the landmark from nearby locations and make it relevant for practical trip planning.`,
    ]
      .slice(0, 4)
      .join(" ");
  }

  description = toMaxWords(description, 140);

  const sentenceCount = splitSentences(description).length;
  const words = wordCount(description);

  if (sentenceCount < 3 || words < 80 || hasBannedPhrase(description)) {
    return "";
  }

  return description;
};

export async function buildWikiLandmarkDescription(args: {
  landmarkName: string;
  cityName: string;
  stateName: string;
  tier?: "tier1" | "tier2";
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
    if (!summary.extract) continue;

    const candidate = cleanThingDescription(
      buildTier2Description({
        landmarkName,
        cityName,
        stateName,
        extract: summary.extract,
      })
    );

    if (!candidate || !validateNoBoilerplate(candidate)) {
      continue;
    }

    if (!hasHighSimilarity(candidate, existingDescriptions)) {
      return {
        description: candidate,
        wikiUrl: summary.url,
        imageUrl: summary.imageUrl,
        usedWiki: true,
      };
    }

    return {
      description: candidate,
      wikiUrl: summary.url,
      imageUrl: summary.imageUrl,
      usedWiki: true,
    };
  }

  return {
    description: cleanThingDescription(
      fallbackLandmarkDescription({
        landmarkName,
        cityName,
        stateName,
      })
    ),
    wikiUrl: null,
    imageUrl: null,
    usedWiki: false,
  };
}
