import { readFile } from "node:fs/promises";
import path from "node:path";

const FEED_PATH = path.resolve(process.cwd(), "data/merchantFeed.csv");
const EXPECTED_HEADER =
  "id,title,description,link,image_link,availability,price,condition,brand,average_rating,rating_count,review_count";
const PRICE_PATTERN = /^\d+\.\d{2} USD$/;
const AVG_RATING_PATTERN = /^\d+\.\d$/;

type CsvRecord = Record<string, string>;

const parseCsv = (content: string): { headerLine: string; rows: CsvRecord[] } => {
  const normalized = content.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const lines = normalized.trim().split("\n");
  const headerLine = lines[0] ?? "";
  const rows: string[][] = [];

  let currentRow: string[] = [];
  let currentValue = "";
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i += 1) {
    const char = normalized[i];
    const next = normalized[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        currentValue += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if (char === "\n" && !inQuotes) {
      currentRow.push(currentValue);
      rows.push(currentRow);
      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += char;
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue);
    rows.push(currentRow);
  }

  const header = rows[0] ?? [];
  const records: CsvRecord[] = rows.slice(1).map(values => {
    const row: CsvRecord = {};
    header.forEach((column, index) => {
      row[column] = values[index] ?? "";
    });
    return row;
  });

  return { headerLine, rows: records };
};

const fail = (message: string): never => {
  throw new Error(`[merchant-feed-validate] ${message}`);
};

const main = async () => {
  const raw = await readFile(FEED_PATH, "utf8");
  const { headerLine, rows } = parseCsv(raw);

  if (headerLine !== EXPECTED_HEADER) {
    fail(`header mismatch: expected "${EXPECTED_HEADER}" got "${headerLine}"`);
  }

  const seenIds = new Set<string>();
  rows.forEach((row, index) => {
    const line = index + 2;
    const id = row.id?.trim() ?? "";
    const price = row.price?.trim() ?? "";
    const averageRating = row.average_rating?.trim() ?? "";

    if (!id) {
      fail(`missing id at line ${line}`);
    }

    if (seenIds.has(id)) {
      fail(`duplicate id "${id}" at line ${line}`);
    }
    seenIds.add(id);

    if (!PRICE_PATTERN.test(price)) {
      fail(`invalid price "${price}" at line ${line}`);
    }

    if (!AVG_RATING_PATTERN.test(averageRating)) {
      fail(`invalid average_rating "${averageRating}" at line ${line}`);
    }
  });

  console.log(
    `[merchant-feed-validate] OK (${rows.length} rows, ${seenIds.size} unique ids)`
  );
};

void main();
