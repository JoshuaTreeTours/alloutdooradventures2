import { classifyActivity } from "../lib/activityClassifier";
import { normalizeFareharborUrl } from "../lib/fareharbor";
import { slugify } from "./tourCatalog";
import type { Tour } from "./tours.types";

import australiaCsv from "../../data/australia.csv?raw";

type CsvRow = Record<string, string>;

const CATEGORY_PRIORITY = ["cycling", "canoeing", "hiking", "day-adventures"] as const;

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
    .split(/[-|,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

const sortByPriority = (categories: string[]) =>
  Array.from(new Set(categories)).sort(
    (a, b) =>
      CATEGORY_PRIORITY.indexOf(a as (typeof CATEGORY_PRIORITY)[number]) -
      CATEGORY_PRIORITY.indexOf(b as (typeof CATEGORY_PRIORITY)[number]),
  );

const resolveActivitySlugs = (title: string, tags: string[]) => {
  const classification = classifyActivity({ title, tags });
  const categories: string[] = [];

  if (classification.nonWalkingCategory === "cycling") {
    categories.push("cycling");
  } else if (classification.nonWalkingCategory === "canoeing") {
    categories.push("canoeing");
  } else if (classification.isHiking) {
    categories.push("hiking");
  } else {
    categories.push("day-adventures");
  }

  const ordered = sortByPriority(categories);
  const primary = ordered[0];

  return {
    activitySlugs: primary
      ? [primary, ...ordered.filter((slug) => slug !== primary)]
      : ordered,
    primaryCategory: primary ?? ordered[0],
  };
};

const buildRating = (value?: string) => {
  const score = value ? Number.parseFloat(value) : Number.NaN;
  if (!Number.isFinite(score)) {
    return undefined;
  }
  const rating = Math.round((score / 20) * 10) / 10;
  return Math.min(Math.max(rating, 1), 5);
};

const buildTourFromRow = (row: CsvRow): Tour | null => {
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
  const city = locationParts[locationParts.length - 1] ?? "Unknown";
  const country = "Australia";
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
  const { activitySlugs, primaryCategory } = resolveActivitySlugs(itemName, tags);
  const likelyToSellOut =
    row.availability_count !== undefined &&
    Number.parseFloat(row.availability_count) <= 30;

  return {
    id: `${operatorSlug}-${itemId}`,
    slug: slugify(`${itemName}-${itemId}`),
    title: itemName,
    operator,
    categories: activitySlugs,
    primaryCategory,
    tags: tags.length ? tags : undefined,
    destination: {
      country,
      state: "",
      stateSlug: slugify(country),
      city,
      citySlug: slugify(city),
      lat: row.location_lat ? Number(row.location_lat) : undefined,
      lng: row.location_long ? Number(row.location_long) : undefined,
    },
    heroImage,
    galleryImages: heroImage ? [heroImage] : undefined,
    badges: {
      rating: buildRating(row.quality_score),
      reviewCount: row.availability_count
        ? Number.parseFloat(row.availability_count)
        : undefined,
      likelyToSellOut,
      tagline: tags[0] ?? "Tour",
    },
    tagPills: tags.length ? tags.slice(0, 3) : undefined,
    activitySlugs,
    bookingProvider: "fareharbor",
    bookingUrl,
    bookingWidgetUrl,
    longDescription: `${itemName} is a guided outdoor experience based in ${city}, ${country} that keeps the logistics simple and the scenery front and center.`,
  };
};

export const australiaTours: Tour[] = parseCsv(australiaCsv)
  .map((row) => buildTourFromRow(row))
  .filter((tour): tour is Tour => Boolean(tour));
