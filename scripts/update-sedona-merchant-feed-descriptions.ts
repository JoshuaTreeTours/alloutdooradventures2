import { readFileSync, writeFileSync } from "node:fs";

import { enforceMerchantFeedImageGovernanceOnRows } from "../src/engine6/merchantFeedImageGovernance";
import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import { engine6ResolvedTours } from "../src/engine6/registry";

const OUTPUT_PATH = "data/merchantFeed.csv";

const SEDONA_DESCRIPTION_REFRESH_CODES = [
  "162351P6",
  "321860P2",
  "327849P2",
  "327849P1",
  "54668P2",
  "189623P3",
  "325517P1",
  "109073P8",
  "129182P3",
  "129182P1",
  "393812P1",
  "338750P2",
  "393812P3",
  "129182P2",
  "3925OBW",
  "3925P1",
  "25271P1",
  "15880P21",
  "15880P10",
  "32242P1",
  "291644P1",
  "115255P2",
] as const;

const escapeCsv = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const tours = SEDONA_DESCRIPTION_REFRESH_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(entry => entry.productCode === productCode);
  if (!tour) {
    throw new Error(`Missing resolved Sedona tour for ${productCode}`);
  }
  return tour;
});

const governedRows = await enforceMerchantFeedImageGovernanceOnRows({
  rows: tours.map(buildMerchantFeedRowFromProductSchema),
  tours,
});
const rowsById = new Map(governedRows.map(row => [row.id, row]));

const lines = readFileSync(OUTPUT_PATH, "utf8").split(/\r?\n/).filter(Boolean);
const [header, ...dataLines] = lines;
const nextLines = [header];

for (const line of dataLines) {
  const productCode = line.split(",")[0];
  const replacement = rowsById.get(productCode);
  if (!replacement) {
    nextLines.push(line);
    continue;
  }

  nextLines.push(
    [
      replacement.id,
      replacement.title,
      replacement.description,
      replacement.link,
      replacement.image_link,
      replacement.availability,
      replacement.price,
      replacement.condition,
      replacement.brand,
      replacement.average_rating,
      replacement.rating_count,
      replacement.review_count,
    ]
      .map(value => escapeCsv(String(value)))
      .join(",")
  );
  rowsById.delete(productCode);
}

if (rowsById.size > 0) {
  throw new Error(
    `Missing merchant feed rows for ${[...rowsById.keys()].join(", ")}`
  );
}

writeFileSync(OUTPUT_PATH, `${nextLines.join("\n")}\n`, "utf8");
console.log(
  `Updated merchant feed descriptions for ${SEDONA_DESCRIPTION_REFRESH_CODES.length} Sedona products.`
);
