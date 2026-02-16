import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildTourUrlSafe } from "../src/utils/buildTourUrl";
import { slugify } from "../src/utils/slugify";

const OUTPUT_HEADERS = [
  "tourId",
  "slug",
  "title",
  "description",
  "price",
  "currency",
  "ratingValue",
  "ratingCount",
  "availability",
  "image",
  "merchant_enabled",
  "merchant_title",
  "merchant_description",
  "source_url",
  "last_updated",
] as const;

type OutputHeader = (typeof OUTPUT_HEADERS)[number];
type OutputRow = Record<OutputHeader, string>;

type CsvRecord = Record<string, string>;

const csvPaths = {
  california: path.resolve(process.cwd(), "data/california.csv"),
  californiaAlt: path.resolve(process.cwd(), "data/California.csv"),
  enrichment: path.resolve(process.cwd(), "data/tourEnrichment.csv"),
};

const today = new Date().toISOString().slice(0, 10);

const parseCsvRow = (line: string) => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
};

const parseCsv = (content: string): CsvRecord[] => {
  const normalized = content.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [];
  }

  const lines = normalized.split("\n");
  const header = parseCsvRow(lines[0]).map(col => col.trim());

  return lines.slice(1).map(line => {
    const values = parseCsvRow(line);
    const row: CsvRecord = {};
    header.forEach((col, index) => {
      row[col] = values[index]?.trim() ?? "";
    });
    return row;
  });
};

const escapeCsv = (value: string) => {
  const escaped = (value ?? "").replace(/"/g, '""');
  if (/[",\n]/.test(escaped)) {
    return `"${escaped}"`;
  }
  return escaped;
};

const buildCsv = (rows: OutputRow[]) => {
  const headerLine = OUTPUT_HEADERS.join(",");
  const body = rows
    .map(row => OUTPUT_HEADERS.map(header => escapeCsv(row[header])).join(","))
    .join("\n");
  return `${headerLine}\n${body}\n`;
};

const pickFirst = (row: CsvRecord, keys: string[]) => {
  for (const key of keys) {
    const value = row[key]?.trim();
    if (value) {
      return value;
    }
  }
  return "";
};

const getTourId = (row: CsvRecord) =>
  pickFirst(row, ["tourId", "tour_id", "item_id", "id", "itemId"]);

const getTitle = (row: CsvRecord) =>
  pickFirst(row, ["title", "name", "item_name", "tour_name"]);

const getDescription = (row: CsvRecord) =>
  pickFirst(row, ["description", "summary", "blurb", "tour_description"]);

const getSlug = (row: CsvRecord, title: string, tourId: string) => {
  const sourceSlug = row.slug?.trim();
  if (sourceSlug) {
    return sourceSlug;
  }

  const generated = slugify(title);
  if (generated) {
    return generated;
  }

  return `tour-${tourId}`;
};

const getSourceUrl = (row: CsvRecord, tourId: string, title: string, slug: string) => {
  return buildTourUrlSafe({
    source_url: row.source_url,
    slug,
    title,
    tourId,
    state: pickFirst(row, ["state", "state_name", "region"]),
    state_slug: pickFirst(row, ["state_slug", "stateSlug"]),
    city: pickFirst(row, ["city", "city_name", "destination_city"]),
    city_slug: pickFirst(row, ["city_slug", "citySlug"]),
  });
};

const toBlankOutputRow = (): OutputRow => ({
  tourId: "",
  slug: "",
  title: "",
  description: "",
  price: "",
  currency: "",
  ratingValue: "",
  ratingCount: "",
  availability: "",
  image: "",
  merchant_enabled: "",
  merchant_title: "",
  merchant_description: "",
  source_url: "",
  last_updated: "",
});

const applyDefaults = (row: OutputRow) => {
  if (!row.availability.trim()) {
    row.availability = "in_stock";
  }
  if (!row.last_updated.trim()) {
    row.last_updated = today;
  }
};

const mergeOnlyBlanks = (target: OutputRow, patch: Partial<OutputRow>) => {
  for (const key of OUTPUT_HEADERS) {
    const next = patch[key];
    if (!next?.trim()) {
      continue;
    }

    if (!target[key].trim()) {
      target[key] = next;
    }
  }
};

const main = async () => {
  let californiaPath = csvPaths.california;
  try {
    await readFile(californiaPath, "utf8");
  } catch {
    californiaPath = csvPaths.californiaAlt;
  }

  const californiaRows = parseCsv(await readFile(californiaPath, "utf8"));

  let existingRows: CsvRecord[] = [];
  try {
    existingRows = parseCsv(await readFile(csvPaths.enrichment, "utf8"));
  } catch {
    existingRows = [];
  }

  const byTourId = new Map<string, OutputRow>();

  for (let index = 0; index < existingRows.length; index += 1) {
    const existing = existingRows[index];
    const tourId = getTourId(existing) || `generated-existing-${index + 1}`;
    if (!getTourId(existing)) {
      console.warn(`Fallback used: missing tourId in existing enrichment row ${index + 2}`);
    }
    const row = byTourId.get(tourId) ?? toBlankOutputRow();
    row.tourId = tourId;
    mergeOnlyBlanks(row, existing as Partial<OutputRow>);
    applyDefaults(row);
    byTourId.set(tourId, row);
  }

  for (let index = 0; index < californiaRows.length; index += 1) {
    const source = californiaRows[index];
    const tourId = getTourId(source) || `generated-source-${index + 1}`;
    if (!getTourId(source)) {
      console.warn(`Fallback used: missing tourId in source row ${index + 2}`);
    }

    const title = getTitle(source);
    const description = getDescription(source);
    const slug = getSlug(source, title, tourId);
    const candidate: Partial<OutputRow> = {
      tourId,
      slug,
      title,
      description,
      source_url: getSourceUrl(source, tourId, title, slug),
    };

    if (!(source.source_url ?? "").trim()) {
      console.warn(`Fallback used: missing source_url for tourId ${tourId}`);
    }

    if (!(source.slug ?? "").trim()) {
      console.warn(`Fallback used: missing slug for tourId ${tourId}`);
    }

    const row = byTourId.get(tourId) ?? toBlankOutputRow();
    row.tourId = tourId;
    mergeOnlyBlanks(row, candidate);
    applyDefaults(row);
    byTourId.set(tourId, row);
  }

  const mergedRows = Array.from(byTourId.values()).sort((a, b) =>
    a.tourId.localeCompare(b.tourId, undefined, { numeric: true })
  );

  const output = buildCsv(mergedRows);
  await writeFile(csvPaths.enrichment, output, "utf8");

  console.log(
    `Wrote ${mergedRows.length} tour enrichment rows from ${californiaRows.length} California source rows.`
  );
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
