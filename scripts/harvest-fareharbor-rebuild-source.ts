import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { tours as routeBackedTours } from "../src/data/tours";
import { getAllEngine2Tours } from "../src/engine2/data/loadEngine2";
import { legacyFhMigratedTours } from "../src/engine6/legacyFh/registry";
import { getFareharborItemFromUrl } from "../src/lib/fareharbor";

type SourceKind = "route-backed" | "engine2" | "legacy-fh-migrated";
type SourceRecord = {
  source: SourceKind;
  id: string;
  title: string;
  route: string | null;
};
type Candidate = {
  key: string;
  companyShortname: string;
  itemId: string;
  records: SourceRecord[];
};
type JsonRecord = Record<string, unknown>;

const MAX_CONCURRENCY = 3;
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 4;
const REPORT_DIR = path.resolve("reports");
const REPORT_JSON = path.join(REPORT_DIR, "fareharbor-rebuild-harvest.json");
const REPORT_MD = path.join(REPORT_DIR, "fareharbor-rebuild-harvest.md");

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const textOf = (value: unknown) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
const plain = (value: string) =>
  value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>`~]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const addCandidate = (
  map: Map<string, Candidate>,
  source: SourceKind,
  id: string,
  title: string,
  bookingUrl: string,
  route: string | null,
) => {
  const ref = getFareharborItemFromUrl(bookingUrl);
  if (!ref) return false;
  const key = `${ref.companyShortname}:${ref.itemId}`;
  const record: SourceRecord = { source, id, title, route };
  const current = map.get(key);
  if (current) {
    if (!current.records.some(r => r.source === source && r.id === id)) {
      current.records.push(record);
    }
  } else {
    map.set(key, {
      key,
      companyShortname: ref.companyShortname,
      itemId: ref.itemId,
      records: [record],
    });
  }
  return true;
};

const collectCandidates = () => {
  const map = new Map<string, Candidate>();
  let unparseable = 0;

  for (const tour of routeBackedTours) {
    if (tour.bookingProvider !== "fareharbor") continue;
    const route = `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`;
    if (!addCandidate(map, "route-backed", tour.productCode ?? tour.id, tour.title, tour.bookingUrl, route)) {
      unparseable += 1;
    }
  }

  for (const tour of getAllEngine2Tours()) {
    if (tour.bookingProvider !== "fareharbor") continue;
    if (!addCandidate(
      map,
      "engine2",
      String(tour.id),
      tour.name,
      tour.bookingUrl ?? tour.booking.bookingUrl,
      tour.seo.canonicalPath ?? null,
    )) {
      unparseable += 1;
    }
  }

  for (const tour of legacyFhMigratedTours) {
    if (!addCandidate(
      map,
      "legacy-fh-migrated",
      tour.productCode,
      tour.title,
      tour.bookingUrl,
      tour.canonicalPath,
    )) {
      unparseable += 1;
    }
  }

  return {
    entries: Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key)),
    unparseable,
  };
};

const fetchJson = async (url: string) => {
  let lastStatus: number | null = null;
  let lastError: unknown = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "AOA-FH-Rebuild-Harvest/1.0",
        },
        signal: controller.signal,
      });
      lastStatus = response.status;
      if (response.ok) {
        return { status: response.status, payload: (await response.json()) as unknown };
      }
      if (response.status !== 429 && response.status < 500) {
        return { status: response.status, payload: null };
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
    await sleep(700 * 2 ** attempt + Math.floor(Math.random() * 350));
  }
  return {
    status: lastStatus,
    payload: null,
    error: lastError instanceof Error ? lastError.message : String(lastError ?? "request failed"),
  };
};

const IMAGE_URL = /https?:\/\/[^\s)"'<>]+/gi;
const looksLikeImage = (url: string) => {
  const v = url.toLowerCase();
  return (
    v.includes("filestackcontent.com") ||
    v.includes("cdn.fareharbor.com") ||
    /\.(?:jpe?g|png|webp|gif)(?:\?|$)/i.test(v)
  );
};
const collectImageUrls = (value: unknown, out = new Set<string>()) => {
  if (typeof value === "string") {
    for (const match of value.match(IMAGE_URL) ?? []) {
      const clean = match.replace(/[.,;:]+$/, "");
      if (looksLikeImage(clean)) out.add(clean);
    }
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectImageUrls(item, out);
    return out;
  }
  if (isRecord(value)) {
    for (const item of Object.values(value)) collectImageUrls(item, out);
  }
  return out;
};

const unwrapData = (payload: unknown) => {
  if (!isRecord(payload)) return {} as JsonRecord;
  return isRecord(payload.data) ? payload.data : payload;
};
const unwrapItem = (payload: unknown) => {
  if (!isRecord(payload)) return {} as JsonRecord;
  return isRecord(payload.item) ? payload.item : payload;
};

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
] as const;

const supplementalFrom = (record: JsonRecord) =>
  Object.fromEntries(
    supplementalKeys
      .map(key => [key, textOf(record[key])] as const)
      .filter(([, value]) => plain(value).length >= 12),
  );

const contentUrl = (c: Candidate) =>
  `https://fareharbor.com/api/items/v1/${encodeURIComponent(c.companyShortname)}/${encodeURIComponent(c.itemId)}/content/`;
const structuredUrl = (c: Candidate) =>
  `https://fareharbor.com/api/items/v1/${encodeURIComponent(c.companyShortname)}/${encodeURIComponent(c.itemId)}/structured-description/`;
