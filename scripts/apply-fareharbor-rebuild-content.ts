import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

type SourceRecord = { source: string; id: string; title: string; route: string | null };
type HarvestItem = {
  key: string;
  records: SourceRecord[];
  description: string;
  supplemental: Record<string, string>;
  images: string[];
  rewriteReady: boolean;
  imageReady: boolean;
};
type Harvest = {
  summary: Record<string, unknown>;
  items: HarvestItem[];
};
type Enrichment = { r: boolean; k: string; p?: string[]; i?: string[] };

const root = process.cwd();
const harvestPath = path.join(root, "reports", "fareharbor-rebuild-harvest.json");
const outDir = path.join(root, "src", "utils", "fh", "rebuild");
const summaryPath = path.join(root, "reports", "fareharbor-rebuild-apply-summary.json");
const TARGET_CHUNK_BYTES = 750_000;

const PRICE_PATTERN = /(?:\$|USD\s*|US\$)\s*\d[\d,.]*(?:\s*(?:per|\/|each|pp)\b[^.;]*)?/gi;
const CTA_PATTERN = /\b(book now|reserve now|click here)\b/i;
const ws = (value: string) => value.replace(/\s+/g, " ").trim();
const stripHtml = (value: string) => value.replace(/<[^>]+>/g, " ");
const clean = (value: string) =>
  ws(
    stripHtml(value || "")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/[•|]/g, ". ")
      .replace(PRICE_PATTERN, " "),
  ).replace(/^[ .\-–—]+|[ .\-–—]+$/g, "");

const humanizeSlug = (slug: string) =>
  slug
    .split("-")
    .map(part => ({ nyc: "NYC", dc: "DC", st: "St." }[part] ?? `${part.charAt(0).toUpperCase()}${part.slice(1)}`))
    .join(" ");

const sentenceSplit = (value: string) =>
  clean(value)
    .split(/(?<=[.!?])\s+/)
    .map(part => part.replace(/^[ .;\-]+|[ .;\-]+$/g, ""))
    .filter(part => part.length >= 30 && !CTA_PATTERN.test(part));

