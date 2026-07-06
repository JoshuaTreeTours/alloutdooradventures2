import { readFileSync, writeFileSync } from "node:fs";

import { resolveEngine6GovernedProductDescription } from "../src/engine6/governedEditorialDescriptions";
import { engine6ResolvedTours } from "../src/engine6/registry";

const OUTPUT_PATH = "data/merchantFeed.csv";
const PRODUCT_CODE = "189546P8";

const escapeCsv = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const parseCsvLine = (line: string) => {
  const parts: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      parts.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  parts.push(current);
  return parts;
};

const tour = engine6ResolvedTours.find(entry => entry.productCode === PRODUCT_CODE);
if (!tour) {
  throw new Error(`Missing resolved tour for ${PRODUCT_CODE}`);
}

const governedDescription = resolveEngine6GovernedProductDescription(tour);
const lines = readFileSync(OUTPUT_PATH, "utf8").split(/\r?\n/).filter(Boolean);
const rowIndex = lines.findIndex(line => line.startsWith(`${PRODUCT_CODE},`));

if (rowIndex < 0) {
  throw new Error(`Missing merchant feed row for ${PRODUCT_CODE}`);
}

const fields = parseCsvLine(lines[rowIndex]);
if (fields.length !== 12) {
  throw new Error(
    `Unexpected merchant feed field count for ${PRODUCT_CODE}: ${fields.length}`
  );
}

const previousDescription = fields[2];
fields[2] = governedDescription;

lines[rowIndex] = fields.map(field => escapeCsv(field)).join(",");
writeFileSync(OUTPUT_PATH, `${lines.join("\n")}\n`, "utf8");

console.log(`Updated merchant feed description for ${PRODUCT_CODE}.`);
console.log(`Previous length: ${previousDescription.length}`);
console.log(`Next length: ${governedDescription.length}`);
