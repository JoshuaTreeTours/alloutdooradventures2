import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildTourUrl } from "../src/utils/buildTourUrl";
import palmSpringsTours from "../src/engine2/data/palm-springs.generated";

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
  dataRoot: path.resolve(process.cwd(), "data"),
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

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

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

const getSlug = (
  row: CsvRecord,
  title: string,
  tourId: string,
  canonicalSlug?: string
) => {
  if (canonicalSlug?.trim()) {
    return canonicalSlug.trim();
  }

  const sourceSlug = row.slug?.trim();
  if (sourceSlug) {
    return sourceSlug;
  }

  const generated = slugify(title);
  if (generated) {
    return `${generated}-${tourId}`;
  }

  console.warn(`WARN: missing slug and title for tourId=${tourId}; skipping record`);
  return "";
};

const parseLocation = (value: string) => {
  const segments = value
    .split("/")
    .map(segment => segment.trim())
    .filter(Boolean);

  const city = segments.at(-1) ?? "";
  const state = segments.length >= 2 ? segments.at(-2) ?? "" : "";
  return { state, city };
};

const listCsvFiles = async (directory: string): Promise<string[]> => {
  const all = await readdir(directory, {
    withFileTypes: true,
  });

  const files: string[] = [];
  for (const entry of all) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listCsvFiles(fullPath)));
      continue;
    }
    if (!entry.isFile()) {
      continue;
    }
    if (!entry.name.toLowerCase().endsWith(".csv")) {
      continue;
    }
    if (entry.name.toLowerCase() === "tourenrichment.csv") {
      continue;
    }
    files.push(fullPath);
  }

  return files;
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

const canonicalByTourId = new Map<string, { slug: string; state: string; city: string }>(
  palmSpringsTours.map(tour => [
    tour.id,
    {
      slug: tour.slug,
      state: tour.geo.region,
      city: tour.geo.city,
    },
  ])
);

const main = async () => {
  const sourceFiles = await listCsvFiles(csvPaths.dataRoot);
  const sourceRows: CsvRecord[] = [];

  for (const sourceFile of sourceFiles) {
    const parsedRows = parseCsv(await readFile(sourceFile, "utf8"));
    sourceRows.push(...parsedRows);
  }

  let existingRows: CsvRecord[] = [];
  try {
    existingRows = parseCsv(await readFile(csvPaths.enrichment, "utf8"));
  } catch {
    existingRows = [];
  }

  const byTourId = new Map<string, OutputRow>();

  for (const existing of existingRows) {
    const tourId = getTourId(existing);
    if (!tourId) {
      continue;
    }

    const row = byTourId.get(tourId) ?? toBlankOutputRow();
    row.tourId = tourId;
    mergeOnlyBlanks(row, existing as Partial<OutputRow>);
    applyDefaults(row);
    byTourId.set(tourId, row);
  }

  for (const source of sourceRows) {
    const tourId = getTourId(source);
    if (!tourId) {
      continue;
    }

    const title = getTitle(source);
    const description = getDescription(source);
    const canonical = canonicalByTourId.get(tourId);
    const slug = getSlug(source, title, tourId, canonical?.slug);
    if (!slug) {
      continue;
    }

    const parsedLocation = parseLocation(source.location ?? "");
    const state = canonical?.state?.trim() || parsedLocation.state;
    const city = canonical?.city?.trim() || parsedLocation.city;

    if (!state || !city) {
      console.warn(`WARN: missing location state/city for tourId=${tourId}; skipping record`);
      continue;
    }

    const row = byTourId.get(tourId) ?? toBlankOutputRow();
    row.tourId = tourId;
    if (!row.title.trim() && title.trim()) {
      row.title = title;
    }
    if (!row.description.trim() && description.trim()) {
      row.description = description;
    }
    row.slug = slug;
    row.source_url = buildTourUrl(state, city, slug);
    applyDefaults(row);
    byTourId.set(tourId, row);
  }

  const mergedRows = Array.from(byTourId.values()).sort((a, b) =>
    a.tourId.localeCompare(b.tourId, undefined, { numeric: true })
  );

  const output = buildCsv(mergedRows);
  await writeFile(csvPaths.enrichment, output, "utf8");

  console.log(
    `Wrote ${mergedRows.length} tour enrichment rows from ${sourceRows.length} source rows across ${sourceFiles.length} CSV files.`
  );
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
