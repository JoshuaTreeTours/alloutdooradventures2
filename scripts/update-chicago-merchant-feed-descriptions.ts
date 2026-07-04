import { readFileSync, writeFileSync } from "node:fs";

import { enforceMerchantFeedImageGovernanceOnRows } from "../src/engine6/merchantFeedImageGovernance";
import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import { engine6ResolvedTours } from "../src/engine6/registry";

const OUTPUT_PATH = "data/merchantFeed.csv";

const CHICAGO_DESCRIPTION_REFRESH_CODES = [
  "5580ARC",
  "76126P2",
  "76126P8",
  "5580SKY",
  "35169P12",
  "5680NIGHT",
  "5680DAY",
  "61552P17",
  "7812P133",
  "8841P19",
  "188341P1",
  "130651P13",
  "3397P10",
  "3332BITE",
  "316128P3",
  "5042P100",
  "46250P9",
  "68189P1",
  "61552P8",
  "3332DAY",
  "191307P3",
  "338277P2",
  "7812P19",
] as const;

const escapeCsv = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const tours = CHICAGO_DESCRIPTION_REFRESH_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(entry => entry.productCode === productCode);
  if (!tour) {
    throw new Error(`Missing resolved Chicago tour for ${productCode}`);
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
  `Updated merchant feed descriptions for ${CHICAGO_DESCRIPTION_REFRESH_CODES.length} Chicago products.`
);
