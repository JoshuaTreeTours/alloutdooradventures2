import { readFileSync, writeFileSync } from "node:fs";

import { enforceMerchantFeedImageGovernanceOnRows } from "../src/engine6/merchantFeedImageGovernance";
import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import { engine6ResolvedTours } from "../src/engine6/registry";

const OUTPUT_PATH = "data/merchantFeed.csv";

const JACKSON_HOLE_DESCRIPTION_REFRESH_CODES = [
  "6029YOFWILD",
  "6029WILDSAF",
  "15073P5",
  "156172P2",
  "156172P1",
  "6252SCENIC",
  "38400P2",
  "6252P5",
  "15073P1",
  "15073P6",
  "320113P1",
  "15739P3",
  "56481P3",
  "35441P2",
  "35441P1",
  "460738P6",
  "342881P1",
  "38400P8",
  "6029WINTER",
  "156172P5",
] as const;

const escapeCsv = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const tours = JACKSON_HOLE_DESCRIPTION_REFRESH_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(entry => entry.productCode === productCode);
  if (!tour) {
    throw new Error(`Missing resolved Jackson Hole tour for ${productCode}`);
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
  `Refreshed ${JACKSON_HOLE_DESCRIPTION_REFRESH_CODES.length} Jackson Hole merchant feed descriptions.`
);
