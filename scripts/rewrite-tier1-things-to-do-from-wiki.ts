import fs from "node:fs";
import path from "node:path";
import { CITY_TIER1_SLUGS } from "../src/data/cityTier1";
import { buildWikiLandmarkDescription } from "../src/utils/guides/buildWikiLandmarkDescription";
import { jaccardSimilarity } from "../src/utils/guides/checkDescriptionSimilarity";
import { isTier1Guide } from "../src/utils/guides/isTier1Guide";
import { validateNoBoilerplate } from "../src/utils/guides/validateNoBoilerplate";
import { flushWikiSummaryCache } from "../src/utils/wiki/wikiSummary";

type ThingToDo = {
  title: string;
  description: string;
  wikiUrl?: string;
  source_url?: string;
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
  failures: Array<{ file: string; reason: string }>;
  warnings: Array<{ file: string; reason: string }>;
};

const ROOT = path.resolve("src/data/guides/us");
const REPORT_PATH = path.resolve("reports/tier1-wiki-things-to-do.json");
const MIN_WORDS = 100;
const MIN_FACT_SIGNALS = 2;
const SIMILARITY_THRESHOLD = 0.85;
const TOP20_CITY_SLUGS = new Set([
  "los-angeles",
  "san-diego",
  "san-francisco",
  "sacramento",
  "phoenix",
  "denver",
  "chicago",
  "new-york",
  "miami",
  "boston",
  "washington",
  "orlando",
  "philadelphia",
  "las-vegas",
  "portland",
  "seattle",
  "anaheim",
  "long-beach",
  "san-jose",
  "nashville",
]);

const FACT_SIGNAL_PATTERN =
  /(\b\d{4}\b|\b\d+(?:\.\d+)?\s?(?:acre|acres|mile|miles|km|sq|square|year|ft|feet|percent|%|meter|meters)\b|\b(?:opened|built|founded|established|completed|designated|renovated|expanded|constructed|incorporated)\b|\b(?:architect|neighborhood|district|style|collection|campus|tower|pier|beach|museum|gallery|observatory|bridge|park|landmark)\b)/gi;

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

const countFactSignals = (text: string) => {
  const matches = text.match(FACT_SIGNAL_PATTERN) ?? [];
  return new Set(matches.map(value => value.toLowerCase())).size;
};

const isValidDescription = (text: string) =>
  validateNoBoilerplate(text) &&
  wordCount(text) >= MIN_WORDS &&
  countFactSignals(text) >= MIN_FACT_SIGNALS;

const run = async () => {
  const report: Report = {
    updatedGuides: [],
    wikiItems: 0,
    failures: [],
    warnings: [],
  };

  const files = walkGuideFiles(ROOT);

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const guide = JSON.parse(raw) as Guide;
    const citySlug = path.basename(file, ".json");

    if (!isTier1Guide(guide, file) || !TOP20_CITY_SLUGS.has(citySlug)) {
      continue;
    }

    if (!CITY_TIER1_SLUGS.includes(citySlug)) {
      continue;
    }

    if (!guide.city || !guide.state || !Array.isArray(guide.thingsToDo)) {
      report.failures.push({ file, reason: "Missing city/state/thingsToDo" });
      continue;
    }

    const updatedThings: ThingToDo[] = [];

    for (const item of guide.thingsToDo) {
      let chosen = await buildWikiLandmarkDescription({
        landmarkName: item.title,
        cityName: guide.city,
        stateName: guide.state,
        existingDescriptions: updatedThings.map(entry => entry.description),
      });

      for (let attempt = 0; attempt < 3; attempt += 1) {
        if (
          isValidDescription(chosen.description) &&
          !updatedThings.some(existing => jaccardSimilarity(chosen.description, existing.description) > SIMILARITY_THRESHOLD)
        ) {
          break;
        }

        chosen = await buildWikiLandmarkDescription({
          landmarkName: item.title,
          cityName: guide.city,
          stateName: guide.state,
          existingDescriptions: updatedThings.map(entry => entry.description),
        });
      }

      const next: ThingToDo = {
        title: item.title,
        description: chosen.description,
        source_url: chosen.wikiUrl ?? item.source_url,
        wikiUrl: chosen.wikiUrl ?? item.wikiUrl,
      };

      updatedThings.push(next);
      if (chosen.usedWiki) {
        report.wikiItems += 1;
      }
    }

    guide.thingsToDo = updatedThings;

    for (const item of updatedThings) {
      if (!validateNoBoilerplate(item.description)) {
        report.failures.push({
          file,
          reason: `Banned boilerplate phrase in ${item.title}`,
        });
      }

      if (wordCount(item.description) < MIN_WORDS || countFactSignals(item.description) < MIN_FACT_SIGNALS) {
        report.failures.push({
          file,
          reason: `Description rule failure in ${item.title}`,
        });
      }
    }

    for (let i = 0; i < updatedThings.length; i += 1) {
      for (let j = i + 1; j < updatedThings.length; j += 1) {
        const similarity = jaccardSimilarity(updatedThings[i].description, updatedThings[j].description);
        if (similarity > SIMILARITY_THRESHOLD) {
          report.warnings.push({
            file,
            reason: `High similarity (${similarity.toFixed(2)}) between ${updatedThings[i].title} and ${updatedThings[j].title}`,
          });
        }
      }
    }

    fs.writeFileSync(file, `${JSON.stringify(guide, null, 2)}\n`, "utf8");
    report.updatedGuides.push(file);
  }

  flushWikiSummaryCache();

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Updated tier1 guides: ${report.updatedGuides.length}`);
  console.log(`Items from wiki: ${report.wikiItems}`);
  console.log(`Warnings: ${report.warnings.length}`);
  console.log(`Failures: ${report.failures.length}`);

  if (report.failures.length > 0) {
    process.exitCode = 1;
  }
};

run();
