import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  DEFAULT_CURRENCY,
  DEFAULT_IMAGE_URL,
  PRICE_FLOOR_USD,
} from "../src/constants/merchantDefaults";
import { tours } from "../src/data/tours";
import { slugify } from "../src/utils/slugify";
import {
  applyPriceFloor,
  formatMerchantPrice,
  parsePrice,
} from "../src/utils/merchantPricing";
import { extractPageImage } from "./utils/extractPageImage";

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
  "brand",
  "average_rating",
  "rating_count",
  "review_count",
] as const;

type OutputHeader = (typeof OUTPUT_HEADERS)[number];
type CsvRecord = Record<string, string>;
type MerchantRow = Record<OutputHeader, string>;

type ProductImageRecord = {
  image_url?: string;
};

const DOMAIN = "https://www.alloutdooradventures.com";
const DEFAULT_AVAILABILITY = "in stock";
const DEFAULT_BRAND = "All Outdoor Adventures";

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
  const generatedSlug =
    rawSlug || slugify(row.title?.trim() || tourId || "tour");
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

const isValidHttpUrl = (value: unknown): value is string => {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const normalizeMerchantPrice = (value: string) => {
  const parsed = parsePrice(value);
  const normalizedAmount =
    parsed === null ? PRICE_FLOOR_USD : applyPriceFloor(parsed);
  return formatMerchantPrice(normalizedAmount, DEFAULT_CURRENCY);
};

const normalizeAverageRating = (value: unknown) => {
  if (value === null || value === undefined) {
    return "";
  }

  const parsed =
    typeof value === "number"
      ? value
      : Number.parseFloat(String(value).trim());

  if (!Number.isFinite(parsed)) {
    return "";
  }

  return parsed.toFixed(1);
};

const getProductMap = () => {
  const products = new Map<string, ProductImageRecord>();

  tours.forEach(tour => {
    const bookingItemId = tour.bookingUrl.match(/\/items\/(\d+)/)?.[1];
    const fallbackImage =
      tour.heroImage ??
      tour.galleryImages?.find(image => isValidHttpUrl(image));

    if (!fallbackImage) {
      return;
    }

    if (bookingItemId) {
      products.set(bookingItemId, { image_url: fallbackImage });
    }

    if (tour.id) {
      products.set(tour.id, { image_url: fallbackImage });
    }
  });

  return products;
};

const main = async () => {
  const sourceRows = parseCsv(await readFile(INPUT_PATH, "utf8"));
  const productsByTourId = getProductMap();

  const outputRows: MerchantRow[] = [];
  let warningCount = 0;

  for (let index = 0; index < sourceRows.length; index += 1) {
    const row = sourceRows[index];
    const tourId = row.tourId?.trim() || `generated-${index + 1}`;

    const rawPrice = parsePrice(row.price);
    const finalPrice = applyPriceFloor(rawPrice);
    const currency = row.currency?.trim().toUpperCase() || DEFAULT_CURRENCY;
    const price = normalizeMerchantPrice(
      formatMerchantPrice(finalPrice, currency)
    );

    if (rawPrice === null || finalPrice !== rawPrice) {
      warningCount += 1;
      console.warn(
        `Fallback used for price on tourId ${tourId}: defaulted to ${price}.`
      );
    }

    const title =
      row.merchant_title?.trim() || row.title?.trim() || `Tour ${tourId}`;
    const description =
      row.merchant_description?.trim() ||
      row.description?.trim() ||
      `Tour ${tourId}`;
    const link = toAoaLink(row.source_url ?? "", row, tourId);

    const product = productsByTourId.get(tourId);
    const extractedPageImage = await extractPageImage(link);
    const imageLink = [
      row.image,
      product?.image_url,
      extractedPageImage,
      DEFAULT_IMAGE_URL,
    ].find(candidate => isValidHttpUrl(candidate)) as string;

    const availability =
      (row.availability ?? "").trim() || DEFAULT_AVAILABILITY;

    if (!row.source_url?.trim()) {
      warningCount += 1;
      console.warn(
        `Fallback used for link on tourId ${tourId}: used AOA URL ${link}`
      );
    } else if (!row.source_url.includes("alloutdooradventures.com")) {
      warningCount += 1;
      console.warn(
        `Fallback used for link on tourId ${tourId}: replaced with ${link}`
      );
    }

    if (!row.image?.trim() && imageLink !== row.image?.trim()) {
      warningCount += 1;
      console.warn(
        `Fallback used for image on tourId ${tourId}: resolved to ${imageLink}.`
      );
    }

    if (!(row.availability ?? "").trim()) {
      warningCount += 1;
      console.warn(
        `Fallback used for availability on tourId ${tourId}: defaulted to ${DEFAULT_AVAILABILITY}.`
      );
    }

    outputRows.push({
      id: tourId,
      title,
      description,
      link,
      image_link: imageLink,
      availability,
      price,
      condition: "new",
      brand: DEFAULT_BRAND,
      average_rating: normalizeAverageRating(row.ratingValue),
      rating_count: row.ratingCount?.trim() || "",
      review_count: row.ratingCount?.trim() || "",
    });
  }

  await writeFile(OUTPUT_PATH, toCsv(outputRows), "utf8");

  console.log(`Processed ${sourceRows.length} rows.`);
  console.log(
    `Wrote ${outputRows.length} merchant feed rows to ${OUTPUT_PATH}.`
  );
  console.log(`Logged ${warningCount} warnings.`);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
