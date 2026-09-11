import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { toursForAudit } from "../src/data/tours.audit";
import { getFareharborItemFromUrl } from "../src/lib/fareharbor";
import { isSuppressedFareHarborBookingPage } from "../src/utils/fareharbor/suppressedBookingPages";

const SAMPLE_SIZE = 75;
const CONCURRENCY = 5;
const TIMEOUT_MS = 12000;
const OUT_DIR = path.resolve("artifacts");

type Candidate = {
  id: string;
  title: string;
  canonicalPath: string;
  companyShortname: string;
  itemId: string;
  bookingUrl: string;
  asn: string;
};

type Row = Candidate & {
  status: number | null;
  endpoint: string;
  currency: string | null;
  decimalPlaces: number | null;
  itemCount: number;
  lowPrice: number | null;
  highPrice: number | null;
  adultPrice: number | null;
  childPrice: number | null;
  infantPrice: number | null;
  breakdown: Array<{ label: string; price: number | null; minPartySize: number | null }>;
  confidence: "high" | "medium" | "none";
  safeToAutomate: boolean;
  reason: string;
  error: string | null;
};

const hash = (value: string) => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

const getAsn = (url: string) => {
  try { return new URL(url).searchParams.get("asn") || "fhdn"; } catch { return "fhdn"; }
};

const buildCohort = () => {
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
    map.set(key, { id: tour.id, title: tour.title, canonicalPath, companyShortname: ref.companyShortname, itemId: ref.itemId, bookingUrl, asn: getAsn(bookingUrl) });
  }
  return Array.from(map.values()).sort((a,b) => hash(a.canonicalPath)-hash(b.canonicalPath));
};

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const numberValue = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;
const labelOf = (record: Record<string, unknown>) => {
  for (const key of ["singular", "name", "label", "title", "plural"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

const fetchJson = async (url: string) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "AOA-FareHarbor-PricePreview-Audit/1.0" }, signal: controller.signal });
    let payload: unknown = null;
    if (response.ok) payload = await response.json();
    return { response, payload };
  } finally { clearTimeout(timer); }
};

const auditOne = async (candidate: Candidate): Promise<Row> => {
  const endpoint = `https://fareharbor.com/api/embed/${encodeURIComponent(candidate.companyShortname)}/price-preview/per-item/v2/?asn=${encodeURIComponent(candidate.asn)}&item_pks=${encodeURIComponent(candidate.itemId)}&include_breakdown=yes&allow_unlisted_items=yes`;
  try {
    const { response, payload } = await fetchJson(endpoint);
    if (!response.ok || !isRecord(payload)) {
      return { ...candidate, status: response.status, endpoint, currency: null, decimalPlaces: null, itemCount: 0, lowPrice: null, highPrice: null, adultPrice: null, childPrice: null, infantPrice: null, breakdown: [], confidence: "none", safeToAutomate: false, reason: `HTTP ${response.status}`, error: null };
    }

    const details = isRecord(payload.details) ? payload.details : {};
    const currency = typeof details.currency === "string" ? details.currency.toUpperCase() : null;
    const decimalPlaces = numberValue(details.currency_decimal_places);
    const divisor = decimalPlaces === null ? 100 : 10 ** decimalPlaces;
    const items = Array.isArray(payload.items) ? payload.items.filter(isRecord) : [];
    if (!items.length) {
      return { ...candidate, status: response.status, endpoint, currency, decimalPlaces, itemCount: 0, lowPrice: null, highPrice: null, adultPrice: null, childPrice: null, infantPrice: null, breakdown: [], confidence: "none", safeToAutomate: false, reason: "Price-preview endpoint reachable but returned no priced item", error: null };
    }

    const price = isRecord(items[0].price) ? items[0].price : {};
    const lowRaw = numberValue(price.low);
    const highRaw = numberValue(price.high);
    const lowPrice = lowRaw === null ? null : lowRaw / divisor;
    const highPrice = highRaw === null ? null : highRaw / divisor;
    const breakdownRecord = isRecord(price.breakdown) ? price.breakdown : {};
    const customerTypes = Array.isArray(breakdownRecord.customer_types) ? breakdownRecord.customer_types.filter(isRecord) : [];
    const breakdown = customerTypes.map(entry => ({
      label: labelOf(entry),
      price: numberValue(entry.price) === null ? null : (numberValue(entry.price)! / divisor),
      minPartySize: numberValue(entry.min_party_size),
    }));

    const labeled = (pattern: RegExp) => {
      const values = breakdown.filter(v => pattern.test(v.label) && v.price !== null).map(v => v.price!);
      return values.length ? Math.min(...values) : null;
    };
    const adultPrice = labeled(/\badult\b/i);
    const childPrice = labeled(/\bchild|youth|teen\b/i);
    const infantPrice = labeled(/\binfant|baby\b/i);

    let confidence: Row["confidence"] = "none";
    let safeToAutomate = false;
    let reason = "Price preview found, but pricing semantics require product-type review";
    if (adultPrice !== null && currency) {
      confidence = "high";
      safeToAutomate = true;
      reason = "Explicit Adult customer-type price returned by FareHarbor price-preview endpoint";
    } else if (lowPrice !== null && currency) {
      confidence = "medium";
      safeToAutomate = true;
      reason = breakdown.length <= 1
        ? "FareHarbor returned a single low price with known currency"
        : "FareHarbor returned an authoritative low price plus customer-type breakdown; usable as From price but unit semantics should be retained";
    }

    return { ...candidate, status: response.status, endpoint, currency, decimalPlaces, itemCount: items.length, lowPrice, highPrice, adultPrice, childPrice, infantPrice, breakdown, confidence, safeToAutomate, reason, error: null };
  } catch (error) {
    return { ...candidate, status: null, endpoint, currency: null, decimalPlaces: null, itemCount: 0, lowPrice: null, highPrice: null, adultPrice: null, childPrice: null, infantPrice: null, breakdown: [], confidence: "none", safeToAutomate: false, reason: "Request exception", error: error instanceof Error ? error.message : String(error) };
  }
};

