import fs from "node:fs";
import path from "node:path";
import { buildWikiLandmarkDescription } from "../src/utils/guides/buildWikiLandmarkDescription";
import { fallbackLandmarkDescription } from "../src/utils/guides/fallbackLandmarkDescription";
import { maxSimilarityAgainst } from "../src/utils/guides/checkDescriptionSimilarity";
import { isTier1Guide } from "../src/utils/guides/isTier1Guide";
import { BANNED_PHRASES, findBannedPhrase } from "../src/utils/guides/validateNoBoilerplate";
import { flushWikiSummaryCache } from "../src/utils/wiki/wikiSummary";

type Thing = { title: string; description: string; wikiUrl?: string };
type Guide = { city?: string; state?: string; tier?: "tier1" | "tier2"; thingsToDo?: Thing[] };

type Failure = { file: string; landmark: string; reason: string; tried: string[] };

const ROOT = path.resolve("src/data/guides/us");
const REPORT_PATH = path.resolve("reports/wiki-rewrite-report.json");

const walkJson = (dir: string): string[] => {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkJson(full));
    if (entry.isFile() && entry.name.endsWith(".json") && entry.name !== "index.json") out.push(full);
  }
  return out.sort();
};

const sentenceCount = (text: string) =>
  text.replace(/(\d)\.(\d)/g, "$1_$2").split(/(?<=[.!?])\s+/).filter(Boolean).length;
const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

const run = async () => {
  const files = walkJson(ROOT);
  const report = {
    totalGuides: files.length,
    updatedGuides: 0,
    totalItems: 0,
    wikiItems: 0,
    fallbackItems: 0,
    wikiHitRate: 0,
    failures: [] as Failure[],
    byGuide: [] as Array<{ file: string; tier: "tier1" | "tier2"; wikiUsed: number; total: number }>,
  };

  for (const file of files) {
    const guide = JSON.parse(fs.readFileSync(file, "utf8")) as Guide;
    if (!guide.city || !guide.state || !Array.isArray(guide.thingsToDo)) continue;

    const tier: "tier1" | "tier2" = guide.tier === "tier1" || isTier1Guide(guide, file) ? "tier1" : "tier2";
    const useWikiForGuide = tier === "tier1" && guide.city === "New York";

    const next: Thing[] = [];
    let changed = false;
    let wikiUsed = 0;

    for (const item of guide.thingsToDo) {
      const landmarkName = item.title.replace(/^Explore\s+/i, "").trim();
      report.totalItems += 1;
      let description = "";
      let wikiUrl: string | null = null;
      let usedWiki = false;
      let tried: string[] = [];

      if (useWikiForGuide) {
        const res = await buildWikiLandmarkDescription({
          landmarkName,
          cityName: guide.city,
          stateName: guide.state,
          tier,
          existingDescriptions: next.map(t => t.description),
        });
        description = res.description;
        wikiUrl = res.wikiUrl;
        usedWiki = res.usedWiki;
        tried = res.tried;
      }

      if (!description || findBannedPhrase(description) || maxSimilarityAgainst(description, next.map(t => t.description)) > 0.7) {
        description = fallbackLandmarkDescription({
          landmarkName,
          cityName: guide.city,
          stateName: guide.state,
          tier,
        });
        wikiUrl = null;
        usedWiki = false;
      }

      if (tier === "tier1" && sentenceCount(description) !== 6) {
        report.failures.push({ file, landmark: landmarkName, reason: "Tier1 sentence count", tried });
      }
      if (tier === "tier2" && (sentenceCount(description) < 2 || sentenceCount(description) > 3 || wordCount(description) > 90)) {
        report.failures.push({ file, landmark: landmarkName, reason: "Tier2 length", tried });
      }

      if (usedWiki) {
        report.wikiItems += 1;
        wikiUsed += 1;
      } else {
        report.fallbackItems += 1;
      }

      const rewritten: Thing = { title: item.title, description, wikiUrl: wikiUrl ?? undefined };
      if (rewritten.description !== item.description || rewritten.wikiUrl !== item.wikiUrl) changed = true;
      next.push(rewritten);
    }

    report.byGuide.push({ file, tier, wikiUsed, total: guide.thingsToDo.length });

    if (changed) {
      guide.thingsToDo = next;
      fs.writeFileSync(file, `${JSON.stringify(guide, null, 2)}\n`);
      report.updatedGuides += 1;
    }
  }

  flushWikiSummaryCache();
  report.wikiHitRate = report.totalItems ? report.wikiItems / report.totalItems : 0;

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const allTexts = files
    .map(file => JSON.parse(fs.readFileSync(file, "utf8")) as Guide)
    .flatMap(g => g.thingsToDo ?? [])
    .map(t => t.description);
  for (const text of allTexts) {
    const banned = findBannedPhrase(text);
    if (banned) throw new Error(`Banned phrase found: ${banned}`);
  }

  const hasBannedInGuideDescriptions = (guidePath: string) => {
    const parsed = JSON.parse(fs.readFileSync(path.resolve(guidePath), "utf8")) as Guide;
    return (parsed.thingsToDo ?? []).some(item =>
      BANNED_PHRASES.some(phrase => (item.description ?? "").toLowerCase().includes(phrase))
    );
  };

  if (hasBannedInGuideDescriptions("src/data/guides/us/new-york/new-york.json")) {
    throw new Error("NYC still contains banned phrases");
  }

  if (hasBannedInGuideDescriptions("src/data/guides/us/maine/portland.json")) {
    throw new Error("Portland still contains banned phrases");
  }

  const tier1GuideGood = report.byGuide.some(g => g.tier === "tier1" && g.total > 0 && g.wikiUsed / g.total >= 0.5);
  if (!tier1GuideGood) throw new Error("No Tier-1 guide reached >=50% wiki usage");

  console.log(`Updated guides: ${report.updatedGuides}`);
  console.log(`Wiki hit rate: ${(report.wikiHitRate * 100).toFixed(1)}%`);
};

run().catch(error => {
  console.error(error);
  process.exit(1);
});
