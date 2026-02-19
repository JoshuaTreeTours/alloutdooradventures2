import { maxSimilarityAgainst } from "./checkDescriptionSimilarity";
import { paraphraseWikiSummary } from "./paraphraseWikiSummary";
import { findBannedPhrase } from "./validateNoBoilerplate";
import { validateTier1Specificity } from "./validateWikiSpecificity";
import { fetchWikiSummaryWithVariants } from "../wiki/wikiSummary";

const splitSentences = (text: string) =>
  text
    .replace(/(\d)\.(\d)/g, "$1_$2")
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const enforceTierBounds = (text: string, tier: "tier1" | "tier2") => {
  const sentences = splitSentences(text);
  if (tier === "tier1") {
    return sentences.slice(0, 6).join(" ");
  }

  const sliced = sentences.slice(0, 3);
  const joined = sliced.join(" ");
  const words = joined.split(/\s+/).filter(Boolean);
  if (words.length <= 120) return joined;
  return `${words.slice(0, 120).join(" ").replace(/[,:;\-]+$/g, "")}.`;
};

export async function buildWikiLandmarkDescription(args: {
  landmarkName: string;
  cityName: string;
  stateName?: string;
  tier: "tier1" | "tier2";
  existingDescriptions?: string[];
}): Promise<{ description: string; wikiUrl: string | null; usedWiki: boolean; tried: string[] }> {
  const { landmarkName, cityName, stateName, tier, existingDescriptions = [] } = args;

  const wiki = await fetchWikiSummaryWithVariants({
    landmarkName,
    cityName,
    stateName,
  });

  if (!wiki.extract) {
    return { description: "", wikiUrl: null, usedWiki: false, tried: wiki.tried };
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parsed = paraphraseWikiSummary({
      extract: wiki.extract,
      landmarkName,
      cityName,
      stateName,
      tier,
    });

    const candidate = enforceTierBounds(parsed.text, tier);
    if (!candidate || findBannedPhrase(candidate)) continue;
    if (maxSimilarityAgainst(candidate, existingDescriptions) > 0.7) continue;

    if (tier === "tier1") {
      const specificity = validateTier1Specificity({
        text: candidate,
        factSignalsFromExtract: parsed.factSignals,
      });
      if (!specificity.ok) continue;
    }

    return {
      description: candidate,
      wikiUrl: wiki.wikiUrl,
      usedWiki: true,
      tried: wiki.tried,
    };
  }

  return { description: "", wikiUrl: null, usedWiki: false, tried: wiki.tried };
}
