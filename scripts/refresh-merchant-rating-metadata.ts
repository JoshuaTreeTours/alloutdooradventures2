import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  buildMerchantFeedCommercialSnapshot,
  MERCHANT_FEED_COMMERCIAL_SNAPSHOT_PATH,
} from "../src/engine6/merchantFeedCommercialSnapshot";

const FEED_PATH = path.resolve(process.cwd(), "data/merchantFeed.csv");
const REPORT_PATH = path.resolve(process.cwd(), "merchant-rating-refresh-report.json");
const SNAPSHOT_PATH = path.resolve(
  process.cwd(),
  MERCHANT_FEED_COMMERCIAL_SNAPSHOT_PATH
);
const AOA_BASE_URL = (process.env.MERCHANT_RATING_BASE_URL ?? "https://www.alloutdooradventures.com").replace(/\/$/, "");
const BETWEEN_PRODUCTS_MS = Number(process.env.MERCHANT_RATING_DELAY_MS ?? "150");
const REQUEST_TIMEOUT_MS = Number(process.env.MERCHANT_RATING_REQUEST_TIMEOUT_MS ?? "15000");
const MAX_ATTEMPTS = Number(process.env.MERCHANT_RATING_MAX_ATTEMPTS ?? "3");

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

type AoaCommercialResult = {
  priceAmount: number;
  priceCurrency: "USD";
  aggregateRating: number;
  reviewCount: number;
  source: string;
  attempt: number;
};

const formatMerchantUsdPrice = (amount: number) => {
  const rounded = Math.round(amount * 100) / 100;
  return `${rounded} USD`;
};

const fetchFromAoa = async (productCode: string): Promise<AoaCommercialResult> => {
  let lastProblem = "unknown failure";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const url = `${AOA_BASE_URL}/api/engine6/viator-product?productCode=${encodeURIComponent(productCode)}`;
    try {
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          "cache-control": "no-cache",
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      const text = await response.text();
      if (!response.ok) {
        lastProblem = `HTTP ${response.status} ${text.slice(0, 180)}`;
      } else {
        const json = JSON.parse(text) as {
          source?: string;
          extracted?: {
            priceAmount?: number | null;
            priceCurrency?: string | null;
            reviewCount?: number | null;
            aggregateRating?: number | null;
          };
        };
        const priceAmount = json?.extracted?.priceAmount;
        const priceCurrency = json?.extracted?.priceCurrency;
        const count = json?.extracted?.reviewCount;
        const rating = json?.extracted?.aggregateRating;
        const source = json?.source ?? "unknown";

        if (!Number.isFinite(priceAmount) || Number(priceAmount) <= 0) {
          lastProblem = `missing positive extracted.priceAmount (${source})`;
        } else if (
          typeof priceCurrency === "string" &&
          priceCurrency.trim().toUpperCase() !== "USD"
        ) {
          lastProblem = `non-USD extracted.priceCurrency ${priceCurrency} (${source})`;
        } else if (!Number.isFinite(count) || Number(count) <= 0) {
          lastProblem = `missing positive extracted.reviewCount (${source})`;
        } else if (!Number.isFinite(rating) || Number(rating) <= 0) {
          lastProblem = `missing positive extracted.aggregateRating (${source})`;
        } else if (source !== "live-api") {
          // The successful Magpie-100 refresh returned source=live-api. Do not
          // overwrite Merchant Center data with a bundled/stale fallback.
          lastProblem = `non-live source ${source}`;
        } else {
          return {
            priceAmount: Number(priceAmount),
            priceCurrency: "USD",
            aggregateRating: Number(rating),
            reviewCount: Math.trunc(Number(count)),
            source,
            attempt,
          };
        }
      }
    } catch (error) {
      lastProblem = error instanceof Error ? error.message : String(error);
    }

    if (attempt < MAX_ATTEMPTS) {
      await sleep(500 * attempt);
    }
  }

  throw new Error(`${productCode}: ${lastProblem} after ${MAX_ATTEMPTS} attempt(s)`);
};

