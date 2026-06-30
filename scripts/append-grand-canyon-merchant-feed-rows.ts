import { readFileSync, writeFileSync } from "node:fs";

import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import { engine6ResolvedTours } from "../src/engine6/registry";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_GRAND_CANYON_PRODUCT_CODES = [
  "5662346P1",
  "5637206P8",
  "5637206P7",
  "109090P3",
  "5167SD",
  "6338P18",
  "265766P28",
  "5637206P4",
  "318692P1",
  "318692P2",
  "18678CS",
  "6613P24",
  "89776P1",
  "229754P2",
  "5488718P3",
  "7886P3",
  "3272GCER",
  "25576P9",
  "108446P2",
  "6338DISCOVERY",
  "229754P1",
  "3272GCSR2",
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

const newRows = NEW_GRAND_CANYON_PRODUCT_CODES.map(productCode => {
  if (existingIds.has(productCode)) {
    throw new Error(
      `Refusing to overwrite existing merchant feed row ${productCode}`
    );
  }

  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Grand Canyon tour for ${productCode}`);
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
  `Appended ${newRows.length} Grand Canyon merchant feed rows to ${OUTPUT_PATH}.`
);
