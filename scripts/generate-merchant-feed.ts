import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import { auditEngine6MerchantFeedSchemaParity } from "../src/engine6/merchantFeedParity";
import { resolveEngine6ToursForProductSchema } from "../src/engine6/fetchEngine6LiveCommercialFieldsForSchema";
import { engine6ResolvedTours } from "../src/engine6/registry";
import type { Engine6Tour } from "../src/engine6/types";

const OUTPUT_PATH = path.resolve(process.cwd(), "data/merchantFeed.csv");

const OUTPUT_HEADERS = [
  "id",
  "title",
  "description",
  "link",
  "image_link",
  "availability",
  "price",
  "condition",
  "brand",
  "average_rating",
  "rating_count",
  "review_count",
] as const;

const REQUIRED_MERCHANT_FIELDS = [
  "id",
  "title",
  "description",
  "link",
  "image_link",
  "availability",
  "price",
  "condition",
  "brand",
] as const satisfies readonly OutputHeader[];

type OutputHeader = (typeof OUTPUT_HEADERS)[number];
type MerchantRow = Record<OutputHeader, string>;

type MerchantFeedBlankCounts = {
  totalRows: number;
  blankPriceRows: number;
  blankAverageRatingRows: number;
  blankRatingCountRows: number;
  blankReviewCountRows: number;
  blankRequiredFieldRows: number;
};

const escapeCsv = (value: string) => {
  const escaped = (value ?? "").replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

const toCsv = (rows: MerchantRow[]) => {
  const headerLine = OUTPUT_HEADERS.join(",");
  const body = rows
    .map(row => OUTPUT_HEADERS.map(header => escapeCsv(row[header])).join(","))
    .join("\n");
  return `${headerLine}\n${body}\n`;
};

const parseCsv = (content: string): MerchantRow[] => {
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

  const [headers = [], ...bodyRows] = rows.filter(
    candidate => candidate.length > 1
  );
  return bodyRows.map(values => {
    const record = {} as MerchantRow;
    OUTPUT_HEADERS.forEach(header => {
      const headerIndex = headers.indexOf(header);
      record[header] = headerIndex >= 0 ? (values[headerIndex] ?? "") : "";
    });
    return record;
  });
};

export const countMerchantFeedBlankFields = (
  rows: MerchantRow[]
): MerchantFeedBlankCounts => {
  const isBlank = (value: string | undefined) => !value?.trim();

  let blankRequiredFieldRows = 0;
  for (const row of rows) {
    if (REQUIRED_MERCHANT_FIELDS.some(field => isBlank(row[field]))) {
      blankRequiredFieldRows += 1;
    }
  }

  return {
    totalRows: rows.length,
    blankPriceRows: rows.filter(row => isBlank(row.price)).length,
    blankAverageRatingRows: rows.filter(row => isBlank(row.average_rating))
      .length,
    blankRatingCountRows: rows.filter(row => isBlank(row.rating_count)).length,
    blankReviewCountRows: rows.filter(row => isBlank(row.review_count)).length,
    blankRequiredFieldRows,
  };
};

export const validateMerchantFeedRows = (rows: MerchantRow[]) => {
  const report = countMerchantFeedBlankFields(rows);
  const failures: string[] = [];

  for (const row of rows) {
    for (const field of REQUIRED_MERCHANT_FIELDS) {
      if (!row[field]?.trim()) {
        failures.push(
          `Required field "${field}" is blank for product ${row.id || "(missing id)"}`
        );
      }
    }
  }

  if (report.blankPriceRows > 0) {
    failures.push(
      `Merchant feed validation failed: ${report.blankPriceRows} row(s) have blank price.`
    );
  }

  return {
    report,
    pass: failures.length === 0,
    failures,
  };
};

const logMerchantFeedReport = (
  label: string,
  report: MerchantFeedBlankCounts,
  pass?: boolean
) => {
  console.log(`\nMerchant Feed ${label}:`);
  console.log(`  Total rows: ${report.totalRows}`);
  console.log(`  Blank price rows: ${report.blankPriceRows}`);
  console.log(`  Blank average_rating rows: ${report.blankAverageRatingRows}`);
  console.log(`  Blank rating_count rows: ${report.blankRatingCountRows}`);
  console.log(`  Blank review_count rows: ${report.blankReviewCountRows}`);
  console.log(`  Blank required-field rows: ${report.blankRequiredFieldRows}`);
  if (typeof pass === "boolean") {
    console.log(`  Pass/Fail: ${pass ? "PASS" : "FAIL"}`);
  }
};

export const buildMerchantRow = (tour: Engine6Tour): MerchantRow =>
  buildMerchantFeedRowFromProductSchema(tour);

const readExistingMerchantFeedRows = async (): Promise<MerchantRow[]> => {
  try {
    const content = await readFile(OUTPUT_PATH, "utf8");
    return parseCsv(content);
  } catch {
    return [];
  }
};

const main = async () => {
  const existingRows = await readExistingMerchantFeedRows();
  if (existingRows.length > 0) {
    logMerchantFeedReport("Before", countMerchantFeedBlankFields(existingRows));
  } else {
    console.log("\nMerchant Feed Before: no existing merchantFeed.csv rows.");
  }

  const schemaResolvedTours = await resolveEngine6ToursForProductSchema(
    engine6ResolvedTours
  );

  const outputRows: MerchantRow[] = schemaResolvedTours.map(tour =>
    buildMerchantRow(tour)
  );

  const validation = validateMerchantFeedRows(outputRows);
  logMerchantFeedReport("After", validation.report, validation.pass);

  if (!validation.pass) {
    for (const failure of validation.failures.slice(0, 20)) {
      console.error(failure);
    }
    if (validation.failures.length > 20) {
      console.error(
        `...and ${validation.failures.length - 20} additional validation failures.`
      );
    }
    throw new Error("Merchant feed validation failed before write.");
  }

  const parityAudit = auditEngine6MerchantFeedSchemaParity(
    schemaResolvedTours,
    new Map(outputRows.map(row => [row.id, row]))
  );

  if (!parityAudit.pass) {
    for (const failure of parityAudit.failures.slice(0, 20)) {
      console.error(failure);
    }
    if (parityAudit.failures.length > 20) {
      console.error(
        `...and ${parityAudit.failures.length - 20} additional Product JSON-LD parity failures.`
      );
    }
    throw new Error(
      "Merchant feed Product JSON-LD parity validation failed before write."
    );
  }

  await writeFile(OUTPUT_PATH, toCsv(outputRows), "utf8");

  console.log(`Processed ${engine6ResolvedTours.length} Engine6 products.`);
  console.log(
    `Wrote ${outputRows.length} merchant feed rows to ${OUTPUT_PATH}.`
  );
  console.log("Product JSON-LD parity: PASS");
};

if (process.argv[1]?.includes("generate-merchant-feed")) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
