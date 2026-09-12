import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

import { tours as routeBackedTours } from "../src/data/tours";
import { getAllEngine2Tours } from "../src/engine2/data/loadEngine2";
import { legacyFhMigratedTours } from "../src/engine6/legacyFh/registry";
import { getFareharborItemFromUrl } from "../src/lib/fareharbor";
import { PRICE_MIN_THRESHOLD_USD } from "../src/constants/merchantDefaults";
import { parsePrice } from "../src/utils/merchantPricing";
import {
  resolveHighConfidenceFareHarborPrice,
  resolvePhase2FareHarborPrice,
  resolvePhase3FareHarborPrice,
} from "../src/utils/fareharbor/pricePreview";

type SourceKind = "route-backed" | "engine2" | "legacy-fh-migrated";

type SourceRecord = {
  source: SourceKind;
  id: string;
  title: string;
  bookingUrl: string;
  existingPrice: number | null;
  existingCurrency: string | null;
  fallbackBeforeAudit: boolean;
  route: string | null;
};

type Candidate = {
  key: string;
  companyShortname: string;
  itemId: string;
  asn: string;
  records: SourceRecord[];
};

type JsonRecord = Record<string, unknown>;

type PreviewSignals = {
  currency: string | null;
  advertisedLow: number | null;
  advertisedHigh: number | null;
  customerTypeCount: number;
  customerTypeLabels: string[];
};

const MAX_CONCURRENCY = 16;
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 3;
const REPORT_DIR = path.resolve("reports");
const REPORT_JSON = path.join(REPORT_DIR, "fareharbor-full-universe-pricing-audit.json");
const REPORT_MD = path.join(REPORT_DIR, "fareharbor-full-universe-pricing-audit.md");

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const numeric = (value: unknown) =>
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

const buildPreviewUrl = (candidate: Candidate) =>
  `https://fareharbor.com/api/embed/${encodeURIComponent(candidate.companyShortname)}/price-preview/per-item/v2/?asn=${encodeURIComponent(candidate.asn)}&item_pks=${encodeURIComponent(candidate.itemId)}&include_breakdown=yes&allow_unlisted_items=yes`;

const isUsableExistingPrice = (price: number | null) =>
  price !== null && Number.isFinite(price) && price >= PRICE_MIN_THRESHOLD_USD;

const getPreviewSignals = (payload: unknown): PreviewSignals => {
  if (!isRecord(payload)) {
    return {
      currency: null,
      advertisedLow: null,
      advertisedHigh: null,
      customerTypeCount: 0,
      customerTypeLabels: [],
    };
  }

  const details = isRecord(payload.details) ? payload.details : {};
  const currency =
    typeof details.currency === "string" && details.currency.trim()
      ? details.currency.trim().toUpperCase()
      : null;
  const decimals = numeric(details.currency_decimal_places) ?? 2;
  const divisor = 10 ** Math.min(Math.max(decimals, 0), 4);
  const items = Array.isArray(payload.items) ? payload.items.filter(isRecord) : [];
  if (items.length !== 1) {
    return {
      currency,
      advertisedLow: null,
      advertisedHigh: null,
      customerTypeCount: 0,
      customerTypeLabels: [],
    };
  }

  const price = isRecord(items[0].price) ? items[0].price : {};
  const breakdown = isRecord(price.breakdown) ? price.breakdown : {};
  const customerTypes = Array.isArray(breakdown.customer_types)
    ? breakdown.customer_types.filter(isRecord)
    : [];

  const rawLow = numeric(price.low);
  const rawHigh = numeric(price.high);
  return {
    currency,
    advertisedLow: rawLow !== null ? rawLow / divisor : null,
    advertisedHigh: rawHigh !== null ? rawHigh / divisor : null,
    customerTypeCount: customerTypes.length,
    customerTypeLabels: Array.from(
      new Set(customerTypes.map(labelOf).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b)),
  };
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchJsonWithRetry = async (url: string) => {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "AOA-FareHarbor-Full-Universe-Audit/1.0",
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
    await sleep(350 * 2 ** attempt);
  }
  throw lastError ?? new Error("FareHarbor request failed");
};

