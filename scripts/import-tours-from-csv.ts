import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Tour } from "../src/data/tours.types";

const DATA_DIR = path.resolve("data");
const OUTPUT_PATH = path.resolve("src/data/tours.generated.ts");
const PLACEHOLDER_IMAGE = "/hero.jpg";
const CATEGORY_FILES = [
  { filename: "cycling.csv", activitySlug: "cycling" },
  { filename: "hiking.csv", activitySlug: "hiking" },
  { filename: "canoeing.csv", activitySlug: "canoeing" },
] as const;

const REQUIRED_COLUMNS = [
  "company_shortname",
  "location",
  "item_id",
  "item_name",
  "image_url",
  "calendar_link",
  "regular_link",
] as const;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const splitCsvLine = (text: string) => {
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

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }

      row.push(current);
      current = "";
      if (row.length > 1 || row[0]?.trim()) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows;
};

const parseCsv = (contents: string) => {
  const rows = splitCsvLine(contents);
  const [header, ...dataRows] = rows;
  if (!header) {
    return { header: [], records: [] };
  }

  const records = dataRows.map((row) => {
    const record: Record<string, string> = {};
    header.forEach((column, index) => {
      record[column] = row[index] ?? "";
    });
    return record;
  });

  return { header, records };
};

const parseLocation = (location: string) => {
  const segments = location.split("/").map((segment) => segment.trim());
  const city = segments.at(-1) || "Unknown";
  const state = segments.at(-2) || "Unknown";
  return {
    state,
    stateSlug: slugify(state),
    city,
    citySlug: slugify(city),
  };
};

const parseTags = (rawTags: string) =>
  rawTags
    .split("-")
    .map((tag) => tag.trim())
    .filter(Boolean);

const mapActivitySlugs = (activitySlug: string) => [activitySlug];

const buildLongDescription = (title: string, city: string, state: string) =>
  [
    `${title} is a curated experience in ${city}, ${state} designed for travelers who want a guided, outdoors-first outing.`,
    "Expect local insights, well-paced stops, and an itinerary that balances adventure with comfort. Your guide handles the logistics so you can focus on the scenery.",
  ].join("\n\n");

const parseNumber = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const buildRating = (qualityScore?: number) => {
  if (!qualityScore) {
    return undefined;
  }

  const rating = Math.round((qualityScore / 20) * 10) / 10;
  return Math.min(Math.max(rating, 1), 5);
};

const requiredColumnsMissing = (header: string[]) =>
  REQUIRED_COLUMNS.filter((column) => !header.includes(column));

export const normalizeBookingUrl = (rawUrl: string) => {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch (error) {
    throw new Error(`Invalid booking URL: ${rawUrl}`);
  }

  if (parsedUrl.hostname === "fareharbor.com") {
    const calendarMatch = parsedUrl.pathname.match(
      /\/embeds\/calendar\/([^/]+)\/items\/(\d+)/,
    );
    const bookCalendarMatch = parsedUrl.pathname.match(
      /\/embeds\/book\/([^/]+)\/items\/(\d+)\/calendar/,
    );
    const itemMatch = parsedUrl.pathname.match(/\/items\/(\d+)/);
    if (!itemMatch?.[1]) {
      throw new Error(`FareHarbor URL missing item id: ${rawUrl}`);
    }

    if (calendarMatch?.[1] && calendarMatch?.[2]) {
      parsedUrl.pathname = `/embeds/book/${calendarMatch[1]}/items/${calendarMatch[2]}/`;
    } else if (bookCalendarMatch?.[1] && bookCalendarMatch?.[2]) {
      parsedUrl.pathname = `/embeds/book/${bookCalendarMatch[1]}/items/${bookCalendarMatch[2]}/`;
    }

    if (!parsedUrl.searchParams.has("branding")) {
      parsedUrl.searchParams.append("branding", "no");
    }
  }

  return parsedUrl.toString();
};

const normalizeCalendarUrl = (rawUrl: string) => {
  const normalizedUrl = normalizeBookingUrl(rawUrl);
  const parsedUrl = new URL(normalizedUrl);

  if (parsedUrl.hostname === "fareharbor.com") {
    const calendarMatch = parsedUrl.pathname.match(
      /\/embeds\/calendar\/([^/]+)\/items\/(\d+)/,
    );
    const bookMatch = parsedUrl.pathname.match(
      /\/embeds\/book\/([^/]+)\/items\/(\d+)/,
    );

    if (calendarMatch?.[1] && calendarMatch?.[2]) {
      parsedUrl.pathname = `/embeds/book/${calendarMatch[1]}/items/${calendarMatch[2]}/calendar/`;
    } else if (bookMatch?.[1] && bookMatch?.[2]) {
      parsedUrl.pathname = `/embeds/book/${bookMatch[1]}/items/${bookMatch[2]}/calendar/`;
    }
  }

  return parsedUrl.toString();
};

