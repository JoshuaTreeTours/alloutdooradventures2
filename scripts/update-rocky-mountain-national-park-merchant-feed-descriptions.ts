import { readFileSync, writeFileSync } from "node:fs";

import { enforceMerchantFeedImageGovernanceOnRows } from "../src/engine6/merchantFeedImageGovernance";
import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import { engine6ResolvedTours } from "../src/engine6/registry";
import { ROCKY_MOUNTAIN_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/rockyMountainNationalParkViatorPublicRatings";

const OUTPUT_PATH = "data/merchantFeed.csv";

const escapeCsv = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const tours = ROCKY_MOUNTAIN_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES.map(
  productCode => {
    const tour = engine6ResolvedTours.find(
      entry => entry.productCode === productCode
    );
    if (!tour) {
      throw new Error(
        `Missing resolved Rocky Mountain National Park tour for ${productCode}`
      );
    }
    return tour;
  }
);

const governedRows = await enforceMerchantFeedImageGovernanceOnRows({
  rows: tours.map(buildMerchantFeedRowFromProductSchema),
  tours,
});
const rowsById = new Map(governedRows.map(row => [row.id, row]));

const lines = readFileSync(OUTPUT_PATH, "utf8").split(/\r?\n/).filter(Boolean);
const [header, ...dataLines] = lines;
const nextLines = [header];

for (const line of dataLines) {
  const id = line.split(",")[0];
  const governed = rowsById.get(id);
  if (!governed) {
    nextLines.push(line);
    continue;
  }

  const columns = [
    governed.id,
    governed.title,
    governed.description,
    governed.link,
    governed.image_link,
    governed.availability,
    governed.price,
    governed.condition,
    governed.brand,
    governed.average_rating,
    governed.rating_count,
    governed.review_count,
  ].map(value => escapeCsv(String(value)));

  nextLines.push(columns.join(","));
  rowsById.delete(id);
}

if (rowsById.size > 0) {
  throw new Error(
    `Missing merchant feed rows for: ${Array.from(rowsById.keys()).join(", ")}`
  );
}

writeFileSync(OUTPUT_PATH, `${nextLines.join("\n")}\n`, "utf8");
console.log(
  `Refreshed ${ROCKY_MOUNTAIN_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES.length} Rocky Mountain National Park merchant feed rows.`
);
