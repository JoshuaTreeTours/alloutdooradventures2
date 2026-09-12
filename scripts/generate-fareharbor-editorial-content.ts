import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { tours as routeBackedTours } from "../src/data/tours";
import { getAllEngine2Tours } from "../src/engine2/data/loadEngine2";
import { getFareharborItemFromUrl } from "../src/lib/fareharbor";
import {
  buildFareHarborEditorial,
  type FareHarborEditorialEntry,
} from "../src/utils/fh/buildFareHarborEditorial";

type Candidate = {
  key: string;
  companyShortname: string;
  itemId: string;
  title: string;
  city: string;
  region: string;
  country: string;
  operator: string;
  type: "tour" | "rental";
  activity: string;
  sources: string[];
};

type JsonRecord = Record<string, unknown>;

type FetchResult = {
  status: number | null;
  payload: unknown;
  endpoint: string | null;
  error?: string;
};

const MAX_CONCURRENCY = Number(process.env.FH_EDITORIAL_CONCURRENCY ?? 4);
const MAX_ATTEMPTS = 5;
const REQUEST_TIMEOUT_MS = 15_000;
const INTER_REQUEST_DELAY_MS = 45;
const OUTPUT_PATH = path.resolve("src/data/fareharborEditorial.generated.json");
const REPORT_PATH = path.resolve("reports/fareharbor-editorial-rebuild.md");

const clean = (value?: string | null) => (value ?? "").replace(/\s+/g, " ").trim();
const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const textValue = (value: unknown): string => {
  if (typeof value === "string") return clean(value);
  if (Array.isArray(value)) {
    return value.map(textValue).filter(Boolean).join(" ");
  }
  if (isRecord(value)) {
    const likelyKeys = ["text", "description", "name", "title", "label", "content", "value"];
    const likely = likelyKeys.map(key => textValue(value[key])).filter(Boolean);
    if (likely.length) return likely.join(" ");
    return Object.values(value).map(textValue).filter(Boolean).join(" ");
  }
  return "";
};

const collectCandidates = () => {
  const byKey = new Map<string, Candidate>();
  let unparseable = 0;

  const add = (input: Omit<Candidate, "key" | "companyShortname" | "itemId"> & { bookingUrl: string }) => {
    const ref = getFareharborItemFromUrl(input.bookingUrl);
    if (!ref) {
      unparseable += 1;
      return;
    }
    const key = `${ref.companyShortname}:${ref.itemId}`;
    const current = byKey.get(key);
    if (current) {
      current.sources = Array.from(new Set([...current.sources, ...input.sources]));
      if (!current.operator && input.operator) current.operator = input.operator;
      if ((!current.city || current.city === "Unknown") && input.city) current.city = input.city;
      if ((!current.region || current.region === "Unknown") && input.region) current.region = input.region;
      if (!current.activity && input.activity) current.activity = input.activity;
      if (current.type !== "rental" && input.type === "rental") current.type = "rental";
      return;
    }
    byKey.set(key, {
      key,
      companyShortname: ref.companyShortname,
      itemId: ref.itemId,
      title: input.title,
      city: input.city,
      region: input.region,
      country: input.country,
      operator: input.operator,
      type: input.type,
      activity: input.activity,
      sources: input.sources,
    });
  };

  for (const tour of routeBackedTours) {
    if (tour.bookingProvider !== "fareharbor" || tour.engine === "engine6") continue;
    add({
      bookingUrl: tour.bookingUrl,
      title: tour.title,
      city: tour.destination.city,
      region: tour.destination.state || tour.destination.country || "Unknown",
      country: tour.destination.country || "",
      operator: tour.operator || "",
      type: tour.type === "rental" ? "rental" : "tour",
      activity: tour.primaryDisplayCategory || tour.primaryCategory || tour.activitySlugs[0] || "",
      sources: ["route-backed"],
    });
  }

  for (const tour of getAllEngine2Tours()) {
    if ((tour.bookingProvider ?? "fareharbor") !== "fareharbor" || tour.engine === "engine3") continue;
    add({
      bookingUrl: tour.bookingUrl ?? tour.booking.bookingUrl,
      title: tour.name,
      city: tour.geo.city,
      region: tour.geo.region || tour.geo.country || "Unknown",
      country: tour.geo.country || "",
      operator: tour.provider.name || "",
      type: tour.type === "rental" ? "rental" : "tour",
      activity: tour.type === "rental" ? "rentals" : "",
      sources: ["engine2"],
    });
  }

  return {
    candidates: [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key)),
    unparseable,
  };
};

