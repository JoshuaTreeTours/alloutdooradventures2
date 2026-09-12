import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { tours as routeBackedTours } from "../src/data/tours";
import { getAllEngine2Tours } from "../src/engine2/data/loadEngine2";
import { getFareharborItemFromUrl } from "../src/lib/fareharbor";
import { PRICE_MIN_THRESHOLD_USD } from "../src/constants/merchantDefaults";
import { parsePrice } from "../src/utils/merchantPricing";
import {
  resolveHighConfidenceFareHarborPrice,
  resolvePhase2FareHarborPrice,
  resolvePhase3FareHarborPrice,
} from "../src/utils/fareharbor/pricePreview";

type JsonRecord = Record<string, unknown>;
type SourceRecord = {
  source: "route-backed" | "engine2";
  id: string;
  title: string;
  route: string | null;
  bookingUrl: string;
  fallback: boolean;
};
type Candidate = {
  key: string;
  companyShortname: string;
  itemId: string;
  asn: string;
  records: SourceRecord[];
};

type Result = {
  key: string;
  status: number | null;
  currency: string | null;
  advertisedLow: number | null;
  advertisedHigh: number | null;
  phase: 1 | 2 | 3 | null;
  safeResolvedPrice: number | null;
  safeResolvedCurrency: string | null;
  providerAdvertisedPriceUsable: boolean;
  records: SourceRecord[];
  attempts: number;
  error?: string;
};

const CONCURRENCY = 4;
const MAX_ATTEMPTS = 5;
const REQUEST_TIMEOUT_MS = 20_000;
const INTER_REQUEST_DELAY_MS = 175;
const OUTPUT_DIR = path.resolve("reports");
const JSON_PATH = path.join(OUTPUT_DIR, "fareharbor-full-universe-slow-audit.json");
const MD_PATH = path.join(OUTPUT_DIR, "fareharbor-full-universe-slow-audit.md");

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const numeric = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const isUsablePrice = (price: number | null) =>
  price !== null && Number.isFinite(price) && price >= PRICE_MIN_THRESHOLD_USD;

const getAsn = (url: string) => {
  try {
    return new URL(url).searchParams.get("asn") || "fhdn";
  } catch {
    return "fhdn";
  }
};

const buildPreviewUrl = (candidate: Candidate) =>
  `https://fareharbor.com/api/embed/${encodeURIComponent(candidate.companyShortname)}/price-preview/per-item/v2/?asn=${encodeURIComponent(candidate.asn)}&item_pks=${encodeURIComponent(candidate.itemId)}&include_breakdown=yes&allow_unlisted_items=yes`;

const parseSignals = (payload: unknown) => {
  if (!isRecord(payload)) {
    return { currency: null, low: null, high: null };
  }
  const details = isRecord(payload.details) ? payload.details : {};
  const currency =
    typeof details.currency === "string" && details.currency.trim()
      ? details.currency.trim().toUpperCase()
      : null;
  const decimals = numeric(details.currency_decimal_places) ?? 2;
  const divisor = 10 ** Math.min(Math.max(decimals, 0), 4);
  const items = Array.isArray(payload.items) ? payload.items.filter(isRecord) : [];
  if (items.length !== 1) return { currency, low: null, high: null };
  const price = isRecord(items[0].price) ? items[0].price : {};
  const rawLow = numeric(price.low);
  const rawHigh = numeric(price.high);
  return {
    currency,
    low: rawLow === null ? null : rawLow / divisor,
    high: rawHigh === null ? null : rawHigh / divisor,
  };
};

const collectRecords = (): SourceRecord[] => {
  const records: SourceRecord[] = [];
  for (const tour of routeBackedTours) {
    if (tour.bookingProvider !== "fareharbor") continue;
    const price =
      typeof tour.startingPrice === "number" && Number.isFinite(tour.startingPrice)
        ? tour.startingPrice
        : null;
    records.push({
      source: "route-backed",
      id: tour.productCode ?? tour.id,
      title: tour.title,
      route: `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`,
      bookingUrl: tour.bookingUrl,
      fallback: !isUsablePrice(price),
    });
  }
  for (const tour of getAllEngine2Tours()) {
    if (tour.bookingProvider !== "fareharbor") continue;
    const price = parsePrice(tour.pricing?.price ?? null);
    records.push({
      source: "engine2",
      id: String(tour.id),
      title: tour.name,
      route: tour.seo.canonicalPath ?? null,
      bookingUrl: tour.bookingUrl ?? tour.booking.bookingUrl,
      fallback: !isUsablePrice(price),
    });
  }
  return records;
};

