import { readFileSync, writeFileSync } from "node:fs";

import { resolveMerchantDescription } from "../src/engine6/merchantDescriptions";
import { merchantFeedEligibleTours } from "../src/engine6/merchantFeedEligibility";
import { engine6ResolvedTours } from "../src/engine6/registry";

const OUTPUT_PATH = "data/merchantFeed.csv";

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
const eligibleProductCodes = new Set(
  merchantFeedEligibleTours.map(tour => tour.productCode)
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
  if (!eligibleProductCodes.has(productCode)) {
    return values;
  }

  const tour = toursByProductCode.get(productCode);
  if (!tour) {
    return values;
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
  `Updated ${updatedDescriptions} merchant description(s) across ${outputRows.length} rows in ${OUTPUT_PATH}.`
);
