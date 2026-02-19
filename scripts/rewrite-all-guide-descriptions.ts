import fs from "node:fs";
import path from "node:path";
import { buildWikiLandmarkDescription } from "../src/utils/guides/buildWikiLandmarkDescription";
import {
  hasHighSimilarity,
  jaccardSimilarity,
} from "../src/utils/guides/checkDescriptionSimilarity";
import { isTier1Guide } from "../src/utils/guides/isTier1Guide";
import { validateNoBoilerplate } from "../src/utils/guides/validateNoBoilerplate";
import { flushWikiSummaryCache } from "../src/utils/wiki/wikiSummary";

type ThingToDo = {
  title: string;
  description: string;
  wikiUrl?: string;
};

type GuideJson = {
  tier?: "tier1" | "tier2";
  city?: string;
  state?: string;
  thingsToDo?: ThingToDo[];
};

const ROOT = path.resolve("src/data/guides");
const SIMILARITY_THRESHOLD = 0.7;

const walkGuideFiles = (dir: string): string[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkGuideFiles(full));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".json") && entry.name !== "index.json") {
      files.push(full);
    }
  }

  return files.sort();
};

const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const sentenceCount = (text: string) =>
  text
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean).length;

const constraintsByTier = (tier: "tier1" | "tier2") =>
  tier === "tier1"
    ? { minWords: 60, maxWords: 110, minSentences: 3, maxSentences: 3 }
    : { minWords: 1, maxWords: 90, minSentences: 2, maxSentences: 3 };

const run = async () => {
  const files = walkGuideFiles(ROOT);
  let updatedGuides = 0;
  let updatedItems = 0;
  let wikiItems = 0;
  let fallbackItems = 0;

  for (const file of files) {
    const guide = JSON.parse(fs.readFileSync(file, "utf8")) as GuideJson;
    if (!guide.city || !guide.state || !Array.isArray(guide.thingsToDo)) {
      continue;
    }

    const tier: "tier1" | "tier2" = isTier1Guide(guide, file) ? "tier1" : "tier2";
    const rules = constraintsByTier(tier);

    const nextThings: ThingToDo[] = [];
    let changed = false;

    for (const current of guide.thingsToDo) {
      let result = await buildWikiLandmarkDescription({
        landmarkName: current.title,
        cityName: guide.city,
        stateName: guide.state,
        tier,
        existingDescriptions: nextThings.map(item => item.description),
      });

      let description = result.description;

      const violatesRules = () => {
        const words = wordCount(description);
        const sentences = sentenceCount(description);
        return (
          !validateNoBoilerplate(description) ||
          words < rules.minWords ||
          words > rules.maxWords ||
          sentences < rules.minSentences ||
          sentences > rules.maxSentences
        );
      };

      if (violatesRules()) {
        result = await buildWikiLandmarkDescription({
          landmarkName: current.title,
          cityName: guide.city,
          stateName: guide.state,
          tier,
          existingDescriptions: nextThings.map(item => item.description),
        });
        description = result.description;
      }

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const existingDescriptions = nextThings.map(item => item.description);
        const similarity = existingDescriptions.length
          ? Math.max(
              ...existingDescriptions.map(existing =>
                jaccardSimilarity(description, existing)
              )
            )
          : 0;

        if (
          similarity <= SIMILARITY_THRESHOLD &&
          validateNoBoilerplate(description) &&
          !hasHighSimilarity(description, existingDescriptions)
        ) {
          break;
        }

        result = await buildWikiLandmarkDescription({
          landmarkName: current.title,
          cityName: guide.city,
          stateName: guide.state,
          tier,
          existingDescriptions,
        });
        description = result.description;
      }

      if (result.usedWiki) {
        wikiItems += 1;
      } else {
        fallbackItems += 1;
      }

      const next: ThingToDo = {
        title: current.title,
        description,
      };

      if (result.wikiUrl) {
        next.wikiUrl = result.wikiUrl;
      }

      if (current.description !== next.description || current.wikiUrl !== next.wikiUrl) {
        changed = true;
        updatedItems += 1;
      }

      nextThings.push(next);
    }

    if (!changed) {
      continue;
    }

    guide.thingsToDo = nextThings;
    fs.writeFileSync(file, `${JSON.stringify(guide, null, 2)}\n`, "utf8");
    updatedGuides += 1;
  }

  flushWikiSummaryCache();

  console.log(`Updated guides: ${updatedGuides}`);
  console.log(`Updated thing descriptions: ${updatedItems}`);
  console.log(`Wiki-backed descriptions: ${wikiItems}`);
  console.log(`Fallback descriptions: ${fallbackItems}`);
};

run();
