import { readFileSync, writeFileSync } from "node:fs";

import { enforceMerchantFeedImageGovernanceOnRows } from "../src/engine6/merchantFeedImageGovernance";
import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import { engine6ResolvedTours } from "../src/engine6/registry";
import { HAWAII_VOLCANOES_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/hawaiiVolcanoesViatorPublicRatings";

const OUTPUT_PATH = "data/merchantFeed.csv";

const escapeCsv = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const tours = HAWAII_VOLCANOES_VIATOR_PUBLIC_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(
      `Missing resolved Hawaii Volcanoes National Park tour for ${productCode}`
    );
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
let replaced = 0;

for (const line of dataLines) {
  const productCode = line.split(",")[0];
  const replacement = rowsById.get(productCode);
  if (!replacement) {
    nextLines.push(line);
    continue;
  }

  replaced += 1;
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
}

writeFileSync(OUTPUT_PATH, `${nextLines.join("\n")}\n`, "utf8");
console.log(
  `Updated ${replaced} Hawaii Volcanoes National Park merchant feed descriptions.`
);
