import fs from "node:fs";
import path from "node:path";
import { buildWikiLandmarkDescription } from "../src/utils/guides/buildWikiLandmarkDescription";
import { maxSimilarityAgainst } from "../src/utils/guides/checkDescriptionSimilarity";
import { isTier1Guide } from "../src/utils/guides/isTier1Guide";
import { flushWikiSummaryCache } from "../src/utils/wiki/wikiSummary";

type Thing = { title: string; description: string; wikiUrl?: string };
type Guide = { city?: string; state?: string; tier?: "tier1" | "tier2"; thingsToDo?: Thing[] };
type Failure = { file: string; landmark: string; reason: string; tried: string[] };

const ROOT = path.resolve("src/data/guides/us");
const REPORT_PATH = path.resolve("reports/wiki-rewrite-report.json");

const walkJson = (dir: string): string[] => {
  const output: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) output.push(...walkJson(full));
    if (entry.isFile() && entry.name.endsWith(".json") && entry.name !== "index.json") output.push(full);
  }
  return output.sort();
};

const splitSentences = (text: string) =>
  text.replace(/(\d)\.(\d)/g, "$1_$2").split(/(?<=[.!?])\s+/).filter(Boolean);

const hasTwoFactDetails = (text: string) => {
  const numbers = text.match(/\b\d[\d,]*(?:\.\d+)?\b/g) ?? [];
  const proper = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}\b/g) ?? [];
  return new Set([...numbers, ...proper]).size >= 2;
};

const run = async () => {
  const files = walkJson(ROOT);

  const report = {
    totalGuides: files.length,
    updatedGuides: 0,
    totalItems: 0,
    rewrittenItems: 0,
    skippedNoData: 0,
    failures: [] as Failure[],
    byGuide: [] as Array<{ file: string; tier: "tier1" | "tier2"; rewritten: number; skipped: number }>,
  };

  for (const file of files) {
    const guide = JSON.parse(fs.readFileSync(file, "utf8")) as Guide;
    if (!guide.city || !guide.state || !Array.isArray(guide.thingsToDo)) continue;

    const tier: "tier1" | "tier2" = guide.tier === "tier1" || isTier1Guide(guide, file) ? "tier1" : "tier2";

    let changed = false;
    let rewritten = 0;
    let skipped = 0;
    const nextThings: Thing[] = [];

    for (const item of guide.thingsToDo) {
      report.totalItems += 1;
      const landmarkName = item.title.replace(/^Explore\s+/i, "").trim();

      if (tier === "tier2") {
        skipped += 1;
        report.skippedNoData += 1;
        nextThings.push(item);
        continue;
      }

      const result = await buildWikiLandmarkDescription({
        landmarkName,
        cityName: guide.city,
        stateName: guide.state,
        tier,
        existingDescriptions: nextThings.map(entry => entry.description),
      });

      if (!result.usedWiki || !result.description) {
        skipped += 1;
        report.skippedNoData += 1;
        nextThings.push(item);
        continue;
      }

      const sentenceCount = splitSentences(result.description).length;
      const words = result.description.split(/\s+/).filter(Boolean).length;

      if (tier === "tier1" && (sentenceCount < 4 || sentenceCount > 6 || words > 150)) {
        report.failures.push({ file, landmark: landmarkName, reason: "tier1 length/sentence validation", tried: result.tried });
        nextThings.push(item);
        continue;
      }

      if (tier === "tier2" && (sentenceCount < 2 || sentenceCount > 3 || words > 120)) {
        report.failures.push({ file, landmark: landmarkName, reason: "tier2 sentence/word validation", tried: result.tried });
        nextThings.push(item);
        continue;
      }

      if (!hasTwoFactDetails(result.description)) {
        report.failures.push({ file, landmark: landmarkName, reason: "insufficient factual details", tried: result.tried });
        nextThings.push(item);
        continue;
      }

      if (maxSimilarityAgainst(result.description, nextThings.map(entry => entry.description)) > 0.75) {
        report.failures.push({ file, landmark: landmarkName, reason: "high similarity in guide", tried: result.tried });
        nextThings.push(item);
        continue;
      }

      const rewrittenItem: Thing = {
        ...item,
        description: result.description,
        wikiUrl: result.wikiUrl ?? item.wikiUrl,
      };

      if (rewrittenItem.description !== item.description || rewrittenItem.wikiUrl !== item.wikiUrl) {
        changed = true;
        rewritten += 1;
        report.rewrittenItems += 1;
      }

      nextThings.push(rewrittenItem);
    }

    report.byGuide.push({ file, tier, rewritten, skipped });

    if (changed) {
      guide.thingsToDo = nextThings;
      fs.writeFileSync(file, `${JSON.stringify(guide, null, 2)}\n`, "utf8");
      report.updatedGuides += 1;
    }
  }

  flushWikiSummaryCache();
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Updated guides: ${report.updatedGuides}`);
  console.log(`Rewritten items: ${report.rewrittenItems}`);
  console.log(`Skipped (no data): ${report.skippedNoData}`);
};

run().catch(error => {
  console.error(error);
  process.exit(1);
});