const rewriteSentence = (value: string) => {
  let text = clean(value);
  const replacements: Array<[RegExp, string]> = [
    [/\byou're\b/gi, "guests are"],
    [/\byou'll\b/gi, "guests will"],
    [/\byou can\b/gi, "guests can"],
    [/\byour\b/gi, "their"],
    [/\byou\b/gi, "guests"],
    [/\bwe offer\b/gi, "the operator offers"],
    [/\bwe provide\b/gi, "the operator provides"],
    [/\bour\b/gi, "the operator's"],
    [/^explore\s+/i, "Guests can explore "],
    [/^enjoy\s+/i, "Guests can enjoy "],
    [/^experience\s+/i, "Guests can experience "],
    [/^join us\s+/i, "Join the local operator "],
  ];
  for (const [pattern, replacement] of replacements) text = text.replace(pattern, replacement);
  text = ws(text);
  if (text && !/[.!?]$/.test(text)) text += ".";
  return text;
};

const supplementalSentence = (supplemental: Record<string, string>) => {
  const priorities = [
    "what_is_included",
    "what_to_bring",
    "meeting_point",
    "check_in_details",
    "duration",
    "group_size",
  ];
  for (const key of priorities) {
    const raw = clean(supplemental[key] ?? "");
    if (raw.length < 20) continue;
    const value = rewriteSentence(raw).replace(/[.]$/, "");
    const lead: Record<string, string> = {
      what_is_included: "The operator lists these inclusions",
      what_to_bring: "Preparation guidance includes",
      meeting_point: "Meeting guidance includes",
      check_in_details: "Check-in guidance includes",
      duration: "Duration information",
      group_size: "Group-size information",
    };
    return `${lead[key]}: ${value}.`;
  }
  return "";
};

const truncateAtWord = (value: string, max: number) => {
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  return `${cut.slice(0, Math.max(0, cut.lastIndexOf(" ")))}…`;
};

const harvest = JSON.parse(await readFile(harvestPath, "utf8")) as Harvest;
const byRoute: Record<string, Enrichment> = {};

for (const item of harvest.items) {
  const title = item.records.find(record => record.title)?.title || "Tour";
  const images = Array.from(new Set((item.images ?? []).filter(Boolean))).slice(0, 3);
  const sourceSentences = item.rewriteReady
    ? sentenceSplit(item.description).slice(0, 2).map(rewriteSentence)
    : [];
  const supplemental = item.rewriteReady ? supplementalSentence(item.supplemental ?? {}) : "";

  for (const record of item.records) {
    if (!record.route) continue;
    const parts = record.route.split("/");
    const city = parts.length > 4 ? humanizeSlug(parts[3] ?? "") : "this destination";
    const paragraphs: string[] = [];
    if (item.rewriteReady) {
      let intro = `${title} offers travelers an operator-run experience in ${city}.`;
      if (sourceSentences.length) intro += ` ${sourceSentences.join(" ")}`;
      paragraphs.push(truncateAtWord(intro, 900));
      if (supplemental) paragraphs.push(truncateAtWord(supplemental, 500));
    }
    byRoute[record.route] = {
      r: item.rewriteReady,
      k: item.key,
      ...(paragraphs.length ? { p: paragraphs } : {}),
      ...(images.length ? { i: images } : {}),
    };
  }
}

await mkdir(outDir, { recursive: true });
for (const filename of await readdir(outDir)) {
  if (/^chunk\d+\.ts$/.test(filename)) await rm(path.join(outDir, filename));
}

await writeFile(
  path.join(outDir, "types.ts"),
  `export type FareHarborEnrichment = {\n  r: boolean;\n  k: string;\n  p?: string[];\n  i?: string[];\n};\n\nexport type FareHarborEnrichmentMap = Record<string, FareHarborEnrichment>;\n`,
  "utf8",
);

const chunks: Record<string, Enrichment>[] = [];
let current: Record<string, Enrichment> = {};
let currentBytes = 2;
for (const [route, value] of Object.entries(byRoute)) {
  const entryBytes = Buffer.byteLength(`${JSON.stringify(route)}:${JSON.stringify(value)},`, "utf8");
  if (Object.keys(current).length && currentBytes + entryBytes > TARGET_CHUNK_BYTES) {
    chunks.push(current);
    current = {};
    currentBytes = 2;
  }
  current[route] = value;
  currentBytes += entryBytes;
}
if (Object.keys(current).length) chunks.push(current);

for (let index = 0; index < chunks.length; index += 1) {
  const filename = `chunk${String(index).padStart(2, "0")}.ts`;
  await writeFile(
    path.join(outDir, filename),
    `import type { FareHarborEnrichmentMap } from "./types";\n\nconst data: FareHarborEnrichmentMap = ${JSON.stringify(chunks[index])};\nexport default data;\n`,
    "utf8",
  );
}

const imports = chunks.map((_, index) => `import c${index} from "./chunk${String(index).padStart(2, "0")}";`).join("\n");
const assign = chunks.map((_, index) => `c${index}`).join(", ");
await writeFile(
  path.join(outDir, "index.ts"),
  `import type { FareHarborEnrichment } from "./types";\n${imports}\n\nconst byRoute = Object.assign({}, ${assign}) as Record<string, FareHarborEnrichment>;\n\nexport const getFareHarborRebuildContent = (route: string | null | undefined) => {\n  if (!route) return null;\n  return byRoute[route] ?? null;\n};\n\nexport const FAREHARBOR_REBUILD_ROUTE_COUNT = ${Object.keys(byRoute).length};\n`,
  "utf8",
);

const rewriteRoutes = Object.values(byRoute).filter(value => value.r).length;
const twoImageRoutes = Object.values(byRoute).filter(value => (value.i?.length ?? 0) >= 2).length;
const skippedItems = harvest.items.filter(item => !item.rewriteReady).length;
const summary = {
  uniqueFareHarborItems: harvest.items.length,
  routeRecords: Object.keys(byRoute).length,
  rewriteReadyItems: harvest.items.filter(item => item.rewriteReady).length,
  rewriteRoutes,
  twoImageItems: harvest.items.filter(item => (item.images?.length ?? 0) >= 2).length,
  twoImageRoutes,
  skippedItems,
  generatedChunks: chunks.length,
  pricePolicy: "Never synthesize the $129 floor for unresolved FareHarbor prices; explicit stored or live-verified prices only.",
  unresolvedFareHarborCta: "Learn More",
};
await writeFile(summaryPath, JSON.stringify(summary, null, 2), "utf8");
console.info(`[fh-rebuild-apply] SUMMARY ${JSON.stringify(summary)}`);
