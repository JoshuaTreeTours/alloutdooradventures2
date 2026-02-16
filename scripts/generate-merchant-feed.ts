import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  DEFAULT_CURRENCY,
  DEFAULT_IMAGE_URL,
} from "../src/constants/merchantDefaults";
import {
  ALLOWED_ACTIVITY_KEYWORDS,
  EXCLUDED_TITLE_PATTERNS,
} from "../src/config/merchantFilters";
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
const DEBUG_OUTPUT_PATH = path.resolve(
  process.cwd(),
  "data/merchantFeed.debug.csv"
);

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

const DEBUG_HEADERS = ["tourId", "title", "reason", "link", "image", "price"] as const;

type OutputHeader = (typeof OUTPUT_HEADERS)[number];
type DebugHeader = (typeof DEBUG_HEADERS)[number];
type CsvRecord = Record<string, string>;
type MerchantRow = Record<OutputHeader, string>;
type DebugRow = Record<DebugHeader, string>;

type ProductImageRecord = {
  image_url?: string;
};

type DropReason =
  | "notAllowedActivity"
  | "invalidLink"
  | "pageNotFound"
  | "missingTitle"
  | "missingDescription"
  | "missingImage_afterAllFallbacks";

type FilterStats = {
  totalInput: number;
  kept: number;
  dropped_notAllowedActivity: number;
  dropped_invalidLink: number;
  dropped_pageNotFound: number;
  dropped_missingTitle: number;
  dropped_missingDescription: number;
  dropped_missingImage_afterAllFallbacks: number;
};

const DOMAIN = "https://www.alloutdooradventures.com";
const DOMAIN_HOSTNAME = "www.alloutdooradventures.com";
const DEFAULT_AVAILABILITY = "in_stock";
const PAGE_EXISTS_TIMEOUT_MS = 3000;
const MAX_DEBUG_ROWS = 200;

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

const rowsToCsv = <THeader extends string>(
  headers: readonly THeader[],
  rows: Record<THeader, string>[]
) => {
  const headerLine = headers.join(",");
  const body = rows
    .map(row => headers.map(header => escapeCsv(row[header])).join(","))
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

const getValidTourPaths = () =>
  new Set(tours.map(tour => `/tours/${tour.slug}`));

const isAllowedTour = (title: string, tags?: string) => {
  const text = `${title} ${tags || ""}`.toLowerCase();

  if (EXCLUDED_TITLE_PATTERNS.some(pattern => text.includes(pattern))) {
    return false;
  }

  return ALLOWED_ACTIVITY_KEYWORDS.some(keyword => text.includes(keyword));
};

const parseAoaTourPath = (url: string) => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.replace(/\/+$/, "");

    if (
      (parsed.protocol !== "https:" && parsed.protocol !== "http:") ||
      hostname !== DOMAIN_HOSTNAME ||
      !pathname.startsWith("/tours/") ||
      pathname.split("/").filter(Boolean).length !== 2
    ) {
      return null;
    }

    return pathname;
  } catch {
    return null;
  }
};

const pageExists = async (url: string, validTourPaths: Set<string>) => {
  const pathname = parseAoaTourPath(url);
  if (pathname && validTourPaths.has(pathname)) {
    return true;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PAGE_EXISTS_TIMEOUT_MS);

  try {
    const headResponse = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });

    if (headResponse.ok) {
      return true;
    }

    const getResponse = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });
    return getResponse.ok;
  } catch {
    if (pathname) {
      const slug = pathname.split("/").pop() ?? "";
      return !slug.startsWith("generated-");
    }

    return false;
  } finally {
    clearTimeout(timeout);
  }
};

const emptyStats = (): FilterStats => ({
  totalInput: 0,
  kept: 0,
  dropped_notAllowedActivity: 0,
  dropped_invalidLink: 0,
  dropped_pageNotFound: 0,
  dropped_missingTitle: 0,
  dropped_missingDescription: 0,
  dropped_missingImage_afterAllFallbacks: 0,
});