const runPool = async <T,R>(items:T[], fn:(item:T)=>Promise<R>) => {
  const results = new Array<R>(items.length); let cursor=0;
  const worker=async()=>{ while(true){ const i=cursor++; if(i>=items.length)return; results[i]=await fn(items[i]); console.log(`[fh-preview-audit] ${i+1}/${items.length}`); } };
  await Promise.all(Array.from({length:Math.min(CONCURRENCY,items.length)},worker)); return results;
};

const main = async () => {
  const cohort = buildCohort();
  const sample = cohort.slice(0, SAMPLE_SIZE);
  const rows = await runPool(sample, auditOne);
  const priced = rows.filter(r => r.lowPrice !== null);
  const safe = rows.filter(r => r.safeToAutomate);
  const summary = {
    generatedAt: new Date().toISOString(),
    eligibleLegacyFallbackCohort: cohort.length,
    sampledCount: sample.length,
    http200Count: rows.filter(r => r.status === 200).length,
    pricedCount: priced.length,
    pricedRate: Number((priced.length / sample.length).toFixed(4)),
    safeToAutomateCount: safe.length,
    safeToAutomateRate: Number((safe.length / sample.length).toFixed(4)),
    explicitAdultPriceCount: rows.filter(r => r.adultPrice !== null).length,
    emptyPricePreviewCount: rows.filter(r => r.status === 200 && r.itemCount === 0).length,
    non200Count: rows.filter(r => r.status !== 200).length,
    currencies: Array.from(new Set(priced.map(r => r.currency).filter(Boolean))).sort(),
    lowPrices: priced.map(r => r.lowPrice).filter((v): v is number => v !== null),
  };
  await mkdir(OUT_DIR,{recursive:true});
  await writeFile(path.join(OUT_DIR,"fareharbor-price-preview-audit.json"),JSON.stringify({summary,rows},null,2)+"\n");
  await writeFile(path.join(OUT_DIR,"fareharbor-price-preview-audit-summary.json"),JSON.stringify(summary,null,2)+"\n");
  console.log(`[fh-preview-audit] SUMMARY ${JSON.stringify(summary)}`);
};

main().catch(error=>{ console.error("[fh-preview-audit] FATAL",error); process.exitCode=1; });
