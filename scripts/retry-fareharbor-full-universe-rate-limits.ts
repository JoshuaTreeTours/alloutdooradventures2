import { gunzipSync } from "node:zlib";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { tours as routeBackedTours } from "../src/data/tours";
import { getAllEngine2Tours } from "../src/engine2/data/loadEngine2";
import { getFareharborItemFromUrl } from "../src/lib/fareharbor";
import { PRICE_MIN_THRESHOLD_USD } from "../src/constants/merchantDefaults";
import {
  resolveHighConfidenceFareHarborPrice,
  resolvePhase2FareHarborPrice,
  resolvePhase3FareHarborPrice,
} from "../src/utils/fareharbor/pricePreview";

type JsonRecord = Record<string, unknown>;
type Candidate = { key: string; company: string; itemId: string; asn: string };
type RetryResult = {
  key: string;
  status: number | null;
  attempts: number;
  currency: string | null;
  advertisedLow: number | null;
  advertisedHigh: number | null;
  providerAdvertisedPriceUsable: boolean;
  phase: 1 | 2 | 3 | null;
  safeResolvedPrice: number | null;
  safeResolvedCurrency: string | null;
  error?: string;
};

const KEYS_PATH = path.resolve("scripts/fareharbor-full-universe-retry-keys.b64");
const OUTPUT_DIR = path.resolve("reports");
const JSON_PATH = path.join(OUTPUT_DIR, "fareharbor-full-universe-rate-limit-retry.json");
const MD_PATH = path.join(OUTPUT_DIR, "fareharbor-full-universe-rate-limit-retry.md");
const CONCURRENCY = 4;
const MAX_ATTEMPTS = 6;
const TIMEOUT_MS = 20_000;
const PAUSE_MS = 250;

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const numeric = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getAsn = (url: string) => {
  try {
    return new URL(url).searchParams.get("asn") || "fhdn";
  } catch {
    return "fhdn";
  }
};

