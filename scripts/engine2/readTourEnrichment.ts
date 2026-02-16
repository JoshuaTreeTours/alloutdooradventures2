import { readFile } from "node:fs/promises";

export type TourEnrichment = {
  tourId: string;
  slug: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  ratingValue: string;
  ratingCount: string;
  availability: string;
  image: string;
  merchant_enabled: string;
  merchant_title: string;
  merchant_description: string;
  source_url: string;
  last_updated: string;
};

const KNOWN_COLUMNS: (keyof TourEnrichment)[] = [
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
];

const parseCsvLine = (line: string) => {
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

const blankEnrichment = (): TourEnrichment => ({
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

export const readTourEnrichment = async (filePath: string) => {
  const output = new Map<string, TourEnrichment>();

  let contents = "";
  try {
    contents = await readFile(filePath, "utf8");
  } catch {
    return output;
  }

  const normalized = contents.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return output;
  }

  const lines = normalized.split("\n");
  const headerCells = parseCsvLine(lines[0]);
  const colIndexByName = new Map<string, number>();

  headerCells.forEach((raw, index) => {
    const name = raw.trim();
    if (name) {
      colIndexByName.set(name, index);
    }
  });

  for (const line of lines.slice(1)) {
    if (!line.trim()) {
      continue;
    }

    const values = parseCsvLine(line);
    const row = blankEnrichment();

    KNOWN_COLUMNS.forEach(column => {
      const idx = colIndexByName.get(column);
      row[column] = idx === undefined ? "" : (values[idx] ?? "").trim();
    });

    if (!row.tourId) {
      continue;
    }

    output.set(row.tourId, row);
  }

  return output;
};
