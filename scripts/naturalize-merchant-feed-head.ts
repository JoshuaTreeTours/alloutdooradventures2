import { readFileSync, writeFileSync } from "node:fs";

import { resolveEngine6GovernedProductDescription } from "../src/engine6/governedEditorialDescriptions";
import { engine6ResolvedTours } from "../src/engine6/registry";

const MERCHANT_FEED_PATH = "data/merchantFeed.csv";
const FIRST_PRODUCT_LINE = 2;
const LAST_PRODUCT_LINE = 501;
const EXPECTED_COLUMN_COUNT = 12;

const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (inQuotes) {
      if (char === '"' && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
};

const escapeCsv = (value: string) =>
  /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

const lines = readFileSync(MERCHANT_FEED_PATH, "utf8").trimEnd().split(/\r?\n/);
const tourByProductCode = new Map(
  engine6ResolvedTours.map(tour => [tour.productCode, tour])
);
let changedDescriptions = 0;

for (
  let lineIndex = FIRST_PRODUCT_LINE - 1;
  lineIndex < Math.min(LAST_PRODUCT_LINE, lines.length);
  lineIndex += 1
) {
  const values = parseCsvLine(lines[lineIndex]);
  if (values.length !== EXPECTED_COLUMN_COUNT) {
    throw new Error(
      `Merchant line ${lineIndex + 1} has ${values.length} columns; expected ${EXPECTED_COLUMN_COUNT}`
    );
  }

  const productCode = values[0];
  const tour = tourByProductCode.get(productCode);
  if (!tour) {
    throw new Error(
      `Merchant line ${lineIndex + 1} has no configured Engine6 tour for ${productCode}`
    );
  }

  const governedDescription = resolveEngine6GovernedProductDescription(tour);
  if (values[2] !== governedDescription) {
    values[2] = governedDescription;
    changedDescriptions += 1;
  }
  lines[lineIndex] = values.map(escapeCsv).join(",");
}

writeFileSync(MERCHANT_FEED_PATH, `${lines.join("\n")}\n`, "utf8");
console.log(
  `Audited the first ${LAST_PRODUCT_LINE - FIRST_PRODUCT_LINE + 1} merchant products and improved ${changedDescriptions} descriptions.`
);
