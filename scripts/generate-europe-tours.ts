import fs from "node:fs";
import path from "node:path";

import { normalizeFareharborUrl } from "../src/lib/fareharbor";
import { slugify } from "../src/data/tourCatalog";
import type { Tour } from "../src/data/tours.types";

type CsvRow = Record<string, string>;

const ACTIVITY_CONFIGS = [
  {
    activitySlug: "cycling",
    badgeLabel: "Bike Tour",
    inputFile: "europe-cycling.csv",
    outputFile: "europe-cycling.generated.ts",
  },
  {
    activitySlug: "hiking",
    badgeLabel: "Hiking Tour",
    inputFile: "europe-hiking.csv",
    outputFile: "europe-hiking.generated.ts",
  },
  {
    activitySlug: "canoeing",
    badgeLabel: "Paddle Tour",
    inputFile: "europe-canoeing.csv",
    outputFile: "europe-canoeing.generated.ts",
  },
];

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

const buildTourFromRow = (
  row: CsvRow,
  {
    activitySlug,
    badgeLabel,
  }: { activitySlug: string; badgeLabel: string },
): Tour | null => {
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
  const tour: Tour = {
    id: `${operatorSlug}-${itemId}`,
    slug: slugify(`${itemName}-${itemId}`),
    title: itemName,
    operator,
    categories: [activitySlug],
    primaryCategory: activitySlug,
    destination: {
      state: country,
      stateSlug: slugify(country),
      city,
      citySlug: slugify(city),
      lat: row.location_lat ? Number(row.location_lat) : undefined,
      lng: row.location_long ? Number(row.location_long) : undefined,
    },
    heroImage,
    badges: {
      tagline: badgeLabel,
    },
    activitySlugs: [activitySlug],
    bookingProvider: "fareharbor",
    bookingUrl,
    longDescription: `${itemName} is a guided ${activitySlug} experience based in ${city}, ${country} for travelers who want to explore local highlights with an expert lead.`,
  };

  if (bookingWidgetUrl) {
    tour.bookingWidgetUrl = bookingWidgetUrl;
  }

  if (tags.length) {
    tour.tags = tags;
    tour.tagPills = tags.slice(0, 5);
  }

  if (heroImage) {
    tour.galleryImages = [heroImage];
  }

  return tour;
};

const ensureDirectory = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const main = () => {
  ACTIVITY_CONFIGS.forEach((config) => {
    const dataPath = path.resolve("data", "europe", config.inputFile);
    const outputPath = path.resolve(
      "src",
      "data",
      "generated",
      config.outputFile,
    );
    const csvText = fs.readFileSync(dataPath, "utf8");
    const tours = parseCsv(csvText)
      .map((row) =>
        buildTourFromRow(row, {
          activitySlug: config.activitySlug,
          badgeLabel: config.badgeLabel,
        }),
      )
      .filter((tour): tour is Tour => Boolean(tour));

    ensureDirectory(path.dirname(outputPath));

    const exportName = `europe${config.activitySlug[0]!.toUpperCase()}${config.activitySlug.slice(1)}Tours`;
    const fileContents =
      `// This file is auto-generated by scripts/generate-europe-tours.ts. Do not edit manually.\n` +
      `import type { Tour } from "../tours.types";\n\n` +
      `export const ${exportName}: Tour[] = ${JSON.stringify(tours, null, 2)};\n`;

    fs.writeFileSync(outputPath, fileContents, "utf8");
  });
};

main();
