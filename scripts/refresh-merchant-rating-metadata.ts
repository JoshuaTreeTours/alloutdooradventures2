import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const FEED_PATH = path.resolve(process.cwd(), "data/merchantFeed.csv");
const BASE_URL = (process.env.MERCHANT_RATING_BASE_URL ?? "https://www.alloutdooradventures.com").replace(/\/$/, "");
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

type RatingMetadata = {
  aggregateRating: number;
  reviewCount: number;
  source: string;
};

const fetchLiveRatingMetadata = async (productCode: string): Promise<RatingMetadata> => {
  const url = new URL(`${BASE_URL}/api/engine6/viator-product`);
  url.searchParams.set("productCode", productCode);
  url.searchParams.set("_merchant_rating_refresh", `${Date.now()}-${Math.random()}`);

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "cache-control": "no-cache, no-store, max-age=0",
      pragma: "no-cache",
      "user-agent": "Mozilla/5.0 AOA-Merchant-Rating-Refresh/2.0",
    },
  });

  if (!response.ok) throw new Error(`${productCode}: HTTP ${response.status}`);

  const body = (await response.json()) as {
    source?: string;
    extracted?: { aggregateRating?: number | null; reviewCount?: number | null };
  };

  const aggregateRating = body.extracted?.aggregateRating;
  const reviewCount = body.extracted?.reviewCount;

  if (typeof aggregateRating !== "number" || !Number.isFinite(aggregateRating) || aggregateRating <= 0) {
    throw new Error(`${productCode}: missing aggregateRating from live AOA endpoint`);
  }
  if (typeof reviewCount !== "number" || !Number.isFinite(reviewCount) || reviewCount <= 0) {
    throw new Error(`${productCode}: missing reviewCount from live AOA endpoint`);
  }

  return { aggregateRating, reviewCount, source: body.source ?? "unknown" };
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
  for (const [name, index] of [["id", idIndex], ["average_rating", avgIndex], ["rating_count", ratingCountIndex], ["review_count", reviewCountIndex]] as const) {
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
          console.log(`[merchant-rating-refresh] CANARY 6740P7 -> ${liveRating} rating, ${liveCount} reviews (${live.source})`);
          if (liveRating === "4.8" && liveCount === "453") {
            throw new Error("6740P7: canary still returned stale 4.8 / 453 values");
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
  if (skipped.some(item => item.includes("6740P7: canary still returned stale"))) {
    throw new Error("6740P7 canary returned stale data; refusing to write merchant feed");
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
