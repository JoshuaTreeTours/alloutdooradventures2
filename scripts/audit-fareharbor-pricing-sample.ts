import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { tours } from "../src/data/tours";
import { getFareharborItemFromUrl } from "../src/lib/fareharbor";
import { isSuppressedFareHarborBookingPage } from "../src/utils/fareharbor/suppressedBookingPages";
import {
  buildAvailabilityQuery,
  fareharborEndpoints,
  parseAvailabilityResponse,
} from "./fareharborClient";

const SAMPLE_SIZE = 75;
const CONCURRENCY = 5;
const WINDOW_DAYS = 30;
const SECOND_WINDOW_DAYS = 60;
const REQUEST_TIMEOUT_MS = 12_000;
const OUTPUT_DIR = path.resolve("dist");
const JSON_OUTPUT = path.join(OUTPUT_DIR, "fareharbor-pricing-audit.json");
const MD_OUTPUT = path.join(OUTPUT_DIR, "fareharbor-pricing-audit.md");

type PricePoint = {
  label: string | null;
  value: number;
  source: string;
};

type Candidate = {
  id: string;
  title: string;
  operator: string | null;
  state: string;
  city: string;
  canonicalPath: string;
  companyShortname: string;
  itemId: string;
  bookingUrl: string;
  currentStartingPrice: number | null;
  currentCurrency: string | null;
};

type AuditRow = Candidate & {
  status:
    | "priced"
    | "availability-http-error"
    | "no-availability"
    | "quote-http-error"
    | "quote-no-prices"
    | "exception";
  availabilityHttpStatus: number | null;
  quoteHttpStatus: number | null;
  availabilityId: string | null;
  currency: string | null;
  minimumObservedPrice: number | null;
  adultPrice: number | null;
  childPrice: number | null;
  infantPrice: number | null;
  primaryPrice: number | null;
  confidence: "high" | "medium" | "low" | "none";
  likelySafeReplacement: boolean;
  reason: string;
  pricePoints: PricePoint[];
};

const normalizeNumber = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const textValue = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const firstText = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = textValue(record[key]);
    if (value) return value;
  }
  return null;
};

const collectPricePoints = (payload: Record<string, unknown>) => {
  const points: PricePoint[] = [];
  const seen = new Set<string>();

  const add = (value: unknown, label: string | null, source: string) => {
    const price = normalizeNumber(value);
    if (price === null || price <= 0) return;
    const key = `${label ?? ""}|${price}|${source}`;
    if (seen.has(key)) return;
    seen.add(key);
    points.push({ label, value: price, source });
  };

  const scanRecord = (record: Record<string, unknown>, source: string, inheritedLabel: string | null = null) => {
    const ownLabel =
      firstText(record, ["name", "label", "title", "singular", "plural", "description"]) ??
      inheritedLabel;

    add(record.public_price, ownLabel, `${source}.public_price`);
    add(record.minimum_price, ownLabel, `${source}.minimum_price`);
    add(record.price, ownLabel, `${source}.price`);

    const customerTypes = record.customer_types;
    if (Array.isArray(customerTypes)) {
      customerTypes.forEach((entry, index) => {
        if (isRecord(entry)) scanRecord(entry, `${source}.customer_types[${index}]`, ownLabel);
      });
    }

    for (const key of ["rates", "rate_categories"]) {
      const rates = record[key];
      if (Array.isArray(rates)) {
        rates.forEach((entry, index) => {
          if (isRecord(entry)) scanRecord(entry, `${source}.${key}[${index}]`, ownLabel);
        });
      }
    }
  };

  scanRecord(payload, "quote");
  return points;
};

const collectCurrency = (payload: Record<string, unknown>, availabilityRaw?: Record<string, unknown>) => {
  const candidates: unknown[] = [];
  const pushFrom = (record?: Record<string, unknown>) => {
    if (!record) return;
    candidates.push(record.currency, record.currency_code, record.currency_type);
    if (isRecord(record.pricing)) candidates.push(record.pricing.currency);
  };
  pushFrom(payload);
  pushFrom(availabilityRaw);
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      const normalized = candidate.trim().toUpperCase();
      if (/^[A-Z]{3}$/.test(normalized)) return normalized;
    }
  }
  return null;
};

