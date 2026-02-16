import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CSV_PATH = path.resolve(process.cwd(), "data/tourEnrichment.csv");
const TARGET_HEADERS = [
  "tourId",
  "slug",
  "title",
  "price",
  "currency",
  "ratingValue",
  "ratingCount",
  "availability",
  "image",
  "merchant_enabled",
  "merchant_title",
  "merchant_description",
  "source_url",
  "last_updated",
];
const REQUIRED_HEADERS = ["tourId", "price", "currency", "ratingValue", "ratingCount"];

const parseCsvLine = (line) => {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
};

const encodeCsvValue = (value) => {
  const stringValue = value == null ? "" : String(value);
  if (stringValue.includes('"') || stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes("\r")) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
};

const toRowObject = (headers, values) =>
  headers.reduce((accumulator, header, index) => {
    accumulator[header] = values[index] ?? "";
    return accumulator;
  }, {});

const getDefaultValue = (header, today) => {
  if (header === "availability") return "in_stock";
  if (header === "merchant_enabled") return "false";
  if (header === "last_updated") return today;
  return "";
};

const hasRequiredHeaders = (headers) =>
  REQUIRED_HEADERS.every((requiredHeader) => headers.includes(requiredHeader));

const main = async () => {
  const source = await readFile(CSV_PATH, "utf8");
  const eol = source.includes("\r\n") ? "\r\n" : "\n";
  const lines = source.split(/\r?\n/);
  const nonEmptyLines = lines.filter((line) => line.trim() !== "");

  if (nonEmptyLines.length === 0) {
    throw new Error("tourEnrichment.csv is empty; cannot migrate.");
  }

  const currentHeaders = parseCsvLine(nonEmptyLines[0]);

  if (!hasRequiredHeaders(currentHeaders)) {
    throw new Error(
      `tourEnrichment.csv is missing required headers before migration. Found: ${currentHeaders.join(",")}`
    );
  }

  const alreadyExpanded = currentHeaders.join(",") === TARGET_HEADERS.join(",");
  if (alreadyExpanded) {
    if (!hasRequiredHeaders(currentHeaders)) {
      throw new Error(
        `tourEnrichment.csv is missing required headers after migration: ${REQUIRED_HEADERS.join(",")}`
      );
    }
    console.log("tourEnrichment.csv already uses the master catalog header. No changes made.");
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const migratedRows = nonEmptyLines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = toRowObject(currentHeaders, values);

    return TARGET_HEADERS.map((header) => {
      const existingValue = row[header];
      if (typeof existingValue === "string" && existingValue.length > 0) {
        return existingValue;
      }
      return getDefaultValue(header, today);
    });
  });

  if (!hasRequiredHeaders(TARGET_HEADERS)) {
    throw new Error(
      `tourEnrichment.csv is missing required headers after migration: ${REQUIRED_HEADERS.join(",")}`
    );
  }

  const outputLines = [
    TARGET_HEADERS.map(encodeCsvValue).join(","),
    ...migratedRows.map((row) => row.map(encodeCsvValue).join(",")),
  ];

  const output = `${outputLines.join(eol)}${eol}`;
  await writeFile(CSV_PATH, output, "utf8");
  console.log("tourEnrichment.csv migrated to master catalog schema.");
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
