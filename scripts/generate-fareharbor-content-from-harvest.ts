import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type SourceRecord = { source: string; id: string; title: string; route: string };
type HarvestItem = {
  key: string;
  headline?: string;
  description?: string;
  supplemental?: Record<string, string>;
  images?: string[];
  rewriteReady?: boolean;
  records: SourceRecord[];
};
type Harvest = { summary?: Record<string, unknown>; items: HarvestItem[] };
type GeneratedItem = {
  key: string;
  paragraphs: string[];
  highlights: string[];
  seoDescription: string;
  images: string[];
};

const inputPath = process.argv[2];
if (!inputPath) throw new Error("Usage: tsx scripts/generate-fareharbor-content-from-harvest.ts <harvest.json>");
const OUTPUT = path.resolve("src/data/fareharborContent.generated.json");

const clean = (value: unknown) => String(value ?? "")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();
const stripCommercial = (value: string) => value
  .replace(/(?:starting\s+(?:at|from)\s+|from\s+)?\$\s?\d+(?:\.\d{1,2})?/gi, "")
  .replace(/\b(?:USD|US\$)\s?\d+(?:\.\d{1,2})?/gi, "")
  .replace(/\bbook\s+(?:now|today)\b/gi, "")
  .replace(/\s+([,.;:!?])/g, "$1")
  .replace(/\s{2,}/g, " ")
  .trim();
const sentence = (value: string) => {
  const v = value.replace(/^[•|·\-–—:;\s]+/, "").replace(/[•|·]+/g, ", ").trim();
  if (!v) return "";
  const capped = v.charAt(0).toUpperCase() + v.slice(1);
  return /[.!?]$/.test(capped) ? capped : `${capped}.`;
};
const safeTitle = (record: SourceRecord) => stripCommercial(clean(record.title));
const routeLocation = (route: string) => {
  const parts = route.split("/").filter(Boolean);
  const toursIndex = parts.indexOf("tours");
  if (parts[0] !== "destinations" || toursIndex < 2) return "";
  const city = parts[toursIndex - 1]?.replace(/-/g, " ") ?? "";
  const region = parts[toursIndex - 2]?.replace(/-/g, " ") ?? "";
  const pretty = (v: string) => v.replace(/\b\w/g, c => c.toUpperCase());
  return city && region ? `${pretty(city)}, ${pretty(region)}` : pretty(city || region);
};
const extractDuration = (value: string) => value.match(/\b(?:about\s+|approximately\s+)?\d+(?:\.\d+)?(?:\s*(?:-|–|to)\s*\d+(?:\.\d+)?)?\s*(?:hours?|hrs?|minutes?|mins?|days?)\b/i)?.[0] ?? "";
const extractCapacity = (value: string) => value.match(/\b(?:holds?|capacity(?:\s+of)?|up to)\s+(?:up to\s+)?\d+[^.;|]{0,55}/i)?.[0] ?? "";
const extractSeason = (value: string) => value.match(/\b(?:open|available|operates?|runs?)\s+(?:from\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December)[^.;|]{0,70}/i)?.[0] ?? "";
const extractLocation = (value: string) => value.match(/\b(?:located|meet(?:ing)?|check[- ]?in)\s+(?:at|on|near|in)\s+[^.;]{6,100}/i)?.[0] ?? "";
const splitUseful = (value: string) => stripCommercial(clean(value))
  .split(/(?<=[.!?])\s+|\s*[•|·]\s*/)
  .map(s => s.trim())
  .filter(s => s.length >= 12 && s.length <= 180)
  .filter(s => !/\b(?:price|rate|cost|discount|save|book now|guarantee|best|unforgettable)\b/i.test(s));
