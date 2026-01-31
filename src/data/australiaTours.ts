import { classifyActivity } from "../lib/activityClassifier";
import { normalizeFareharborUrl } from "../lib/fareharbor";
import { slugify } from "./tourCatalog";
import type { Tour } from "./tours.types";

import { australiaTourRows } from "./australiaTours.generated";

type CsvRow = (typeof australiaTourRows)[number];

const CATEGORY_PRIORITY = ["cycling", "canoeing", "hiking", "day-adventures"] as const;

const sanitizeText = (value?: string) =>
  value?.replace(/\r/g, " ").replace(/\n/g, " ").trim() ?? "";

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

export const australiaTours: Tour[] = australiaTourRows
  .map((row) => buildTourFromRow(row))
  .filter((tour): tour is Tour => Boolean(tour));