const main = async () => {
  const content = await readFile(FEED_PATH, "utf8");
  const rows = parseCsv(content);
  if (rows.length < 2) throw new Error("merchantFeed.csv has no product rows");

  const headers = rows[0];
  const idIndex = headers.indexOf("id");
  const priceIndex = headers.indexOf("price");
  const avgIndex = headers.indexOf("average_rating");
  const ratingCountIndex = headers.indexOf("rating_count");
  const reviewCountIndex = headers.indexOf("review_count");

  for (const [name, index] of [
    ["id", idIndex],
    ["price", priceIndex],
    ["average_rating", avgIndex],
    ["rating_count", ratingCountIndex],
    ["review_count", reviewCountIndex],
  ] as const) {
    if (index < 0) throw new Error(`Missing required column: ${name}`);
  }

  const dataRows = rows.slice(1);
  const failures: Array<{ id: string; error: string }> = [];
  const refreshed: Array<{
    id: string;
    price: string;
    rating: string;
    reviews: number;
    attempt: number;
  }> = [];
  let priceChanges = 0;
  let ratingChanges = 0;
  let countChanges = 0;

  // Deliberately serial, with the same 150 ms pacing used by the successful
  // Magpie 100-tour refresh. This avoids hammering the production resolver and
  // causing it to fall back to bundled data under parallel load.
  for (let i = 0; i < dataRows.length; i += 1) {
    const row = dataRows[i];
    const productCode = row[idIndex]?.trim();
    if (!productCode) {
      failures.push({ id: "(blank)", error: "missing product code" });
      continue;
    }

    try {
      const live = await fetchFromAoa(productCode);
      const livePrice = formatMerchantUsdPrice(live.priceAmount);
      const liveRating = normalizeRating(live.aggregateRating);
      const liveCount = String(live.reviewCount);

      if (row[priceIndex] !== livePrice) priceChanges += 1;
      if (row[avgIndex] !== liveRating) ratingChanges += 1;
      if (row[ratingCountIndex] !== liveCount || row[reviewCountIndex] !== liveCount) countChanges += 1;

      row[priceIndex] = livePrice;
      row[avgIndex] = liveRating;
      row[ratingCountIndex] = liveCount;
      row[reviewCountIndex] = liveCount;
      refreshed.push({
        id: productCode,
        price: livePrice,
        rating: liveRating,
        reviews: live.reviewCount,
        attempt: live.attempt,
      });

      if (productCode.toUpperCase() === "6740P7") {
        console.log(`[merchant-rating-refresh] CANARY 6740P7 -> ${livePrice}, ${liveRating} rating, ${liveCount} reviews (${live.source}, attempt ${live.attempt})`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ id: productCode, error: message });
      console.warn(`[merchant-rating-refresh] preserving ${productCode}: ${message}`);
    }

    console.log(`[merchant-rating-refresh] [${i + 1}/${dataRows.length}] ${productCode}`);
    await sleep(BETWEEN_PRODUCTS_MS);
  }

  if (refreshed.length === 0) {
    throw new Error("No live-api products resolved; refusing to write merchant feed");
  }

  await writeFile(FEED_PATH, toCsv([headers, ...dataRows]), "utf8");

  const snapshotRows = dataRows.map(row => ({
    id: row[idIndex] ?? "",
    price: row[priceIndex] ?? "",
    average_rating: row[avgIndex] ?? "",
    rating_count: row[ratingCountIndex] ?? "",
    review_count: row[reviewCountIndex] ?? "",
  }));
  await writeFile(
    SNAPSHOT_PATH,
    `${JSON.stringify(buildMerchantFeedCommercialSnapshot(snapshotRows), null, 2)}\n`,
    "utf8"
  );

  await writeFile(
    REPORT_PATH,
    `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      method: "AOA production Engine6 commercial resolver (serial, 150ms pacing)",
      totalProducts: dataRows.length,
      liveApiRefreshed: refreshed.length,
      priceChanges,
      ratingChanges,
      countChanges,
      refreshed,
      failures,
    }, null, 2)}\n`,
    "utf8"
  );

  console.log(
    `[merchant-rating-refresh] complete: ${dataRows.length} products; ${refreshed.length} live-api refreshed; ${priceChanges} price change(s); ${ratingChanges} rating change(s); ${countChanges} review-count change(s); ${failures.length} preserved unresolved.`
  );
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