const collectRecords = () => {
  const records: SourceRecord[] = [];

  for (const tour of routeBackedTours) {
    if (tour.bookingProvider !== "fareharbor") continue;
    const existingPrice =
      typeof tour.startingPrice === "number" && Number.isFinite(tour.startingPrice)
        ? tour.startingPrice
        : null;
    records.push({
      source: "route-backed",
      id: tour.productCode ?? tour.id,
      title: tour.title,
      bookingUrl: tour.bookingUrl,
      existingPrice,
      existingCurrency: tour.currency ?? null,
      fallbackBeforeAudit: !isUsableExistingPrice(existingPrice),
      route: `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`,
    });
  }

  for (const tour of getAllEngine2Tours()) {
    if (tour.bookingProvider !== "fareharbor") continue;
    const existingPrice = parsePrice(tour.pricing?.price ?? null);
    records.push({
      source: "engine2",
      id: String(tour.id),
      title: tour.name,
      bookingUrl: tour.bookingUrl ?? tour.booking.bookingUrl,
      existingPrice,
      existingCurrency: tour.pricing?.currency ?? null,
      fallbackBeforeAudit: !isUsableExistingPrice(existingPrice),
      route: tour.seo.canonicalPath ?? null,
    });
  }

  for (const tour of legacyFhMigratedTours) {
    const existingPrice =
      typeof tour.priceAmount === "number" && Number.isFinite(tour.priceAmount)
        ? tour.priceAmount
        : null;
    records.push({
      source: "legacy-fh-migrated",
      id: tour.productCode,
      title: tour.title,
      bookingUrl: tour.bookingUrl,
      existingPrice,
      existingCurrency: tour.priceCurrency ?? null,
      fallbackBeforeAudit: !isUsableExistingPrice(existingPrice),
      route: tour.canonicalPath,
    });
  }

  return records;
};

const buildCandidates = (records: SourceRecord[]) => {
  const candidates = new Map<string, Candidate>();
  let unparseableBookingUrls = 0;

  for (const record of records) {
    const ref = getFareharborItemFromUrl(record.bookingUrl);
    if (!ref) {
      unparseableBookingUrls += 1;
      continue;
    }
    const key = `${ref.companyShortname}:${ref.itemId}`;
    const current = candidates.get(key);
    if (current) {
      current.records.push(record);
      continue;
    }
    candidates.set(key, {
      key,
      companyShortname: ref.companyShortname,
      itemId: ref.itemId,
      asn: getAsn(record.bookingUrl),
      records: [record],
    });
  }

  return { candidates, unparseableBookingUrls };
};

const runPool = async <T, R>(items: T[], worker: (item: T, index: number) => Promise<R>) => {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const runWorker = async () => {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(MAX_CONCURRENCY, items.length) }, runWorker),
  );
  return results;
};

