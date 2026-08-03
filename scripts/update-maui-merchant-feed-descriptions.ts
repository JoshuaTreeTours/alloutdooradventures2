import { readFileSync, writeFileSync } from "node:fs";

import { enforceMerchantFeedImageGovernanceOnRows } from "../src/engine6/merchantFeedImageGovernance";
import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import { engine6ResolvedTours } from "../src/engine6/registry";

const OUTPUT_PATH = "data/merchantFeed.csv";

const MAUI_DESCRIPTION_REFRESH_CODES = [
  "5501HASKY",
  "5069WEST60",
  "5069COMP60",
  "7029OGGHAN",
  "5069DOM",
  "7029OGGVOY",
  "326167P1",
  "320015P2",
  "64708P2",
  "200419P2",
  "105668P1",
  "104589P11",
  "2360M5",
  "62707P3",
  "241329P1",
  "2784P8",
  "3087MOLL",
  "166701P1",
  "124957P2",
  "5069WEST45",
] as const;

const escapeCsv = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const tours = MAUI_DESCRIPTION_REFRESH_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(entry => entry.productCode === productCode);
  if (!tour) {
    throw new Error(`Missing resolved Maui tour for ${productCode}`);
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
  `Updated merchant feed descriptions for ${MAUI_DESCRIPTION_REFRESH_CODES.length} Maui products.`
);
