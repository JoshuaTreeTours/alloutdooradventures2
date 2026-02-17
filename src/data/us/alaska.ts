import fs from "fs";
import path from "path";

export interface AlaskaTour {
  id: string;
  title: string;
  city: string;
  description?: string;
  price?: string;
  image?: string;
  bookingUrl?: string;
  operator?: string;
  slug?: string;
  sourceItemId?: string;
  location?: string;
  location_lat?: string;
  location_long?: string;
  company_shortname?: string;
  company_email?: string;
  company_phone?: string;
}

const clean = (value?: string) => (value ?? "").trim();

const toHumanCity = (value?: string) => {
  const raw = clean(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
  if (!raw) {
    return "";
  }

  return raw
    .split(" ")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

const getCityFromLocation = (location?: string) => {
  const parts = clean(location)
    .split("/")
    .map(segment => segment.trim())
    .filter(Boolean);
  return toHumanCity(parts[parts.length - 1] ?? "");
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

export function loadAlaskaTours(): AlaskaTour[] {
  const filePath = path.join(process.cwd(), "data/alaska.csv");

  if (!fs.existsSync(filePath)) {
    console.warn("⚠️ data/alaska.csv not found; skipping Alaska ingestion.");
    return [];
  }

  const file = fs.readFileSync(filePath, "utf8");
  const records = parseCsv(file);

  return records
    .map((record, index): AlaskaTour | null => {
      const id = clean(
        record.id || record.tour_id || record.sourceItemId || record.item_id
      );
      const title = clean(record.title || record.name || record.item_name);
      const sourceItemId = id;
      const location = clean(record.location);

      const city =
        toHumanCity(record.city || record.citySlug) ||
        getCityFromLocation(location) ||
        "Alaska";

      if (!id && !title) {
        console.warn(`Skipping invalid Alaska row ${index + 2}: missing id and title`);
        return null;
      }

      return {
        id,
        sourceItemId,
        title: title || `Alaska Tour ${sourceItemId || index + 1}`,
        city,
        location,
        description: clean(record.description) || undefined,
        price: clean(record.price || record.from_price) || undefined,
        image: clean(record.image || record.image_url || record.photo) || undefined,
        bookingUrl: clean(record.booking_url || record.url || record.regular_link) || undefined,
        operator: clean(record.operator || record.provider || record.company_name) || undefined,
        slug: clean(record.slug) || undefined,
        location_lat: clean(record.location_lat) || undefined,
        location_long: clean(record.location_long) || undefined,
        company_shortname: clean(record.company_shortname) || undefined,
        company_email: clean(record.company_email) || undefined,
        company_phone: clean(record.company_phone) || undefined,
      };
    })
    .filter((tour): tour is AlaskaTour => Boolean(tour));
}
