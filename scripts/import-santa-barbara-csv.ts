import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Tour } from "../src/data/tours.types";
import { getFareharborItemFromUrl, normalizeFareharborUrl } from "../src/lib/fareharbor";

const INPUT_PATH = path.resolve("data/santa-barbara.csv");
const OUTPUT_PATH = path.resolve(
  "src/data/locations/us/california/santa-barbara.tours.ts",
);
const API_BASE = "https://fareharbor.com/api/v1";
const MAX_SNIPPET_LENGTH = 220;
const REQUIRED_COLUMNS = [
  "company_name",
  "company_shortname",
  "location",
  "item_id",
  "item_name",
  "regular_link",
] as const;
const VALID_CATEGORIES = ["Cycling", "Hiking", "Paddle Sports", "Day Tours"] as const;

const sanitize = (value?: string) => value?.replace(/\s+/g, " ").trim() ?? "";

const slugify = (value: string) =>
  sanitize(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const splitCsvLine = (text: string) => {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }

      row.push(current);
      rows.push(row);
      current = "";
      row = [];
      continue;
    }

    current += char;
  }

  if (current.length || row.length) {
    row.push(current);
    rows.push(row);
  }

  return rows;
};

const parseCsv = (source: string) => {
  const rows = splitCsvLine(source).filter((row) => row.some((cell) => cell.trim().length > 0));
  if (rows.length === 0) {
    throw new Error("CSV file is empty");
  }

  const header = rows[0].map((column) => sanitize(column));
  REQUIRED_COLUMNS.forEach((column) => {
    if (!header.includes(column)) {
      throw new Error(`CSV missing required column: ${column}`);
    }
  });

  return rows.slice(1).map((row, rowIndex) => {
    const record = Object.fromEntries(
      header.map((column, index) => [column, sanitize(row[index])]),
    ) as Record<string, string>;

    REQUIRED_COLUMNS.forEach((column) => {
      if (!record[column]) {
        throw new Error(`Row ${rowIndex + 2}: missing required field \"${column}\"`);
      }
    });

    return record;
  });
};

const stripHtml = (value?: string) => {
  if (!value) return undefined;
  const cleaned = value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
  const normalized = sanitize(cleaned);
  return normalized || undefined;
};

const clampSnippet = (value?: string) => {
  if (!value) return undefined;
  if (value.length <= MAX_SNIPPET_LENGTH) return value;
  const chunk = value.slice(0, MAX_SNIPPET_LENGTH - 1);
  const cut = chunk.lastIndexOf(" ");
  return `${(cut > 100 ? chunk.slice(0, cut) : chunk).trim()}…`;
};

const collectImageCandidates = (payload: unknown): string[] => {
  const results = new Set<string>();
  const queue: unknown[] = [payload];

  while (queue.length) {
    const current = queue.shift();
    if (!current) continue;

    if (typeof current === "string") {
      const trimmed = current.trim();
      if (
        /^https?:\/\//i.test(trimmed) &&
        /(filestackcontent\.com|fareharbor\.com|images\.|cloudfront)/i.test(trimmed) &&
        /\.(jpg|jpeg|png|webp)(\?|$)/i.test(trimmed)
      ) {
        results.add(trimmed);
      }
      continue;
    }

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    if (typeof current === "object") {
      const record = current as Record<string, unknown>;
      Object.values(record).forEach((value) => {
        if (typeof value === "string" || Array.isArray(value) || (value && typeof value === "object")) {
          queue.push(value);
        }
      });
    }
  }

  return Array.from(results);
};

const fetchFareharborMetadata = async (companyShortname: string, itemId: string) => {
  const endpoint = `${API_BASE}/companies/${companyShortname}/items/${itemId}/`;
  const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`FareHarbor request failed (${response.status}) for ${companyShortname}:${itemId}`);
  }
  const payload = (await response.json()) as Record<string, unknown>;

  const heroImageUrl = collectImageCandidates(payload)[0];
  const descriptionCandidate = [
    payload.description,
    payload.short_description,
    payload.summary,
    payload.seo_description,
    payload.marketing_description,
  ].find((entry) => typeof entry === "string" && sanitize(entry).length > 0) as string | undefined;

  return {
    heroImageUrl: heroImageUrl ? sanitize(heroImageUrl) : undefined,
    sourceDescription: clampSnippet(stripHtml(descriptionCandidate)),
  };
};

const getFareharborMetadataWithFallback = async (
  companyShortname: string,
  itemId: string,
  fallbackImageUrl?: string,
  fallbackDescription?: string,
) => {
  try {
    return await fetchFareharborMetadata(companyShortname, itemId);
  } catch {
    return {
      heroImageUrl: fallbackImageUrl,
      sourceDescription: clampSnippet(stripHtml(fallbackDescription)),
    };
  }
};

