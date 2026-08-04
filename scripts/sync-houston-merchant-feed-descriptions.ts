import { readFileSync, writeFileSync } from "node:fs";

import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import { engine6ResolvedTours } from "../src/engine6/registry";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_HOUSTON_PRODUCT_CODES = JSON.parse(
  readFileSync("scripts/houston-product-selection.json", "utf8")
).selectedProductCodes as string[];

const escapeCsv = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const parseCsvLines = (content: string) => {
  const lines = content.split(/\r?\n/);
  if (lines.at(-1) === "") {
    lines.pop();
  }
  return lines;
};

const parseCsvRow = (line: string) => {
  const values: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(value);
      value = "";
      continue;
    }

    value += char;
  }

  values.push(value);
  return values;
};

const serializeCsvRow = (values: string[]) =>
  values.map(value => escapeCsv(value)).join(",");

const targetCodes = new Set<string>(NEW_HOUSTON_PRODUCT_CODES);
const beforeBytes = readFileSync(OUTPUT_PATH);
const lines = parseCsvLines(beforeBytes.toString("utf8"));
const header = lines[0];
const legacyLineById = new Map<string, string>();

for (const line of lines.slice(1)) {
  const id = parseCsvRow(line)[0];
  if (id && !targetCodes.has(id)) {
    legacyLineById.set(id, line);
  }
}

const updatedLines = [header];
let synced = 0;

for (const line of lines.slice(1)) {
  const values = parseCsvRow(line);
  const id = values[0];

  if (!id || !targetCodes.has(id)) {
    updatedLines.push(line);
    continue;
  }

  const tour = engine6ResolvedTours.find(entry => entry.productCode === id);
  if (!tour) {
    throw new Error(`Missing resolved tour for merchant feed sync: ${id}`);
  }

  const governedRow = buildMerchantFeedRowFromProductSchema(tour);
  values[2] = governedRow.description;
  updatedLines.push(serializeCsvRow(values));
  synced += 1;
}

const nextCsv = `${updatedLines.join("\n")}\n`;
writeFileSync(OUTPUT_PATH, nextCsv, "utf8");

for (const [id, legacyLine] of legacyLineById) {
  const currentLine = updatedLines.find(row => parseCsvRow(row)[0] === id);
  if (currentLine !== legacyLine) {
    throw new Error(`Legacy merchant feed row changed for ${id}`);
  }
}

console.log(
  `Synced governed descriptions for ${synced} Houston merchant feed rows.`
);
