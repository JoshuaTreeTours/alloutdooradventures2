import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { getFareharborItemFromUrl } from "../src/lib/fareharbor";

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

const extractStartingPrice = (payload: Record<string, unknown>) => {
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

  if (!priceCandidates.length) {
    return null;
  }

  return Math.min(...priceCandidates.filter((price) => price > 0));
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

const fetchFareharborPricing = async (
  reference: FareharborItemReference,
): Promise<FareharborPriceEntry | null> => {
  const url = `https://fareharbor.com/api/v1/companies/${reference.companyShortname}/items/${reference.itemId}/`;

  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) {
      console.warn(
        `Skipping ${reference.companyShortname}/${reference.itemId}: ${response.status}`,
      );
      return null;
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const startingPrice = extractStartingPrice(payload);
    if (startingPrice === null) {
      console.warn(
        `No public price for ${reference.companyShortname}/${reference.itemId}.`,
      );
      return null;
    }

    return {
      startingPrice,
      currency: extractCurrency(payload),
      source: "fareharbor-api",
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(
      `Failed to fetch pricing for ${reference.companyShortname}/${reference.itemId}.`,
      error,
    );
    return null;
  }
};

const loadExistingCache = async () => {
  if (!existsSync(OUTPUT_PATH)) {
    return {} as Record<string, FareharborPriceEntry>;
  }

  const moduleUrl = pathToFileURL(OUTPUT_PATH).href;
  const module = await import(moduleUrl);
  return (module.FAREHARBOR_PRICE_CACHE ??
    {}) as Record<string, FareharborPriceEntry>;
};

const writeCacheFile = async (cache: Record<string, FareharborPriceEntry>) => {
  const fileContents = `export type FareharborPriceEntry = {
  startingPrice: number;
  currency: string;
  source: "fareharbor-api";
  lastUpdated: string;
};

// This file is auto-generated by scripts/fetch-fareharbor-pricing.ts. Do not edit manually.
export const FAREHARBOR_PRICE_CACHE: Record<string, FareharborPriceEntry> = ${JSON.stringify(
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
    console.warn("No FareHarbor items found for pricing.");
    return;
  }

  const cache = await loadExistingCache();
  const missing = Array.from(references.entries()).filter(
    ([key]) => !cache[key],
  );
  const fetchLimit = Number.parseInt(
    process.env.FAREHARBOR_PRICE_FETCH_LIMIT ?? "0",
    10,
  );
  const toFetch =
    fetchLimit > 0 ? missing.slice(0, fetchLimit) : missing;

  for (const [key, reference] of toFetch) {
    const entry = await fetchFareharborPricing(reference);
    if (entry) {
      cache[key] = entry;
      console.log(
        `Cached price for ${reference.companyShortname}/${reference.itemId}.`,
      );
    }
  }

  await writeCacheFile(cache);
  console.log(
    `Wrote ${Object.keys(cache).length} FareHarbor price entries to ${OUTPUT_PATH}.`,
  );
};

run().catch((error) => {
  console.error("Failed to update FareHarbor pricing cache.", error);
  process.exitCode = 1;
});
