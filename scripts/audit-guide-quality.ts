import fs from "node:fs";
import path from "node:path";
import { getGuidePlaceClassification } from "../src/data/guidePlaceClassification";

type ThingToDo = {
  title?: string;
  description?: string;
  wikiUrl?: string;
  sourceUrl?: string;
  source_url?: string;
};

type Guide = {
  title?: string;
  state?: string;
  city?: string;
  slug?: string;
  overview?: string[];
  highlights?: Array<{ title?: string; description?: string }>;
  thingsToDo?: ThingToDo[];
  bestTimeToVisit?: { title?: string; bullets?: string[] };
  travelTips?: string[];
  faq?: Array<{ q?: string; a?: string }>;
  tours?: { stateSlug?: string; citySlug?: string };
  aboutCity?: { sections?: Array<{ heading?: string; paragraphs?: string[] }> };
};

type Issue = {
  file: string;
  severity: "error" | "warn";
  code: string;
  detail: string;
};

const ROOT = path.resolve("src/data/guides/us");
const strict = process.argv.includes("--strict");

const bannedPatterns: Array<[string, RegExp]> = [
  ["legacy-value-template", /one of the most valuable things to do/i],
  ["lexical-anchors", /lexical anchors/i],
  ["article-set", /article set/i],
  ["coverage-for", /coverage for .+ cites dated milestones/i],
  ["tier-label", /\bTier[- ]?\d\b/i],
  ["generic-strong-base", /is a strong base for travelers/i],
  ["generic-prominent-landmark", /is a prominent landmark/i],
  ["generic-cultural-landscape", /physical and cultural landscape/i],
  ["urban-park-risk", /major urban park/i],
  ["traceability-jargon", /validation and traceability/i],
  ["encyclopedic-signature", /encyclopedic signature/i],
];

const suspiciousThingTitles = [
  /^hour visitor pass$/i,
  /^visitor pass$/i,
  /^day pass$/i,
];

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith(".json") && entry.name !== "index.json"
      ? [full]
      : [];
  });

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
const textOf = (guide: Guide) =>
  normalize(
    [
      guide.title,
      ...(guide.overview ?? []),
      ...(guide.highlights ?? []).flatMap(x => [x.title, x.description]),
      ...(guide.thingsToDo ?? []).flatMap(x => [x.title, x.description]),
      guide.bestTimeToVisit?.title,
      ...(guide.bestTimeToVisit?.bullets ?? []),
      ...(guide.travelTips ?? []),
      ...(guide.faq ?? []).flatMap(x => [x.q, x.a]),
      ...(guide.aboutCity?.sections ?? []).flatMap(x => [x.heading, ...(x.paragraphs ?? [])]),
    ]
      .filter(Boolean)
      .join(" ")
  );

const issues: Issue[] = [];
const guides = walk(ROOT);
let verifiedCount = 0;
let unverifiedCount = 0;
let wikipediaFieldCount = 0;
let duplicateParagraphCount = 0;

