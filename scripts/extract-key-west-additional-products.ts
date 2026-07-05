/**
 * Extract additional Key West products blocked in bulk run.
 * Run: npx tsx scripts/extract-key-west-additional-products.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

import { chromium } from "playwright";

import { EXTRACT_MOAB_PRODUCT_JS } from "./lib/moabBrowserExtract";

const ADDITIONAL = [
  {
    productCode: "17325KEYYAN",
    sourceUrl:
      "https://www.viator.com/tours/Key-West/Dry-Tortugas-National-Park-Day-Trip-by-Catamaran/d661-17325KEYYAN",
  },
  {
    productCode: "7812P77",
    sourceUrl:
      "https://www.viator.com/tours/Key-West/Key-West-Secret-Food-Tour/d661-7812P77",
  },
  {
    productCode: "5264P10",
    sourceUrl:
      "https://www.viator.com/tours/Key-West/Snorkel-and-Sunset-Sail-Rum-n-Reggae/d661-5264P10",
  },
  {
    productCode: "44502P2",
    sourceUrl:
      "https://www.viator.com/tours/Key-West/Seafood-Lovers-Food-Tasting-and-Cultural-Walking-Tour/d661-44502P2",
  },
  {
    productCode: "407510P2",
    sourceUrl:
      "https://www.viator.com/tours/Key-West/Key-West-Historic-Walking-Tour/d661-407510P2",
  },
  {
    productCode: "2642P38",
    sourceUrl:
      "https://www.viator.com/tours/Key-West/Key-West-Historic-Trolley-Tour/d661-2642P38",
  },
];

const main = async () => {
  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    viewport: { width: 1400, height: 900 },
  });

  const page = await context.newPage();
  const results: Record<string, unknown>[] = [];

  for (const entry of ADDITIONAL) {
    console.log(`Extracting ${entry.productCode}...`);
    await page.goto(entry.sourceUrl, {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    await page.waitForTimeout(10000);
    const raw = await page.evaluate(EXTRACT_MOAB_PRODUCT_JS);
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    results.push({
      ...parsed,
      productCode: entry.productCode,
      productUrl: entry.sourceUrl,
    });
    console.log(`  ${parsed.title} ${parsed.priceFrom}`);
    await page.waitForTimeout(5000);
  }

  await browser.close();

  const existing = JSON.parse(
    readFileSync("scripts/key-west-live-product-data.json", "utf8")
  ) as Record<string, unknown>[];

  const merged = [...existing];
  for (const entry of results) {
    if (
      !merged.some(item => item.productCode === entry.productCode) &&
      entry.title &&
      parseFloat(String(entry.priceFrom).replace(/[^\d.]/g, "")) > 50 &&
      entry.heroUrl
    ) {
      merged.push({ ...entry, preferred: true });
    }
  }

  writeFileSync(
    "scripts/key-west-live-product-data.json",
    `${JSON.stringify(merged, null, 2)}\n`
  );
  console.log(`Merged total: ${merged.length}`);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
