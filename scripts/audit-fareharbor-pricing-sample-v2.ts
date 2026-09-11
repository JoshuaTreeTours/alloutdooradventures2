import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { toursForAudit } from "../src/data/tours.audit";
import { getFareharborItemFromUrl } from "../src/lib/fareharbor";
import { isSuppressedFareHarborBookingPage } from "../src/utils/fareharbor/suppressedBookingPages";
import { buildAvailabilityQuery, fareharborEndpoints, parseAvailabilityResponse } from "./fareharborClient";

const SAMPLE_SIZE = 75;
const CONCURRENCY = 5;
const LOOKAHEAD_WINDOWS: Array<[number, number]> = [[0, 30], [30, 60]];
const TIMEOUT_MS = 12000;
const OUT_DIR = path.resolve("artifacts");

type Candidate = {
  id: string;
  title: string;
  canonicalPath: string;
  state: string;
  city: string;
  companyShortname: string;
  itemId: string;
  bookingUrl: string;
};

type PricePoint = { label: string | null; value: number; source: string };

type Row = Candidate & {
  status: string;
  availabilityStatus: number | null;
  quoteStatus: number | null;
  currency: string | null;
  adultPrice: number | null;
  childPrice: number | null;
  infantPrice: number | null;
  minimumObservedPrice: number | null;
  recommendedPrice: number | null;
  confidence: "high" | "medium" | "low" | "none";
  safeToAutomate: boolean;
  reason: string;
  pricePoints: PricePoint[];
};

const num = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const text = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const getLabel = (record: Record<string, unknown>, inherited: string | null) =>
  text(record.name) ?? text(record.label) ?? text(record.title) ?? text(record.singular) ?? text(record.plural) ?? inherited;

const collectPricePoints = (payload: Record<string, unknown>) => {
  const points: PricePoint[] = [];
  const seen = new Set<string>();

  const add = (value: unknown, label: string | null, source: string) => {
    const parsed = num(value);
    if (parsed === null || parsed <= 0) return;
    const key = `${label ?? ""}|${parsed}|${source}`;
    if (seen.has(key)) return;
    seen.add(key);
    points.push({ label, value: parsed, source });
  };

  const scan = (record: Record<string, unknown>, source: string, inherited: string | null = null) => {
    const label = getLabel(record, inherited);
    add(record.public_price, label, `${source}.public_price`);
    add(record.minimum_price, label, `${source}.minimum_price`);
    add(record.price, label, `${source}.price`);

    const customerTypes = record.customer_types;
    if (Array.isArray(customerTypes)) {
      customerTypes.forEach((entry, i) => {
        if (isRecord(entry)) scan(entry, `${source}.customer_types[${i}]`, label);
      });
    }
    for (const key of ["rates", "rate_categories"]) {
      const list = record[key];
      if (Array.isArray(list)) {
        list.forEach((entry, i) => {
          if (isRecord(entry)) scan(entry, `${source}.${key}[${i}]`, label);
        });
      }
    }
  };

  scan(payload, "quote");
  return points;
};

const getCurrency = (payload: Record<string, unknown>, availability?: Record<string, unknown>) => {
  const candidates: unknown[] = [];
  const add = (record?: Record<string, unknown>) => {
    if (!record) return;
    candidates.push(record.currency, record.currency_code, record.currency_type);
    if (isRecord(record.pricing)) candidates.push(record.pricing.currency);
  };
  add(payload);
  add(availability);
  for (const candidate of candidates) {
    if (typeof candidate === "string" && /^[A-Za-z]{3}$/.test(candidate.trim())) {
      return candidate.trim().toUpperCase();
    }
  }
  return null;
};

const labeledMin = (points: PricePoint[], pattern: RegExp) => {
  const matches = points.filter(p => p.label && pattern.test(p.label));
  return matches.length ? Math.min(...matches.map(p => p.value)) : null;
};

const fetchJson = async (url: string) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "AOA-FareHarbor-Pricing-Audit/1.0" },
      signal: controller.signal,
    });
    let payload: unknown = null;
    if (response.ok) payload = await response.json();
    return { response, payload };
  } finally {
    clearTimeout(timer);
  }
};

