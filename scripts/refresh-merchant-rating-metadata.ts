import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const FEED_PATH = path.resolve(process.cwd(), "data/merchantFeed.csv");
const BASE_URL = (
  process.env.MERCHANT_RATING_BASE_URL ?? "https://www.alloutdooradventures.com"
).replace(/\/$/, "");
const CONCURRENCY = Number(process.env.MERCHANT_RATING_CONCURRENCY ?? "12");

const parseCsv = (content: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const ch = content[i];
    const next = content[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += ch;
  }

  if (value.length || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows.filter(candidate => candidate.some(cell => cell.length > 0));
};

const escapeCsv = (value: string) => {
  const escaped = (value ?? "").replace(/"/g, '""');
  return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
};

const toCsv = (rows: string[][]) =>
  `${rows.map(row => row.map(escapeCsv).join(",")).join("\n")}\n`;

const normalizeRating = (value: number) => {
  if (!Number.isFinite(value)) return "";
  return value.toFixed(1);
};

const fetchRatingMetadata = async (productCode: string) => {
  const url = `${BASE_URL}/api/engine6/viator-product?productCode=${encodeURIComponent(productCode)}`;
  const response = await fetch(url, {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`${productCode}: HTTP ${response.status}`);
  }

  const body = (await response.json()) as {
    extracted?: {
      aggregateRating?: number | null;
      reviewCount?: number | null;
    };
  };

  const aggregateRating = body.extracted?.aggregateRating;
  const reviewCount = body.extracted?.reviewCount;

  if (typeof aggregateRating !== "number" || !Number.isFinite(aggregateRating)) {
    throw new Error(`${productCode}: missing aggregateRating`);
  }
  if (typeof reviewCount !== "number" || !Number.isFinite(reviewCount)) {
    throw new Error(`${productCode}: missing reviewCount`);
  }

  return { aggregateRating, reviewCount };
};

const main = async () => {
  const content = await readFile(FEED_PATH, "utf8");
  const rows = parseCsv(content);
  if (rows.length < 2) throw new Error("merchantFeed.csv has no product rows");

  const headers = rows[0];
  const idIndex = headers.indexOf("id");
  const avgIndex = headers.indexOf("average_rating");
  const ratingCountIndex = headers.indexOf("rating_count");
  const reviewCountIndex = headers.indexOf("review_count");

  for (const [name, index] of [
    ["id", idIndex],
    ["average_rating", avgIndex],
    ["rating_count", ratingCountIndex],
    ["review_count", reviewCountIndex],
  ] as const) {
    if (index < 0) throw new Error(`Missing required column: ${name}`);
  }

  const dataRows = rows.slice(1);
  const skipped: string[] = [];
  let ratingChanges = 0;
  let countChanges = 0;

  for (let start = 0; start < dataRows.length; start += CONCURRENCY) {
    const batch = dataRows.slice(start, start + CONCURRENCY);
    await Promise.all(
      batch.map(async row => {
        const productCode = row[idIndex]?.trim();
        if (!productCode) {
          skipped.push("(blank id): missing product code");
          return;
        }

        try {
          const live = await fetchRatingMetadata(productCode);
          const liveRating = normalizeRating(live.aggregateRating);
          const liveCount = String(Math.trunc(live.reviewCount));

          if (row[avgIndex] !== liveRating) ratingChanges += 1;
          if (
            row[ratingCountIndex] !== liveCount ||
            row[reviewCountIndex] !== liveCount
          ) {
            countChanges += 1;
          }

          row[avgIndex] = liveRating;
          row[ratingCountIndex] = liveCount;
          row[reviewCountIndex] = liveCount;
        } catch (error) {
          skipped.push(error instanceof Error ? error.message : String(error));
          // Preserve the existing merchant-feed values for products that do not
          // currently return complete live rating metadata.
        }
      })
    );

    console.log(
      `[merchant-rating-refresh] processed ${Math.min(start + batch.length, dataRows.length)}/${dataRows.length}`
    );
  }

  if (skipped.length > 0) {
    console.warn(
      `[merchant-rating-refresh] ${skipped.length} product(s) unresolved; preserving their existing rating fields.`
    );
    skipped.slice(0, 25).forEach(item => console.warn(`  ${item}`));
  }

  await writeFile(FEED_PATH, toCsv([headers, ...dataRows]), "utf8");
  console.log(
    `[merchant-rating-refresh] complete: ${dataRows.length} products; ${ratingChanges} average_rating change(s); ${countChanges} review-count change(s); ${skipped.length} preserved unresolved product(s).`
  );
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