for (const file of guides) {
  const relative = path.relative(process.cwd(), file).replaceAll("\\", "/");
  const guide = JSON.parse(fs.readFileSync(file, "utf8")) as Guide;
  const city = guide.city?.trim();
  const stateSlug = guide.tours?.stateSlug?.trim();
  const citySlug = guide.tours?.citySlug?.trim();

  if (!city || !stateSlug || !citySlug) {
    issues.push({ file: relative, severity: "error", code: "identity-missing", detail: "Guide is missing city/stateSlug/citySlug identity needed for classification." });
    continue;
  }

  const classification = getGuidePlaceClassification(stateSlug, citySlug, city);
  if (classification.verified) verifiedCount += 1;
  else {
    unverifiedCount += 1;
    issues.push({ file: relative, severity: "warn", code: "classification-unverified", detail: `${city} still uses the unverified default classification.` });
  }

  const text = textOf(guide);
  for (const [code, pattern] of bannedPatterns) {
    if (pattern.test(text)) {
      issues.push({ file: relative, severity: "error", code, detail: `Legacy or low-quality phrase matched: ${pattern}` });
    }
  }

  for (const thing of guide.thingsToDo ?? []) {
    if (suspiciousThingTitles.some(pattern => pattern.test(thing.title ?? ""))) {
      issues.push({ file: relative, severity: "error", code: "suspicious-attraction", detail: `Suspicious Things to Do entry: ${thing.title}` });
    }
    const sourceFields = [thing.wikiUrl, thing.sourceUrl, thing.source_url].filter(Boolean) as string[];
    for (const source of sourceFields) {
      if (/wikipedia\.org/i.test(source)) {
        wikipediaFieldCount += 1;
        issues.push({ file: relative, severity: "error", code: "wikipedia-item-source", detail: `Things to Do entry exposes Wikipedia source: ${thing.title ?? "untitled"}` });
      }
    }
    const description = normalize(thing.description ?? "");
    if (description.length < 120) {
      issues.push({ file: relative, severity: "warn", code: "thin-attraction-copy", detail: `${thing.title ?? "Untitled"} has only ${description.length} characters of description.` });
    }
  }

  const paragraphs = (guide.aboutCity?.sections ?? []).flatMap(section => section.paragraphs ?? []).map(normalize).filter(Boolean);
  const seen = new Set<string>();
  for (const paragraph of paragraphs) {
    if (seen.has(paragraph)) {
      duplicateParagraphCount += 1;
      issues.push({ file: relative, severity: "error", code: "duplicate-about-paragraph", detail: "The About section contains an exact repeated paragraph." });
    }
    seen.add(paragraph);
  }

  const numericTitle = guide.title?.match(/Top\s+(\d+)\s+/i);
  if (numericTitle && guide.thingsToDo?.length) {
    const claimed = Number(numericTitle[1]);
    if (claimed !== guide.thingsToDo.length) {
      issues.push({ file: relative, severity: "error", code: "title-count-mismatch", detail: `Title claims ${claimed} items but guide contains ${guide.thingsToDo.length}.` });
    }
  }

  if ((guide.overview?.length ?? 0) < 2) {
    issues.push({ file: relative, severity: "warn", code: "thin-overview", detail: "Guide has fewer than two overview paragraphs." });
  }
  if ((guide.thingsToDo?.length ?? 0) < 5) {
    issues.push({ file: relative, severity: "warn", code: "thin-things-to-do", detail: "Guide has fewer than five Things to Do entries." });
  }
  if ((guide.travelTips?.length ?? 0) < 4) {
    issues.push({ file: relative, severity: "warn", code: "thin-travel-tips", detail: "Guide has fewer than four practical travel tips." });
  }
}

const errors = issues.filter(issue => issue.severity === "error");
const warnings = issues.filter(issue => issue.severity === "warn");
const byCode = new Map<string, number>();
for (const issue of issues) byCode.set(issue.code, (byCode.get(issue.code) ?? 0) + 1);

console.log(`AOA guide quality audit`);
console.log(`Guides scanned: ${guides.length}`);
console.log(`Verified classifications: ${verifiedCount}`);
console.log(`Unverified classifications: ${unverifiedCount}`);
console.log(`Wikipedia item-source fields: ${wikipediaFieldCount}`);
console.log(`Duplicate About paragraphs: ${duplicateParagraphCount}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);
console.log("Issue counts:");
for (const [code, count] of [...byCode.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${code}: ${count}`);
}

if (issues.length) {
  console.log("\nFirst 200 issues:");
  issues.slice(0, 200).forEach(issue => console.log(`[${issue.severity}] ${issue.file} :: ${issue.code} :: ${issue.detail}`));
}

if (errors.length > 0 || (strict && warnings.length > 0)) process.exitCode = 1;
