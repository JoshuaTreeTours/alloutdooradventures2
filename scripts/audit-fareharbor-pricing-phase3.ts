import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { getAllEngine2Tours } from "../src/engine2/data/loadEngine2";
import { getFareharborItemFromUrl } from "../src/lib/fareharbor";
import { PRICE_MIN_THRESHOLD_USD } from "../src/constants/merchantDefaults";
import { parsePrice } from "../src/utils/merchantPricing";
import {
  resolveHighConfidenceFareHarborPrice,
  resolvePhase2FareHarborPrice,
  resolvePhase3FareHarborPrice,
} from "../src/utils/fareharbor/pricePreview";
import { isSuppressedFareHarborBookingPage } from "../src/utils/fareharbor/suppressedBookingPages";

type JsonRecord = Record<string, unknown>;

type Candidate = {
  key: string;
  companyShortname: string;
  itemId: string;
  bookingUrl: string;
  asn: string;
  title: string;
};

type LabelExample = {
  key: string;
  title: string;
  label: string;
  price: number | null;
  currency: string;
};

type LabelSummary = {
  label: string;
  count: number;
  currencies: string[];
  minPrice: number | null;
  maxPrice: number | null;
  examples: LabelExample[];
};

const OUTPUT_PATH = path.resolve("reports/fareharbor-phase3-label-audit.json");
const MAX_CONCURRENCY = 8;
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_ATTEMPTS = 3;
const MAX_EXAMPLES_PER_LABEL = 5;

const EXPERIENCE_TITLE_SIGNAL =
  /\b(tour|guided|cruise|sail|sailing|snorkel|snorkeling|hike|hiking|walk|walking|raft|rafting|zipline|scuba|dive|diving|safari|excursion|adventure|experience|tasting|food|wine|ghost|museum|admission|class|lesson|whale|dolphin|volcano|sunset|sunrise|stargazing|fishing|horseback|helicopter|flight|luau|show|cave|wildlife|waterfall|jeep|atv|utv)\b/i;
const NON_EXPERIENCE_PRODUCT_SIGNAL =
  /\b(rental|rentals|rent|umbrella|chair|locker|parking|gift\s*card|deposit|add[- ]?on|upgrade|merchandise|equipment|gear)\b/i;

const isExperienceTitle = (title: string) =>
  EXPERIENCE_TITLE_SIGNAL.test(title) &&
  !NON_EXPERIENCE_PRODUCT_SIGNAL.test(title);

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const numberValue = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const labelOf = (record: JsonRecord) => {
  for (const key of ["singular", "name", "label", "title", "plural"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

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
          "User-Agent": "AOA-FareHarbor-Commercial-Reserve-Phase3-Audit/1.0",
        },
        signal: controller.signal,
      });
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
    await sleep(300 * 2 ** attempt);
  }

  throw lastError ?? new Error("FareHarbor Phase 3 audit request failed");
};

const buildCandidates = () => {
  const candidates = new Map<string, Candidate>();

  for (const tour of getAllEngine2Tours()) {
    if (tour.bookingProvider !== "fareharbor") continue;
    if (tour.type === "rental") continue;
    if (!isExperienceTitle(tour.name)) continue;
    if (isSuppressedFareHarborBookingPage(tour)) continue;

    const existingPrice = parsePrice(tour.pricing?.price ?? null);
    if (existingPrice !== null && existingPrice >= PRICE_MIN_THRESHOLD_USD) {
      continue;
    }

    const bookingUrl = tour.bookingUrl ?? tour.booking.bookingUrl;
    const reference = getFareharborItemFromUrl(bookingUrl);
    if (!reference) continue;
    const key = `${reference.companyShortname}:${reference.itemId}`;
    if (candidates.has(key)) continue;

    candidates.set(key, {
      key,
      companyShortname: reference.companyShortname,
      itemId: reference.itemId,
      bookingUrl,
      asn: getAsn(bookingUrl),
      title: tour.name,
    });
  }

  return Array.from(candidates.values()).sort((a, b) => a.key.localeCompare(b.key));
};

const runPool = async <T, R>(items: T[], worker: (item: T) => Promise<R>) => {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const runWorker = async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index]);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(MAX_CONCURRENCY, items.length) }, runWorker),
  );
  return results;
};

