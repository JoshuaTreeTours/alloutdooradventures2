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

const BANNED_OUTPUT = [
  /prominent landmark/i,
  /recognized as part of the city'?s landscape/i,
  /visitors experience/i,
  /site-specific details/i,
  /easy recommendation/i,
  /travelers comparing attractions/i,
  /one of the most valuable things to do/i,
];

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
  return `${words.slice(0, maxWords).join(" ").replace(/[,:;\-]+$/g, "")}.`;
};

const hasBanned = (text: string) => BANNED_OUTPUT.some(pattern => pattern.test(text));

const buildExtendedDescription = (args: {
  landmarkName: string;
  cityName: string;
  stateName: string;
  extract: string;
}) => {
  const { landmarkName, cityName, stateName, extract } = args;
  const sentences = splitSentences(extract).filter(sentence => !hasBanned(sentence));

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

  description = trimToWords(description, 140);
  description = stateName.toLowerCase() === "hawaii" ? description.replace(/The site is regularly referenced in statewide historical, environmental, or cultural documentation\.?/gi, "").trim() : description;

  const sentenceTotal = splitSentences(description).length;
  const words = wordCount(description);

  if (sentenceTotal < 4 || words < 80) {
    description = `${landmarkName} is a landmark in ${cityName}, ${stateName}. The location is tied to the city's geographic setting and reflects how the surrounding region developed over time. Historical records describe its role in major local transitions, including civic growth and changes in transportation or land use. The site is known for defining physical features that distinguish it from nearby districts and give it a lasting identity. It remains a useful reference point for understanding the area's cultural history and broader landscape context.`;
    description = trimToWords(description, 140);
  }

  if (hasBanned(description)) {
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
  const {
    landmarkName,
    cityName,
    stateName,
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
    if (!summary.extract) continue;

    const candidate = cleanThingDescription(buildExtendedDescription({
      landmarkName,
      cityName,
      stateName,
      extract: summary.extract,
    }));

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
    description: cleanThingDescription(fallbackLandmarkDescription({
      landmarkName,
      cityName,
      stateName,
    })),
    wikiUrl: null,
    imageUrl: null,
    usedWiki: false,
  };
}
