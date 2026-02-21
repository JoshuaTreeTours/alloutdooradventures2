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

const MIN_WORDS = 80;

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

const expandWithContext = (args: {
  summary: string;
  landmarkName: string;
  cityName: string;
  stateName: string;
}) => {
  const { summary, landmarkName, cityName, stateName } = args;
  const context = `${landmarkName} has shaped how ${cityName}, ${stateName} is understood by residents and visitors, because its setting, structure, and public role capture key parts of the area's development. The site also stands out for physical characteristics that are easy to identify on arrival, helping explain why it remains part of local history and civic identity.`;
  return `${summary} ${context}`.replace(/\s+/g, " ").trim();
};

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
  ].filter(Boolean);

  let description = [lead, ...body].join(" ").replace(/\s+/g, " ").trim();

  if (splitSentences(description).length < 4) {
    description = `${lead} ${sentences.join(" ")}`.trim();
  }

  description = trimToWords(description, maxWords);

  const sentenceTotal = splitSentences(description).length;
  const words = wordCount(description);

  if (sentenceTotal < 4 || words < minWords) {
    description = `${landmarkName} in ${cityName}, ${stateName}, has a well-recorded role in local history and regional change over time. The landmark includes physical features that define its character, whether through architecture, waterfront geography, preserved natural terrain, or long-standing public space design. It matters because it anchors major civic narratives, helping explain how the city grew and why this area became culturally recognizable. Current use and preservation work continue to connect the site with community identity, education, and tourism.`;
    description = trimToWords(description, maxWords);
  }

  if (wordCount(description) < minWords) {
    description = expandWithContext({
      summary: description,
      landmarkName,
      cityName,
      stateName,
    });
    description = trimToWords(description, maxWords);
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
      minWords: tier === "tier2" ? MIN_WORDS : 80,
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
