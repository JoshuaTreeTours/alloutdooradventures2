import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { getFareharborItemFromUrl } from "../src/lib/fareharbor";
import {
  buildAvailabilityQuery,
  fareharborEndpoints,
  parseAvailabilityResponse,
} from "./fareharborClient";

type FareharborPriceEntry = {
  startingPrice: number;
  currency: string;
  source: "fareharbor-api";
  lastUpdated: string;
};

type FareharborItemReference = {
  companyShortname: string;
  itemId: string;
};

const DATA_DIR = path.resolve("data");
const SRC_DATA_DIR = path.resolve("src/data");
const OUTPUT_PATH = path.resolve("src/data/fareharborPricing.ts");

const buildCacheKey = ({ companyShortname, itemId }: FareharborItemReference) =>
  `${companyShortname}:${itemId}`;

const splitCsvLine = (text: string) => {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "\n" && !inQuotes) {
      row.push(current);
      rows.push(row);
      current = "";
      row = [];
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if (char !== "\r") {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows;
};

const parseCsv = (contents: string) => {
  const rows = splitCsvLine(contents);
  const [header, ...dataRows] = rows;
  if (!header) {
    return { header: [], records: [] as Record<string, string>[] };
  }

  const records = dataRows.map((row) => {
    const record: Record<string, string> = {};
    header.forEach((column, index) => {
      record[column] = row[index] ?? "";
    });
    return record;
  });

  return { header, records };
};

const listFiles = async (directory: string, extension: string) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath, extension)));
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(fullPath);
    }
  }

  return files;
};

const extractFareharborItemsFromCsv = async (csvPath: string) => {
  const contents = await readFile(csvPath, "utf8");
  const { records } = parseCsv(contents);
  const items = new Map<string, FareharborItemReference>();

  for (const record of records) {
    const companyShortname = record.company_shortname?.trim();
    const itemId = record.item_id?.trim();
    if (companyShortname && itemId) {
      const reference = { companyShortname, itemId };
      items.set(buildCacheKey(reference), reference);
      continue;
    }

    const bookingUrl =
      record.booking_url?.trim() ||
      record.regular_link?.trim() ||
      record.calendar_link?.trim();
    const reference = getFareharborItemFromUrl(bookingUrl);
    if (reference) {
      items.set(buildCacheKey(reference), reference);
    }
  }

  return items;
};

const extractFareharborItemsFromSource = async (sourcePath: string) => {
  const contents = await readFile(sourcePath, "utf8");
  const matches =
    contents.match(/https?:\/\/fareharbor\.com\/[^\s"'()]+/g) ?? [];
  const items = new Map<string, FareharborItemReference>();

  for (const match of matches) {
    const reference = getFareharborItemFromUrl(match);
    if (reference) {
      items.set(buildCacheKey(reference), reference);
    }
  }

  return items;
};

const normalizePriceValue = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const collectPriceCandidates = (payload: Record<string, unknown>) => {
  const priceCandidates: number[] = [];

  const directFields = [
    payload.public_price,
    payload.minimum_price,
    payload.price,
  ];
  directFields.forEach((value) => {
    const normalized = normalizePriceValue(value);
    if (normalized !== null) {
      priceCandidates.push(normalized);
    }
  });

  const customerTypes = payload.customer_types;
  if (Array.isArray(customerTypes)) {
    customerTypes.forEach((customerType) => {
      if (!customerType || typeof customerType !== "object") {
        return;
      }
      const price = normalizePriceValue(
        (customerType as Record<string, unknown>).price,
      );
      const publicPrice = normalizePriceValue(
        (customerType as Record<string, unknown>).public_price,
      );
      if (price !== null) {
        priceCandidates.push(price);
      }
      if (publicPrice !== null) {
        priceCandidates.push(publicPrice);
      }
    });
  }

  return priceCandidates.filter((price) => price > 0);
};

const extractStartingPrice = (payload: Record<string, unknown>) => {
  const priceCandidates = collectPriceCandidates(payload);

  if (!priceCandidates.length) {
    return null;
  }

  return Math.min(...priceCandidates);
};

const extractCurrency = (payload: Record<string, unknown>) => {
  const candidates = [
    payload.currency,
    payload.currency_code,
    payload.currency_type,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim().toUpperCase();
    }
  }
  return "USD";
};

const collectQuotePriceCandidates = (payload: Record<string, unknown>) => {
  const candidates: number[] = [];

  candidates.push(...collectPriceCandidates(payload));

  const customerTypes = payload.customer_types;
  if (Array.isArray(customerTypes)) {
    customerTypes.forEach((customerType) => {
      if (!customerType || typeof customerType !== "object") {
        return;
      }
      candidates.push(
        ...collectPriceCandidates(customerType as Record<string, unknown>),
      );
    });
  }

  const rateCandidates = [payload.rates, payload.rate_categories];
  rateCandidates.forEach((rates) => {
    if (!Array.isArray(rates)) {
      return;
    }
    rates.forEach((rate) => {
      if (!rate || typeof rate !== "object") {
        return;
      }
      candidates.push(...collectPriceCandidates(rate as Record<string, unknown>));
      const rateCustomerTypes = (rate as Record<string, unknown>).customer_types;
      if (Array.isArray(rateCustomerTypes)) {
        rateCustomerTypes.forEach((customerType) => {
          if (!customerType || typeof customerType !== "object") {
            return;
          }
          candidates.push(
            ...collectPriceCandidates(customerType as Record<string, unknown>),
          );
        });
      }
    });
  });

  return candidates.filter((price) => price > 0);
};

const collectCurrencyCandidates = (payload: Record<string, unknown>) => {
  const candidates = [
    payload.currency,
    payload.currency_code,
    payload.currency_type,
    payload.currency_symbol,
  ];

  const pricingCurrency =
    payload.pricing && typeof payload.pricing === "object"
      ? (payload.pricing as Record<string, unknown>).currency
      : null;
  if (pricingCurrency) {
    candidates.push(pricingCurrency);
  }

  return candidates
    .filter((candidate) => typeof candidate === "string")
    .map((candidate) => (candidate as string).trim().toUpperCase())
    .filter((candidate) => candidate.length > 0);
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  attempts = 3,
) => {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      if (response.status >= 500 || response.status === 429) {
        lastError = new Error(
          `Transient error ${response.status} on ${url}.`,
        );
      } else {
        return response;
      }
    } catch (error) {
      lastError = error;
    }

    const delay = 300 * Math.pow(2, attempt);
    await sleep(delay);
  }

  throw lastError;
};