const getRetryAfterMs = (response: Response) => {
  const raw = response.headers.get("retry-after");
  if (!raw) return null;
  const seconds = Number(raw);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(raw);
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : null;
};

const fetchJson = async (url: string): Promise<FetchResult> => {
  let lastStatus: number | null = null;
  let lastError = "";
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "AOA-FareHarbor-Editorial-Rebuild/1.0",
        },
        signal: controller.signal,
      });
      lastStatus = response.status;
      if (response.ok) {
        return { status: response.status, payload: await response.json(), endpoint: url };
      }
      lastError = `HTTP ${response.status}`;
      if (response.status !== 429 && response.status < 500) {
        return { status: response.status, payload: null, endpoint: url, error: lastError };
      }
      const retryAfter = getRetryAfterMs(response);
      await sleep(retryAfter ?? 650 * (2 ** attempt) + Math.floor(Math.random() * 350));
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      await sleep(650 * (2 ** attempt) + Math.floor(Math.random() * 350));
    } finally {
      clearTimeout(timeout);
    }
  }
  return { status: lastStatus, payload: null, endpoint: url, error: lastError || "request failed" };
};

const urlsFor = (candidate: Candidate) => ({
  content: `https://fareharbor.com/api/items/v1/${encodeURIComponent(candidate.companyShortname)}/${encodeURIComponent(candidate.itemId)}/content/`,
  structured: `https://fareharbor.com/api/items/v1/${encodeURIComponent(candidate.companyShortname)}/${encodeURIComponent(candidate.itemId)}/structured-description/`,
  detail: `https://fareharbor.com/api/v1/companies/${encodeURIComponent(candidate.companyShortname)}/items/${encodeURIComponent(candidate.itemId)}/`,
});

const extractPayload = (payload: unknown) => {
  const root = isRecord(payload) ? payload : {};
  const data = isRecord(root.data) ? root.data : root;
  const item = isRecord(root.item) ? root.item : data;
  const primary = isRecord(data) ? data : item;

  const description = textValue(primary.description) || textValue(item.description);
  const headline = textValue(primary.headline) || textValue(item.headline);
  const supplementalKeys = [
    "what_is_included",
    "what_is_not_included",
    "what_to_bring",
    "check_in_details",
    "meeting_point",
    "cancellation_policy",
    "highlight_description",
    "duration",
    "group_size",
  ];
  const supplemental: Record<string, string> = {};
  for (const key of supplementalKeys) {
    const value = textValue(primary[key]) || textValue(item[key]);
    if (value) supplemental[key] = value;
  }

  return { description, headline, supplemental };
};

const hashSource = (description: string, headline: string, supplemental: Record<string, string>) => {
  const payload = JSON.stringify({ description, headline, supplemental });
  return createHash("sha256").update(payload).digest("hex").slice(0, 20);
};

const resolveSource = async (candidate: Candidate) => {
  const urls = urlsFor(candidate);
  const contentResponse = await fetchJson(urls.content);
  let chosen = extractPayload(contentResponse.payload);
  let chosenResponse = contentResponse;
  let endpointLabel = "content";

  const sourceLength = clean(`${chosen.headline} ${chosen.description} ${Object.values(chosen.supplemental).join(" ")}`).length;
  if (sourceLength < 80) {
    const structuredResponse = await fetchJson(urls.structured);
    const structured = extractPayload(structuredResponse.payload);
    const structuredLength = clean(`${structured.headline} ${structured.description} ${Object.values(structured.supplemental).join(" ")}`).length;
    if (structuredLength > sourceLength) {
      chosen = structured;
      chosenResponse = structuredResponse;
      endpointLabel = "structured-description";
    }
  }

  const chosenLength = clean(`${chosen.headline} ${chosen.description} ${Object.values(chosen.supplemental).join(" ")}`).length;
  if (chosenLength < 80) {
    const detailResponse = await fetchJson(urls.detail);
    const detail = extractPayload(detailResponse.payload);
    const detailLength = clean(`${detail.headline} ${detail.description} ${Object.values(detail.supplemental).join(" ")}`).length;
    if (detailLength > chosenLength) {
      chosen = detail;
      chosenResponse = detailResponse;
      endpointLabel = "item-detail";
    }
  }

  return {
    ...chosen,
    status: chosenResponse.status,
    endpoint: endpointLabel,
    sourceHash: hashSource(chosen.description, chosen.headline, chosen.supplemental),
  };
};

const { candidates, unparseable } = collectCandidates();
console.info(`[fh-editorial] unique FareHarbor candidates=${candidates.length} unparseable=${unparseable}`);

