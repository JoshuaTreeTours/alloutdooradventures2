import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const FEED_PATH = path.resolve(process.cwd(), "data/merchantFeed.csv");
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

const decodeHtml = (value: string) =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");

const htmlToVisibleText = (html: string) =>
  decodeHtml(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  ).replace(/\s+/g, " ");

type RatingMetadata = {
  aggregateRating: number;
  reviewCount: number;
  source: "visible-page" | "json-ld";
};

const parseNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const extractVisibleRating = (html: string): RatingMetadata | null => {
  const text = htmlToVisibleText(html);

  // This is the exact presentation used on AOA tour pages, e.g.
  // "4.7 rating • 577 reviews". Prefer this over stored/API metadata because
  // the merchant feed must match what the customer and Google see on the target URL.
  const patterns = [
    /\b([0-5](?:\.\d+)?)\s+rating\s*[•·|\-—:]?\s*([\d,]+)\s+reviews?\b/i,
    /★\s*([0-5](?:\.\d+)?)\s*\(?\s*([\d,]+)\s+reviews?\s*\)?/i,
    /\b([0-5](?:\.\d+)?)\s*\(\s*([\d,]+)\s+reviews?\s*\)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const aggregateRating = Number(match[1]);
    const reviewCount = Number(match[2].replace(/,/g, ""));
    if (
      Number.isFinite(aggregateRating) &&
      aggregateRating >= 0 &&
      aggregateRating <= 5 &&
      Number.isFinite(reviewCount) &&
      reviewCount >= 0
    ) {
      return { aggregateRating, reviewCount, source: "visible-page" };
    }
  }

  return null;
};

const findAggregateRating = (value: unknown): RatingMetadata | null => {
  if (!value || typeof value !== "object") return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findAggregateRating(item);
      if (found) return found;
    }
    return null;
  }

  const record = value as Record<string, unknown>;
  const aggregate = record.aggregateRating;
  if (aggregate && typeof aggregate === "object" && !Array.isArray(aggregate)) {
    const rating = aggregate as Record<string, unknown>;
    const aggregateRating = parseNumber(rating.ratingValue);
    const reviewCount = parseNumber(rating.reviewCount ?? rating.ratingCount);
    if (
      aggregateRating !== null &&
      aggregateRating >= 0 &&
      aggregateRating <= 5 &&
      reviewCount !== null &&
      reviewCount >= 0
    ) {
      return { aggregateRating, reviewCount, source: "json-ld" };
    }
  }

  for (const child of Object.values(record)) {
    const found = findAggregateRating(child);
    if (found) return found;
  }
  return null;
};

const extractJsonLdRating = (html: string): RatingMetadata | null => {
  const scriptPattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptPattern.exec(html)) !== null) {
    const raw = decodeHtml(match[1]).trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as unknown;
      const found = findAggregateRating(parsed);
      if (found) return found;
    } catch {
      // Ignore malformed/non-standard JSON-LD blocks and continue to the next one.
    }
  }

  return null;
};

const fetchRatingMetadataFromPage = async (
  productCode: string,
  targetUrl: string
): Promise<RatingMetadata> => {
  const url = new URL(targetUrl);
  if (url.hostname !== "www.alloutdooradventures.com" && url.hostname !== "alloutdooradventures.com") {
    throw new Error(`${productCode}: target URL is not an AOA product page (${url.hostname})`);
  }

  // Cache-bust so a refresh run does not knowingly reuse a stale edge response.
  url.searchParams.set("_rating_refresh", String(Date.now()));

  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      accept: "text/html,application/xhtml+xml",
      "cache-control": "no-cache",
      pragma: "no-cache",
      "user-agent": "AOA-Merchant-Rating-Refresh/1.0 (+https://www.alloutdooradventures.com)",
    },
  });

  if (!response.ok) {
    throw new Error(`${productCode}: target page HTTP ${response.status}`);
  }

  const html = await response.text();

  // The visible customer-facing value is authoritative. JSON-LD is only a
  // fallback for pages whose visible rating markup is not present in initial HTML.
  const visible = extractVisibleRating(html);
  if (visible) return visible;

  const jsonLd = extractJsonLdRating(html);
  if (jsonLd) return jsonLd;

  throw new Error(`${productCode}: no aggregate rating found on target AOA page`);
};

const main = async () => {
  const content = await readFile(FEED_PATH, "utf8");
  const rows = parseCsv(content);
  if (rows.length < 2) throw new Error("merchantFeed.csv has no product rows");

  const headers = rows[0];
  const idIndex = headers.indexOf("id");
  const linkIndex = headers.indexOf("link");
  const avgIndex = headers.indexOf("average_rating");
  const ratingCountIndex = headers.indexOf("rating_count");
  const reviewCountIndex = headers.indexOf("review_count");

  for (const [name, index] of [
    ["id", idIndex],
    ["link", linkIndex],
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
  let visiblePageMatches = 0;
  let jsonLdFallbacks = 0;

  for (let start = 0; start < dataRows.length; start += CONCURRENCY) {
    const batch = dataRows.slice(start, start + CONCURRENCY);
    await Promise.all(
      batch.map(async row => {
        const productCode = row[idIndex]?.trim();
        const targetUrl = row[linkIndex]?.trim();
        if (!productCode) {
          skipped.push("(blank id): missing product code");
          return;
        }
        if (!targetUrl) {
          skipped.push(`${productCode}: missing target URL`);
          return;
        }

        try {
          const live = await fetchRatingMetadataFromPage(productCode, targetUrl);
          const liveRating = normalizeRating(live.aggregateRating);
          const liveCount = String(Math.trunc(live.reviewCount));

          if (live.source === "visible-page") visiblePageMatches += 1;
          else jsonLdFallbacks += 1;

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

          if (productCode.toUpperCase() === "6740P7") {
            console.log(
              `[merchant-rating-refresh] CANARY 6740P7 -> ${liveRating} rating, ${liveCount} reviews (${live.source})`
            );
          }
        } catch (error) {
          skipped.push(error instanceof Error ? error.message : String(error));
          // Never replace good existing values with blanks when a page cannot be resolved.
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
    skipped.slice(0, 50).forEach(item => console.warn(`  ${item}`));
  }

  await writeFile(FEED_PATH, toCsv([headers, ...dataRows]), "utf8");
  console.log(
    `[merchant-rating-refresh] complete: ${dataRows.length} products; ${ratingChanges} average_rating change(s); ${countChanges} review-count change(s); ${visiblePageMatches} visible-page match(es); ${jsonLdFallbacks} JSON-LD fallback(s); ${skipped.length} preserved unresolved product(s).`
  );
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