const parseSignals = (payload: unknown) => {
  if (!isRecord(payload)) return { currency: null, low: null, high: null };
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

const loadRetryKeys = async () => {
  const b64 = (await readFile(KEYS_PATH, "utf8")).trim();
  const json = gunzipSync(Buffer.from(b64, "base64")).toString("utf8");
  return JSON.parse(json) as string[];
};

const buildUrlMap = () => {
  const map = new Map<string, string>();
  for (const tour of routeBackedTours) {
    if (tour.bookingProvider !== "fareharbor") continue;
    const ref = getFareharborItemFromUrl(tour.bookingUrl);
    if (ref) map.set(`${ref.companyShortname}:${ref.itemId}`, tour.bookingUrl);
  }
  for (const tour of getAllEngine2Tours()) {
    if (tour.bookingProvider !== "fareharbor") continue;
    const bookingUrl = tour.bookingUrl ?? tour.booking.bookingUrl;
    const ref = getFareharborItemFromUrl(bookingUrl);
    if (ref && !map.has(`${ref.companyShortname}:${ref.itemId}`)) {
      map.set(`${ref.companyShortname}:${ref.itemId}`, bookingUrl);
    }
  }
  return map;
};

const buildPreviewUrl = (candidate: Candidate) =>
  `https://fareharbor.com/api/embed/${encodeURIComponent(candidate.company)}/price-preview/per-item/v2/?asn=${encodeURIComponent(candidate.asn)}&item_pks=${encodeURIComponent(candidate.itemId)}&include_breakdown=yes&allow_unlisted_items=yes`;

const fetchOne = async (candidate: Candidate): Promise<RetryResult> => {
  let lastError: string | undefined;
  let lastStatus: number | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(buildPreviewUrl(candidate), {
        headers: {
          Accept: "application/json",
          "User-Agent": "AOA-FareHarbor-RateLimit-Retry/1.0",
        },
        signal: controller.signal,
      });
      lastStatus = response.status;
      if (response.ok) {
        const payload = (await response.json()) as unknown;
        const signals = parseSignals(payload);
        const p1 = resolveHighConfidenceFareHarborPrice(payload);
        const p2 = resolvePhase2FareHarborPrice(payload);
        const p3 = resolvePhase3FareHarborPrice(payload);
        const safe = p1 ?? p2 ?? p3;
        return {
          key: candidate.key,
          status: response.status,
          attempts: attempt,
          currency: signals.currency,
          advertisedLow: signals.low,
          advertisedHigh: signals.high,
          providerAdvertisedPriceUsable:
            signals.low !== null && signals.low >= PRICE_MIN_THRESHOLD_USD,
          phase: p1 ? 1 : p2 ? 2 : p3 ? 3 : null,
          safeResolvedPrice: safe?.startingPrice ?? null,
          safeResolvedCurrency: safe?.currency ?? null,
        };
      }
      if (response.status !== 429 && response.status < 500) {
        return {
          key: candidate.key,
          status: response.status,
          attempts: attempt,
          currency: null,
          advertisedLow: null,
          advertisedHigh: null,
          providerAdvertisedPriceUsable: false,
          phase: null,
          safeResolvedPrice: null,
          safeResolvedCurrency: null,
        };
      }
      lastError = `HTTP ${response.status}`;
      const retryAfter = Number(response.headers.get("retry-after"));
      const wait = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : Math.min(20_000, 1200 * 2 ** (attempt - 1)) + Math.floor(Math.random() * 500);
      if (attempt < MAX_ATTEMPTS) await sleep(wait);
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt < MAX_ATTEMPTS) {
        await sleep(Math.min(20_000, 1200 * 2 ** (attempt - 1)) + Math.floor(Math.random() * 500));
      }
    } finally {
      clearTimeout(timeout);
    }
  }
  return {
    key: candidate.key,
    status: lastStatus,
    attempts: MAX_ATTEMPTS,
    currency: null,
    advertisedLow: null,
    advertisedHigh: null,
    providerAdvertisedPriceUsable: false,
    phase: null,
    safeResolvedPrice: null,
    safeResolvedCurrency: null,
    error: lastError,
  };
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
  const keys = await loadRetryKeys();
  const urlMap = buildUrlMap();
  const candidates: Candidate[] = keys.map(key => {
    const [company, itemId] = key.split(":");
    const sourceUrl = urlMap.get(key) ?? "";
    return { key, company, itemId, asn: getAsn(sourceUrl) };
  });
  const missingSourceUrls = candidates.filter(candidate => !urlMap.has(candidate.key)).length;
  console.info(`[fh-retry] keys=${keys.length} missingSourceUrls=${missingSourceUrls} concurrency=${CONCURRENCY}`);

  const results = new Array<RetryResult>(candidates.length);
  let cursor = 0;
  let completed = 0;
  const worker = async () => {
    while (true) {
      const index = cursor++;
      if (index >= candidates.length) return;
      results[index] = await fetchOne(candidates[index]);
      completed += 1;
      if (completed % 100 === 0 || completed === candidates.length) {
        console.info(`[fh-retry] ${completed}/${candidates.length}`);
      }
      await sleep(PAUSE_MS);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const ok = results.filter(result => result.status === 200);
  const providerLow = ok.filter(result => result.providerAdvertisedPriceUsable);
  const safe = ok.filter(result => result.safeResolvedPrice !== null);
  const union = ok.filter(
    result => result.providerAdvertisedPriceUsable || result.safeResolvedPrice !== null,
  );
  const positiveLowBelowFloor = ok.filter(
    result =>
      result.advertisedLow !== null &&
      result.advertisedLow > 0 &&
      result.advertisedLow < PRICE_MIN_THRESHOLD_USD,
  );
  const summary = {
    retryKeys: keys.length,
    missingSourceUrls,
    statusCounts: countBy(results.map(result => result.status)),
    attemptCounts: countBy(results.map(result => result.attempts)),
    currencyCounts: countBy(ok.map(result => result.currency)),
    successful: ok.length,
    providerAdvertisedLowAtLeast20: providerLow.length,
    safePhase1to3: safe.length,
    unionAtLeast20: union.length,
    positiveProviderLowBelow20: positiveLowBelowFloor.length,
    anyPositiveProviderLow: ok.filter(result => (result.advertisedLow ?? 0) > 0).length,
  };

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(JSON_PATH, JSON.stringify({ summary, results }, null, 2), "utf8");
  await writeFile(
    MD_PATH,
    `# FareHarbor Rate-Limit Retry Audit\n\n` +
      `- Retry keys: ${summary.retryKeys}\n` +
      `- Successful responses: ${summary.successful}\n` +
      `- Provider-advertised low >= $20: ${summary.providerAdvertisedLowAtLeast20}\n` +
      `- Safe Phase 1-3: ${summary.safePhase1to3}\n` +
      `- Union >= $20: ${summary.unionAtLeast20}\n` +
      `- Positive provider low below $20: ${summary.positiveProviderLowBelow20}\n` +
      `- Any positive provider low: ${summary.anyPositiveProviderLow}\n\n` +
      `## Status counts\n\n\`\`\`json\n${JSON.stringify(summary.statusCounts, null, 2)}\n\`\`\`\n`,
    "utf8",
  );
  console.info(`[fh-retry] SUMMARY ${JSON.stringify(summary)}`);
};

main().catch(error => {
  console.error("[fh-retry] FATAL", error);
  process.exitCode = 1;
});