const findLabeledPrice = (points: PricePoint[], matcher: RegExp) => {
  const matches = points.filter(point => point.label && matcher.test(point.label));
  return matches.length ? Math.min(...matches.map(point => point.value)) : null;
};

const timeoutFetch = async (url: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "AllOutdoorAdventures-FareHarbor-Pricing-Audit/1.0",
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const fetchAvailability = async (candidate: Candidate, startOffset: number, endOffset: number) => {
  const today = new Date();
  const start = isoDate(addDays(today, startOffset));
  const end = isoDate(addDays(today, endOffset));
  const base = fareharborEndpoints.availability(candidate.companyShortname, candidate.itemId);
  const url = `${base}?${buildAvailabilityQuery(start, end)}`;
  const response = await timeoutFetch(url);
  if (!response.ok) return { response, entries: [] as ReturnType<typeof parseAvailabilityResponse> };
  const payload = (await response.json()) as unknown;
  return { response, entries: parseAvailabilityResponse(payload) };
};

const auditCandidate = async (candidate: Candidate): Promise<AuditRow> => {
  const base: Omit<AuditRow, "status" | "availabilityHttpStatus" | "quoteHttpStatus" | "availabilityId" | "currency" | "minimumObservedPrice" | "adultPrice" | "childPrice" | "infantPrice" | "primaryPrice" | "confidence" | "likelySafeReplacement" | "reason" | "pricePoints"> = candidate;

  try {
    let availabilityResult = await fetchAvailability(candidate, 0, WINDOW_DAYS);
    if (!availabilityResult.response.ok) {
      return {
        ...base,
        status: "availability-http-error",
        availabilityHttpStatus: availabilityResult.response.status,
        quoteHttpStatus: null,
        availabilityId: null,
        currency: null,
        minimumObservedPrice: null,
        adultPrice: null,
        childPrice: null,
        infantPrice: null,
        primaryPrice: null,
        confidence: "none",
        likelySafeReplacement: false,
        reason: `Availability endpoint returned HTTP ${availabilityResult.response.status}.`,
        pricePoints: [],
      };
    }

    let available = availabilityResult.entries.filter(entry => entry.isAvailable);
    if (!available.length) {
      availabilityResult = await fetchAvailability(candidate, WINDOW_DAYS, SECOND_WINDOW_DAYS);
      if (!availabilityResult.response.ok) {
        return {
          ...base,
          status: "availability-http-error",
          availabilityHttpStatus: availabilityResult.response.status,
          quoteHttpStatus: null,
          availabilityId: null,
          currency: null,
          minimumObservedPrice: null,
          adultPrice: null,
          childPrice: null,
          infantPrice: null,
          primaryPrice: null,
          confidence: "none",
          likelySafeReplacement: false,
          reason: `Second availability endpoint returned HTTP ${availabilityResult.response.status}.`,
          pricePoints: [],
        };
      }
      available = availabilityResult.entries.filter(entry => entry.isAvailable);
    }

    if (!available.length) {
      return {
        ...base,
        status: "no-availability",
        availabilityHttpStatus: availabilityResult.response.status,
        quoteHttpStatus: null,
        availabilityId: null,
        currency: null,
        minimumObservedPrice: null,
        adultPrice: null,
        childPrice: null,
        infantPrice: null,
        primaryPrice: null,
        confidence: "none",
        likelySafeReplacement: false,
        reason: `No available slot found in the next ${SECOND_WINDOW_DAYS} days.`,
        pricePoints: [],
      };
    }

    const availability = available[0];
    const quoteUrl = fareharborEndpoints.quote(
      candidate.companyShortname,
      candidate.itemId,
      availability.availabilityId,
    );
    const quoteResponse = await timeoutFetch(quoteUrl);
    if (!quoteResponse.ok) {
      return {
        ...base,
        status: "quote-http-error",
        availabilityHttpStatus: availabilityResult.response.status,
        quoteHttpStatus: quoteResponse.status,
        availabilityId: availability.availabilityId,
        currency: collectCurrency({}, availability.raw),
        minimumObservedPrice: null,
        adultPrice: null,
        childPrice: null,
        infantPrice: null,
        primaryPrice: null,
        confidence: "none",
        likelySafeReplacement: false,
        reason: `Quote endpoint returned HTTP ${quoteResponse.status}.`,
        pricePoints: [],
      };
    }

    const quotePayload = (await quoteResponse.json()) as Record<string, unknown>;
    const pricePoints = collectPricePoints(quotePayload);
    const currency = collectCurrency(quotePayload, availability.raw);
    if (!pricePoints.length) {
      return {
        ...base,
        status: "quote-no-prices",
        availabilityHttpStatus: availabilityResult.response.status,
        quoteHttpStatus: quoteResponse.status,
        availabilityId: availability.availabilityId,
        currency,
        minimumObservedPrice: null,
        adultPrice: null,
        childPrice: null,
        infantPrice: null,
        primaryPrice: null,
        confidence: "none",
        likelySafeReplacement: false,
        reason: "Quote payload was reachable but contained no recognized positive price fields.",
        pricePoints: [],
      };
    }

    const minimumObservedPrice = Math.min(...pricePoints.map(point => point.value));
    const adultPrice = findLabeledPrice(pricePoints, /\badult\b/i);
    const childPrice = findLabeledPrice(pricePoints, /\bchild|youth|teen\b/i);
    const infantPrice = findLabeledPrice(pricePoints, /\binfant|baby\b/i);
    const directPublicPrices = pricePoints
      .filter(point => /public_price|minimum_price/.test(point.source) && !/customer_types/.test(point.source))
      .map(point => point.value);
    const directPrice = directPublicPrices.length ? Math.min(...directPublicPrices) : null;
    const uniqueValues = Array.from(new Set(pricePoints.map(point => point.value))).sort((a, b) => a - b);

    let primaryPrice: number | null = null;
    let confidence: AuditRow["confidence"] = "low";
    let reason = "Multiple price points were found but no unambiguous adult/public starting price could be identified.";

    if (adultPrice !== null) {
      primaryPrice = adultPrice;
      confidence = "high";
      reason = childPrice !== null || infantPrice !== null
        ? "Adult customer-type price is explicitly labeled; cheaper child/infant rates can be excluded."
        : "Adult customer-type price is explicitly labeled in the live quote.";
    } else if (directPrice !== null && currency) {
      primaryPrice = directPrice;
      confidence = uniqueValues.length === 1 ? "high" : "medium";
      reason = uniqueValues.length === 1
        ? "Live quote exposes one public/minimum price and a currency."
        : "Live quote exposes a direct public/minimum price plus other rate values; usable with a conservative rule.";
    } else if (uniqueValues.length === 1 && currency) {
      primaryPrice = uniqueValues[0];
      confidence = "medium";
      reason = "Only one positive live quote price exists, but it is not explicitly labeled adult/public.";
    } else {
      primaryPrice = minimumObservedPrice;
    }

    const likelySafeReplacement =
      primaryPrice !== null &&
      primaryPrice > 0 &&
      currency !== null &&
      (confidence === "high" || confidence === "medium");

    return {
      ...base,
      status: "priced",
      availabilityHttpStatus: availabilityResult.response.status,
      quoteHttpStatus: quoteResponse.status,
      availabilityId: availability.availabilityId,
      currency,
      minimumObservedPrice,
      adultPrice,
      childPrice,
      infantPrice,
      primaryPrice,
      confidence,
      likelySafeReplacement,
      reason,
      pricePoints: pricePoints.slice(0, 30),
    };
  } catch (error) {
    return {
      ...base,
      status: "exception",
      availabilityHttpStatus: null,
      quoteHttpStatus: null,
      availabilityId: null,
      currency: null,
      minimumObservedPrice: null,
      adultPrice: null,
      childPrice: null,
      infantPrice: null,
      primaryPrice: null,
      confidence: "none",
      likelySafeReplacement: false,
      reason: error instanceof Error ? error.message : String(error),
      pricePoints: [],
    };
  }
};

const canonicalPathFor = (tour: (typeof tours)[number]) =>
  `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`;

const fnv1a = (input: string) => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

const buildCandidates = () => {
  const byItem = new Map<string, Candidate>();

  for (const tour of tours) {
    if (tour.bookingProvider !== "fareharbor") continue;
    if (tour.engine === "engine6") continue;
    if (isSuppressedFareHarborBookingPage(tour)) continue;
    if (tour.startingPrice !== undefined && tour.startingPrice !== null && tour.startingPrice >= 20) continue;

    const sourceUrl = tour.bookingWidgetUrl || tour.bookingUrl;
    const reference = getFareharborItemFromUrl(sourceUrl);
    if (!reference) continue;

    const canonicalPath = canonicalPathFor(tour);
    const key = `${reference.companyShortname}:${reference.itemId}`;
    if (!byItem.has(key)) {
      byItem.set(key, {
        id: tour.id,
        title: tour.title,
        operator: tour.operator ?? null,
        state: tour.destination.state,
        city: tour.destination.city,
        canonicalPath,
        companyShortname: reference.companyShortname,
        itemId: reference.itemId,
        bookingUrl: sourceUrl,
        currentStartingPrice: tour.startingPrice ?? null,
        currentCurrency: tour.currency ?? null,
      });
    }
  }

  const all = Array.from(byItem.values());
  all.sort((a, b) => fnv1a(a.canonicalPath) - fnv1a(b.canonicalPath));
  return { all, sample: all.slice(0, SAMPLE_SIZE) };
};

const runWithConcurrency = async <T, R>(items: T[], worker: (item: T) => Promise<R>) => {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  const runner = async () => {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index]);
      console.log(`[fareharbor-audit] ${index + 1}/${items.length}`);
    }
  };

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, runner));
  return results;
};