const extractBreakdown = (payload: unknown) => {
  if (!isRecord(payload)) return null;
  const details = isRecord(payload.details) ? payload.details : {};
  const currency =
    typeof details.currency === "string"
      ? details.currency.trim().toUpperCase()
      : "";
  const decimalPlaces = numberValue(details.currency_decimal_places) ?? 2;
  if (!currency || decimalPlaces < 0 || decimalPlaces > 4) return null;
  const divisor = 10 ** decimalPlaces;

  const items = Array.isArray(payload.items) ? payload.items.filter(isRecord) : [];
  if (items.length !== 1) return null;
  const price = isRecord(items[0].price) ? items[0].price : null;
  const breakdown = price && isRecord(price.breakdown) ? price.breakdown : null;
  const customerTypes = breakdown && Array.isArray(breakdown.customer_types)
    ? breakdown.customer_types.filter(isRecord)
    : [];
  if (!customerTypes.length) return null;
  return { currency, divisor, customerTypes };
};

const main = async () => {
  const candidates = buildCandidates();
  let requestFailures = 0;

  const observations = await runPool(candidates, async candidate => {
    try {
      const { status, payload } = await fetchJsonWithRetry(buildPricePreviewUrl(candidate));
      if (status !== 200 || payload === null) return null;

      if (
        resolveHighConfidenceFareHarborPrice(payload) ||
        resolvePhase2FareHarborPrice(payload) ||
        resolvePhase3FareHarborPrice(payload)
      ) {
        return null;
      }

      const parsed = extractBreakdown(payload);
      if (!parsed) return null;

      return parsed.customerTypes
        .map(record => {
          const label = labelOf(record);
          if (!label) return null;
          const rawPrice = numberValue(record.price);
          return {
            key: candidate.key,
            title: candidate.title,
            label,
            price: rawPrice !== null && rawPrice > 0 ? rawPrice / parsed.divisor : null,
            currency: parsed.currency,
          } satisfies LabelExample;
        })
        .filter((entry): entry is LabelExample => Boolean(entry));
    } catch (error) {
      requestFailures += 1;
      console.warn(
        `[commercial-reserve-phase3-audit] request failed for ${candidate.key}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  });

  const byLabel = new Map<string, LabelSummary>();
  let unresolvedPayloads = 0;

  for (const observation of observations) {
    if (!observation?.length) continue;
    unresolvedPayloads += 1;
    for (const entry of observation) {
      const normalized = entry.label.trim().replace(/\s+/g, " ");
      const existing = byLabel.get(normalized) ?? {
        label: normalized,
        count: 0,
        currencies: [],
        minPrice: null,
        maxPrice: null,
        examples: [],
      };
      existing.count += 1;
      if (entry.currency && !existing.currencies.includes(entry.currency)) {
        existing.currencies.push(entry.currency);
        existing.currencies.sort();
      }
      if (entry.price !== null) {
        existing.minPrice =
          existing.minPrice === null ? entry.price : Math.min(existing.minPrice, entry.price);
        existing.maxPrice =
          existing.maxPrice === null ? entry.price : Math.max(existing.maxPrice, entry.price);
      }
      if (existing.examples.length < MAX_EXAMPLES_PER_LABEL) {
        existing.examples.push(entry);
      }
      byLabel.set(normalized, existing);
    }
  }

  const labels = Array.from(byLabel.values()).sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label),
  );

  const report = {
    generatedAt: new Date().toISOString(),
    candidates: candidates.length,
    unresolvedPayloads,
    uniqueLabels: labels.length,
    requestFailures,
    labels,
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.info(`[commercial-reserve-phase3-audit] SUMMARY ${JSON.stringify({
    candidates: report.candidates,
    unresolvedPayloads: report.unresolvedPayloads,
    uniqueLabels: report.uniqueLabels,
    requestFailures: report.requestFailures,
    topLabels: labels.slice(0, 20).map(({ label, count }) => ({ label, count })),
  })}`);
};

main().catch(error => {
  console.error("[commercial-reserve-phase3-audit] FATAL", error);
  process.exitCode = 1;
});
