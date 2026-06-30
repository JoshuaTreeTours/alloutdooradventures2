import { readFileSync, writeFileSync } from "node:fs";

import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import { engine6ResolvedTours } from "../src/engine6/registry";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_ZION_PRODUCT_CODES = [
  "265766P9",
  "199627P1",
  "170406P19",
  "310623P1",
  "318343P2",
  "265766P10",
  "265766P27",
  "286874P2",
  "300061P2",
  "163873P9",
  "163873P18",
  "118887P1",
  "118887P5",
  "118887P2",
  "275087P2",
  "163873P1",
  "118744P4",
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

const newRows = NEW_ZION_PRODUCT_CODES.map(productCode => {
  if (existingIds.has(productCode)) {
    throw new Error(
      `Refusing to overwrite existing merchant feed row ${productCode}`
    );
  }

  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Zion tour for ${productCode}`);
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
  `Appended ${newRows.length} Zion merchant feed rows to ${OUTPUT_PATH}.`
);
