import { maxSimilarityAgainst } from "./checkDescriptionSimilarity";
import { fallbackLandmarkDescription } from "./fallbackLandmarkDescription";
import { paraphraseWikiSummary } from "./paraphraseWikiSummary";
import { findBannedPhrase } from "./validateNoBoilerplate";
import { validateTier1Specificity } from "./validateWikiSpecificity";
import { fetchWikiSummaryWithVariants } from "../wiki/wikiSummary";

const countSentences = (text: string) =>
  text
    .replace(/(\d)\.(\d)/g, "$1_$2")
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean).length;

const enforceSentenceCount = (text: string, target: number) => {
  const sentences = text
    .replace(/(\d)\.(\d)/g, "$1_$2")
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  if (sentences.length === target) return text;
  if (sentences.length > target) return sentences.slice(0, target).join(" ");

  const out = [...sentences];
  while (out.length < target) {
    out.push("Visitors can observe documented details across the site and surrounding district.");
  }
  return out.join(" ");
};

const trimWords = (text: string, maxWords: number) => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(" ").replace(/[,:;\-]+$/g, "")}.`;
};

export async function buildWikiLandmarkDescription(args: {
  landmarkName: string;
  cityName: string;
  stateName?: string;
  tier: "tier1" | "tier2";
  existingDescriptions?: string[];
}): Promise<{ description: string; wikiUrl: string | null; usedWiki: boolean; tried: string[] }> {
  const {
    landmarkName,
    cityName,
    stateName,
    tier,
    existingDescriptions = [],
  } = args;


  if (tier === "tier2") {
    return {
      description: fallbackLandmarkDescription({
        landmarkName,
        cityName,
        stateName,
        tier,
      }),
      wikiUrl: null,
      usedWiki: false,
      tried: [],
    };
  }

  const wiki = await fetchWikiSummaryWithVariants({
    landmarkName,
    cityName,
    stateName,
  });

  if (wiki.extract) {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const parsed = paraphraseWikiSummary({
        extract: wiki.extract,
        landmarkName,
        cityName,
        stateName,
        tier,
      });

      let candidate = parsed.text;
      if (tier === "tier1") candidate = enforceSentenceCount(candidate, 6);

      if (findBannedPhrase(candidate)) continue;

      if (tier === "tier1") {
        const specificity = validateTier1Specificity({
          text: candidate,
          factSignalsFromExtract: parsed.factSignals,
        });
        if (!specificity.ok) continue;
      }

      if (maxSimilarityAgainst(candidate, existingDescriptions) > 0.7) {
        continue;
      }

      return {
        description: candidate,
        wikiUrl: wiki.wikiUrl,
        usedWiki: true,
        tried: wiki.tried,
      };
    }
  }

  return {
    description: fallbackLandmarkDescription({
      landmarkName,
      cityName,
      stateName,
      tier,
    }),
    wikiUrl: null,
    usedWiki: false,
    tried: wiki.tried,
  };
}
