import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type HarvestRecord = {
  route: string | null;
  title: string;
};

type HarvestItem = {
  key: string;
  records: HarvestRecord[];
  headline: string;
  description: string;
  supplemental: Record<string, string>;
  images: string[];
  rewriteReady: boolean;
};

type HarvestFile = {
  summary: Record<string, unknown>;
  items: HarvestItem[];
};

type RebuildRecord = {
  description: string;
  headline?: string;
  images: string[];
  highlights: string[];
  duration?: string;
  meetingPoint?: string;
  included?: string[];
  notIncluded?: string[];
};

const INPUT = path.resolve("reports/fareharbor-rebuild-harvest.json");
const OUTPUT = path.resolve("src/data/fareharborRebuild.generated.ts");

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();
const sentenceCase = (value: string) => {
  const text = normalizeWhitespace(value);
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
};

const titleCaseSlug = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getCityLabel = (route: string | null) => {
  if (!route) return "the destination";
  const parts = route.split("/").filter(Boolean);
  const toursIndex = parts.indexOf("tours");
  if (toursIndex <= 0) return "the destination";
  return titleCaseSlug(parts[toursIndex - 1] ?? "") || "the destination";
};

const stripPrices = (value: string) =>
  value
    .replace(/\b(?:from|starting\s+at|starts?\s+at|rates?|prices?)\s*[:\-]?\s*\$?\s*\d[\d,.]*(?:\s*(?:usd|per\s+(?:person|adult|child|hour|day)|pp))?/gi, " ")
    .replace(/\$\s*\d[\d,.]*(?:\s*(?:usd|per\s+(?:person|adult|child|hour|day)|pp))?/gi, " ")
    .replace(/\b\d+(?:\.\d+)?\s*(?:usd|dollars?)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const stripSalesLanguage = (value: string) =>
  stripPrices(value)
    .replace(/\b(?:book|reserve)\s+(?:now|today|online)\b[!,.]?/gi, " ")
    .replace(/\blimited availability\b[!,.]?/gi, " ")
    .replace(/\bdon['’]t miss\b[^.!?]*[.!?]?/gi, " ")
    .replace(/\bonce[- ]in[- ]a[- ]lifetime\b/gi, "memorable")
    .replace(/\bbucket[- ]list\b/gi, "notable")
    .replace(/\s+/g, " ")
    .trim();

const splitSentences = (value: string) =>
  (normalizeWhitespace(value).match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [])
    .map(sentence => stripSalesLanguage(sentence))
    .map(normalizeWhitespace)
    .filter(sentence => sentence.length >= 24);

const rewriteVoice = (value: string) => {
  let text = normalizeWhitespace(value)
    .replace(/^join\s+us\s+(?:for|on)\s+/i, "This experience features ")
    .replace(/^come\s+(?:and\s+)?(?:enjoy|experience|explore|discover)\s+/i, "The experience includes ")
    .replace(/^enjoy\s+/i, "The experience includes ")
    .replace(/^experience\s+/i, "Guests experience ")
    .replace(/^explore\s+/i, "Guests explore ")
    .replace(/^discover\s+/i, "Guests discover ")
    .replace(/\bwe\s+offer\b/gi, "the operator offers")
    .replace(/\bwe\s+provide\b/gi, "the operator provides")
    .replace(/\bwe\s+will\b/gi, "the operator will")
    .replace(/\bour\s+(?=[A-Za-z])/gi, "the operator's ")
    .replace(/\byou['’]ll\b/gi, "guests can")
    .replace(/\byou\s+will\b/gi, "guests can")
    .replace(/\byou\s+can\b/gi, "guests can")
    .replace(/\byour\b/gi, "the guest's")
    .replace(/\bwith\s+us\b/gi, "with the operator")
    .replace(/\s+/g, " ")
    .trim();

  if (text && !/[.!?]$/.test(text)) text += ".";
  return sentenceCase(text);
};

const cleanHeadline = (value: string) =>
  stripSalesLanguage(value)
    .replace(/[•|]+/g, " · ")
    .replace(/\s*·\s*·\s*/g, " · ")
    .replace(/^[\s·-]+|[\s·-]+$/g, "")
    .trim();

const splitList = (value?: string) => {
  if (!value) return [];
  return value
    .split(/\s*(?:\n|;|\||•|\u2022|,\s+(?=[A-Z]))\s*/)
    .map(stripSalesLanguage)
    .map(normalizeWhitespace)
    .filter(entry => entry.length >= 3 && entry.length <= 180)
    .slice(0, 8);
};

const unique = (values: string[]) =>
  Array.from(new Set(values.map(normalizeWhitespace).filter(Boolean)));

const makeDescription = (item: HarvestItem, route: string | null) => {
  const title = item.records.find(record => record.route === route)?.title ?? item.records[0]?.title ?? "This experience";
  const city = getCityLabel(route);
  const headline = cleanHeadline(item.headline);
  const sourceSentences = splitSentences(item.description)
    .map(rewriteVoice)
    .filter(sentence => sentence.length >= 28)
    .filter(sentence => !/^the experience includes\s*\.?$/i.test(sentence));

  const usefulHeadline =
    headline.length >= 20 &&
    !headline.toLowerCase().includes(title.toLowerCase()) &&
    !/^(about|overview|details)$/i.test(headline)
      ? rewriteVoice(headline)
      : "";

  const facts = unique([usefulHeadline, ...sourceSentences]).slice(0, 3);
  const duration = stripSalesLanguage(item.supplemental.duration ?? "");
  const meeting = stripSalesLanguage(
    item.supplemental.meeting_point ?? item.supplemental.check_in_details ?? "",
  );

  const lead = `${title} is a locally operated experience in ${city}.`;
  const factualBody = facts.join(" ");
  const logistics = [
    duration ? `The operator lists the duration as ${duration.replace(/[.]$/, "")}.` : "",
    meeting && meeting.length <= 220
      ? `Meeting details: ${meeting.replace(/[.]$/, "")}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return normalizeWhitespace([lead, factualBody, logistics].filter(Boolean).join(" "));
};

const makeHighlights = (item: HarvestItem) => {
  const included = splitList(item.supplemental.what_is_included);
  const bring = splitList(item.supplemental.what_to_bring);
  const source = splitSentences(item.description)
    .map(rewriteVoice)
    .map(sentence => sentence.replace(/[.!?]+$/, ""))
    .filter(sentence => sentence.length >= 20 && sentence.length <= 150);

  return unique([
    ...included.map(value => `Includes ${value.replace(/^includes?\s+/i, "")}`),
    ...bring.slice(0, 1).map(value => `Plan to bring ${value.replace(/^bring\s+/i, "")}`),
    ...source,
  ]).slice(0, 5);
};

const harvest = JSON.parse(await readFile(INPUT, "utf8")) as HarvestFile;
const byRoute: Record<string, RebuildRecord> = {};
let rewrittenRoutes = 0;
let imageTwoPlusRoutes = 0;

for (const item of harvest.items) {
  if (!item.rewriteReady) continue;

  const images = unique(item.images).slice(0, 8);
  const headline = cleanHeadline(item.headline);
  const included = splitList(item.supplemental.what_is_included);
  const notIncluded = splitList(item.supplemental.what_is_not_included);
  const duration = stripSalesLanguage(item.supplemental.duration ?? "");
  const meetingPoint = stripSalesLanguage(
    item.supplemental.meeting_point ?? item.supplemental.check_in_details ?? "",
  );
  const highlights = makeHighlights(item);

  for (const record of item.records) {
    if (!record.route) continue;
    const route = record.route.endsWith("/") ? record.route.slice(0, -1) : record.route;
    if (byRoute[route]) continue;

    const description = makeDescription(item, record.route);
    if (description.length < 100) continue;

    byRoute[route] = {
      description,
      ...(headline ? { headline } : {}),
      images,
      highlights,
      ...(duration ? { duration } : {}),
      ...(meetingPoint ? { meetingPoint } : {}),
      ...(included.length ? { included } : {}),
      ...(notIncluded.length ? { notIncluded } : {}),
    };
    rewrittenRoutes += 1;
    if (images.length >= 2) imageTwoPlusRoutes += 1;
  }
}

const content = `export type FareHarborRebuildRecord = {\n  description: string;\n  headline?: string;\n  images: string[];\n  highlights: string[];\n  duration?: string;\n  meetingPoint?: string;\n  included?: string[];\n  notIncluded?: string[];\n};\n\n// Generated from live FareHarbor source data. Do not edit by hand.\nexport const fareHarborRebuildByRoute: Record<string, FareHarborRebuildRecord> = ${JSON.stringify(byRoute, null, 2)};\n`;

await writeFile(OUTPUT, content, "utf8");
console.info(
  `[fh-rebuild-registry] routes=${rewrittenRoutes} routesWith2PlusImages=${imageTwoPlusRoutes} output=${OUTPUT}`,
);
