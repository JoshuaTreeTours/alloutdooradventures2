import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type CsvRecord = Record<string, string>;

type OgEntry = {
  title: string;
  description: string;
  image?: string;
};

const DATA_DIR = path.resolve("data");
const OUTPUT_PATH = path.resolve("src/data/ogManifest.json");

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");


const parseCsvRows = (text: string) => {
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

    if (char === "\n" && !inQuotes) {
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }

    if (char !== "\r") {
      current += char;
    }
  }

  if (current.length || row.length) {
    row.push(current);
    rows.push(row);
  }

  return rows;
};

const parseCsv = (contents: string): CsvRecord[] => {
  const rows = parseCsvRows(contents);
  if (!rows.length) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());

  return rows.slice(1).map((row) => {
    const entry: CsvRecord = {};
    headers.forEach((header, index) => {
      if (!header) {
        return;
      }
      entry[header] = row[index]?.trim() ?? "";
    });
    return entry;
  });
};

const getCsvFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return getCsvFiles(fullPath);
      }
      return entry.name.toLowerCase().endsWith(".csv") ? [fullPath] : [];
    }),
  );

  return files.flat();
};

const parseLocation = (location: string) => {
  const segments = location
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

  const city = segments.at(-1) || "Unknown";
  const state =
    segments.length >= 3 ? segments[1] || "Unknown" : segments.at(-2) || "Unknown";

  return {
    state,
    city,
    stateSlug: slugify(state),
    citySlug: slugify(city),
  };
};

const buildDescription = (record: CsvRecord, city: string, state: string) => {
  const preferred =
    record.short_description?.trim() ||
    record.summary?.trim() ||
    record.description?.trim();

  if (preferred) {
    return preferred;
  }

  return `Guided tour in ${city}, ${state}. Book online.`;
};

const buildManifest = async () => {
  const manifest: Record<string, OgEntry> = {};
  const csvFiles = await getCsvFiles(DATA_DIR);

  for (const filePath of csvFiles) {
    const contents = await readFile(filePath, "utf8");
    const rows = parseCsv(contents);

    rows.forEach((record) => {
      const location = record.location?.trim();
      const itemName = record.item_name?.trim();
      if (!location || !itemName) {
        return;
      }

      const { state, city, stateSlug, citySlug } = parseLocation(location);
      const rawItemId = record.item_id?.trim();
      const itemId = rawItemId || slugify(itemName);
      const tourSlug = slugify(`${itemName}-${itemId}`);
      const tourPath = `/destinations/${stateSlug}/${citySlug}/tours/${tourSlug}`;

      const nextEntry: OgEntry = {
        title: itemName,
        description: buildDescription(record, city, state),
      };

      const imageUrl = record.image_url?.trim();
      if (imageUrl) {
        nextEntry.image = imageUrl;
      }

      const existing = manifest[tourPath];
      if (!existing) {
        manifest[tourPath] = nextEntry;
        return;
      }

      const hasExistingImage = Boolean(existing.image);
      const hasNextImage = Boolean(nextEntry.image);
      if (!hasExistingImage && hasNextImage) {
        manifest[tourPath] = nextEntry;
        return;
      }

      if (existing.description.startsWith("Guided tour in") && !nextEntry.description.startsWith("Guided tour in")) {
        manifest[tourPath] = nextEntry;
      }
    });
  }

  const sortedEntries = Object.entries(manifest).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  await writeFile(OUTPUT_PATH, `${JSON.stringify(Object.fromEntries(sortedEntries), null, 2)}\n`);

  console.log(
    `Generated OG manifest with ${sortedEntries.length} entries at ${path.relative(process.cwd(), OUTPUT_PATH)}`,
  );
};

buildManifest().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