const buildIsoDate = (date: Date) => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const MAX_CONCURRENCY = 6;
const LOW_PRICE_SHORT_CIRCUIT = 1;
const AVAILABILITY_WINDOW_DAYS = 30;
const AVAILABILITY_LOOKAHEAD_DAYS = 90;

const createConcurrencyLimiter = (limit: number) => {
  let active = 0;
  const queue: Array<() => void> = [];

  const next = () => {
    if (active >= limit || queue.length === 0) {
      return;
    }
    const task = queue.shift();
    if (!task) {
      return;
    }
    active += 1;
    task();
  };

  return <T>(fn: () => Promise<T>) =>
    new Promise<T>((resolve, reject) => {
      const run = async () => {
        try {
          resolve(await fn());
        } catch (error) {
          reject(error);
        } finally {
          active -= 1;
          next();
        }
      };
      queue.push(run);
      next();
    });
};

const fetchAvailabilityWindow = async (
  reference: FareharborItemReference,
  startDate: string,
  endDate: string,
) => {
  const baseUrl = fareharborEndpoints.availability(
    reference.companyShortname,
    reference.itemId,
  );
  const url = `${baseUrl}?${buildAvailabilityQuery(startDate, endDate)}`;
  const response = await fetchWithRetry(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    console.warn(
      `Availability request failed for ${reference.companyShortname}/${reference.itemId}: ${response.status}`,
    );
    return [];
  }

  const payload = (await response.json()) as unknown;
  return parseAvailabilityResponse(payload);
};

const fetchQuotePayload = async (
  reference: FareharborItemReference,
  availabilityId: string,
) => {
  const url = fareharborEndpoints.quote(
    reference.companyShortname,
    reference.itemId,
    availabilityId,
  );
  const response = await fetchWithRetry(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    console.warn(
      `Quote request failed for ${reference.companyShortname}/${reference.itemId} availability ${availabilityId}: ${response.status}`,
    );
    return null;
  }
  return (await response.json()) as Record<string, unknown>;
};

