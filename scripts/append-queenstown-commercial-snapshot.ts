/**
 * Append-only Queenstown commercial snapshot rows using the existing snapshot builder.
 * Does not rewrite preexisting snapshot rows.
 * Run: npx tsx scripts/append-queenstown-commercial-snapshot.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

import { QUEENSTOWN_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/queenstownViatorPublicRatings";
import {
  MERCHANT_FEED_COMMERCIAL_SNAPSHOT_PATH,
  type MerchantFeedCommercialSnapshot,
} from "../src/engine6/merchantFeedCommercialSnapshot";

const SNAPSHOT_PATH = MERCHANT_FEED_COMMERCIAL_SNAPSHOT_PATH;
const MERCHANT_FEED_PATH = "data/merchantFeed.csv";

const parseMerchantRow = (line: string) => {
  const id = line.split(",")[0];
  const priceMatch = line.match(/,in stock,([^,]+),new,/);
  const ratingMatch = line.match(/,Outdoor Adventures,([\d.]+),(\d+),(\d+)$/);
  if (!id || !priceMatch?.[1] || !ratingMatch) {
    return null;
  }
  return {
    productCode: id,
    price: priceMatch[1],
    averageRating: ratingMatch[1],
    ratingCount: ratingMatch[2],
    reviewCount: ratingMatch[3],
  };
};

const snapshot = JSON.parse(
  readFileSync(SNAPSHOT_PATH, "utf8")
) as MerchantFeedCommercialSnapshot;

const existingCodes = new Set(
  snapshot.rows.map(row => row.productCode.trim().toUpperCase())
);

const feedLines = readFileSync(MERCHANT_FEED_PATH, "utf8")
  .split(/\r?\n/)
  .filter(Boolean)
  .slice(1);

const appended = QUEENSTOWN_VIATOR_PUBLIC_PRODUCT_CODES.map(productCode => {
  const line = feedLines.find(entry => entry.split(",")[0] === productCode);
  if (!line) {
    throw new Error(`Missing merchant-feed row for Queenstown ${productCode}`);
  }
  const parsed = parseMerchantRow(line);
  if (!parsed) {
    throw new Error(`Unparseable merchant-feed row for Queenstown ${productCode}`);
  }
  if (!/ USD$/i.test(parsed.price)) {
    throw new Error(
      `Queenstown ${productCode} merchant-feed price is not USD: ${parsed.price}`
    );
  }
  return parsed;
}).filter(row => !existingCodes.has(row.productCode.trim().toUpperCase()));

if (appended.length === 0) {
  console.log("Commercial snapshot already contains Queenstown rows.");
  process.exit(0);
}

const next: MerchantFeedCommercialSnapshot = {
  generatedAt: snapshot.generatedAt,
  source: snapshot.source,
  rows: [...snapshot.rows, ...appended],
};

writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(next, null, 2)}\n`, "utf8");
console.log(
  `Preserved ${snapshot.rows.length} existing commercial snapshot rows; appended ${appended.length} Queenstown rows.`
);
