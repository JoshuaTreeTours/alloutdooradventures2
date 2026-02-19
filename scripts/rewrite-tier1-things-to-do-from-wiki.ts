import fs from "node:fs";
import path from "node:path";
import { buildWikiLandmarkDescription } from "../src/utils/guides/buildWikiLandmarkDescription";
import { jaccardSimilarity } from "../src/utils/guides/checkDescriptionSimilarity";
import { isGenericTravelAdvice } from "../src/utils/guides/isGenericTravelAdvice";
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
  fallbackItems: number;
  failures: Array<{ file: string; reason: string }>;
  warnings: Array<{ file: string; reason: string }>;
};

const ROOT = path.resolve("src/data/guides/us");
const REPORT_PATH = path.resolve("reports/tier1-wiki-things-to-do.json");
const REWRITE_SIMILARITY_THRESHOLD = 0.7;
const VALIDATION_SIMILARITY_THRESHOLD = 0.85;
const MIN_DESCRIPTION_CHARS = 160;

const FACT_SIGNAL_PATTERN =
  /(\b\d{4}\b|\b\d+(?:\.\d+)?\s?(?:acre|acres|mile|miles|km|sq|square|year|ft|feet|percent|%|meter|meters)\b|\b(?:opened|built|founded|established|completed|designated|renovated|expanded|constructed)\b|\b(?:architect|neighborhood|district|style|collection|campus|tower|pier|beach|museum|gallery|observatory|landmark|park|lake)\b)/i;

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

const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const isHighQuality = (text: string) => {
  const words = wordCount(text);
  const hasFactSignal = FACT_SIGNAL_PATTERN.test(text);
  const hasGenericAdvice = isGenericTravelAdvice(text);
  const isBoilerplate = !validateNoBoilerplate(text);

  return words > 45 && hasFactSignal && !hasGenericAdvice && !isBoilerplate;
};

const hasSourceUrl = (item: ThingToDo) =>
  Boolean(item.source_url?.trim() || item.wikiUrl?.trim());

const shouldRewriteDescription = (args: {
  item: ThingToDo;
  existingDescriptions: string[];
}) => {
  const { item, existingDescriptions } = args;
  const description = item.description ?? "";
  const similarityScores = existingDescriptions.map(existing =>
    jaccardSimilarity(description, existing)
  );
  const maxSimilarity = similarityScores.length ? Math.max(...similarityScores) : 0;
  const hasBoilerplate = !validateNoBoilerplate(description);
  const hasGenericAdvice = isGenericTravelAdvice(description);
  const tooShort = description.length < MIN_DESCRIPTION_CHARS;
  const missingDescription = !description.trim();

  if (hasSourceUrl(item) && isHighQuality(description) && !hasBoilerplate) {
    return false;
  }

  return (
    hasBoilerplate ||
    hasGenericAdvice ||
    maxSimilarity > REWRITE_SIMILARITY_THRESHOLD ||
    tooShort ||
    missingDescription
  );
};

const validateGuide = (file: string, guide: Guide, report: Report) => {
  const thingsToDo = guide.thingsToDo ?? [];

  for (const item of thingsToDo) {
    if (!validateNoBoilerplate(item.description)) {
      report.failures.push({
        file,
        reason: `Banned boilerplate phrase in ${item.title}`,
      });
    }

    if (item.description.length < MIN_DESCRIPTION_CHARS && !FACT_SIGNAL_PATTERN.test(item.description)) {
      report.failures.push({
        file,
        reason: `Thin description with no concrete facts for ${item.title}`,
      });
    }
  }

  for (let i = 0; i < thingsToDo.length; i += 1) {
    for (let j = i + 1; j < thingsToDo.length; j += 1) {
      const similarity = jaccardSimilarity(
        thingsToDo[i].description,
        thingsToDo[j].description
      );
      if (similarity > VALIDATION_SIMILARITY_THRESHOLD) {
        report.warnings.push({
          file,
          reason: `High similarity (${similarity.toFixed(2)}) between ${thingsToDo[i].title} and ${thingsToDo[j].title}`,
        });
      }
    }
  }
};

const run = async () => {
  const report: Report = {
    updatedGuides: [],
    wikiItems: 0,
    fallbackItems: 0,
    failures: [],
    warnings: [],
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

    for (const item of guide.thingsToDo) {
      const existing = updatedThings.map(entry => entry.description);

      if (!shouldRewriteDescription({ item, existingDescriptions: existing })) {
        updatedThings.push(item);
        continue;
      }

      let result = await buildWikiLandmarkDescription({
        landmarkName: item.title,
        cityName: guide.city,
        stateName: guide.state,
        existingDescriptions: existing,
      });

      for (let retryCount = 0; retryCount < 3; retryCount += 1) {
        const maxSimilarity = Math.max(
          0,
          ...updatedThings.map(existingThing =>
            jaccardSimilarity(result.description, existingThing.description)
          )
        );

        if (
          validateNoBoilerplate(result.description) &&
          maxSimilarity <= VALIDATION_SIMILARITY_THRESHOLD
        ) {
          break;
        }

        result = await buildWikiLandmarkDescription({
          landmarkName: item.title,
          cityName: guide.city,
          stateName: guide.state,
          existingDescriptions: updatedThings.map(entry => entry.description),
        });
      }

      const next: ThingToDo = {
        title: item.title,
        description: result.description,
      };

      if (result.wikiUrl) {
        next.source_url = result.wikiUrl;
        next.wikiUrl = result.wikiUrl;
      } else if (item.source_url) {
        next.source_url = item.source_url;
      }

      if (item.description !== next.description || item.wikiUrl !== next.wikiUrl) {
        hadChange = true;
      }

      if (result.usedWiki) {
        report.wikiItems += 1;
      } else {
        report.fallbackItems += 1;
      }

      updatedThings.push(next);
    }

    guide.thingsToDo = updatedThings;
    validateGuide(file, guide, report);

    if (hadChange) {
      fs.writeFileSync(file, `${JSON.stringify(guide, null, 2)}\n`, "utf8");
      report.updatedGuides.push(file);
    }
  }

  flushWikiSummaryCache();

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Updated tier1 guides: ${report.updatedGuides.length}`);
  console.log(`Items from wiki: ${report.wikiItems}`);
  console.log(`Items from fallback: ${report.fallbackItems}`);
  console.log(`Warnings: ${report.warnings.length}`);
  console.log(`Failures: ${report.failures.length}`);

  if (report.failures.length > 0) {
    process.exitCode = 1;
  }
};

run();
