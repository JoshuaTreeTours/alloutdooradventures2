import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const FEED_PATH = path.resolve(process.cwd(), "data/merchantFeed.csv");
const VIATOR_API_KEY = process.env.VIATOR_API_KEY?.trim() ?? "";
const VIATOR_API_BASE_URL = (process.env.VIATOR_API_BASE_URL ?? "https://api.viator.com/partner").replace(/\/$/, "");
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

const toCsv = (rows: string[][]) => `${rows.map(row => row.map(escapeCsv).join(",")).join("\n")}\n`;
const normalizeRating = (value: number) => value.toFixed(1);

const weightedAverageFromReviewCountTotals = (value: unknown): number | null => {
  if (!Array.isArray(value)) return null;
  let weightedSum = 0;
  let totalCount = 0;
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const rating = Number((entry as Record<string, unknown>).rating);
    const count = Number((entry as Record<string, unknown>).count);
    if (Number.isFinite(rating) && Number.isFinite(count) && count > 0) {
      weightedSum += rating * count;
      totalCount += count;
    }
  }
  return totalCount > 0 ? weightedSum / totalCount : null;
};

const sumReviewCountTotals = (value: unknown): number | null => {
  if (!Array.isArray(value)) return null;
  let total = 0;
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const count = Number((entry as Record<string, unknown>).count);
    if (Number.isFinite(count) && count > 0) total += Math.trunc(count);
  }
  return total > 0 ? total : null;
};

type RatingMetadata = {
  aggregateRating: number;
  reviewCount: number;
};

const fetchLiveRatingMetadata = async (productCode: string): Promise<RatingMetadata> => {
  if (!VIATOR_API_KEY) {
    throw new Error("VIATOR_API_KEY is not configured in GitHub Actions secrets");
  }

  const response = await fetch(`${VIATOR_API_BASE_URL}/reviews/product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;version=2.0",
      Accept: "application/json;version=2.0",
      "Accept-Language": "en-US",
      "exp-api-key": VIATOR_API_KEY,
    },
    body: JSON.stringify({
      productCode,
      provider: "ALL",
      count: 1,
      start: 1,
      sortBy: "MOST_RECENT",
    }),
  });

  if (!response.ok) {
    throw new Error(`${productCode}: Viator reviews API HTTP ${response.status}`);
  }

  const body = (await response.json()) as Record<string, unknown>;
  const summary = body.totalReviewsSummary;
  if (!summary || typeof summary !== "object") {
    throw new Error(`${productCode}: no totalReviewsSummary from Viator reviews API`);
  }

  const record = summary as Record<string, unknown>;
  const aggregateRating =
    typeof record.combinedAverageRating === "number" && Number.isFinite(record.combinedAverageRating)
      ? record.combinedAverageRating
      : weightedAverageFromReviewCountTotals(record.reviewCountTotals);

  const reviewCount =
    typeof record.totalReviews === "number" && Number.isFinite(record.totalReviews) && record.totalReviews > 0
      ? Math.trunc(record.totalReviews)
      : sumReviewCountTotals(record.reviewCountTotals);

  if (aggregateRating === null || aggregateRating <= 0) {
    throw new Error(`${productCode}: missing aggregate rating from Viator reviews API`);
  }
  if (reviewCount === null || reviewCount <= 0) {
    throw new Error(`${productCode}: missing review count from Viator reviews API`);
  }

  return { aggregateRating, reviewCount };
};

const main = async () => {
  if (!VIATOR_API_KEY) {
    throw new Error("VIATOR_API_KEY is not configured in GitHub Actions secrets");
  }

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
  let canaryResolved = false;

  for (let start = 0; start < dataRows.length; start += CONCURRENCY) {
    const batch = dataRows.slice(start, start + CONCURRENCY);
    await Promise.all(batch.map(async row => {
      const productCode = row[idIndex]?.trim();
      if (!productCode) return;
      try {
        const live = await fetchLiveRatingMetadata(productCode);
        const liveRating = normalizeRating(live.aggregateRating);
        const liveCount = String(Math.trunc(live.reviewCount));

        if (productCode.toUpperCase() === "6740P7") {
          canaryResolved = true;
          console.log(`[merchant-rating-refresh] CANARY 6740P7 -> ${liveRating} rating, ${liveCount} reviews (direct-viator-reviews-api)`);
          if (liveRating === "4.8" && liveCount === "453") {
            throw new Error("6740P7: direct Viator reviews API still returned stale 4.8 / 453 values");
          }
        }

        if (row[avgIndex] !== liveRating) ratingChanges += 1;
        if (row[ratingCountIndex] !== liveCount || row[reviewCountIndex] !== liveCount) countChanges += 1;
        row[avgIndex] = liveRating;
        row[ratingCountIndex] = liveCount;
        row[reviewCountIndex] = liveCount;
      } catch (error) {
        skipped.push(error instanceof Error ? error.message : String(error));
      }
    }));
    console.log(`[merchant-rating-refresh] processed ${Math.min(start + batch.length, dataRows.length)}/${dataRows.length}`);
  }

  if (!canaryResolved) throw new Error("6740P7 canary did not resolve; refusing to write merchant feed");
  if (skipped.some(item => item.includes("6740P7:"))) {
    throw new Error("6740P7 canary failed; refusing to write merchant feed");
  }

  if (skipped.length > 0) {
    console.warn(`[merchant-rating-refresh] ${skipped.length} product(s) unresolved; preserving existing values.`);
    skipped.slice(0, 50).forEach(item => console.warn(`  ${item}`));
  }

  await writeFile(FEED_PATH, toCsv([headers, ...dataRows]), "utf8");
  console.log(`[merchant-rating-refresh] complete: ${dataRows.length} products; ${ratingChanges} rating change(s); ${countChanges} review-count change(s); ${skipped.length} preserved unresolved product(s).`);
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