const median = (values: number[]) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const run = async () => {
  const { all, sample } = buildCandidates();
  if (!sample.length) throw new Error("No eligible legacy FareHarbor fallback candidates were found.");

  console.log(`[fareharbor-audit] eligible fallback cohort=${all.length}; sample=${sample.length}`);
  const rows = await runWithConcurrency(sample, auditCandidate);

  const pricedRows = rows.filter(row => row.status === "priced");
  const safeRows = rows.filter(row => row.likelySafeReplacement);
  const primaryPrices = safeRows.map(row => row.primaryPrice).filter((value): value is number => value !== null);
  const exact129 = safeRows.filter(row => row.primaryPrice === 129).length;
  const differs129 = safeRows.filter(row => row.primaryPrice !== null && row.primaryPrice !== 129).length;
  const highConfidence = rows.filter(row => row.confidence === "high").length;
  const mediumConfidence = rows.filter(row => row.confidence === "medium").length;
  const lowConfidence = rows.filter(row => row.confidence === "low").length;
  const currencies = Array.from(new Set(safeRows.map(row => row.currency).filter(Boolean))).sort();
  const operators = new Set(sample.map(row => row.companyShortname));
  const states = new Set(sample.map(row => row.state));
  const cities = new Set(sample.map(row => `${row.state}|${row.city}`));

  const summary = {
    generatedAt: new Date().toISOString(),
    sampleSizeRequested: SAMPLE_SIZE,
    eligibleLegacyFallbackCohort: all.length,
    sampledCount: sample.length,
    uniqueFareHarborOperatorsSampled: operators.size,
    uniqueStatesOrCountriesSampled: states.size,
    uniqueCitiesSampled: cities.size,
    pricedQuoteCount: pricedRows.length,
    likelySafeReplacementCount: safeRows.length,
    likelySafeReplacementRate: Number((safeRows.length / sample.length).toFixed(4)),
    highConfidenceCount: highConfidence,
    mediumConfidenceCount: mediumConfidence,
    lowConfidenceCount: lowConfidence,
    noAvailabilityCount: rows.filter(row => row.status === "no-availability").length,
    availabilityHttpErrorCount: rows.filter(row => row.status === "availability-http-error").length,
    quoteHttpErrorCount: rows.filter(row => row.status === "quote-http-error").length,
    quoteNoPricesCount: rows.filter(row => row.status === "quote-no-prices").length,
    exceptionCount: rows.filter(row => row.status === "exception").length,
    safePricesExactly129: exact129,
    safePricesDifferentFrom129: differs129,
    medianSafePrimaryPrice: median(primaryPrices),
    minimumSafePrimaryPrice: primaryPrices.length ? Math.min(...primaryPrices) : null,
    maximumSafePrimaryPrice: primaryPrices.length ? Math.max(...primaryPrices) : null,
    currencies,
  };

  const report = { summary, rows };
  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(JSON_OUTPUT, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const mdLines = [
    "# FareHarbor legacy fallback pricing audit",
    "",
    `Generated: ${summary.generatedAt}`,
    "",
    `- Eligible legacy FareHarbor fallback cohort: **${summary.eligibleLegacyFallbackCohort}**`,
    `- Sampled: **${summary.sampledCount}** products across **${summary.uniqueFareHarborOperatorsSampled}** FareHarbor operators and **${summary.uniqueCitiesSampled}** cities`,
    `- Live quote reached with recognized pricing: **${summary.pricedQuoteCount}/${summary.sampledCount}**`,
    `- Likely safe automated replacement: **${summary.likelySafeReplacementCount}/${summary.sampledCount} (${(summary.likelySafeReplacementRate * 100).toFixed(1)}%)**`,
    `- Confidence: **${summary.highConfidenceCount} high**, **${summary.mediumConfidenceCount} medium**, **${summary.lowConfidenceCount} low**`,
    `- Safe prices equal to $129: **${summary.safePricesExactly129}**; different from $129: **${summary.safePricesDifferentFrom129}**`,
    `- Median safe primary price: **${summary.medianSafePrimaryPrice ?? "n/a"}**`,
    `- Safe price range: **${summary.minimumSafePrimaryPrice ?? "n/a"}–${summary.maximumSafePrimaryPrice ?? "n/a"}**`,
    `- Currencies observed: **${summary.currencies.join(", ") || "none"}**`,
    "",
    "## Sample results",
    "",
    "| Product | FH item | Status | Primary | Currency | Confidence | Adult | Child | Min observed |",
    "|---|---:|---|---:|---|---|---:|---:|---:|",
    ...rows.map(row =>
      `| ${row.title.replace(/\|/g, "\\|")} | ${row.companyShortname}/${row.itemId} | ${row.status} | ${row.primaryPrice ?? ""} | ${row.currency ?? ""} | ${row.confidence} | ${row.adultPrice ?? ""} | ${row.childPrice ?? ""} | ${row.minimumObservedPrice ?? ""} |`
    ),
    "",
    "## Interpretation rule",
    "",
    "High/medium confidence requires a live quote, a known currency, and either an explicitly labeled Adult price, a direct public/minimum price, or a single unambiguous positive quote price. Child/infant rates are not substituted for an adult price when labels are available.",
  ];
  await writeFile(MD_OUTPUT, `${mdLines.join("\n")}\n`, "utf8");

  console.log("[fareharbor-audit] summary", JSON.stringify(summary));
  console.log(`[fareharbor-audit] wrote ${JSON_OUTPUT}`);
};

run().catch(error => {
  console.error("[fareharbor-audit] fatal", error);
  process.exitCode = 1;
});
