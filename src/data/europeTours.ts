import { normalizeFareharborUrl } from "../lib/fareharbor";
import { slugify } from "./tourCatalog";
import type { Tour } from "./tours.types";

import { europeCanoeingRows, type CsvRow } from "./generated/europeCanoeingRows.generated";
import { europeCyclingRows } from "./generated/europeCyclingRows.generated";
import { europeHikingRows } from "./generated/europeHikingRows.generated";

const ACTIVITY_BADGES: Record<string, string> = {
  cycling: "Bike Tour",
  hiking: "Hiking Tour",
  canoeing: "Paddle Tour",
};

const sanitizeText = (value?: string) =>
  value?.replace(/\r/g, " ").replace(/\n/g, " ").trim() ?? "";

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

const buildToursFromRows = (rows: CsvRow[], activitySlug: string) =>
  rows
    .map((row) => buildTourFromRow(row, activitySlug))
    .filter((tour): tour is Tour => Boolean(tour));

export const europeTours: Tour[] = [
  ...buildToursFromRows(europeCyclingRows, "cycling"),
  ...buildToursFromRows(europeHikingRows, "hiking"),
  ...buildToursFromRows(europeCanoeingRows, "canoeing"),
];