const fetchFareharborPricing = async (
  reference: FareharborItemReference,
): Promise<FareharborPriceEntry | null> => {
  const today = new Date();
  let minPrice: number | null = null;
  let currency: string | null = null;
  let sawAvailability = false;
  let shouldStop = false;

  for (let offset = 0; offset < AVAILABILITY_LOOKAHEAD_DAYS; offset += AVAILABILITY_WINDOW_DAYS) {
    const windowStart = buildIsoDate(addDays(today, offset));
    const windowEnd = buildIsoDate(
      addDays(today, Math.min(offset + AVAILABILITY_WINDOW_DAYS, AVAILABILITY_LOOKAHEAD_DAYS)),
    );

    const availabilityEntries = await fetchAvailabilityWindow(
      reference,
      windowStart,
      windowEnd,
    );

    const availableEntries = availabilityEntries.filter(
      (entry) => entry.isAvailable,
    );

    if (availableEntries.length > 0) {
      sawAvailability = true;
    }

    for (const availability of availableEntries) {
      const quotePayload = await fetchQuotePayload(
        reference,
        availability.availabilityId,
      );
      if (!quotePayload) {
        continue;
      }

      const priceCandidates = collectQuotePriceCandidates(quotePayload);
      if (priceCandidates.length > 0) {
        const quoteMin = Math.min(...priceCandidates);
        if (minPrice === null || quoteMin < minPrice) {
          minPrice = quoteMin;
        }
      }

      if (!currency) {
        const currencyCandidates = [
          ...collectCurrencyCandidates(quotePayload),
          ...collectCurrencyCandidates(availability.raw),
        ];
        if (currencyCandidates.length > 0) {
          currency = currencyCandidates[0];
        }
      }

      if (minPrice !== null && minPrice <= LOW_PRICE_SHORT_CIRCUIT) {
        shouldStop = true;
        break;
      }
    }

    if (shouldStop) {
      break;
    }
  }

  if (!sawAvailability) {
    console.warn(
      `No availability window price for ${reference.companyShortname}/${reference.itemId}.`,
    );
    return null;
  }

  if (minPrice === null) {
    console.warn(
      `No quote pricing found for ${reference.companyShortname}/${reference.itemId}.`,
    );
    return null;
  }

  return {
    startingPrice: minPrice,
    currency: currency ?? extractCurrency({}),
    source: "fareharbor-api",
    lastUpdated: new Date().toISOString(),
  };
};

const writeCacheFile = async (cache: Record<string, FareharborPriceEntry>) => {
  const fileContents = `export type FareharborPriceEntry = {
  startingPrice: number;
  currency: string;
  source: "fareharbor-api";
  lastUpdated: string;
};

// This file is auto-generated by scripts/fetch-fareharbor-pricing.ts. Do not edit manually.
export const fareharborPricing: Record<string, FareharborPriceEntry> = ${JSON.stringify(
    cache,
    null,
    2,
  )};
`;
  await writeFile(OUTPUT_PATH, fileContents, "utf8");
};

const run = async () => {
  const csvFiles = await listFiles(DATA_DIR, ".csv");
  const sourceFiles = await listFiles(SRC_DATA_DIR, ".ts");

  const references = new Map<string, FareharborItemReference>();

  for (const csvPath of csvFiles) {
    const items = await extractFareharborItemsFromCsv(csvPath);
    items.forEach((reference, key) => references.set(key, reference));
  }

  for (const sourcePath of sourceFiles) {
    const items = await extractFareharborItemsFromSource(sourcePath);
    items.forEach((reference, key) => references.set(key, reference));
  }

  if (!references.size) {
    throw new Error("No FareHarbor items found for pricing.");
  }

  const sortedReferences = Array.from(references.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const cacheEntries: [string, FareharborPriceEntry][] = [];
  let pricedCount = 0;

  const limit = createConcurrencyLimiter(MAX_CONCURRENCY);
  const tasks = sortedReferences.map(([key, reference]) =>
    limit(async () => {
      const entry = await fetchFareharborPricing(reference);
      if (entry) {
        cacheEntries.push([key, entry]);
        pricedCount += 1;
        return;
      }
      console.warn(
        `Missing price for ${reference.companyShortname}/${reference.itemId}.`,
      );
    }),
  );

  await Promise.all(tasks);

  if (pricedCount < 50) {
    throw new Error(
      `Only ${pricedCount} FareHarbor prices were found. Endpoint may have changed or credentials are missing.`,
    );
  }

  const cache = Object.fromEntries(
    cacheEntries.sort(([a], [b]) => a.localeCompare(b)),
  );
  await writeCacheFile(cache);

  console.log(
    `Wrote ${Object.keys(cache).length} FareHarbor price entries to ${OUTPUT_PATH}.`,
  );
  console.log("FareHarbor pricing summary:");
  console.log(`- Total tours processed: ${sortedReferences.length}`);
  console.log(`- Total prices found: ${pricedCount}`);
  console.log(`- Total written to cache: ${cacheEntries.length}`);
};

run().catch((error) => {
  console.error("Failed to update FareHarbor pricing cache.", error);
  process.exitCode = 1;
});
