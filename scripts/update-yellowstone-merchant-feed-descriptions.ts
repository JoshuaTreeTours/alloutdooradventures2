import { readFileSync, writeFileSync } from "node:fs";

import { resolveMerchantDescription } from "../src/engine6/merchantDescriptions";
import { engine6ResolvedTours } from "../src/engine6/registry";

const OUTPUT_PATH = "data/merchantFeed.csv";

const YELLOWSTONE_MERCHANT_PRODUCT_CODES = new Set([
  "52661P41",
  "5639875P7",
  "52661P40",
  "151830P1",
  "151830P3",
  "151830P8",
  "316119P3",
  "5591554P17",
  "5591554P23",
  "137381P3",
  "481298P1",
  "265766P66",
  "463268P4",
  "463268P1",
  "52661P26",
  "5584219P8",
  "23667P10",
  "23667P2",
  "23667P3",
  "316119P4",
  "23667P4",
  "23667P1",
  "463268P2",
]);

const escapeCsv = (value: string) => {
  const escaped = (value ?? "").replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

const parseCsv = (content: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

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
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows.filter(candidate => candidate.length > 1);
};

const toursByProductCode = new Map(
  engine6ResolvedTours.map(tour => [tour.productCode, tour])
);

const content = readFileSync(OUTPUT_PATH, "utf8");
const rows = parseCsv(content);
const [headers, ...bodyRows] = rows;
const descriptionIndex = headers.indexOf("description");
const idIndex = headers.indexOf("id");

if (descriptionIndex < 0 || idIndex < 0) {
  throw new Error("merchantFeed.csv is missing required id or description columns");
}

let updatedDescriptions = 0;

const outputRows = bodyRows.map(values => {
  const productCode = values[idIndex]?.trim() ?? "";
  if (!YELLOWSTONE_MERCHANT_PRODUCT_CODES.has(productCode)) {
    return values;
  }

  const tour = toursByProductCode.get(productCode);
  if (!tour) {
    throw new Error(`Missing Engine6 tour for Yellowstone product ${productCode}`);
  }

  const nextDescription = resolveMerchantDescription({
    productCode: tour.productCode,
    title: tour.title,
    city: tour.city,
    state: tour.state,
    categoryLabel: tour.categoryLabel,
    productOverviewDescription: tour.overviewText,
  });

  if (values[descriptionIndex] !== nextDescription) {
    updatedDescriptions += 1;
    values[descriptionIndex] = nextDescription;
  }

  return values;
});

const csv = [
  headers.join(","),
  ...outputRows.map(row => row.map(escapeCsv).join(",")),
].join("\n");

writeFileSync(OUTPUT_PATH, `${csv}\n`, "utf8");

console.log(
  `Updated ${updatedDescriptions} Yellowstone merchant description(s) across ${YELLOWSTONE_MERCHANT_PRODUCT_CODES.size} scoped products in ${OUTPUT_PATH}.`
);