const buildCandidates = (records: SourceRecord[]) => {
  const byKey = new Map<string, Candidate>();
  let unparseable = 0;
  for (const record of records) {
    const ref = getFareharborItemFromUrl(record.bookingUrl);
    if (!ref) {
      unparseable += 1;
      continue;
    }
    const key = `${ref.companyShortname}:${ref.itemId}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.records.push(record);
      continue;
    }
    byKey.set(key, {
      key,
      companyShortname: ref.companyShortname,
      itemId: ref.itemId,
      asn: getAsn(record.bookingUrl),
      records: [record],
    });
  }
  return { candidates: Array.from(byKey.values()), unparseable };
};

const fetchCandidate = async (candidate: Candidate): Promise<Result> => {
  const url = buildPreviewUrl(candidate);
  let lastError: string | undefined;
  let finalStatus: number | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "AOA-FareHarbor-Full-Universe-Slow-Audit/1.0",
        },
        signal: controller.signal,
      });
      finalStatus = response.status;
      if (response.ok) {
        const payload = (await response.json()) as unknown;
        const signals = parseSignals(payload);
        const phase1 = resolveHighConfidenceFareHarborPrice(payload);
        const phase2 = resolvePhase2FareHarborPrice(payload);
        const phase3 = resolvePhase3FareHarborPrice(payload);
        const safe = phase1 ?? phase2 ?? phase3;
        return {
          key: candidate.key,
          status: response.status,
          currency: signals.currency,
          advertisedLow: signals.low,
          advertisedHigh: signals.high,
          phase: phase1 ? 1 : phase2 ? 2 : phase3 ? 3 : null,
          safeResolvedPrice: safe?.startingPrice ?? null,
          safeResolvedCurrency: safe?.currency ?? null,
          providerAdvertisedPriceUsable:
            signals.low !== null && signals.low >= PRICE_MIN_THRESHOLD_USD,
          records: candidate.records,
          attempts: attempt,
        };
      }

      if (response.status !== 429 && response.status < 500) {
        return {
          key: candidate.key,
          status: response.status,
          currency: null,
          advertisedLow: null,
          advertisedHigh: null,
          phase: null,
          safeResolvedPrice: null,
          safeResolvedCurrency: null,
          providerAdvertisedPriceUsable: false,
          records: candidate.records,
          attempts: attempt,
        };
      }

      const retryAfter = Number(response.headers.get("retry-after"));
      const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : 1000 * 2 ** (attempt - 1) + Math.floor(Math.random() * 400);
      lastError = `HTTP ${response.status}`;
      if (attempt < MAX_ATTEMPTS) await sleep(waitMs);
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt < MAX_ATTEMPTS) {
        await sleep(1000 * 2 ** (attempt - 1) + Math.floor(Math.random() * 400));
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    key: candidate.key,
    status: finalStatus,
    currency: null,
    advertisedLow: null,
    advertisedHigh: null,
    phase: null,
    safeResolvedPrice: null,
    safeResolvedCurrency: null,
    providerAdvertisedPriceUsable: false,
    records: candidate.records,
    attempts: MAX_ATTEMPTS,
    error: lastError,
  };
};

const runPool = async (items: Candidate[]) => {
  const results = new Array<Result>(items.length);
  let cursor = 0;
  let completed = 0;
  const worker = async () => {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await fetchCandidate(items[index]);
      completed += 1;
      if (completed % 250 === 0 || completed === items.length) {
        console.info(`[fh-universe-slow] ${completed}/${items.length}`);
      }
      await sleep(INTER_REQUEST_DELAY_MS);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return results;
};

const countBy = (values: Array<string | number | null>) => {
  const counts: Record<string, number> = {};
  for (const value of values) {
    const key = value === null ? "null" : String(value);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
};

const main = async () => {
  const records = collectRecords();
  const { candidates, unparseable } = buildCandidates(records);
  candidates.sort((a, b) => a.key.localeCompare(b.key));
  const fallbackCandidates = candidates.filter(candidate =>
    candidate.records.some(record => record.fallback),
  );

  console.info(
    `[fh-universe-slow] sourceRecords=${records.length} uniqueItems=${candidates.length} fallbackUniqueItems=${fallbackCandidates.length} concurrency=${CONCURRENCY}`,
  );

  const results = await runPool(candidates);
  const fallbackResults = results.filter(result =>
    result.records.some(record => record.fallback),
  );
  const okFallback = fallbackResults.filter(result => result.status === 200);
  const safeFallback = fallbackResults.filter(result => result.safeResolvedPrice !== null);
  const providerLowFallback = fallbackResults.filter(result => result.providerAdvertisedPriceUsable);
  const unionFallback = fallbackResults.filter(
    result => result.safeResolvedPrice !== null || result.providerAdvertisedPriceUsable,
  );
  const unresolvedAfterSuccess = okFallback.filter(
    result => result.safeResolvedPrice === null && !result.providerAdvertisedPriceUsable,
  );

  const summary = {
    sourceRecords: records.length,
    uniqueFareHarborItems: candidates.length,
    fallbackUniqueItems: fallbackCandidates.length,
    unparseableBookingUrls: unparseable,
    statusCounts: countBy(results.map(result => result.status)),
    fallbackStatusCounts: countBy(fallbackResults.map(result => result.status)),
    currencyCounts: countBy(results.map(result => result.currency)),
    fallbackCurrencyCounts: countBy(fallbackResults.map(result => result.currency)),
    successfulFallbackItems: okFallback.length,
    safeResolvedFallbackItems: safeFallback.length,
    providerAdvertisedLowFallbackItems: providerLowFallback.length,
    unionSurfacedFallbackItems: unionFallback.length,
    unresolvedSuccessfulFallbackItems: unresolvedAfterSuccess.length,
    safeCoverageAllFallback:
      fallbackResults.length > 0 ? Number((safeFallback.length / fallbackResults.length).toFixed(4)) : 0,
    providerLowCoverageAllFallback:
      fallbackResults.length > 0 ? Number((providerLowFallback.length / fallbackResults.length).toFixed(4)) : 0,
    unionCoverageAllFallback:
      fallbackResults.length > 0 ? Number((unionFallback.length / fallbackResults.length).toFixed(4)) : 0,
    providerLowCoverageSuccessfulFallback:
      okFallback.length > 0 ? Number((providerLowFallback.length / okFallback.length).toFixed(4)) : 0,
    unionCoverageSuccessfulFallback:
      okFallback.length > 0 ? Number((unionFallback.length / okFallback.length).toFixed(4)) : 0,
    attemptCounts: countBy(results.map(result => result.attempts)),
  };

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(JSON_PATH, JSON.stringify({ summary, results }, null, 2), "utf8");
  const markdown = `# FareHarbor Full-Universe Slow Pricing Audit\n\n` +
    `- Source records: ${summary.sourceRecords}\n` +
    `- Unique FareHarbor items: ${summary.uniqueFareHarborItems}\n` +
    `- Unique fallback items: ${summary.fallbackUniqueItems}\n` +
    `- Successful fallback responses: ${summary.successfulFallbackItems}\n` +
    `- Conservative Phase 1-3 resolvable fallback items: ${summary.safeResolvedFallbackItems}\n` +
    `- FareHarbor provider-advertised low prices on fallback items: ${summary.providerAdvertisedLowFallbackItems}\n` +
    `- Union surfacable fallback items: ${summary.unionSurfacedFallbackItems}\n` +
    `- Union coverage of all fallback items: ${(summary.unionCoverageAllFallback * 100).toFixed(1)}%\n` +
    `- Union coverage among successful fallback responses: ${(summary.unionCoverageSuccessfulFallback * 100).toFixed(1)}%\n` +
    `- Remaining successfully queried fallback items without a usable price: ${summary.unresolvedSuccessfulFallbackItems}\n\n` +
    `## Status counts\n\n\`\`\`json\n${JSON.stringify(summary.statusCounts, null, 2)}\n\`\`\`\n\n` +
    `## Currency counts\n\n\`\`\`json\n${JSON.stringify(summary.currencyCounts, null, 2)}\n\`\`\`\n`;
  await writeFile(MD_PATH, markdown, "utf8");
  console.info(`[fh-universe-slow] SUMMARY ${JSON.stringify(summary)}`);
};

main().catch(error => {
  console.error("[fh-universe-slow] FATAL", error);
  process.exitCode = 1;
});
