import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { DEFAULT_CURRENCY } from "../src/constants/merchantDefaults";
import {
  EXCLUDED_FEED_KEYWORDS,
  HIGH_ENERGY_ALLOWED_KEYWORDS,
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

const DEBUG_HEADERS = [
  "id",
  "title",
  "reason",
  "link",
  "imageCandidate",
  "priceCandidate",
] as const;

type OutputHeader = (typeof OUTPUT_HEADERS)[number];
type DebugHeader = (typeof DEBUG_HEADERS)[number];
type CsvRecord = Record<string, string>;
type MerchantRow = Record<OutputHeader, string>;
type DebugRow = Record<DebugHeader, string>;

type DropReason =
  | "notAllowedActivity"
  | "excludedKeyword"
  | "invalidLink"
  | "pageNotFound"
  | "missingImage";

type FilterStats = {
  totalInput: number;
  kept: number;
  dropped_notAllowedActivity: number;
  dropped_excludedKeyword: number;
  dropped_invalidLink: number;
  dropped_pageNotFound: number;
  dropped_missingImage: number;
  dropped_missingPrice: number;
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

const tokenizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const includesKeyword = (text: string, keyword: string) => {
  const normalizedText = ` ${text.toLowerCase()} `;
  const normalizedKeyword = keyword.toLowerCase().trim();

  if (normalizedKeyword.includes(" ") || normalizedKeyword.includes("-")) {
    return normalizedText.includes(` ${normalizedKeyword} `);
  }

  return tokenizeText(text).includes(normalizedKeyword);
};

const buildSourceText = (title: string, tags?: string, description?: string) =>
  `${title || ""} ${tags || ""} ${description || ""}`.toLowerCase();

const matchesExcluded = (title: string, tags?: string, description?: string) => {
  const text = buildSourceText(title, tags, description);
  return EXCLUDED_FEED_KEYWORDS.some(keyword => includesKeyword(text, keyword));
};

const isHorseContext = (text: string) =>
  ["horse", "horseback", "trail ride", "ranch", "equestrian"].some(term =>
    text.includes(term)
  );

const isHighEnergyAllowed = (title: string, tags?: string, description?: string) => {
  const text = buildSourceText(title, tags, description);
  const hasAllowedKeyword = HIGH_ENERGY_ALLOWED_KEYWORDS.some(keyword =>
    includesKeyword(text, keyword)
  );

  if (!hasAllowedKeyword) {
    return false;
  }

  const hasRideWord = includesKeyword(text, "ride") || includesKeyword(text, "riding");
  const hasHorseWord = includesKeyword(text, "horseback") || includesKeyword(text, "horse");
  if (hasRideWord && !hasHorseWord && !isHorseContext(text)) {
    return HIGH_ENERGY_ALLOWED_KEYWORDS.some(keyword =>
      keyword !== "ride" && keyword !== "riding" && includesKeyword(text, keyword)
    );
  }

  const onlySunset = includesKeyword(text, "sunset") &&
    !HIGH_ENERGY_ALLOWED_KEYWORDS.some(keyword =>
      keyword !== "ride" && keyword !== "riding" && includesKeyword(text, keyword)
    );

  return !onlySunset;
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

const isValidImageUrl = (value: unknown): value is string => {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("data:")) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const isPlaceholderImage = (value: string) => {
  const lower = value.toLowerCase();
  return (
    lower.includes("default-tour") ||
    lower.includes("placeholder") ||
    lower.includes("default-image")
  );
};

const parseAoaTourPath = (url: string) => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.replace(/\/+$/, "");

    if (
      parsed.protocol !== "https:" ||
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

const getValidTourPaths = () => new Set(tours.map(tour => `/tours/${tour.slug}`));

const pageExists = async (url: string, validTourPaths: Set<string>) => {
  const pathname = parseAoaTourPath(url);
  const isKnownPath = Boolean(pathname && validTourPaths.has(pathname));
  const slug = pathname?.split("/").pop() ?? "";
  const isGeneratedSlug = slug.startsWith("generated-");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PAGE_EXISTS_TIMEOUT_MS);

  try {
    const headResponse = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });

    if (!headResponse.ok && headResponse.status !== 405) {
      return isKnownPath || !isGeneratedSlug;
    }

    const getResponse = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });

    if (!getResponse.ok) {
      return isKnownPath || !isGeneratedSlug;
    }

    const html = (await getResponse.text()).toLowerCase();
    if (html.includes("tour not found")) {
      return false;
    }

    return true;
  } catch {
    return isKnownPath || !isGeneratedSlug;
  } finally {
    clearTimeout(timeout);
  }
};

