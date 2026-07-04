import { readFileSync, writeFileSync } from "node:fs";

import { engine6ResolvedTours } from "../src/engine6/registry";
import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import { enforceMerchantFeedImageGovernanceOnRows } from "../src/engine6/merchantFeedImageGovernance";

const OUTPUT_PATH = "data/merchantFeed.csv";

const BOSTON_PRODUCT_CODES = [
  "3283BWW",
  "3283SSCRUISE",
  "44921P7",
  "3037DUCK",
  "66111P3",
  "26797P4",
  "8843P7",
  "7167P68",
  "5046BOS_OTT",
  "7812P131",
  "8841P14",
  "400049P3",
  "8647P466",
  "400049P5",
  "385595P5",
  "5046BOS_GG",
  "3283CODZILLA",
  "3978TOUR5",
  "5042BOSDIN",
  "5151BOSCY014",
  "66192P8",
  "255730P225",
] as const;

const escapeCsv = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const tours = BOSTON_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Boston tour for ${productCode}`);
  }
  return tour;
});

const existingCsv = readFileSync(OUTPUT_PATH, "utf8");
const existingLines = existingCsv.split(/\r?\n/).filter(Boolean);
const baselineRowCount = existingLines.length - 1;

if (baselineRowCount < BOSTON_PRODUCT_CODES.length) {
  throw new Error(
    `Expected at least ${BOSTON_PRODUCT_CODES.length} rows before Boston replace`
  );
}

const preservedLines = existingLines.slice(0, existingLines.length - 22);
if (preservedLines.length !== existingLines.length - 22) {
  throw new Error("Unexpected merchant feed shape");
}

const newRows = tours.map(tour => buildMerchantFeedRowFromProductSchema(tour));
const governedRows = await enforceMerchantFeedImageGovernanceOnRows({
  rows: newRows,
  tours,
});

const appendedLines = governedRows.map(row =>
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

const nextCsv = `${preservedLines.join("\n")}\n${appendedLines.join("\n")}\n`;
writeFileSync(OUTPUT_PATH, nextCsv, "utf8");

console.log(
  `Replaced 22 Boston merchant feed rows (${preservedLines.length - 1} baseline + 22 Boston = ${preservedLines.length - 1 + governedRows.length}).`
);
