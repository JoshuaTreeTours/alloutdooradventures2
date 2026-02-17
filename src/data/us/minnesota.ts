import fs from "fs";
import path from "path";

export interface MinnesotaTour {
  id: string;
  title: string;
  city: string;
  description?: string;
  price?: string;
  image?: string;
  bookingUrl?: string;
  operator?: string;
}

const clean = (value?: string) => (value ?? "").trim();

const getCityFromLocation = (location?: string) => {
  const parts = clean(location)
    .split("/")
    .map(segment => segment.trim())
    .filter(Boolean);
  return parts[parts.length - 1] ?? "";
};

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

const parseCsv = (contents: string) => {
  const rows = parseCsvRows(contents);
  if (!rows.length) {
    return [] as Array<Record<string, string>>;
  }

  const headers = rows[0].map(header => header.trim());

  return rows.slice(1).map(row => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (!header) {
        return;
      }
      record[header] = row[index]?.trim() ?? "";
    });
    return record;
  });
};

export function loadMinnesotaTours(): MinnesotaTour[] {
  const filePath = path.join(process.cwd(), "data/heartland/Minnesota.csv");

  if (!fs.existsSync(filePath)) {
    console.warn("⚠️ Minnesota.csv not found");
    return [];
  }

  const file = fs.readFileSync(filePath, "utf8");
  const records = parseCsv(file);

  return records
    .map((record): MinnesotaTour | null => {
      const locationParts = clean(record.location)
        .split("/")
        .map(part => part.trim())
        .filter(Boolean);
      const stateFromLocation = locationParts[1]?.toLowerCase();
      if (stateFromLocation && stateFromLocation !== "minnesota") {
        return null;
      }

      const id = clean(record.id || record.tour_id || record.item_id);
      const title = clean(record.title || record.item_name);
      const city = clean(record.city) || getCityFromLocation(record.location);

      if (!id || !title || !city) {
        return null;
      }

      return {
        id,
        title,
        city,
        description: clean(record.description || record.short_description) || undefined,
        price: clean(record.price) || undefined,
        image: clean(record.image || record.image_url) || undefined,
        bookingUrl:
          clean(record.booking_url || record.regular_link || record.calendar_link) ||
          undefined,
        operator:
          clean(record.operator || record.company_name || record.company_shortname) ||
          undefined,
      };
    })
    .filter((tour): tour is MinnesotaTour => Boolean(tour));
}
