import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { slugify } from "../src/utils/slugify";

const INPUT_PATH = path.resolve(process.cwd(), "data/tourEnrichment.csv");
const OUTPUT_PATH = path.resolve(process.cwd(), "data/merchantFeed.csv");

const OUTPUT_HEADERS = [
  "id",
  "title",
  "description",
  "link",
  "image_link",
  "availability",
  "price",
  "condition",
] as const;

type OutputHeader = (typeof OUTPUT_HEADERS)[number];
type CsvRecord = Record<string, string>;
type MerchantRow = Record<OutputHeader, string>;

const DOMAIN = "https://www.alloutdooradventures.com";
const DEFAULT_IMAGE = `${DOMAIN}/default-tour.jpg`;
const DEFAULT_PRICE = "1.00 USD";
const DEFAULT_AVAILABILITY = "in_stock";

const parseCsv = (content: string): CsvRecord[] => {
  const normalized = content.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  if (!normalized.trim()) {
    return [];
  }

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = "";
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i += 1) {
    const char = normalized[i];
    const next = normalized[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        currentValue += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if (char === "\n" && !inQuotes) {
      currentRow.push(currentValue);
      rows.push(currentRow);
      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += char;
  }

  currentRow.push(currentValue);
  rows.push(currentRow);

  const header = rows[0]?.map(column => column.trim()) ?? [];
  return rows.slice(1).map(rowValues => {
    const row: CsvRecord = {};
    header.forEach((column, index) => {
      row[column] = rowValues[index]?.trim() ?? "";
    });
    return row;
  });
};

const escapeCsv = (value: string) => {
  const escaped = (value ?? "").replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

const toCsv = (rows: MerchantRow[]) => {
  const headerLine = OUTPUT_HEADERS.join(",");
  const body = rows
    .map(row => OUTPUT_HEADERS.map(header => escapeCsv(row[header])).join(","))
    .join("\n");
  return `${headerLine}\n${body}\n`;
};

const buildFallbackLink = (row: CsvRecord, tourId: string) => {
  const rawSlug = row.slug?.trim();
  const generatedSlug = rawSlug || slugify(row.title?.trim() || tourId || "tour");
  return `${DOMAIN}/tours/${generatedSlug}`;
};

const toAoaLink = (rawSourceUrl: string, row: CsvRecord, tourId: string) => {
  const trimmed = rawSourceUrl.trim();
  if (!trimmed) {
    return buildFallbackLink(row, tourId);
  }

  try {
    const parsed = new URL(trimmed, DOMAIN);
    if (parsed.hostname.includes("alloutdooradventures.com")) {
      const pathname = parsed.pathname.replace(/\/+$/, "") || "/";
      return `${DOMAIN}${pathname}`;
    }
  } catch {
    if (trimmed.startsWith("/")) {
      return `${DOMAIN}${trimmed.replace(/\/+$/, "")}`;
    }
  }

  return buildFallbackLink(row, tourId);
};

const normalizePrice = (rawPrice: string, rawCurrency: string) => {
  const currency = (rawCurrency ?? "").trim().toUpperCase() || "USD";
  const cleaned = (rawPrice ?? "").trim().replace(/,/g, "").replace(/[^\d.-]/g, "");

  if (!cleaned) {
    return { value: DEFAULT_PRICE, usedFallback: true };
  }

  const numeric = Number.parseFloat(cleaned);
  if (!Number.isFinite(numeric)) {
    return { value: DEFAULT_PRICE, usedFallback: true };
  }

  return { value: `${numeric.toFixed(2)} ${currency}`, usedFallback: false };
};

const main = async () => {
  const sourceRows = parseCsv(await readFile(INPUT_PATH, "utf8"));

  const outputRows: MerchantRow[] = [];
  let warningCount = 0;

  sourceRows.forEach((row, index) => {
    const tourId = row.tourId?.trim() || `generated-${index + 1}`;

    const price = normalizePrice(row.price, row.currency);
    if (price.usedFallback) {
      warningCount += 1;
      console.warn(`Fallback used for price on tourId ${tourId}: defaulted to ${price.value}.`);
    }

    const title = row.merchant_title?.trim() || row.title?.trim() || `Tour ${tourId}`;
    const description =
      row.merchant_description?.trim() || row.description?.trim() || `Tour ${tourId}`;
    const link = toAoaLink(row.source_url ?? "", row, tourId);
    const imageLink = (row.image ?? "").trim() || DEFAULT_IMAGE;
    const availability = (row.availability ?? "").trim() || DEFAULT_AVAILABILITY;

    if (!row.source_url?.trim()) {
      warningCount += 1;
      console.warn(`Fallback used for link on tourId ${tourId}: used AOA URL ${link}`);
    } else if (!row.source_url.includes("alloutdooradventures.com")) {
      warningCount += 1;
      console.warn(`Fallback used for link on tourId ${tourId}: replaced with ${link}`);
    }

    if (!(row.image ?? "").trim()) {
      warningCount += 1;
      console.warn(`Fallback used for image on tourId ${tourId}: defaulted to ${DEFAULT_IMAGE}.`);
    }

    if (!(row.availability ?? "").trim()) {
      warningCount += 1;
      console.warn(
        `Fallback used for availability on tourId ${tourId}: defaulted to ${DEFAULT_AVAILABILITY}.`,
      );
    }

    outputRows.push({
      id: tourId,
      title,
      description,
      link,
      image_link: imageLink,
      availability,
      price: price.value,
      condition: "new",
    });
  });

  await writeFile(OUTPUT_PATH, toCsv(outputRows), "utf8");

  console.log(`Processed ${sourceRows.length} rows.`);
  console.log(`Wrote ${outputRows.length} merchant feed rows to ${OUTPUT_PATH}.`);
  console.log(`Logged ${warningCount} warnings.`);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
