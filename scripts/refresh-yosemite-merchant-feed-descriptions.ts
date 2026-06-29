import { readFileSync, writeFileSync } from "node:fs";

import { YOSEMITE_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/yosemiteViatorPublicRatings";
import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import { engine6ResolvedTours } from "../src/engine6/registry";

const OUTPUT_PATH = "data/merchantFeed.csv";

const escapeCsv = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const yosemiteIds = new Set(YOSEMITE_VIATOR_PUBLIC_PRODUCT_CODES);

const existingCsv = readFileSync(OUTPUT_PATH, "utf8");
const existingLines = existingCsv.split(/\r?\n/).filter(Boolean);
const header = existingLines[0];
const dataLines = existingLines.slice(1);

const refreshedLines = dataLines.map(line => {
  const id = line.split(",")[0];
  if (!yosemiteIds.has(id)) {
    return line;
  }

  const tour = engine6ResolvedTours.find(entry => entry.productCode === id);
  if (!tour) {
    throw new Error(`Missing resolved Yosemite tour for ${id}`);
  }

  const row = buildMerchantFeedRowFromProductSchema(tour);
  for (const [key, value] of Object.entries(row)) {
    if (value == null || String(value).trim() === "") {
      throw new Error(`Blank merchant feed field ${key} for ${row.id}`);
    }
  }

  return [
    row.id,
    row.title,
    row.description,
    row.link,
    row.image_link,
    row.availability,
    row.price,
    row.condition,
    row.brand,
    row.average_rating,
    row.rating_count,
    row.review_count,
  ]
    .map(value => escapeCsv(String(value)))
    .join(",");
});

const nextCsv = `${[header, ...refreshedLines].join("\n")}\n`;
writeFileSync(OUTPUT_PATH, nextCsv, "utf8");

console.log(
  `Refreshed descriptions for ${YOSEMITE_VIATOR_PUBLIC_PRODUCT_CODES.length} Yosemite merchant feed rows.`
);