const mapCategory = (row: Record<string, string>): (typeof VALID_CATEGORIES)[number] => {
  const haystack = `${row.tags ?? ""} ${row.item_name ?? ""}`.toLowerCase();

  if (/(bike|biking|cycling|e-bike|ebike|bicycle)/.test(haystack)) return "Cycling";
  if (/(hike|hiking|trail|trek|walk)/.test(haystack)) return "Hiking";
  if (/(paddle|kayak|canoe|sup|boat|cruise)/.test(haystack)) return "Paddle Sports";
  return "Day Tours";
};

const mapActivitySlug = (category: (typeof VALID_CATEGORIES)[number]) => {
  if (category === "Cycling") return "cycling";
  if (category === "Hiking") return "hiking";
  if (category === "Paddle Sports") return "canoeing";
  return "detours";
};

const buildTour = async (row: Record<string, string>, rowNumber: number): Promise<Tour> => {
  const locationParts = row.location.split("/").map((value) => sanitize(value));
  if (locationParts.length < 3) {
    throw new Error(`Row ${rowNumber}: location must be Country/State/City`);
  }

  const bookingUrl = normalizeFareharborUrl(row.regular_link) ?? row.regular_link;
  const reference = getFareharborItemFromUrl(bookingUrl);
  if (!reference) {
    throw new Error(`Row ${rowNumber}: invalid FareHarbor regular_link`);
  }

  const category = mapCategory(row);
  const activitySlug = mapActivitySlug(category);
  const title = sanitize(row.item_name);
  const metadata = await getFareharborMetadataWithFallback(
    reference.companyShortname,
    reference.itemId,
    sanitize(row.image_url),
    `${title} is an outdoor experience based in Santa Barbara, California.`,
  );

  const city = "Santa Barbara";
  const state = "California";
  const stateSlug = "california";
  const citySlug = "santa-barbara";
  const id = `${slugify(row.company_shortname || row.company_name)}-${row.item_id}`;
  const slug = `${slugify(title)}-${row.item_id}`;

  const fallbackDescription = `${title} is an outdoor experience based in Santa Barbara, California.`;
  const description = metadata.sourceDescription ?? fallbackDescription;
  const heroImage = metadata.heroImageUrl ?? sanitize(row.image_url);

  if (!heroImage) {
    throw new Error(`Row ${rowNumber}: missing hero image URL from FareHarbor and CSV image_url`);
  }

  return {
    id,
    slug,
    title,
    operator: sanitize(row.company_name),
    categories: [category],
    primaryCategory: activitySlug,
    tags: sanitize(row.tags) ? [sanitize(row.tags)] : undefined,
    destination: { state, stateSlug, city, citySlug },
    heroImage,
    heroImageUrl: heroImage,
    heroImageSource: "fareharbor_media",
    galleryImages: [heroImage],
    badges: { tagline: category },
    tagPills: [category],
    activitySlugs: [activitySlug],
    bookingProvider: "fareharbor",
    bookingUrl,
    bookingWidgetUrl: `https://fareharbor.com/embeds/book/${reference.companyShortname}/items/${reference.itemId}/calendar/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no`,
    sourceOperatorSlug: reference.companyShortname,
    sourceItemId: reference.itemId,
    sourceDescription: description,
    sourceDescriptionSource: "fareharbor",
    shortDescription: description,
    longDescription: description,
  };
};

const escapeForTsString = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");

const stringifyForTs = (value: unknown, depth = 0): string => {
  const indent = "  ".repeat(depth);
  const nestedIndent = "  ".repeat(depth + 1);

  if (value === null || value === undefined) return "undefined";
  if (typeof value === "string") return `"${escapeForTsString(value)}"`;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return `[\n${value
      .map((entry) => `${nestedIndent}${stringifyForTs(entry, depth + 1)}`)
      .join(",\n")}\n${indent}]`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";
    return `{\n${entries
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(
        ([key, entryValue]) =>
          `${nestedIndent}${key}: ${stringifyForTs(entryValue, depth + 1)}`,
      )
      .join(",\n")}\n${indent}}`;
  }

  return "undefined";
};

const run = async () => {
  const csv = await readFile(INPUT_PATH, "utf8");
  const rows = parseCsv(csv);
  const tours: Tour[] = [];

  for (let index = 0; index < rows.length; index += 1) {
    tours.push(await buildTour(rows[index], index + 2));
  }

  const output = `import type { Tour } from "../../../tours.types";\n\n// This file is auto-generated by scripts/import-santa-barbara-csv.ts.\nexport const SANTA_BARBARA_TOURS: Tour[] = ${stringifyForTs(tours)};\n`;

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, output, "utf8");

  console.log(
    `Imported ${tours.length} Santa Barbara tours to ${OUTPUT_PATH}. Categories: ${VALID_CATEGORIES.join(", ")}`,
  );
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
