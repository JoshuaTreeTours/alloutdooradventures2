import { writeFile } from "node:fs/promises";
import path from "node:path";

import { getAllEngine2Tours } from "../src/engine2/data/loadEngine2";
import { getFareharborItemFromUrl } from "../src/lib/fareharbor";
import { PRICE_MIN_THRESHOLD_USD } from "../src/constants/merchantDefaults";
import { parsePrice } from "../src/utils/merchantPricing";
import { resolvePhase2FareHarborPrice } from "../src/utils/fareharbor/pricePreview";
import { isSuppressedFareHarborBookingPage } from "../src/utils/fareharbor/suppressedBookingPages";

type FareharborPhase2PriceEntry = {
  startingPrice: number;
  currency: string;
  source: "fareharbor-price-preview-v2";
  confidence: "medium";
  basis: "standard-traveler";
  basisLabel: string;
  lastUpdated: string;
};

type Candidate = {
  companyShortname: string;
  itemId: string;
  bookingUrl: string;
  asn: string;
};

const OUTPUT_PATH = path.resolve("src/data/fareharborPricingPhase2.ts");
const MAX_CONCURRENCY = 8;
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_ATTEMPTS = 3;

// Phase 2 remains shadow-only. Keep the same USD and minimum-price guard as
// Phase 1 so the new cohort can be inspected independently without requiring
// a currency-rendering or low-price-floor change at the same time.
const PHASE2_CURRENCY = "USD";
const PHASE2_MIN_PRICE = PRICE_MIN_THRESHOLD_USD;

const EXPERIENCE_TITLE_SIGNAL =
  /\b(tour|guided|cruise|sail|sailing|snorkel|snorkeling|hike|hiking|walk|walking|raft|rafting|zipline|scuba|dive|diving|safari|excursion|adventure|experience|tasting|food|wine|ghost|museum|admission|class|lesson|whale|dolphin|volcano|sunset|sunrise|stargazing|fishing|horseback|helicopter|flight|luau|show|cave|wildlife|waterfall|jeep|atv|utv)\b/i;
const NON_EXPERIENCE_PRODUCT_SIGNAL =
  /\b(rental|rentals|rent|umbrella|chair|locker|parking|gift\s*card|deposit|add[- ]?on|upgrade|merchandise|equipment|gear)\b/i;

const isExperienceTitle = (title: string) =>
  EXPERIENCE_TITLE_SIGNAL.test(title) &&
  !NON_EXPERIENCE_PRODUCT_SIGNAL.test(title);

const buildCacheKey = (companyShortname: string, itemId: string) =>
  `${companyShortname}:${itemId}`;

const getAsn = (url: string) => {
  try {
    return new URL(url).searchParams.get("asn") || "fhdn";
  } catch {
    return "fhdn";
  }
};

const buildPricePreviewUrl = (candidate: Candidate) =>
  `https://fareharbor.com/api/embed/${encodeURIComponent(candidate.companyShortname)}/price-preview/per-item/v2/?asn=${encodeURIComponent(candidate.asn)}&item_pks=${encodeURIComponent(candidate.itemId)}&include_breakdown=yes&allow_unlisted_items=yes`;

const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

const fetchJsonWithRetry = async (url: string) => {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "AOA-FareHarbor-Commercial-Reserve-Phase2/1.0",
        },
        signal: controller.signal,
      });

      if (response.ok) {
        return {
          status: response.status,
          payload: (await response.json()) as unknown,
        };
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

    await sleep(300 * 2 ** attempt);
  }

  throw lastError ?? new Error("FareHarbor Phase 2 price-preview request failed");
};