const main = async () => {
  const sourceRows = parseCsv(await readFile(INPUT_PATH, "utf8"));
  const productsByTourId = getProductMap();
  const validTourPaths = getValidTourPaths();
  const skipPageCheck = process.env.MERCHANT_SKIP_PAGE_CHECK === "1";

  const stats = emptyStats();
  const outputRows: MerchantRow[] = [];
  const droppedRows: DebugRow[] = [];

  const dropRow = (
    reason: DropReason,
    row: { tourId: string; title: string; link: string; image: string; price: string }
  ) => {
    stats[`dropped_${reason}`] += 1;

    if (droppedRows.length < MAX_DEBUG_ROWS) {
      droppedRows.push({
        tourId: row.tourId,
        title: row.title,
        reason,
        link: row.link,
        image: row.image,
        price: row.price,
      });
    }
  };

  for (let index = 0; index < sourceRows.length; index += 1) {
    stats.totalInput += 1;

    const row = sourceRows[index];
    const tourId = row.tourId?.trim() || `generated-${index + 1}`;

    const title = row.merchant_title?.trim() || row.title?.trim() || "";
    const description =
      row.merchant_description?.trim() || row.description?.trim() || "";
    const link = toAoaLink(row.source_url ?? "", row, tourId);

    const rawPrice = parsePrice(row.price);
    const finalPrice = applyPriceFloor(rawPrice);
    const useFloorPrice = rawPrice === null || rawPrice < 20;
    const currency = useFloorPrice
      ? DEFAULT_CURRENCY
      : row.currency?.trim().toUpperCase() || DEFAULT_CURRENCY;
    const price = formatMerchantPrice(finalPrice, currency);

    if (!title) {
      dropRow("missingTitle", { tourId, title, link, image: row.image ?? "", price });
      continue;
    }

    if (!description) {
      dropRow("missingDescription", {
        tourId,
        title,
        link,
        image: row.image ?? "",
        price,
      });
      continue;
    }

    if (!isAllowedTour(title, row.tags?.trim())) {
      dropRow("notAllowedActivity", {
        tourId,
        title,
        link,
        image: row.image ?? "",
        price,
      });
      continue;
    }

    const parsedPath = parseAoaTourPath(link);
    if (!parsedPath) {
      dropRow("invalidLink", {
        tourId,
        title,
        link,
        image: row.image ?? "",
        price,
      });
      continue;
    }

    const isGeneratedSlug = parsedPath.split("/").pop()?.startsWith("generated-") ?? false;
    const generatedSlugIsKnown = validTourPaths.has(parsedPath);

    const exists =
      skipPageCheck && !isGeneratedSlug
        ? true
        : skipPageCheck && isGeneratedSlug
          ? generatedSlugIsKnown
          : await pageExists(link, validTourPaths);

    if (!exists) {
      dropRow("pageNotFound", {
        tourId,
        title,
        link,
        image: row.image ?? "",
        price,
      });
      continue;
    }

    const product = productsByTourId.get(tourId);
    const extractedPageImage = await extractPageImage(link);
    const imageLink = [
      product?.image_url,
      row.image,
      extractedPageImage,
      DEFAULT_IMAGE_URL,
    ].find(candidate => isValidHttpUrl(candidate)) as string | undefined;

    if (!imageLink?.trim()) {
      dropRow("missingImage_afterAllFallbacks", {
        tourId,
        title,
        link,
        image: "",
        price,
      });
      continue;
    }

    const availability =
      (row.availability ?? "").trim() || DEFAULT_AVAILABILITY;

    outputRows.push({
      id: tourId,
      title,
      description,
      link,
      image_link: imageLink,
      availability,
      price,
      condition: "new",
    });
    stats.kept += 1;
  }

  await writeFile(OUTPUT_PATH, rowsToCsv(OUTPUT_HEADERS, outputRows), "utf8");
  await writeFile(
    DEBUG_OUTPUT_PATH,
    rowsToCsv(DEBUG_HEADERS, droppedRows),
    "utf8"
  );

  console.log("Merchant feed generation summary");
  console.table(stats);
  console.log(`Wrote ${outputRows.length} merchant rows to ${OUTPUT_PATH}.`);
  console.log(`Wrote ${droppedRows.length} dropped debug rows to ${DEBUG_OUTPUT_PATH}.`);
  if (skipPageCheck) {
    console.log("MERCHANT_SKIP_PAGE_CHECK=1 active: page existence checks bypassed.");
  }
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
