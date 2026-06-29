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

const existingCsv = readFileSync(OUTPUT_PATH, "utf8");
const existingLines = existingCsv.split(/\r?\n/).filter(Boolean);
const existingIds = new Set(
  existingLines.slice(1).map(line => line.split(",")[0])
);

const newRows = YOSEMITE_VIATOR_PUBLIC_PRODUCT_CODES.map(productCode => {
  if (existingIds.has(productCode)) {
    throw new Error(
      `Refusing to overwrite existing merchant feed row ${productCode}`
    );
  }

  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Yosemite tour for ${productCode}`);
  }

  return buildMerchantFeedRowFromProductSchema(tour);
});

for (const row of newRows) {
  for (const [key, value] of Object.entries(row)) {
    if (value == null || String(value).trim() === "") {
      throw new Error(`Blank merchant feed field ${key} for ${row.id}`);
    }
  }
}

const appendedLines = newRows.map(row =>
  [
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
    .join(",")
);

const nextCsv = `${existingLines.join("\n")}\n${appendedLines.join("\n")}\n`;
writeFileSync(OUTPUT_PATH, nextCsv, "utf8");

console.log(
  `Appended ${newRows.length} Yosemite merchant feed rows (${existingLines.length - 1} -> ${existingLines.length - 1 + newRows.length}).`
);
