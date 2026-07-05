import { readFileSync, writeFileSync } from "node:fs";

import { enforceMerchantFeedImageGovernanceOnRows } from "../src/engine6/merchantFeedImageGovernance";
import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import { engine6ResolvedTours } from "../src/engine6/registry";

const OUTPUT_PATH = "data/merchantFeed.csv";

const KEY_WEST_DESCRIPTION_REFRESH_CODES = [
  "331502P3",
  "362955P2",
  "119664P1",
  "288166P2",
  "328038P9",
  "102533P9",
  "2642P5",
  "418765P2",
  "2642P21",
  "2642P34",
  "2642P30",
  "7506P2",
  "7506P1",
  "5395SUNSET",
  "5264HDRS",
  "3800P30",
  "6426SHARKECO",
  "2642P6",
  "44502P1",
  "7812P77",
  "328038P8",
  "18235P1",
  "5264DC",
  "2642P16",
] as const;

const escapeCsv = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const tours = KEY_WEST_DESCRIPTION_REFRESH_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(entry => entry.productCode === productCode);
  if (!tour) {
    throw new Error(`Missing resolved Key West tour for ${productCode}`);
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

writeFileSync(OUTPUT_PATH, `${nextLines.join("\n")}\n`, "utf8");
console.log(
  `Refreshed ${KEY_WEST_DESCRIPTION_REFRESH_CODES.length} Key West merchant feed descriptions.`
);