const rowToTour = (
  row: Record<string, string>,
  activitySlug: string,
): Tour => {
  const destination = parseLocation(row.location);
  const tags = parseTags(row.tags);
  const itemId = row.item_id.trim();
  const title = row.item_name.trim() || "Untitled Tour";
  const slugBase = slugify(title);
  const slug = `${slugBase}-${itemId}`;
  const calendarLink = row.calendar_link.trim();
  const bookingUrl = (calendarLink || row.regular_link).trim();
  const availabilityCount = parseNumber(row.availability_count);
  const qualityScore = parseNumber(row.quality_score);
  const latitude = parseNumber(row.location_lat);
  const longitude = parseNumber(row.location_long);

  if (!bookingUrl) {
    throw new Error(`Missing booking URL for item ${row.item_id} (${title}).`);
  }

  const normalizedBookingUrl = normalizeBookingUrl(bookingUrl);
  const normalizedCalendarLink = calendarLink
    ? normalizeCalendarUrl(calendarLink)
    : undefined;

  const likelyToSellOut =
    typeof availabilityCount === "number" && availabilityCount <= 30;

  return {
    id: `${row.company_shortname}-${itemId}`,
    slug,
    title,
    destination: {
      ...destination,
      lat: latitude,
      lng: longitude,
    },
    heroImage: row.image_url || PLACEHOLDER_IMAGE,
    galleryImages: row.image_url ? [row.image_url] : [],
    badges: {
      rating: buildRating(qualityScore),
      reviewCount: availabilityCount,
      likelyToSellOut,
      tagline: tags[0],
    },
    tagPills: tags.slice(0, 3),
    activitySlugs: mapActivitySlugs(activitySlug),
    bookingProvider: "fareharbor",
    bookingUrl: normalizedBookingUrl,
    bookingWidgetUrl: normalizedCalendarLink,
    longDescription: buildLongDescription(
      title,
      destination.city,
      destination.state,
    ),
  };
};

const writeGeneratedFile = async (tours: Tour[]) => {
  const fileContents = `import type { Tour } from "./tours.types";

// This file is auto-generated by scripts/import-tours-from-csv.ts. Do not edit manually.
export const toursGenerated: Tour[] = ${JSON.stringify(tours, null, 2)};
`;
  await writeFile(OUTPUT_PATH, fileContents, "utf8");
};

const run = async () => {
  const files = new Set(await readdir(DATA_DIR));
  const csvFiles = CATEGORY_FILES.filter((entry) =>
    files.has(entry.filename),
  );

  if (!csvFiles.length) {
    throw new Error(
      `No category CSV files found in ${DATA_DIR}. Expected: ${CATEGORY_FILES.map(
        (entry) => entry.filename,
      ).join(", ")}`,
    );
  }

  const tours: Tour[] = [];
  const skippedRows: string[] = [];
  const seenItems = new Map<
    string,
    {
      source: string;
      location: string;
      title: string;
      calendarLink: string;
      regularLink: string;
      imageUrl: string;
    }
  >();

  for (const { filename, activitySlug } of csvFiles) {
    const csvPath = path.join(DATA_DIR, filename);
    const contents = await readFile(csvPath, "utf8");
    const { header, records } = parseCsv(contents);
    const missingColumns = requiredColumnsMissing(header);

    if (missingColumns.length) {
      throw new Error(
        `${filename} is missing required columns: ${missingColumns.join(", ")}`,
      );
    }

    records.forEach((row, index) => {
      const rowIdentifier = row.item_id
        ? `${row.company_shortname}-${row.item_id}`
        : `row ${index + 2}`;
      const missingFields: string[] = [];
      const location = row.location?.trim() ?? "";
      const { state, city } = parseLocation(location);
      const bookingUrl = (row.calendar_link || row.regular_link || "").trim();

      if (!row.item_id?.trim()) {
        missingFields.push("item_id");
      }
      if (!row.item_name?.trim()) {
        missingFields.push("title");
      }
      if (!location || state === "Unknown" || city === "Unknown") {
        missingFields.push("city/state");
      }
      if (!row.image_url?.trim()) {
        missingFields.push("image_url");
      }
      if (!bookingUrl) {
        missingFields.push("booking_url");
      }

      if (missingFields.length) {
        const message = `${filename}: ${rowIdentifier} missing ${missingFields.join(
          ", ",
        )}`;
        console.warn(`[import] Skipping ${message}`);
        skippedRows.push(message);
        return;
      }

      const itemKey = `${row.company_shortname}-${row.item_id}`;
      const nextSnapshot = {
        source: filename,
        location: row.location,
        title: row.item_name,
        calendarLink: row.calendar_link,
        regularLink: row.regular_link,
        imageUrl: row.image_url,
      };
      const previousSnapshot = seenItems.get(itemKey);

      if (previousSnapshot) {
        const hasConflict =
          previousSnapshot.location !== nextSnapshot.location ||
          previousSnapshot.title !== nextSnapshot.title ||
          previousSnapshot.calendarLink !== nextSnapshot.calendarLink ||
          previousSnapshot.regularLink !== nextSnapshot.regularLink ||
          previousSnapshot.imageUrl !== nextSnapshot.imageUrl;

        if (hasConflict) {
          const message = `${filename}: ${itemKey} conflicts with ${previousSnapshot.source}`;
          console.warn(`[import] Skipping ${message}`);
          skippedRows.push(message);
        }
        return;
      }

      seenItems.set(itemKey, nextSnapshot);
      try {
        tours.push(rowToTour(row, activitySlug));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        const warning = `${filename}: ${message}`;
        console.warn(`[import] Skipping ${warning}`);
        skippedRows.push(warning);
      }
    });
  }

  if (skippedRows.length) {
    console.warn(
      `[import] Skipped ${skippedRows.length} rows due to missing or invalid data.`,
    );
  }

  await writeGeneratedFile(tours);
  console.log(`Generated ${tours.length} tours.`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
