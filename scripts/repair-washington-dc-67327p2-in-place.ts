/**
 * In-place swap of failed Washington D.C. product 67327P2 -> validated replacement.
 * Run: npx tsx scripts/repair-washington-dc-67327p2-in-place.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import { engine6ResolvedTours } from "../src/engine6/registry";
import { validateEngine6LiveViatorCandidate } from "../src/engine6/engine6LiveViatorProductionValidation";

const REMOVED_PRODUCT_CODE = "67327P2";
const REMOVED_URL =
  "https://www.alloutdooradventures.com/destinations/district-of-columbia/washington/tours/private-washington-dc-monuments-tour-67327P2";

const BACKUPS = [
  {
    rank: 1,
    productCode: "67327P1",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Washington-DC-Day-Tour/d657-67327P1",
  },
  {
    rank: 2,
    productCode: "67327P13",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Black-History-Tour-Washington-DC/d657-67327P13",
  },
  {
    rank: 3,
    productCode: "255730P179",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Walking-Tour-of-Capitol-Hill-and-the-National-Mall/d657-255730P179",
  },
] as const;

const MERCHANT_FEED_PATH = "data/merchantFeed.csv";
const SITEMAP_PATH = "public/sitemap-tours.xml";

const escapeCsv = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const main = async () => {
  let replacement: (typeof BACKUPS)[number] | null = null;
  let validationResult: Awaited<
    ReturnType<typeof validateEngine6LiveViatorCandidate>
  > | null = null;

  console.log(`Validating backups for ${REMOVED_PRODUCT_CODE}...\n`);

  for (const candidate of BACKUPS) {
    const result = await validateEngine6LiveViatorCandidate({
      productCode: candidate.productCode,
      sourceUrl: candidate.sourceUrl,
    });
    console.log(
      JSON.stringify(
        {
          rank: candidate.rank,
          productCode: candidate.productCode,
          passed: result.passed,
          apiConfirmedActive: result.apiConfirmedActive,
          publicPageAvailable: result.publicPageAvailable,
          reason: result.reason,
        },
        null,
        2
      )
    );
    if (result.passed) {
      replacement = candidate;
      validationResult = result;
      break;
    }
  }

  if (!replacement || !validationResult) {
    console.error(
      "\nNo backup candidate passed live Viator validation. Aborting merchant feed/sitemap swap."
    );
    process.exit(1);
  }

  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === replacement.productCode
  );
  if (!tour) {
    throw new Error(
      `Missing resolved Washington D.C. tour for ${replacement.productCode}`
    );
  }

  const row = buildMerchantFeedRowFromProductSchema(tour);
  for (const [key, value] of Object.entries(row)) {
    if (value == null || String(value).trim() === "") {
      throw new Error(`Blank merchant feed field ${key} for ${row.id}`);
    }
  }

  const replacementRow = [
    row.id,
    row.title,
    row.description,
    row.link,
    row.image_link,
    row.availability,
    row.price,
    row.condition,
    row.brand,
    row.average_rating,
    row.rating_count,
    row.review_count,
  ]
    .map(value => escapeCsv(String(value)))
    .join(",");

  const csv = readFileSync(MERCHANT_FEED_PATH, "utf8");
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const header = lines[0];
  const body = lines.slice(1);
  const removedIndex = body.findIndex(
    line => line.split(",")[0] === REMOVED_PRODUCT_CODE
  );
  if (removedIndex < 0) {
    throw new Error(`Merchant feed row not found for ${REMOVED_PRODUCT_CODE}`);
  }

  body[removedIndex] = replacementRow;
  writeFileSync(MERCHANT_FEED_PATH, [header, ...body].join("\n") + "\n", "utf8");
  console.log(
    `\nSwapped merchant feed row ${REMOVED_PRODUCT_CODE} -> ${replacement.productCode}`
  );

  let sitemap = readFileSync(SITEMAP_PATH, "utf8");
  if (!sitemap.includes(REMOVED_URL)) {
    throw new Error(`Sitemap URL not found for ${REMOVED_PRODUCT_CODE}`);
  }
  sitemap = sitemap.replaceAll(REMOVED_URL, row.link);
  writeFileSync(SITEMAP_PATH, sitemap, "utf8");
  console.log(`Swapped sitemap URL -> ${row.link}`);

  console.log(
    JSON.stringify(
      {
        removed: REMOVED_PRODUCT_CODE,
        replacement: replacement.productCode,
        validation: validationResult,
      },
      null,
      2
    )
  );
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
