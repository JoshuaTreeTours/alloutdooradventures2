import { readFileSync, writeFileSync } from "node:fs";

import { enforceMerchantFeedImageGovernanceOnRows } from "../src/engine6/merchantFeedImageGovernance";
import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import { engine6ResolvedTours } from "../src/engine6/registry";

const OUTPUT_PATH = "data/merchantFeed.csv";

const WASHINGTON_DC_DESCRIPTION_REFRESH_CODES = [
  "67327P4",
  "7953P7",
  "67327P2",
  "149066P1",
  "255730P191",
  "67327P5",
  "41503P1",
  "41503P2",
  "6349P59",
  "6766SIGTOUR",
  "67327P3",
  "7812P219",
  "6349DAYTOUR",
  "6349NIGHT",
  "6766P11",
  "41377P2",
  "60725P1",
  "14782P1",
  "5046WAS_MON",
  "6349VIPDC",
  "2384P20",
  "5769MTVN",
] as const;

const escapeCsv = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const tours = WASHINGTON_DC_DESCRIPTION_REFRESH_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(entry => entry.productCode === productCode);
  if (!tour) {
    throw new Error(`Missing resolved Washington D.C. tour for ${productCode}`);
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
  `Updated merchant feed descriptions for ${WASHINGTON_DC_DESCRIPTION_REFRESH_CODES.length} Washington D.C. products.`
);
