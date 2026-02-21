import fs from "node:fs";
import path from "node:path";
import { cleanWikiLanguage } from "../src/utils/cleanWikiLanguage";
import { flushWikiSummaryCache, getWikipediaSummary } from "../src/utils/wiki/wikiRest";
import {
  assertNoBoilerplate,
  hasBoilerplate,
} from "../src/utils/guides/wikiNoBoilerplate";
import { isProtectedGuide } from "../src/utils/guides/protectedGuides";

type Thing = {
  title: string;
  description: string;
  wikiUrl?: string;
};

type Guide = {
  tier?: "tier1" | "tier2";
  city?: string;
  state?: string;
  slug?: string;
  hero?: { image?: string };
  thingsToDo?: Thing[];
};

type RewriteReport = {
  totalGuides: number;
  protectedCount: number;
  protectedSlugs: string[];
  targetedGuides: number;
  rewrittenGuides: string[];
  rewritesPerGuide: Record<string, number>;
  failedWikiLookup: Array<{ guide: string; item: string }>;
  noWikiUrl: Array<{ guide: string; item: string }>;
  dryRun: boolean;
  networkAvailable: boolean;
};

const ROOT = path.resolve("src/data/guides/us");
const REPORT_PATH = path.resolve("reports/small-town-wiki-rewrite.json");

const args = process.argv.slice(2);
const isApply = args.includes("--apply");
const isDryRun = !isApply || args.includes("--dry-run");

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

const toRouteSlug = (filePath: string) => {
  const rel = path.relative(path.resolve("src/data/guides"), filePath);
  return rel.replace(/\.json$/, "").replace(/\\/g, "/");
};

const cleanTitle = (title: string) => title.replace(/^explore\s+/i, "").trim();

const canonicalWikiUrl = (title: string, pageUrl?: string) => {
  if (pageUrl?.trim()) return pageUrl.trim();
  const normalized = title.trim().replace(/\s+/g, "_");
  if (!normalized) return undefined;
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(normalized).replace(
    /%5F/g,
    "_"
  )}`;
};

const buildFactualDescription = (title: string, city: string, extract: string) => {
  const cleaned = cleanWikiLanguage(extract).replace(/\s+/g, " ").trim();
  const sourceSentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => !hasBoilerplate(line));

  const lead = `${title} is a landmark in or near ${city}.`;
  const second = sourceSentences[0] ?? "";
  const third = sourceSentences[1] ?? "";

  const result = [lead, second, third].filter(Boolean).slice(0, 3).join(" ");
  const normalized = result.replace(/\s+/g, " ").trim();

  if (normalized.split(/(?<=[.!?])\s+/).filter(Boolean).length < 2) {
    return `${title} is a landmark in or near ${city}. Visitors come here for local character and notable natural or cultural features.`;
  }

  return normalized;
};

const resolveThingFromWiki = async (
  thing: Thing,
  city: string,
  state: string
): Promise<{ description: string; wikiUrl?: string } | null> => {
  const base = cleanTitle(thing.title);
  const candidates = [base, `${base}, ${city}`, `${base}, ${state}`, `${base} (${state})`];

  for (const candidate of candidates) {
    const summary = await getWikipediaSummary(candidate);
    if (!summary?.extract) continue;

    const description = buildFactualDescription(base, city, summary.extract);
    const wikiUrl = canonicalWikiUrl(summary.title || base, summary.pageUrl);
    assertNoBoilerplate(description);

    return { description, wikiUrl };
  }

  return null;
};

const shouldSkipItem = (item: Thing) =>
  Boolean(item.wikiUrl?.trim()) && !hasBoilerplate(item.description);

const run = async () => {
  const files = walkGuideFiles(ROOT);
  const connectivityProbe = await getWikipediaSummary("United States");
  const networkAvailable = Boolean(connectivityProbe?.extract);

  const report: RewriteReport = {
    totalGuides: files.length,
    protectedCount: 0,
    protectedSlugs: [],
    targetedGuides: 0,
    rewrittenGuides: [],
    rewritesPerGuide: {},
    failedWikiLookup: [],
    noWikiUrl: [],
    dryRun: isDryRun,
    networkAvailable,
  };

  for (const file of files) {
    const guide = JSON.parse(fs.readFileSync(file, "utf8")) as Guide;
    const routeSlug = toRouteSlug(file);

    if (!guide.city || !Array.isArray(guide.thingsToDo)) {
      continue;
    }

    if (isProtectedGuide({ ...guide, slug: routeSlug })) {
      report.protectedCount += 1;
      report.protectedSlugs.push(routeSlug);
      continue;
    }

    if (!(guide.tier === "tier2" || guide.tier !== "tier1")) {
      continue;
    }

    report.targetedGuides += 1;

    let changedCount = 0;
    const nextThings: Thing[] = [];

    for (const item of guide.thingsToDo) {
      if (shouldSkipItem(item)) {
        nextThings.push(item);
        continue;
      }

      if (!networkAvailable) {
        nextThings.push(item);
        continue;
      }

      const resolved = await resolveThingFromWiki(item, guide.city, guide.state ?? "");
      if (!resolved) {
        report.failedWikiLookup.push({ guide: routeSlug, item: item.title });
        nextThings.push(item);
        continue;
      }

      if (!resolved.wikiUrl) {
        report.noWikiUrl.push({ guide: routeSlug, item: item.title });
      }

      const nextItem: Thing = {
        ...item,
        description: resolved.description,
        ...(resolved.wikiUrl ? { wikiUrl: resolved.wikiUrl } : {}),
      };

      if (
        nextItem.description !== item.description ||
        (nextItem.wikiUrl ?? "") !== (item.wikiUrl ?? "")
      ) {
        changedCount += 1;
      }

      nextThings.push(nextItem);
    }

    if (changedCount > 0) {
      report.rewrittenGuides.push(routeSlug);
      report.rewritesPerGuide[routeSlug] = changedCount;
      if (!isDryRun) {
        guide.thingsToDo = nextThings;
        fs.writeFileSync(file, `${JSON.stringify(guide, null, 2)}\n`, "utf8");
      }
    }
  }

  flushWikiSummaryCache();
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Total guides: ${report.totalGuides}`);
  console.log(`Protected guides: ${report.protectedCount}`);
  console.log(`Targeted guides: ${report.targetedGuides}`);
  console.log(`Rewritten guides: ${report.rewrittenGuides.length}`);
  console.log(`Dry run: ${report.dryRun}`);
  console.log(`Network available: ${report.networkAvailable}`);
  console.log(`Protected slugs: ${report.protectedSlugs.join(", ")}`);
  console.log(`Report: ${REPORT_PATH}`);
};

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
