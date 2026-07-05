/**
 * Re-extract Orlando products that failed in the main browser pass.
 * Run: npx tsx scripts/enrich-orlando-missing-products.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

import { chromium } from "playwright";

import { EXTRACT_MOAB_PRODUCT_JS } from "./lib/moabBrowserExtract";

const MISSING = [
  {
    productCode: "3170P41",
    sourceUrl:
      "https://www.viator.com/tours/Orlando/Clearwater-Beach-Day-Trip-from-Orlando-with-Optional-Upgrades/d663-3170P41",
  },
  {
    productCode: "3170P96",
    sourceUrl:
      "https://www.viator.com/tours/Orlando/Pirates-Dinner-Adventure-Top-Orlando-Dinner-Attraction/d663-3170P96",
  },
  {
    productCode: "5039P6",
    sourceUrl:
      "https://www.viator.com/tours/Orlando/VIP-Private-Airboat-Tour-by-Boggy-Creek-Airboat-Adventures-near-Orlando-Florida/d663-5039P6",
  },
  {
    productCode: "169791P1",
    sourceUrl:
      "https://www.viator.com/tours/Orlando/CLEAR-KAYAK-TOURS-RAINBOW-SPRINGS/d663-169791P1",
  },
  {
    productCode: "5039P10",
    sourceUrl:
      "https://www.viator.com/tours/Orlando/Boggy-Creek-Adventures-1-2-Hour-Airboat-Ride-Food-and-Gem-Mine-experience/d663-5039P10",
  },
  {
    productCode: "478210P1",
    sourceUrl:
      "https://www.viator.com/tours/Orlando/Dining-Cruise-Experiences-on-St-Johns-River-from-Sanford-FL/d663-478210P1",
  },
  {
    productCode: "243420P2",
    sourceUrl:
      "https://www.viator.com/tours/Orlando/Lake-Sailing-Tour/d663-243420P2",
  },
  {
    productCode: "415467P2",
    sourceUrl:
      "https://www.viator.com/tours/Orlando/Silver-Springs-Jungle-Kayaking-and-Paddle-Boarding-Adventure/d663-415467P2",
  },
  {
    productCode: "5467OHEP",
    sourceUrl:
      "https://www.viator.com/tours/Orlando/Florida-Everglades-Airboat-Tour-and-Alligator-Encounter-with-Optional-Lunch/d663-5467OHEP",
  },
];

const main = async () => {
  const existing = JSON.parse(
    readFileSync("scripts/orlando-live-product-data.json", "utf8")
  ) as Record<string, unknown>[];

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
  const added: Record<string, unknown>[] = [];

  for (const entry of MISSING) {
    console.log(`Extracting ${entry.productCode}...`);
    await page.goto(entry.sourceUrl, {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    await page.waitForTimeout(9000);
    const raw = await page.evaluate(EXTRACT_MOAB_PRODUCT_JS);
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const priceNum = parsed.priceFrom
      ? parseFloat(String(parsed.priceFrom).replace(/[^\d.]/g, ""))
      : 0;
    console.log(`  ${parsed.title} ${parsed.priceFrom} hero=${!!parsed.heroUrl}`);
    if (parsed.title && priceNum > 50 && parsed.heroUrl) {
      added.push({
        ...parsed,
        productCode: entry.productCode,
        productUrl: entry.sourceUrl,
        preferred: true,
      });
    }
    await page.waitForTimeout(2000);
  }

  await browser.close();

  const merged = [
    ...existing.filter(
      e =>
        !added.some(a => a.productCode === e.productCode) &&
        !["3805P1", "3088_1D_UO", "3805P9", "3170P99"].includes(
          String(e.productCode)
        )
    ),
    ...added,
  ].sort((a, b) => {
    const priceA = parseFloat(String(a.priceFrom).replace(/[^\d.]/g, ""));
    const priceB = parseFloat(String(b.priceFrom).replace(/[^\d.]/g, ""));
    return priceB - priceA;
  });

  writeFileSync(
    "scripts/orlando-live-product-data.json",
    `${JSON.stringify(merged, null, 2)}\n`
  );
  console.log(`Merged total: ${merged.length}, added: ${added.length}`);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
