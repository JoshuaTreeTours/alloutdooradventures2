import { readFileSync, writeFileSync } from "node:fs";

import { enforceMerchantFeedImageGovernanceOnRows } from "../src/engine6/merchantFeedImageGovernance";
import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import { engine6ResolvedTours } from "../src/engine6/registry";

const OUTPUT_PATH = "data/merchantFeed.csv";

const PHILADELPHIA_PRODUCT_CODES = [
  "8841P1",
  "8841P6",
  "8841P70",
  "8841P10",
  "102233P1",
  "102233P3",
  "255730P245",
  "255730P256",
  "86032P3",
  "8841P73",
  "153296P3",
  "8841P82",
  "86032P1",
  "8841P34",
  "5582660P3",
  "6314PHILSEG",
  "5042PHLSPI",
  "5042P61",
  "8841P27",
  "25140P1",
  "115692P1",
  "52886P6",
] as const;

const escapeCsv = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const tours = PHILADELPHIA_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(entry => entry.productCode === productCode);
  if (!tour) {
    throw new Error(`Missing resolved Philadelphia tour for ${productCode}`);
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
}

writeFileSync(OUTPUT_PATH, `${nextLines.join("\n")}\n`, "utf8");
console.log(`Refreshed ${PHILADELPHIA_PRODUCT_CODES.length} Philadelphia merchant feed rows.`);