const emptyStats = (): FilterStats => ({
  totalInput: 0,
  kept: 0,
  dropped_notAllowedActivity: 0,
  dropped_excludedKeyword: 0,
  dropped_invalidLink: 0,
  dropped_pageNotFound: 0,
  dropped_missingImage: 0,
  dropped_missingPrice: 0,
});

const main = async () => {
  const sourceRows = parseCsv(await readFile(INPUT_PATH, "utf8"));
  const skipPageCheck = process.env.MERCHANT_SKIP_PAGE_CHECK === "1";
  const validTourPaths = getValidTourPaths();

  const stats = emptyStats();
  const outputRows: MerchantRow[] = [];
  const droppedRows: DebugRow[] = [];

  const dropRow = (
    reason: DropReason,
    row: {
      id: string;
      title: string;
      link: string;
      imageCandidate: string;
      priceCandidate: string;
    }
  ) => {
    stats[`dropped_${reason}`] += 1;

    if (droppedRows.length < MAX_DEBUG_ROWS) {
      droppedRows.push({
        id: row.id,
        title: row.title,
        reason,
        link: row.link,
        imageCandidate: row.imageCandidate,
        priceCandidate: row.priceCandidate,
      });
    }
  };

  for (let index = 0; index < sourceRows.length; index += 1) {
    stats.totalInput += 1;

    const row = sourceRows[index];
    const tourId = row.tourId?.trim() || `generated-${index + 1}`;

    const title = row.merchant_title?.trim() || row.title?.trim() || `Tour ${tourId}`;
    const description =
      row.merchant_description?.trim() || row.description?.trim() || "";
    const tags = row.tags?.trim() || "";
    const link = toAoaLink(row.source_url ?? "", row, tourId);

    const rawPrice = parsePrice(row.price);
    const finalPrice = applyPriceFloor(rawPrice);
    const useFloorPrice = rawPrice === null || rawPrice < 20;
    const currency = useFloorPrice
      ? DEFAULT_CURRENCY
      : row.currency?.trim().toUpperCase() || DEFAULT_CURRENCY;
    const price = formatMerchantPrice(finalPrice, currency);

    if (!isHighEnergyAllowed(title, tags, description)) {
      dropRow("notAllowedActivity", {
        id: tourId,
        title,
        link,
        imageCandidate: row.image ?? "",
        priceCandidate: price,
      });
      continue;
    }

    if (matchesExcluded(title, tags, description)) {
      dropRow("excludedKeyword", {
        id: tourId,
        title,
        link,
        imageCandidate: row.image ?? "",
        priceCandidate: price,
      });
      continue;
    }

    const parsedPath = parseAoaTourPath(link);
    if (!parsedPath) {
      dropRow("invalidLink", {
        id: tourId,
        title,
        link,
        imageCandidate: row.image ?? "",
        priceCandidate: price,
      });
      continue;
    }

    if (!skipPageCheck) {
      const exists = await pageExists(link, validTourPaths);
      if (!exists) {
        dropRow("pageNotFound", {
          id: tourId,
          title,
          link,
          imageCandidate: row.image ?? "",
          priceCandidate: price,
        });
        continue;
      }
    }

    const imageCandidate = [
      row.image_url,
      row.image,
      await extractPageImage(link),
    ].find(candidate => {
      if (!isValidImageUrl(candidate)) {
        return false;
      }

      return !isPlaceholderImage(candidate);
    });

    if (!imageCandidate) {
      dropRow("missingImage", {
        id: tourId,
        title,
        link,
        imageCandidate: row.image ?? row.image_url ?? "",
        priceCandidate: price,
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
      image_link: imageCandidate,
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
