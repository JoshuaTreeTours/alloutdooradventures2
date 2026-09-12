import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { tours as routeBackedTours } from "../src/data/tours";
import { getAllEngine2Tours } from "../src/engine2/data/loadEngine2";
import { legacyFhMigratedTours } from "../src/engine6/legacyFh/registry";
import { getFareharborItemFromUrl } from "../src/lib/fareharbor";

type SourceKind = "route-backed" | "engine2" | "legacy-fh-migrated";
type Candidate = {
  key: string;
  companyShortname: string;
  itemId: string;
  titles: string[];
  sources: SourceKind[];
};
type JsonRecord = Record<string, unknown>;

const MAX_CONCURRENCY = 4;
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_ATTEMPTS = 4;
const REPORT_DIR = path.resolve("reports");
const REPORT_JSON = path.join(REPORT_DIR, "fareharbor-description-universe-audit.json");
const REPORT_MD = path.join(REPORT_DIR, "fareharbor-description-universe-audit.md");

const isRecord = (value: unknown): value is JsonRecord => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const textOf = (value: unknown) => typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
const plain = (value: string) => value
  .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
  .replace(/\[[^\]]+\]\([^)]*\)/g, match => match.replace(/^\[|\]\([^)]*\)$/g, ""))
  .replace(/<[^>]+>/g, " ")
  .replace(/[#*_>`~\-]+/g, " ")
  .replace(/\s+/g, " ")
  .trim();
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const collectCandidates = () => {
  const map = new Map<string, Candidate>();
  let unparseable = 0;
  const add = (source: SourceKind, title: string, bookingUrl: string) => {
    const ref = getFareharborItemFromUrl(bookingUrl);
    if (!ref) { unparseable += 1; return; }
    const key = `${ref.companyShortname}:${ref.itemId}`;
    const current = map.get(key);
    if (current) {
      if (title && !current.titles.includes(title)) current.titles.push(title);
      if (!current.sources.includes(source)) current.sources.push(source);
      return;
    }
    map.set(key, {
      key,
      companyShortname: ref.companyShortname,
      itemId: ref.itemId,
      titles: title ? [title] : [],
      sources: [source],
    });
  };

  for (const tour of routeBackedTours) {
    if (tour.bookingProvider === "fareharbor") add("route-backed", tour.title, tour.bookingUrl);
  }
  for (const tour of getAllEngine2Tours()) {
    if (tour.bookingProvider !== "fareharbor") continue;
    add("engine2", tour.name, tour.bookingUrl ?? tour.booking.bookingUrl);
  }
  for (const tour of legacyFhMigratedTours) add("legacy-fh-migrated", tour.title, tour.bookingUrl);

  return { entries: Array.from(map.values()).sort((a,b) => a.key.localeCompare(b.key)), unparseable };
};

const fetchJson = async (url: string) => {
  let lastStatus: number | null = null;
  let lastError: unknown = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "AOA-FH-Description-Coverage-Audit/1.0" },
        signal: controller.signal,
      });
      lastStatus = response.status;
      if (response.ok) return { status: response.status, payload: await response.json() as unknown };
      if (response.status !== 429 && response.status < 500) return { status: response.status, payload: null };
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
    await sleep(500 * (2 ** attempt) + Math.floor(Math.random() * 250));
  }
  return { status: lastStatus, payload: null, error: lastError instanceof Error ? lastError.message : String(lastError ?? "request failed") };
};

const contentUrl = (c: Candidate) => `https://fareharbor.com/api/items/v1/${encodeURIComponent(c.companyShortname)}/${encodeURIComponent(c.itemId)}/content/`;
const detailUrl = (c: Candidate) => `https://fareharbor.com/api/v1/companies/${encodeURIComponent(c.companyShortname)}/items/${encodeURIComponent(c.itemId)}/`;

const extractContent = (payload: unknown) => {
  const root = isRecord(payload) ? payload : {};
  const data = isRecord(root.data) ? root.data : root;
  const description = textOf(data.description);
  const headline = textOf(data.headline);
  const supplementalKeys = [
    "what_is_included", "what_is_not_included", "what_to_bring", "check_in_details",
    "meeting_point", "cancellation_policy", "highlight_description", "duration", "group_size",
  ];
  const supplemental = supplementalKeys
    .map(key => [key, textOf(data[key])] as const)
    .filter(([, value]) => value.length >= 20);
  return { description, headline, supplemental };
};

const extractDetail = (payload: unknown) => {
  const root = isRecord(payload) ? payload : {};
  const item = isRecord(root.item) ? root.item : root;
  return { description: textOf(item.description), headline: textOf(item.headline) };
};

const { entries, unparseable } = collectCandidates();
console.info(`[fh-description-universe] candidates=${entries.length} unparseable=${unparseable}`);