const results = new Array<[string, FareHarborEditorialEntry]>(candidates.length);
let cursor = 0;
let completed = 0;
let sourceBacked = 0;
let content200 = 0;

const workers = Array.from({ length: Math.max(1, MAX_CONCURRENCY) }, async () => {
  while (true) {
    const index = cursor++;
    if (index >= candidates.length) return;
    const candidate = candidates[index];

    const source = await resolveSource(candidate);
    if (source.status === 200) content200 += 1;
    const entry = buildFareHarborEditorial({
      key: candidate.key,
      title: candidate.title,
      city: candidate.city,
      region: candidate.region,
      country: candidate.country,
      operator: candidate.operator,
      type: candidate.type,
      activity: candidate.activity,
      description: source.description,
      headline: source.headline,
      supplemental: source.supplemental,
      sourceStatus: source.status,
      sourceEndpoint: source.endpoint,
      sourceHash: source.sourceHash,
    });
    if (entry.sourceBacked) sourceBacked += 1;
    results[index] = [candidate.key, entry];

    completed += 1;
    if (completed % 250 === 0 || completed === candidates.length) {
      console.info(`[fh-editorial] ${completed}/${candidates.length} sourceBacked=${sourceBacked}`);
    }
    await sleep(INTER_REQUEST_DELAY_MS);
  }
});

await Promise.all(workers);

const items = Object.fromEntries(results);
const summary = {
  total: candidates.length,
  sourceBacked,
  metadataFallback: candidates.length - sourceBacked,
  content200,
  contentOther: candidates.length - content200,
  unparseable,
  sourceBackedRate: Number((sourceBacked / Math.max(candidates.length, 1)).toFixed(4)),
};

const generatedAt = new Date().toISOString();
await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(
  OUTPUT_PATH,
  `${JSON.stringify({ generatedAt, summary, items }, null, 2)}\n`,
  "utf8"
);

const representative = candidates
  .filter((_, index) => index % Math.max(1, Math.floor(candidates.length / 24)) === 0)
  .slice(0, 24)
  .map(candidate => [candidate, items[candidate.key]] as const);
const brussels = candidates
  .filter(candidate => /brussels/i.test(`${candidate.city} ${candidate.region} ${candidate.title}`))
  .slice(0, 12)
  .map(candidate => [candidate, items[candidate.key]] as const);

await mkdir(path.dirname(REPORT_PATH), { recursive: true });
await writeFile(
  REPORT_PATH,
  [
    "# FareHarbor Editorial Rebuild",
    "",
    `Generated: ${generatedAt}`,
    `Unique FareHarbor items: ${summary.total}`,
    `Source-backed editorial: ${summary.sourceBacked} (${(summary.sourceBackedRate * 100).toFixed(1)}%)`,
    `Metadata-safe fallback editorial: ${summary.metadataFallback}`,
    `Source requests resolving with HTTP 200: ${summary.content200}`,
    `Unparseable booking URLs: ${summary.unparseable}`,
    "",
    "## Guarantees",
    "",
    "- No raw FareHarbor description bodies are committed to the registry.",
    "- Editorial text is regenerated from extracted facts, destination metadata, and structured trip details.",
    "- Engine6 records are excluded from this rebuild.",
    "- Pricing and ratings are not changed by this rebuild.",
    "",
    "## Representative generated entries",
    "",
    ...representative.flatMap(([candidate, entry]) => [
      `### ${candidate.key} — ${candidate.title}`,
      `- Destination: ${candidate.city}, ${candidate.region}`,
      `- Source-backed: ${entry.sourceBacked}`,
      `- Source fields: ${entry.sourceFields.join(", ") || "metadata only"}`,
      `- Overview: ${entry.overview.replace(/\n+/g, " ")}`,
      `- Highlights: ${entry.highlights.join(" | ")}`,
      "",
    ]),
    "## Brussels checks",
    "",
    ...(brussels.length
      ? brussels.flatMap(([candidate, entry]) => [
          `### ${candidate.key} — ${candidate.title}`,
          `- Destination: ${candidate.city}, ${candidate.region}`,
          `- Source-backed: ${entry.sourceBacked}`,
          `- Overview: ${entry.overview.replace(/\n+/g, " ")}`,
          "",
        ])
      : ["No FareHarbor candidate with Brussels in its current catalog metadata was found.", ""]),
  ].join("\n"),
  "utf8"
);

console.info(`[fh-editorial] SUMMARY ${JSON.stringify(summary)}`);