const main = async () => {
  const sourceRecords = collectRecords();
  const { candidates, unparseableBookingUrls } = buildCandidates(sourceRecords);
  const entries = Array.from(candidates.values()).sort((a, b) => a.key.localeCompare(b.key));

  const sourceCounts = sourceRecords.reduce<Record<string, number>>((acc, record) => {
    acc[record.source] = (acc[record.source] ?? 0) + 1;
    return acc;
  }, {});
  const fallbackRecords = sourceRecords.filter(record => record.fallbackBeforeAudit).length;
  const existingUsableRecords = sourceRecords.length - fallbackRecords;

  console.info(
    `[fh-universe] records=${sourceRecords.length} uniqueItems=${entries.length} fallbackRecords=${fallbackRecords} existingUsableRecords=${existingUsableRecords} unparseable=${unparseableBookingUrls}`,
  );

  let requestFailures = 0;
  let completed = 0;
  const audited = await runPool(entries, async candidate => {
    try {
      const { status, payload } = await fetchJsonWithRetry(buildPreviewUrl(candidate));
      const signals = payload ? getPreviewSignals(payload) : getPreviewSignals(null);
      const phase1 = payload ? resolveHighConfidenceFareHarborPrice(payload) : null;
      const phase2 = payload ? resolvePhase2FareHarborPrice(payload) : null;
      const phase3 = payload ? resolvePhase3FareHarborPrice(payload) : null;
      const safe = phase1 ?? phase2 ?? phase3;
      completed += 1;
      if (completed % 250 === 0 || completed === entries.length) {
        console.info(`[fh-universe] ${completed}/${entries.length}`);
      }
      return {
        key: candidate.key,
        companyShortname: candidate.companyShortname,
        itemId: candidate.itemId,
        status,
        records: candidate.records,
        signals,
        phase: phase1 ? 1 : phase2 ? 2 : phase3 ? 3 : null,
        safeResolvedPrice: safe?.startingPrice ?? null,
        safeResolvedCurrency: safe?.currency ?? null,
        providerAdvertisedPriceUsable:
          signals.advertisedLow !== null &&
          signals.advertisedLow >= PRICE_MIN_THRESHOLD_USD,
      };
    } catch (error) {
      requestFailures += 1;
      completed += 1;
      return {
        key: candidate.key,
        companyShortname: candidate.companyShortname,
        itemId: candidate.itemId,
        status: null,
        records: candidate.records,
        signals: getPreviewSignals(null),
        phase: null,
        safeResolvedPrice: null,
        safeResolvedCurrency: null,
        providerAdvertisedPriceUsable: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  const safeResolvedItems = audited.filter(item => item.safeResolvedPrice !== null);
  const providerLowItems = audited.filter(item => item.providerAdvertisedPriceUsable);
  const providerLowNotSafeItems = audited.filter(
    item => item.providerAdvertisedPriceUsable && item.safeResolvedPrice === null,
  );
  const fallbackCandidates = audited.filter(item =>
    item.records.some(record => record.fallbackBeforeAudit),
  );
  const fallbackSafeResolved = fallbackCandidates.filter(item => item.safeResolvedPrice !== null);
  const fallbackProviderLowResolved = fallbackCandidates.filter(item => item.providerAdvertisedPriceUsable);
  const fallbackProviderLowNotSafe = fallbackCandidates.filter(
    item => item.providerAdvertisedPriceUsable && item.safeResolvedPrice === null,
  );
  const currencies = audited.reduce<Record<string, number>>((acc, item) => {
    const currency = item.signals.currency ?? "UNKNOWN";
    acc[currency] = (acc[currency] ?? 0) + 1;
    return acc;
  }, {});
  const statusCounts = audited.reduce<Record<string, number>>((acc, item) => {
    const status = item.status === null ? "error" : String(item.status);
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});
  const phaseCounts = audited.reduce<Record<string, number>>((acc, item) => {
    const phase = item.phase ? `phase${item.phase}` : "unresolved";
    acc[phase] = (acc[phase] ?? 0) + 1;
    return acc;
  }, {});

  const summary = {
    sourceRecordCount: sourceRecords.length,
    sourceCounts,
    uniqueFareHarborItems: entries.length,
    unparseableBookingUrls,
    existingUsableRecords,
    fallbackRecords,
    fallbackUniqueItems: fallbackCandidates.length,
    requestFailures,
    statusCounts,
    currencies,
    phaseCounts,
    safeResolvedUniqueItems: safeResolvedItems.length,
    providerAdvertisedLowUniqueItems: providerLowItems.length,
    providerAdvertisedLowButNotSafeUniqueItems: providerLowNotSafeItems.length,
    fallbackSafeResolvedUniqueItems: fallbackSafeResolved.length,
    fallbackProviderAdvertisedLowUniqueItems: fallbackProviderLowResolved.length,
    fallbackProviderAdvertisedLowButNotSafeUniqueItems: fallbackProviderLowNotSafe.length,
    fallbackSafeCoverageRate:
      fallbackCandidates.length > 0
        ? Number((fallbackSafeResolved.length / fallbackCandidates.length).toFixed(4))
        : 0,
    fallbackProviderAdvertisedLowCoverageRate:
      fallbackCandidates.length > 0
        ? Number((fallbackProviderLowResolved.length / fallbackCandidates.length).toFixed(4))
        : 0,
  };

  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(REPORT_JSON, JSON.stringify({ summary, items: audited }, null, 2), "utf8");

  const md = `# FareHarbor Full-Universe Pricing Audit\n\n` +
    `## Summary\n\n` +
    `- Source records: ${summary.sourceRecordCount}\n` +
    `- Unique FareHarbor items: ${summary.uniqueFareHarborItems}\n` +
    `- Existing usable-price records: ${summary.existingUsableRecords}\n` +
    `- Records currently on fallback/missing price: ${summary.fallbackRecords}\n` +
    `- Unique fallback FareHarbor items: ${summary.fallbackUniqueItems}\n` +
    `- Safe Phase 1-3 prices among fallback items: ${summary.fallbackSafeResolvedUniqueItems} (${(summary.fallbackSafeCoverageRate * 100).toFixed(1)}%)\n` +
    `- FareHarbor provider-advertised low prices among fallback items: ${summary.fallbackProviderAdvertisedLowUniqueItems} (${(summary.fallbackProviderAdvertisedLowCoverageRate * 100).toFixed(1)}%)\n` +
    `- Provider-advertised low prices not covered by Phase 1-3 rules: ${summary.fallbackProviderAdvertisedLowButNotSafeUniqueItems}\n` +
    `- Request failures: ${summary.requestFailures}\n\n` +
    `## Source counts\n\n\`\`\`json\n${JSON.stringify(summary.sourceCounts, null, 2)}\n\`\`\`\n\n` +
    `## Currency counts\n\n\`\`\`json\n${JSON.stringify(summary.currencies, null, 2)}\n\`\`\`\n\n` +
    `## Phase counts\n\n\`\`\`json\n${JSON.stringify(summary.phaseCounts, null, 2)}\n\`\`\`\n\n` +
    `## Interpretation\n\n` +
    `The Phase 1-3 figure is the conservative adult/standard-traveler coverage. The provider-advertised-low figure measures whether FareHarbor itself exposes a current low price for the item through its price-preview endpoint. That second number is the key feasibility signal for replacing the generic $129 fallback, but it still requires sample verification before production because the low price can represent a child or other lower customer type.\n`;
  await writeFile(REPORT_MD, md, "utf8");

  console.info(`[fh-universe] SUMMARY ${JSON.stringify(summary)}`);
};

main().catch(error => {
  console.error("[fh-universe] FATAL", error);
  process.exitCode = 1;
});
