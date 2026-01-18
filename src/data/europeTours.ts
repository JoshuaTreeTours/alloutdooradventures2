import { normalizeFareharborUrl } from "../lib/fareharbor";
import { slugify } from "./tourCatalog";
import type { Tour } from "./tours.types";

import europeCanoeingCsv from "../../data/europe/europe-canoeing.csv?raw";
import europeCyclingCsv from "../../data/europe/europe-cycling.csv?raw";
import europeHikingCsv from "../../data/europe/europe-hiking.csv?raw";

type CsvRow = Record<string, string>;

const ACTIVITY_BADGES: Record<string, string> = {
  cycling: "Bike Tour",
  hiking: "Hiking Tour",
  canoeing: "Paddle Tour",
};

const sanitizeText = (value?: string) =>
  value?.replace(/\r/g, " ").replace(/\n/g, " ").trim() ?? "";

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

const parseCsv = (text: string): CsvRow[] => {
  const rows = parseCsvRows(text).filter((row) =>
    row.some((cell) => cell.trim().length > 0),
  );
  const [headers, ...dataRows] = rows;

  if (!headers) {
    return [];
  }

  return dataRows.map((row) => {
    const record: CsvRow = {};
    headers.forEach((header, index) => {
      record[header] = sanitizeText(row[index]);
    });
    return record;
  });
};

const splitTags = (value?: string) =>
  sanitizeText(value)
    .split("-")
    .map((tag) => tag.trim())
    .filter(Boolean);

const buildTourFromRow = (row: CsvRow, activitySlug: string): Tour | null => {
  const location = sanitizeText(row.location);
  const itemName = sanitizeText(row.item_name);
  const bookingUrlSource =
    row.regular_link || row.booking_url || row.calendar_link;

  if (!location || !itemName || !bookingUrlSource) {
    return null;
  }

  const locationParts = location
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  const country = locationParts[0] ?? "Europe";
  const city = locationParts[locationParts.length - 1] ?? country;
  const itemId = row.item_id || slugify(itemName);
  const operator = row.company_name || row.operator || "Local guide";
  const operatorSlug = slugify(row.company_shortname || operator);
  const bookingUrl =
    normalizeFareharborUrl(bookingUrlSource) ?? bookingUrlSource;
  const bookingWidgetSource =
    row.calendar_link || row.booking_url || row.regular_link;
  const bookingWidgetUrl = bookingWidgetSource
    ? normalizeFareharborUrl(bookingWidgetSource) ?? bookingWidgetSource
    : undefined;
  const heroImage = sanitizeText(row.image_url) || "/hero.jpg";
  const tags = splitTags(row.tags);
  const badgeLabel = ACTIVITY_BADGES[activitySlug] ?? "Tour";

  return {
    id: `${operatorSlug}-${itemId}`,
    slug: slugify(`${itemName}-${itemId}`),
    title: itemName,
    operator,
    categories: [activitySlug],
    primaryCategory: activitySlug,
    tags: tags.length ? tags : undefined,
    destination: {
      state: country,
      stateSlug: slugify(country),
      city,
      citySlug: slugify(city),
      lat: row.location_lat ? Number(row.location_lat) : undefined,
      lng: row.location_long ? Number(row.location_long) : undefined,
    },
    heroImage,
    galleryImages: heroImage ? [heroImage] : undefined,
    badges: {
      tagline: badgeLabel,
    },
    tagPills: tags.length ? tags.slice(0, 5) : undefined,
    activitySlugs: [activitySlug],
    bookingProvider: "fareharbor",
    bookingUrl,
    bookingWidgetUrl,
    longDescription: `${itemName} is a guided ${activitySlug} experience based in ${city}, ${country} for travelers who want to explore local highlights with an expert lead.`,
  };
};

const buildToursFromCsv = (text: string, activitySlug: string) =>
  parseCsv(text)
    .map((row) => buildTourFromRow(row, activitySlug))
    .filter((tour): tour is Tour => Boolean(tour));

export const europeTours: Tour[] = [
  ...buildToursFromCsv(europeCyclingCsv, "cycling"),
  ...buildToursFromCsv(europeHikingCsv, "hiking"),
  ...buildToursFromCsv(europeCanoeingCsv, "canoeing"),
];