const results = new Array<any>(entries.length);
let cursor = 0;
let completed = 0;
const workers = Array.from({ length: MAX_CONCURRENCY }, async () => {
  while (true) {
    const index = cursor++;
    if (index >= entries.length) return;
    const candidate = entries[index];

    const contentResp = await fetchJson(contentUrl(candidate));
    const content = extractContent(contentResp.payload);
    let description = content.description;
    let headline = content.headline;
    let sourceEndpoint = description ? "content" : null;
    let detailStatus: number | null = null;

    if (plain(description).length < 80) {
      const detailResp = await fetchJson(detailUrl(candidate));
      detailStatus = detailResp.status;
      const detail = extractDetail(detailResp.payload);
      if (plain(detail.description).length > plain(description).length) {
        description = detail.description;
        sourceEndpoint = detail.description ? "item-detail" : sourceEndpoint;
      }
      if (!headline && detail.headline) headline = detail.headline;
    }

    const descriptionPlain = plain(description);
    const descriptionLength = descriptionPlain.length;
    const supplementalCount = content.supplemental.length;
    const usable = descriptionLength >= 100;
    const rich = descriptionLength >= 180;
    const rewriteReady = rich || (descriptionLength >= 80 && supplementalCount >= 1);

    results[index] = {
      key: candidate.key,
      sources: candidate.sources,
      title: candidate.titles[0] ?? "",
      contentStatus: contentResp.status,
      detailStatus,
      sourceEndpoint,
      descriptionLength,
      headlineLength: plain(headline).length,
      supplementalCount,
      supplementalKeys: content.supplemental.map(([key]) => key),
      usable,
      rich,
      rewriteReady,
      snippet: descriptionPlain.slice(0, 180),
      error: (contentResp as any).error ?? null,
    };

    completed += 1;
    if (completed % 250 === 0 || completed === entries.length) {
      console.info(`[fh-description-universe] ${completed}/${entries.length}`);
    }
    await sleep(35);
  }
});
await Promise.all(workers);

const count = (fn: (r: any) => boolean) => results.filter(fn).length;
const statusCounts = results.reduce<Record<string, number>>((acc, r) => {
  const key = r.contentStatus == null ? "error" : String(r.contentStatus);
  acc[key] = (acc[key] ?? 0) + 1;
  return acc;
}, {});
const summary = {
  uniqueFareHarborItems: entries.length,
  unparseableBookingUrls: unparseable,
  contentStatusCounts: statusCounts,
  withAnyDescription: count(r => r.descriptionLength > 0),
  withUsableDescription100Plus: count(r => r.usable),
  withRichDescription180Plus: count(r => r.rich),
  rewriteReady: count(r => r.rewriteReady),
  withHeadline: count(r => r.headlineLength > 0),
  withSupplementalFields: count(r => r.supplementalCount > 0),
  rewriteReadyRate: Number((count(r => r.rewriteReady) / Math.max(entries.length, 1)).toFixed(4)),
  usableRate: Number((count(r => r.usable) / Math.max(entries.length, 1)).toFixed(4)),
};

const representative = results
  .filter(r => r.rewriteReady)
  .filter((_, index) => index % Math.max(1, Math.floor(results.length / 30)) === 0)
  .slice(0, 30);
const failures = results.filter(r => !r.rewriteReady).slice(0, 30);

await mkdir(REPORT_DIR, { recursive: true });
await writeFile(REPORT_JSON, JSON.stringify({ summary, representative, failures }, null, 2), "utf8");
await writeFile(REPORT_MD, [
  "# FareHarbor Description Universe Audit",
  "",
  `- Unique FareHarbor items: ${summary.uniqueFareHarborItems}`,
  `- Any surfaced description: ${summary.withAnyDescription}`,
  `- Usable description (>=100 chars): ${summary.withUsableDescription100Plus} (${(summary.usableRate * 100).toFixed(1)}%)`,
  `- Rich description (>=180 chars): ${summary.withRichDescription180Plus}`,
  `- Rewrite-ready (>=180 chars, or >=80 chars plus structured supplemental detail): ${summary.rewriteReady} (${(summary.rewriteReadyRate * 100).toFixed(1)}%)`,
  `- Headline surfaced: ${summary.withHeadline}`,
  `- Supplemental structured fields surfaced: ${summary.withSupplementalFields}`,
  `- Content endpoint statuses: ${JSON.stringify(summary.contentStatusCounts)}`,
  "",
  "## Representative rewrite-ready samples",
  "",
  ...representative.map(r => `- ${r.key} | ${r.title} | ${r.descriptionLength} chars | ${r.supplementalCount} supplemental | ${r.snippet}`),
  "",
  "## First unresolved/thin samples",
  "",
  ...failures.map(r => `- ${r.key} | ${r.title} | status ${r.contentStatus} | ${r.descriptionLength} chars | ${r.supplementalCount} supplemental`),
].join("\n"), "utf8");

console.info(`[fh-description-universe] SUMMARY ${JSON.stringify(summary)}`);