const date = (offsetDays: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

const auditOne = async (candidate: Candidate): Promise<Row> => {
  try {
    let availabilityStatus: number | null = null;
    let selected: ReturnType<typeof parseAvailabilityResponse>[number] | null = null;

    for (const [startOffset, endOffset] of LOOKAHEAD_WINDOWS) {
      const base = fareharborEndpoints.availability(candidate.companyShortname, candidate.itemId);
      const url = `${base}?${buildAvailabilityQuery(date(startOffset), date(endOffset))}`;
      const { response, payload } = await fetchJson(url);
      availabilityStatus = response.status;
      if (!response.ok) {
        return { ...candidate, status: "availability-http-error", availabilityStatus, quoteStatus: null, currency: null, adultPrice: null, childPrice: null, infantPrice: null, minimumObservedPrice: null, recommendedPrice: null, confidence: "none", safeToAutomate: false, reason: `Availability HTTP ${response.status}`, pricePoints: [] };
      }
      const entries = parseAvailabilityResponse(payload).filter(entry => entry.isAvailable);
      if (entries.length) {
        selected = entries[0];
        break;
      }
    }

    if (!selected) {
      return { ...candidate, status: "no-availability-60d", availabilityStatus, quoteStatus: null, currency: null, adultPrice: null, childPrice: null, infantPrice: null, minimumObservedPrice: null, recommendedPrice: null, confidence: "none", safeToAutomate: false, reason: "No available slot found within 60 days", pricePoints: [] };
    }

    const quoteUrl = fareharborEndpoints.quote(candidate.companyShortname, candidate.itemId, selected.availabilityId);
    const { response: quoteResponse, payload: quoteRaw } = await fetchJson(quoteUrl);
    if (!quoteResponse.ok || !isRecord(quoteRaw)) {
      return { ...candidate, status: "quote-http-error", availabilityStatus, quoteStatus: quoteResponse.status, currency: null, adultPrice: null, childPrice: null, infantPrice: null, minimumObservedPrice: null, recommendedPrice: null, confidence: "none", safeToAutomate: false, reason: `Quote HTTP ${quoteResponse.status}`, pricePoints: [] };
    }

    const points = collectPricePoints(quoteRaw);
    const currency = getCurrency(quoteRaw, selected.raw);
    if (!points.length) {
      return { ...candidate, status: "quote-no-recognized-prices", availabilityStatus, quoteStatus: quoteResponse.status, currency, adultPrice: null, childPrice: null, infantPrice: null, minimumObservedPrice: null, recommendedPrice: null, confidence: "none", safeToAutomate: false, reason: "Live quote contained no recognized positive price fields", pricePoints: [] };
    }

    const adultPrice = labeledMin(points, /\badult\b/i);
    const childPrice = labeledMin(points, /\bchild|youth|teen\b/i);
    const infantPrice = labeledMin(points, /\binfant|baby\b/i);
    const minimumObservedPrice = Math.min(...points.map(p => p.value));
    const direct = points.filter(p => /public_price|minimum_price/.test(p.source) && !/customer_types/.test(p.source));
    const directPrice = direct.length ? Math.min(...direct.map(p => p.value)) : null;
    const uniqueValues = Array.from(new Set(points.map(p => p.value))).sort((a, b) => a - b);

    let recommendedPrice: number | null = null;
    let confidence: Row["confidence"] = "low";
    let reason = "Multiple live price points but no clearly labeled adult/public primary price";

    if (adultPrice !== null) {
      recommendedPrice = adultPrice;
      confidence = "high";
      reason = childPrice !== null || infantPrice !== null
        ? "Explicit Adult rate found; lower child/infant values can be excluded"
        : "Explicit Adult rate found";
    } else if (directPrice !== null && currency) {
      recommendedPrice = directPrice;
      confidence = uniqueValues.length === 1 ? "high" : "medium";
      reason = uniqueValues.length === 1 ? "Single direct public/minimum price with known currency" : "Direct public/minimum price with additional rate values";
    } else if (uniqueValues.length === 1 && currency) {
      recommendedPrice = uniqueValues[0];
      confidence = "medium";
      reason = "Single unambiguous positive quote price with known currency";
    } else {
      recommendedPrice = minimumObservedPrice;
    }

    const safeToAutomate = !!currency && recommendedPrice !== null && (confidence === "high" || confidence === "medium");

    return {
      ...candidate,
      status: "priced",
      availabilityStatus,
      quoteStatus: quoteResponse.status,
      currency,
      adultPrice,
      childPrice,
      infantPrice,
      minimumObservedPrice,
      recommendedPrice,
      confidence,
      safeToAutomate,
      reason,
      pricePoints: points.slice(0, 40),
    };
  } catch (error) {
    return { ...candidate, status: "exception", availabilityStatus: null, quoteStatus: null, currency: null, adultPrice: null, childPrice: null, infantPrice: null, minimumObservedPrice: null, recommendedPrice: null, confidence: "none", safeToAutomate: false, reason: error instanceof Error ? error.message : String(error), pricePoints: [] };
  }
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
  const deduped = new Map<string, Candidate>();
  for (const tour of toursForAudit) {
    if (tour.bookingProvider !== "fareharbor") continue;
    if (tour.engine === "engine6") continue;
    if (isSuppressedFareHarborBookingPage(tour)) continue;
    if (tour.startingPrice !== undefined && tour.startingPrice !== null && tour.startingPrice >= 20) continue;
    const bookingUrl = tour.bookingWidgetUrl || tour.bookingUrl;
    const ref = getFareharborItemFromUrl(bookingUrl);
    if (!ref) continue;
    const key = `${ref.companyShortname}:${ref.itemId}`;
    if (deduped.has(key)) continue;
    const canonicalPath = `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`;
    deduped.set(key, {
      id: tour.id,
      title: tour.title,
      canonicalPath,
      state: tour.destination.state,
      city: tour.destination.city,
      companyShortname: ref.companyShortname,
      itemId: ref.itemId,
      bookingUrl,
    });
  }
  const all = Array.from(deduped.values()).sort((a, b) => hash(a.canonicalPath) - hash(b.canonicalPath));
  return { cohort: all, sample: all.slice(0, SAMPLE_SIZE) };
};

const runPool = async <T, R>(items: T[], fn: (item: T) => Promise<R>) => {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const worker = async () => {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await fn(items[index]);
      console.log(`[fh-price-audit] ${index + 1}/${items.length}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker));
  return results;
};

const median = (values: number[]) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const i = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[i] : (sorted[i - 1] + sorted[i]) / 2;
};

const main = async () => {
  const { cohort, sample } = buildSample();
  console.log(`[fh-price-audit] cohort=${cohort.length} sample=${sample.length}`);
  if (sample.length < 50) throw new Error(`Only ${sample.length} eligible candidates found; expected at least 50.`);

  const rows = await runPool(sample, auditOne);
  const safe = rows.filter(row => row.safeToAutomate);
  const prices = safe.map(row => row.recommendedPrice).filter((v): v is number => v !== null);
  const summary = {
    generatedAt: new Date().toISOString(),
    eligibleLegacyFallbackCohort: cohort.length,
    sampledCount: sample.length,
    uniqueOperators: new Set(sample.map(row => row.companyShortname)).size,
    uniqueCities: new Set(sample.map(row => `${row.state}|${row.city}`)).size,
    pricedCount: rows.filter(row => row.status === "priced").length,
    safeToAutomateCount: safe.length,
    safeToAutomateRate: Number((safe.length / sample.length).toFixed(4)),
    highConfidenceCount: rows.filter(row => row.confidence === "high").length,
    mediumConfidenceCount: rows.filter(row => row.confidence === "medium").length,
    lowConfidenceCount: rows.filter(row => row.confidence === "low").length,
    noAvailabilityCount: rows.filter(row => row.status === "no-availability-60d").length,
    availabilityHttpErrorCount: rows.filter(row => row.status === "availability-http-error").length,
    quoteHttpErrorCount: rows.filter(row => row.status === "quote-http-error").length,
    quoteNoRecognizedPricesCount: rows.filter(row => row.status === "quote-no-recognized-prices").length,
    exceptionCount: rows.filter(row => row.status === "exception").length,
    exact129Count: safe.filter(row => row.recommendedPrice === 129).length,
    differentFrom129Count: safe.filter(row => row.recommendedPrice !== 129).length,
    medianRecommendedPrice: median(prices),
    minRecommendedPrice: prices.length ? Math.min(...prices) : null,
    maxRecommendedPrice: prices.length ? Math.max(...prices) : null,
    currencies: Array.from(new Set(safe.map(row => row.currency).filter(Boolean))).sort(),
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, "fareharbor-pricing-audit.json"), JSON.stringify({ summary, rows }, null, 2) + "\n");
  await writeFile(path.join(OUT_DIR, "fareharbor-pricing-audit-summary.json"), JSON.stringify(summary, null, 2) + "\n");
  console.log(`[fh-price-audit] SUMMARY ${JSON.stringify(summary)}`);
};

main().catch(error => {
  console.error("[fh-price-audit] FATAL", error);
  process.exitCode = 1;
});
