import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { tours as routeBackedTours } from "../src/data/tours";
import { getAllEngine2Tours } from "../src/engine2/data/loadEngine2";
import { legacyFhMigratedTours } from "../src/engine6/legacyFh/registry";
import { getFareharborItemFromUrl } from "../src/lib/fareharbor";

type Candidate = { key: string; companyShortname: string; itemId: string; title: string };
type JsonRecord = Record<string, unknown>;

const MAX_CONCURRENCY = 3;
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_ATTEMPTS = 4;
const REPORT_DIR = path.resolve("reports");
const REPORT_JSON = path.join(REPORT_DIR, "fareharbor-image-universe-audit.json");
const REPORT_MD = path.join(REPORT_DIR, "fareharbor-image-universe-audit.md");

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const isRecord = (value: unknown): value is JsonRecord => Boolean(value) && typeof value === "object" && !Array.isArray(value);

const collectCandidates = () => {
  const map = new Map<string, Candidate>();
  const add = (title: string, bookingUrl: string) => {
    const ref = getFareharborItemFromUrl(bookingUrl);
    if (!ref) return;
    const key = `${ref.companyShortname}:${ref.itemId}`;
    if (!map.has(key)) map.set(key, { key, companyShortname: ref.companyShortname, itemId: ref.itemId, title });
  };
  for (const tour of routeBackedTours) if (tour.bookingProvider === "fareharbor") add(tour.title, tour.bookingUrl);
  for (const tour of getAllEngine2Tours()) if (tour.bookingProvider === "fareharbor") add(tour.name, tour.bookingUrl ?? tour.booking.bookingUrl);
  for (const tour of legacyFhMigratedTours) add(tour.title, tour.bookingUrl);
  return Array.from(map.values()).sort((a,b) => a.key.localeCompare(b.key));
};

const fetchJson = async (url: string) => {
  let lastStatus: number | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "AOA-FH-Image-Coverage-Audit/1.0" },
        signal: controller.signal,
      });
      lastStatus = response.status;
      if (response.ok) return { status: response.status, payload: await response.json() as unknown };
      if (response.status !== 429 && response.status < 500) return { status: response.status, payload: null };
    } catch {
      // retry below
    } finally {
      clearTimeout(timeout);
    }
    await sleep(650 * (2 ** attempt) + Math.floor(Math.random() * 300));
  }
  return { status: lastStatus, payload: null };
};

const IMAGE_URL = /https?:\/\/[^\s)"'<>]+/gi;
const looksLikeImage = (url: string) => {
  const v = url.toLowerCase();
  return v.includes("filestackcontent.com") || v.includes("cdn.fareharbor.com") || /\.(?:jpe?g|png|webp|gif)(?:\?|$)/i.test(v);
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

const contentUrl = (c: Candidate) => `https://fareharbor.com/api/items/v1/${encodeURIComponent(c.companyShortname)}/${encodeURIComponent(c.itemId)}/content/`;
const detailUrl = (c: Candidate) => `https://fareharbor.com/api/v1/companies/${encodeURIComponent(c.companyShortname)}/items/${encodeURIComponent(c.itemId)}/`;

const entries = collectCandidates();
console.info(`[fh-image-universe] candidates=${entries.length}`);
const results = new Array<any>(entries.length);
let cursor = 0;
let completed = 0;

const workers = Array.from({ length: MAX_CONCURRENCY }, async () => {
  while (true) {
    const index = cursor++;
    if (index >= entries.length) return;
    const candidate = entries[index];

    const contentResp = await fetchJson(contentUrl(candidate));
    const images = collectImageUrls(contentResp.payload);
    let detailStatus: number | null = null;
    if (images.size < 2) {
      const detailResp = await fetchJson(detailUrl(candidate));
      detailStatus = detailResp.status;
      collectImageUrls(detailResp.payload, images);
    }

    results[index] = {
      key: candidate.key,
      title: candidate.title,
      contentStatus: contentResp.status,
      detailStatus,
      imageCount: images.size,
      sampleImages: Array.from(images).slice(0, 4),
      hasAtLeastTwo: images.size >= 2,
    };

    completed += 1;
    if (completed % 250 === 0 || completed === entries.length) console.info(`[fh-image-universe] ${completed}/${entries.length}`);
    await sleep(45);
  }
});
await Promise.all(workers);

const withAny = results.filter(r => r.imageCount >= 1).length;
const withTwo = results.filter(r => r.imageCount >= 2).length;
const withThree = results.filter(r => r.imageCount >= 3).length;
const summary = {
  uniqueFareHarborItems: entries.length,
  withAnyImage: withAny,
  withAtLeastTwoImages: withTwo,
  withAtLeastThreeImages: withThree,
  anyImageRate: Number((withAny / Math.max(entries.length, 1)).toFixed(4)),
  twoImageRate: Number((withTwo / Math.max(entries.length, 1)).toFixed(4)),
};

await mkdir(REPORT_DIR, { recursive: true });
await writeFile(REPORT_JSON, JSON.stringify({ summary, representative: results.filter(r => r.imageCount >= 2).slice(0, 50), thin: results.filter(r => r.imageCount < 2).slice(0, 50) }, null, 2), "utf8");
await writeFile(REPORT_MD, [
  "# FareHarbor Image Universe Audit",
  "",
  `- Unique FareHarbor items: ${summary.uniqueFareHarborItems}`,
  `- At least 1 surfaced FareHarbor image: ${summary.withAnyImage} (${(summary.anyImageRate * 100).toFixed(1)}%)`,
  `- At least 2 surfaced FareHarbor images: ${summary.withAtLeastTwoImages} (${(summary.twoImageRate * 100).toFixed(1)}%)`,
  `- At least 3 surfaced FareHarbor images: ${summary.withAtLeastThreeImages}`,
  "",
  "Rule proposed for rewrite: use a minimum of two distinct product-relevant FareHarbor images only where two or more are surfaced; never duplicate one image to meet the quota.",
].join("\n"), "utf8");
console.info(`[fh-image-universe] SUMMARY ${JSON.stringify(summary)}`);
