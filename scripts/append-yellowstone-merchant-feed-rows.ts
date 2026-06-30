import { readFileSync, writeFileSync } from "node:fs";

import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import { engine6ResolvedTours } from "../src/engine6/registry";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_YELLOWSTONE_PRODUCT_CODES = [
  "52661P41",
  "5639875P7",
  "52661P40",
  "151830P1",
  "151830P3",
  "151830P8",
  "316119P3",
  "5591554P17",
  "5591554P23",
  "137381P3",
  "481298P1",
  "265766P66",
  "463268P4",
  "463268P1",
  "52661P26",
  "5584219P8",
  "23667P10",
  "23667P2",
  "23667P3",
  "316119P4",
  "23667P4",
  "23667P1",
  "463268P2",
] as const;

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

const newRows = NEW_YELLOWSTONE_PRODUCT_CODES.map(productCode => {
  if (existingIds.has(productCode)) {
    throw new Error(
      `Refusing to overwrite existing merchant feed row ${productCode}`
    );
  }

  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Yellowstone tour for ${productCode}`);
  }

  return buildMerchantFeedRowFromProductSchema(tour);
});

for (const row of newRows) {
  const optionalWhenUnrated = new Set([
    "average_rating",
    "rating_count",
    "review_count",
  ]);
  for (const [key, value] of Object.entries(row)) {
    if (optionalWhenUnrated.has(key)) {
      continue;
    }
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
  `Appended ${newRows.length} Yellowstone merchant feed rows to ${OUTPUT_PATH}.`
);