const buildCandidates = () => {
  const candidates = new Map<string, Candidate>();

  for (const tour of getAllEngine2Tours()) {
    if (tour.bookingProvider !== "fareharbor") continue;
    if (tour.type === "rental") continue;
    if (!isExperienceTitle(tour.name)) continue;
    if (isSuppressedFareHarborBookingPage(tour)) continue;

    // Phase 2 is aimed at pages still lacking a commercially usable price after
    // the Phase 1 reserve has been applied. Existing good prices are not audited
    // or overwritten by this cohort.
    const existingPrice = parsePrice(tour.pricing?.price ?? null);
    if (
      existingPrice !== null &&
      existingPrice >= PRICE_MIN_THRESHOLD_USD
    ) {
      continue;
    }

    const bookingUrl = tour.bookingUrl ?? tour.booking.bookingUrl;
    const reference = getFareharborItemFromUrl(bookingUrl);
    if (!reference) continue;

    const key = buildCacheKey(reference.companyShortname, reference.itemId);
    if (candidates.has(key)) continue;

    candidates.set(key, {
      companyShortname: reference.companyShortname,
      itemId: reference.itemId,
      bookingUrl,
      asn: getAsn(bookingUrl),
    });
  }

  return candidates;
};

const fetchCandidate = async (
  candidate: Candidate,
): Promise<FareharborPhase2PriceEntry | null> => {
  const { status, payload } = await fetchJsonWithRetry(
    buildPricePreviewUrl(candidate),
  );
  if (status !== 200 || payload === null) return null;

  const resolved = resolvePhase2FareHarborPrice(payload);
  if (!resolved) return null;
  if (resolved.currency !== PHASE2_CURRENCY) return null;
  if (resolved.startingPrice < PHASE2_MIN_PRICE) return null;

  return {
    startingPrice: resolved.startingPrice,
    currency: resolved.currency,
    source: "fareharbor-price-preview-v2",
    confidence: "medium",
    basis: resolved.basis,
    basisLabel: resolved.basisLabel,
    lastUpdated: new Date().toISOString(),
  };
};

const runPool = async <T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
) => {
  const results = new Array<R>(items.length);
  let cursor = 0;

  const runWorker = async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  };

  await Promise.all(
    Array.from(
      { length: Math.min(MAX_CONCURRENCY, items.length) },
      runWorker,
    ),
  );

  return results;
};

const writeCacheFile = async (
  cache: Record<string, FareharborPhase2PriceEntry>,
) => {
  const contents = `export type FareharborPhase2PriceEntry = {
  startingPrice: number;
  currency: string;
  source: "fareharbor-price-preview-v2";
  confidence: "medium";
  basis: "standard-traveler";
  basisLabel: string;
  lastUpdated: string;
};

// Phase 2 shadow cohort. Generated for review; not imported by production pricing.
export const fareharborPricingPhase2: Record<string, FareharborPhase2PriceEntry> = ${JSON.stringify(cache, null, 2)};
`;

  await writeFile(OUTPUT_PATH, contents, "utf8");
};

const main = async () => {
  const candidates = buildCandidates();
  const entries = Array.from(candidates.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  console.info(
    `[commercial-reserve-phase2] candidates=${entries.length} concurrency=${MAX_CONCURRENCY}`,
  );

  let completed = 0;
  let failures = 0;
  const resolved = await runPool(entries, async ([key, candidate]) => {
    try {
      const price = await fetchCandidate(candidate);
      completed += 1;
      if (completed % 100 === 0 || completed === entries.length) {
        console.info(
          `[commercial-reserve-phase2] ${completed}/${entries.length}`,
        );
      }
      return { key, price };
    } catch (error) {
      failures += 1;
      console.warn(
        `[commercial-reserve-phase2] request failed for ${key}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return { key, price: null };
    }
  });

  const cache: Record<string, FareharborPhase2PriceEntry> = {};
  for (const { key, price } of resolved) {
    if (price) cache[key] = price;
  }

  await writeCacheFile(cache);

  console.info(
    `[commercial-reserve-phase2] SUMMARY ${JSON.stringify({
      candidates: entries.length,
      mediumConfidencePrices: Object.keys(cache).length,
      coverageRate:
        entries.length > 0
          ? Number((Object.keys(cache).length / entries.length).toFixed(4))
          : 0,
      requestFailures: failures,
      phase2Currency: PHASE2_CURRENCY,
      phase2MinPrice: PHASE2_MIN_PRICE,
      activated: false,
    })}`,
  );
};

main().catch(error => {
  console.error("[commercial-reserve-phase2] FATAL", error);
  process.exitCode = 1;
});
