import fs from "node:fs";
import path from "node:path";
import { buildWikiLandmarkDescription } from "../src/utils/guides/buildWikiLandmarkDescription";
import { jaccardSimilarity } from "../src/utils/guides/checkDescriptionSimilarity";
import { isTier1Guide } from "../src/utils/guides/isTier1Guide";
import { validateNoBoilerplate } from "../src/utils/guides/validateNoBoilerplate";
import { flushWikiSummaryCache } from "../src/utils/wiki/wikiSummary";

type ThingToDo = {
  title: string;
  description: string;
  wikiUrl?: string;
};

type Guide = {
  tier?: "tier1" | "tier2";
  city?: string;
  state?: string;
  thingsToDo?: ThingToDo[];
};

type Report = {
  updatedGuides: string[];
  wikiItems: number;
  fallbackItems: number;
  failures: Array<{ file: string; reason: string }>;
};

const ROOT = path.resolve("src/data/guides/us");
const REPORT_PATH = path.resolve("reports/tier1-wiki-things-to-do.json");
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

    if (
      entry.isFile() &&
      entry.name.endsWith(".json") &&
      entry.name !== "index.json"
    ) {
      files.push(full);
    }
  }

  return files.sort();
};

const countSentences = (text: string) =>
  text
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean).length;

const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const run = async () => {
  const report: Report = {
    updatedGuides: [],
    wikiItems: 0,
    fallbackItems: 0,
    failures: [],
  };

  const files = walkGuideFiles(ROOT);

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const guide = JSON.parse(raw) as Guide;

    if (!isTier1Guide(guide, file)) {
      continue;
    }

    if (!guide.city || !guide.state || !Array.isArray(guide.thingsToDo)) {
      report.failures.push({ file, reason: "Missing city/state/thingsToDo" });
      continue;
    }

    const updatedThings: ThingToDo[] = [];
    let hadChange = false;

    for (let index = 0; index < guide.thingsToDo.length; index += 1) {
      const item = guide.thingsToDo[index];
      const existing = updatedThings.map(entry => entry.description);

      const result = await buildWikiLandmarkDescription({
        landmarkName: item.title,
        cityName: guide.city,
        stateName: guide.state,
        existingDescriptions: existing,
      });

      let description = result.description;

      if (
        !validateNoBoilerplate(description) ||
        countSentences(description) !== 3 ||
        wordCount(description) < 60 ||
        wordCount(description) > 100
      ) {
        const retry = await buildWikiLandmarkDescription({
          landmarkName: item.title,
          cityName: guide.city,
          stateName: guide.state,
          existingDescriptions: existing,
        });
        description = retry.description;
      }

      for (let retryCount = 0; retryCount < 3; retryCount += 1) {
        const similarities = updatedThings.map(existingThing =>
          jaccardSimilarity(description, existingThing.description)
        );
        const max = similarities.length ? Math.max(...similarities) : 0;

        if (max <= SIMILARITY_THRESHOLD) {
          break;
        }

        const regenerated = await buildWikiLandmarkDescription({
          landmarkName: item.title,
          cityName: guide.city,
          stateName: guide.state,
          existingDescriptions: updatedThings.map(entry => entry.description),
        });

        description = regenerated.description;
      }

      const next: ThingToDo = {
        title: item.title,
        description,
      };

      if (result.wikiUrl) {
        next.wikiUrl = result.wikiUrl;
      }

      if (item.description !== description || item.wikiUrl !== next.wikiUrl) {
        hadChange = true;
      }

      if (result.usedWiki) {
        report.wikiItems += 1;
      } else {
        report.fallbackItems += 1;
      }

      updatedThings.push(next);
    }

    if (!hadChange) {
      continue;
    }

    guide.thingsToDo = updatedThings;
    fs.writeFileSync(file, `${JSON.stringify(guide, null, 2)}\n`, "utf8");
    report.updatedGuides.push(file);
  }

  flushWikiSummaryCache();

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Updated tier1 guides: ${report.updatedGuides.length}`);
  console.log(`Items from wiki: ${report.wikiItems}`);
  console.log(`Items from fallback: ${report.fallbackItems}`);
  console.log(`Failures: ${report.failures.length}`);
};

run();