const detailUrl = (c: Candidate) =>
  `https://fareharbor.com/api/v1/companies/${encodeURIComponent(c.companyShortname)}/items/${encodeURIComponent(c.itemId)}/`;

const { entries, unparseable } = collectCandidates();
console.info(`[fh-rebuild-harvest] candidates=${entries.length} unparseable=${unparseable}`);

const results = new Array<any>(entries.length);
let cursor = 0;
let completed = 0;

const workers = Array.from({ length: MAX_CONCURRENCY }, async () => {
  while (true) {
    const index = cursor++;
    if (index >= entries.length) return;
    const candidate = entries[index];

    const contentResp = await fetchJson(contentUrl(candidate));
    const content = unwrapData(contentResp.payload);
    const contentDescription = textOf(content.description);
    const contentHeadline = textOf(content.headline);
    const supplemental = supplementalFrom(content);
    const images = collectImageUrls(contentResp.payload);

    let description = contentDescription;
    let headline = contentHeadline;
    let sourceEndpoint: "content" | "structured-description" | "item-detail" | null =
      plain(contentDescription).length > 0 ? "content" : null;

    let structuredStatus: number | null = null;
    let detailStatus: number | null = null;

    if (plain(description).length < 180) {
      const structuredResp = await fetchJson(structuredUrl(candidate));
      structuredStatus = structuredResp.status;
      collectImageUrls(structuredResp.payload, images);
      const structured = unwrapData(structuredResp.payload);
      const structuredDescription = textOf(structured.description || structured.text || structured.body);
      const structuredHeadline = textOf(structured.headline || structured.title);
      if (plain(structuredDescription).length > plain(description).length) {
        description = structuredDescription;
        sourceEndpoint = "structured-description";
      }
      if (!headline && structuredHeadline) headline = structuredHeadline;
    }

    if (plain(description).length < 180 || images.size < 2) {
      const detailResp = await fetchJson(detailUrl(candidate));
      detailStatus = detailResp.status;
      collectImageUrls(detailResp.payload, images);
      const item = unwrapItem(detailResp.payload);
      const detailDescription = textOf(item.description);
      const detailHeadline = textOf(item.headline || item.name || item.title);
      if (plain(detailDescription).length > plain(description).length) {
        description = detailDescription;
        sourceEndpoint = "item-detail";
      }
      if (!headline && detailHeadline) headline = detailHeadline;
    }

    const cleanDescription = plain(description);
    const cleanHeadline = plain(headline);
    const supplementalEntries = Object.entries(supplemental).filter(([, value]) => plain(String(value)).length >= 12);
    const rewriteReady =
      cleanDescription.length >= 180 ||
      (cleanDescription.length >= 80 && supplementalEntries.length >= 1);

    results[index] = {
      key: candidate.key,
      companyShortname: candidate.companyShortname,
      itemId: candidate.itemId,
      records: candidate.records,
      statuses: {
        content: contentResp.status,
        structuredDescription: structuredStatus,
        detail: detailStatus,
      },
      sourceEndpoint,
      headline: cleanHeadline,
      description: cleanDescription,
      supplemental,
      images: Array.from(images),
      rewriteReady,
      imageReady: images.size >= 2,
      imageCount: images.size,
      error: (contentResp as any).error ?? null,
    };

    completed += 1;
    if (completed % 250 === 0 || completed === entries.length) {
      console.info(`[fh-rebuild-harvest] ${completed}/${entries.length}`);
    }
    await sleep(50);
  }
});

await Promise.all(workers);

const rewriteReady = results.filter(r => r.rewriteReady).length;
const imageReady = results.filter(r => r.imageReady).length;
const bothReady = results.filter(r => r.rewriteReady && r.imageReady).length;
const summary = {
  uniqueFareHarborItems: entries.length,
  unparseableBookingUrls: unparseable,
  rewriteReady,
  rewriteReadyRate: Number((rewriteReady / Math.max(entries.length, 1)).toFixed(4)),
  imageReadyTwoPlus: imageReady,
  imageReadyRate: Number((imageReady / Math.max(entries.length, 1)).toFixed(4)),
  rewriteAndImageReady: bothReady,
  rewriteAndImageReadyRate: Number((bothReady / Math.max(entries.length, 1)).toFixed(4)),
};

await mkdir(REPORT_DIR, { recursive: true });
await writeFile(REPORT_JSON, JSON.stringify({ summary, items: results }, null, 2), "utf8");
await writeFile(
  REPORT_MD,
  [
    "# FareHarbor Rebuild Source Harvest",
    "",
    `- Unique FareHarbor items: ${summary.uniqueFareHarborItems}`,
    `- Rewrite-ready source: ${summary.rewriteReady} (${(summary.rewriteReadyRate * 100).toFixed(1)}%)`,
    `- Two or more product images: ${summary.imageReadyTwoPlus} (${(summary.imageReadyRate * 100).toFixed(1)}%)`,
    `- Both rewrite-ready and 2+ images: ${summary.rewriteAndImageReady} (${(summary.rewriteAndImageReadyRate * 100).toFixed(1)}%)`,
    "",
    "This artifact intentionally preserves the complete normalized source description, supplemental factual fields, source-record routing, and surfaced FareHarbor image URLs for the rebuild phase.",
  ].join("\n"),
  "utf8",
);
console.info(`[fh-rebuild-harvest] SUMMARY ${JSON.stringify(summary)}`);
