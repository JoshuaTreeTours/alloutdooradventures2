import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { toursForAudit } from "../src/data/tours.audit";
import { getFareharborItemFromUrl } from "../src/lib/fareharbor";
import { isSuppressedFareHarborBookingPage } from "../src/utils/fareharbor/suppressedBookingPages";

const SAMPLE_SIZE = 75;
const CONCURRENCY = 5;
const TIMEOUT_MS = 15000;
const OUT_DIR = path.resolve("artifacts");

const CONTROL_URL = "https://fareharbor.com/embeds/book/red-jeep/items/34849/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures";

type Candidate = {
  id: string;
  title: string;
  canonicalPath: string;
  companyShortname: string;
  itemId: string;
  bookingUrl: string;
};

type PriceHit = { token: string; amount: number | null; context: string };

type Row = Candidate & {
  httpStatus: number | null;
  finalUrl: string | null;
  contentType: string | null;
  htmlBytes: number;
  priceHits: PriceHit[];
  jsonPriceFieldHits: string[];
  apiPaths: string[];
  likelyStaticPriceVisible: boolean;
  error: string | null;
};

const hash = (value: string) => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const buildSample = () => {
  const map = new Map<string, Candidate>();
  for (const tour of toursForAudit) {
    if (tour.bookingProvider !== "fareharbor") continue;
    if (tour.engine === "engine6") continue;
    if (isSuppressedFareHarborBookingPage(tour)) continue;
    if (tour.startingPrice !== undefined && tour.startingPrice !== null && tour.startingPrice >= 20) continue;
    const bookingUrl = tour.bookingWidgetUrl || tour.bookingUrl;
    const ref = getFareharborItemFromUrl(bookingUrl);
    if (!ref) continue;
    const key = `${ref.companyShortname}:${ref.itemId}`;
    if (map.has(key)) continue;
    const canonicalPath = `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`;
    map.set(key, { id: tour.id, title: tour.title, canonicalPath, companyShortname: ref.companyShortname, itemId: ref.itemId, bookingUrl });
  }
  return Array.from(map.values()).sort((a, b) => hash(a.canonicalPath) - hash(b.canonicalPath)).slice(0, SAMPLE_SIZE);
};

const fetchText = async (url: string) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "Mozilla/5.0 (compatible; AOA-FareHarbor-Embed-Audit/1.0)",
      },
      signal: controller.signal,
    });
    return { response, text: await response.text() };
  } finally {
    clearTimeout(timer);
  }
};

const normalizeAmount = (token: string) => {
  const match = token.replace(/,/g, "").match(/(\d+(?:\.\d{1,2})?)/);
  if (!match) return null;
  const value = Number.parseFloat(match[1]);
  return Number.isFinite(value) ? value : null;
};

const collectPriceHits = (html: string) => {
  const hits: PriceHit[] = [];
  const seen = new Set<string>();
  const patterns = [
    /(?:US\$|CA\$|A\$|NZ\$|C\$|\$|€|£|¥)\s*[\d,]+(?:\.\d{1,2})?/gi,
    /(?:USD|CAD|AUD|NZD|EUR|GBP|JPY)\s*[\d,]+(?:\.\d{1,2})?/gi,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const token = match[0];
      const index = match.index ?? 0;
      const context = html.slice(Math.max(0, index - 90), Math.min(html.length, index + token.length + 90)).replace(/\s+/g, " ");
      const key = `${token}|${context}`;
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push({ token, amount: normalizeAmount(token), context });
      if (hits.length >= 30) return hits;
    }
  }
  return hits;
};

const collectJsonPriceFields = (html: string) => {
  const out: string[] = [];
  const seen = new Set<string>();
  const pattern = /["'](?:public_price|minimum_price|price|display_price|price_display|amount)["']\s*:\s*(?:["'][^"']{0,40}["']|[-\d.]+)/gi;
  for (const match of html.matchAll(pattern)) {
    const value = match[0].slice(0, 120);
    if (!seen.has(value)) {
      seen.add(value);
      out.push(value);
    }
    if (out.length >= 30) break;
  }
  return out;
};

const collectApiPaths = (html: string) => {
  const out = new Set<string>();
  const patterns = [
    /https?:\/\/fareharbor\.com\/api\/[^"'\s<]+/gi,
    /\/api\/v\d+\/[^"'\s<]+/gi,
    /\/api\/[^"'\s<]+/gi,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      out.add(match[0].replace(/&amp;/g, "&").slice(0, 300));
      if (out.size >= 30) break;
    }
  }
  return Array.from(out);
};

const audit = async (candidate: Candidate): Promise<Row> => {
  try {
    const { response, text } = await fetchText(candidate.bookingUrl);
    const priceHits = collectPriceHits(text);
    const jsonPriceFieldHits = collectJsonPriceFields(text);
    const apiPaths = collectApiPaths(text);
    return {
      ...candidate,
      httpStatus: response.status,
      finalUrl: response.url,
      contentType: response.headers.get("content-type"),
      htmlBytes: Buffer.byteLength(text),
      priceHits,
      jsonPriceFieldHits,
      apiPaths,
      likelyStaticPriceVisible: response.ok && (priceHits.length > 0 || jsonPriceFieldHits.length > 0),
      error: null,
    };
  } catch (error) {
    return { ...candidate, httpStatus: null, finalUrl: null, contentType: null, htmlBytes: 0, priceHits: [], jsonPriceFieldHits: [], apiPaths: [], likelyStaticPriceVisible: false, error: error instanceof Error ? error.message : String(error) };
  }
};

const runPool = async <T, R>(items: T[], fn: (item: T) => Promise<R>) => {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const worker = async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]);
      console.log(`[fh-embed-audit] ${i + 1}/${items.length}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker));
  return results;
};

const main = async () => {
  const sample = buildSample();
  const rows = await runPool(sample, audit);
  const controlCandidate: Candidate = { id: "control-34849", title: "Shared San Andreas Fault Jeep Tour (control)", canonicalPath: "/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849", companyShortname: "red-jeep", itemId: "34849", bookingUrl: CONTROL_URL };
  const control = await audit(controlCandidate);

  const summary = {
    generatedAt: new Date().toISOString(),
    sampledCount: rows.length,
    http200Count: rows.filter(r => r.httpStatus === 200).length,
    non200Count: rows.filter(r => r.httpStatus !== 200).length,
    staticPriceVisibleCount: rows.filter(r => r.likelyStaticPriceVisible).length,
    staticPriceVisibleRate: Number((rows.filter(r => r.likelyStaticPriceVisible).length / rows.length).toFixed(4)),
    priceTokenCount: rows.reduce((sum, r) => sum + r.priceHits.length, 0),
    jsonPriceFieldRowCount: rows.filter(r => r.jsonPriceFieldHits.length > 0).length,
    apiPathRowCount: rows.filter(r => r.apiPaths.length > 0).length,
    control34849: {
      httpStatus: control.httpStatus,
      htmlBytes: control.htmlBytes,
      priceHits: control.priceHits,
      jsonPriceFieldHits: control.jsonPriceFieldHits,
      apiPaths: control.apiPaths,
    },
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, "fareharbor-embed-pricing-audit.json"), JSON.stringify({ summary, control, rows }, null, 2) + "\n");
  await writeFile(path.join(OUT_DIR, "fareharbor-embed-pricing-audit-summary.json"), JSON.stringify(summary, null, 2) + "\n");
  console.log(`[fh-embed-audit] SUMMARY ${JSON.stringify(summary)}`);
};

main().catch(error => {
  console.error("[fh-embed-audit] FATAL", error);
  process.exitCode = 1;
});