const neutralize = (value: string) => stripCommercial(value)
  .replace(/\bwe(?:'re| are)?\b/gi, "the operator")
  .replace(/\bour\b/gi, "the operator's")
  .replace(/\bus\b/gi, "the operator")
  .replace(/\byou(?:'ll| will)?\b/gi, "guests")
  .replace(/\byour\b/gi, "guest")
  .replace(/\bcome and\b/gi, "")
  .replace(/\bdon't miss\b/gi, "includes")
  .replace(/\s+/g, " ")
  .trim();

const makeRewrite = (item: HarvestItem, record: SourceRecord): Omit<GeneratedItem, "key" | "images"> => {
  const title = safeTitle(record) || "Outdoor experience";
  const location = routeLocation(record.route);
  const headline = stripCommercial(clean(item.headline));
  const description = stripCommercial(clean(item.description));
  const supplemental = Object.fromEntries(Object.entries(item.supplemental ?? {}).map(([k, v]) => [k, stripCommercial(clean(v))]));
  const allText = `${headline}. ${description}. ${Object.values(supplemental).join(". ")}`;
  const facts: string[] = [];
  const duration = extractDuration(allText);
  const capacity = extractCapacity(allText);
  const season = extractSeason(allText);
  const meeting = extractLocation(allText);
  if (duration) facts.push(`The published format lists ${duration.toLowerCase()}.`);
  if (capacity) facts.push(sentence(neutralize(capacity)));
  if (season) facts.push(sentence(neutralize(season)));
  if (meeting) facts.push(sentence(neutralize(meeting)));
  for (const [key, value] of Object.entries(supplemental)) {
    if (!value || facts.length >= 5) break;
    const label = key === "what_is_included" ? "Included details" : key === "what_to_bring" ? "The operator recommends bringing" : key === "check_in_details" ? "Check-in guidance" : key === "meeting_point" ? "Meeting guidance" : key === "group_size" ? "Group-size guidance" : "Operator details";
    const first = splitUseful(value)[0] ?? value.slice(0, 130);
    if (first) facts.push(sentence(`${label}: ${neutralize(first)}`));
  }
  const descriptionFacts = splitUseful(description).map(neutralize).filter(Boolean);
  for (const fact of descriptionFacts) {
    if (facts.length >= 5) break;
    const normalized = fact.replace(/^curious about\s+/i, "").replace(/^when guests?\s+/i, "");
    if (normalized.length >= 18 && !facts.some(existing => existing.toLowerCase().includes(normalized.toLowerCase().slice(0, 35)))) {
      facts.push(sentence(normalized));
    }
  }
  const lead = location
    ? `${title} is an operator-listed experience in ${location}, with the page focused on the specific activity rather than a generic destination summary.`
    : `${title} is an operator-listed experience with activity-specific details drawn from the current FareHarbor listing.`;
  const detail1 = facts[0] ?? (headline ? sentence(`The operator highlights ${neutralize(headline).toLowerCase()}`) : "Current operator details are available through the linked FareHarbor listing.");
  const detail2 = facts[1] ?? facts[2] ?? "The listing is presented without an assumed price so availability and current terms can be checked directly with the operator.";
  const paragraphs = [sentence(lead), `${detail1} ${detail2}`.trim()];
  const highlights = facts.slice(0, 5).map(f => f.replace(/[.]$/, ""));
  if (!highlights.length && headline) highlights.push(neutralize(headline).slice(0, 140));
  const seoBase = location ? `${title} in ${location}. ${highlights[0] ?? "See current operator details, availability and tour information."}` : `${title}. ${highlights[0] ?? "See current operator details, availability and tour information."}`;
  const seoDescription = seoBase.replace(/\s+/g, " ").slice(0, 165).replace(/\s+\S*$/, "").trim();
  return { paragraphs, highlights, seoDescription };
};

const harvest = JSON.parse(await readFile(inputPath, "utf8")) as Harvest;
const items: Record<string, GeneratedItem> = {};
let ready = 0;
let twoPlus = 0;
let routes = 0;
for (const item of harvest.items) {
  if (!item.rewriteReady) continue;
  ready += 1;
  const images = Array.from(new Set((item.images ?? []).filter(Boolean))).slice(0, 6);
  if (images.length >= 2) twoPlus += 1;
  const seenRoutes = new Set<string>();
  for (const record of item.records ?? []) {
    if (!record.route || seenRoutes.has(record.route)) continue;
    seenRoutes.add(record.route);
    const rewrite = makeRewrite(item, record);
    items[record.route] = { key: item.key, ...rewrite, images };
    routes += 1;
  }
}
const result = {
  generatedAt: new Date().toISOString(),
  summary: {
    sourceItems: harvest.items.length,
    rewriteReady: ready,
    rewrittenRoutes: Object.keys(items).length,
    withTwoPlusImages: twoPlus,
  },
  items,
};
await writeFile(OUTPUT, `${JSON.stringify(result)}\n`, "utf8");
console.info(`[fh-rebuild] SUMMARY ${JSON.stringify(result.summary)}`);
