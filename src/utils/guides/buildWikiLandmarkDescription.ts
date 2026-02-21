import { hasHighSimilarity } from "./checkDescriptionSimilarity";
import { validateNoBoilerplate } from "./validateNoBoilerplate";
import { fetchWikiSummary } from "../wiki/wikiSummary";

export type WikiDescResult = {
  description: string;
  wikiUrl?: string | null;
  imageUrl?: string | null;
  usedWiki: boolean;
};

const BANNED_OUTPUT = [
  /prominent landmark/i,
  /recognized as part of the city'?s landscape/i,
  /visitors experience/i,
  /site-specific details/i,
  /easy recommendation/i,
  /travelers comparing attractions/i,
  /practical stop/i,
  /orientation point/i,
  /high-impact stop/i,
  /travelers comparing/i,
  /balanced itinerary/i,
  /one of the most valuable things to do/i,
];

const MIN_WORDS_TIER2 = 120;

const splitSentences = (text: string) =>
  text
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(line => line.trim())
    .filter(Boolean);

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

const trimToWords = (text: string, maxWords: number) => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return `${words
    .slice(0, maxWords)
    .join(" ")
    .replace(/[,:;\-]+$/g, "")}.`;
};

const hasBanned = (text: string) =>
  BANNED_OUTPUT.some(pattern => pattern.test(text));

const appendSourceLine = (description: string, wikiUrl: string) =>
  `${description}\n\nSource: ${wikiUrl}`;

const buildExtendedDescription = (args: {
  landmarkName: string;
  cityName: string;
  stateName: string;
  extract: string;
  wikiUrl: string;
  includeSourceLine: boolean;
  minWords: number;
  maxWords: number;
}) => {
  const {
    landmarkName,
    cityName,
    stateName,
    extract,
    wikiUrl,
    includeSourceLine,
    minWords,
    maxWords,
  } = args;
  const sentences = splitSentences(extract).filter(
    sentence => !hasBanned(sentence)
  );

  const lead = `${landmarkName} is a landmark in ${cityName}, ${stateName}.`;
  const body = [
    sentences[0],
    sentences[1],
    sentences[2],
    sentences[3],
    sentences[4],
    sentences[5],
    sentences[6],
    sentences[7],
    sentences[8],
    sentences[9],
  ].filter(Boolean);

  let description = [lead, ...body].join(" ").replace(/\s+/g, " ").trim();

  if (splitSentences(description).length < 4) {
    description = `${lead} ${sentences.join(" ")}`.trim();
  }

  description = trimToWords(description, maxWords);

  const sentenceTotal = splitSentences(description).length;
  const words = wordCount(description);

  if (sentenceTotal < 2 || words < 40) {
    return "";
  }

  if (hasBanned(description)) {
    return "";
  }

  return includeSourceLine
    ? appendSourceLine(description, wikiUrl)
    : description;
};

export async function buildWikiLandmarkDescription(args: {
  landmarkName: string;
  cityName: string;
  stateName: string;
  tier?: "tier1" | "tier2";
  isTop50?: boolean;
  existingContent?: string;
  existingDescriptions?: string[];
}): Promise<WikiDescResult> {
  const {
    landmarkName,
    cityName,
    stateName,
    tier,
    isTop50,
    existingContent,
    existingDescriptions = [],
  } = args;

  if (isTop50) {
    return {
      description: existingContent ?? "",
      wikiUrl: null,
      imageUrl: null,
      usedWiki: false,
    };
  }

  const candidateTitles = [
    `${landmarkName}`,
    `${landmarkName} (${cityName})`,
    `${landmarkName}, ${cityName}`,
    `${landmarkName}, ${stateName}`,
  ];

  for (const candidateTitle of candidateTitles) {
    const summary = await fetchWikiSummary(candidateTitle);
    if (!summary.extract) continue;

    if (!summary.url) continue;

    const candidate = buildExtendedDescription({
      landmarkName,
      cityName,
      stateName,
      extract: summary.extract,
      wikiUrl: summary.url,
      includeSourceLine: tier === "tier2",
      minWords: tier === "tier2" ? MIN_WORDS_TIER2 : 80,
      maxWords: tier === "tier2" ? 170 : 140,
    });

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
    description: "",
    wikiUrl: null,
    imageUrl: null,
    usedWiki: false,
  };
}
