/**
 * Playwright extraction of live Moab Viator product pages.
 * Run: npx tsx scripts/extract-moab-products-browser.ts
 */
import { writeFileSync } from "node:fs";

import { chromium } from "playwright";

import { EXTRACT_MOAB_PRODUCT_JS } from "./lib/moabBrowserExtract";
import catalog from "./moab-catalog-products.json";

type CatalogEntry = { productCode: string; sourceUrl: string };

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

  for (const entry of catalog as CatalogEntry[]) {
    console.log(`Extracting ${entry.productCode}...`);
    try {
      await page.goto(entry.sourceUrl, {
        waitUntil: "domcontentloaded",
        timeout: 120000,
      });
      await page.waitForTimeout(8000);

      const title = await page.title();
      if (/verification required|captcha|viator\.com$/i.test(title) && title.length < 30) {
        console.log(`  CAPTCHA blocked for ${entry.productCode}`);
        results.push({
          productCode: entry.productCode,
          productUrl: entry.sourceUrl,
          error: "DataDome captcha",
        });
        continue;
      }

      const raw = await page.evaluate(EXTRACT_MOAB_PRODUCT_JS);
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      results.push(parsed);
      console.log(
        `  OK: ${parsed.title} ${parsed.priceFrom} (${parsed.reviewCount} reviews)`
      );
    } catch (error) {
      results.push({
        productCode: entry.productCode,
        productUrl: entry.sourceUrl,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`  ERR: ${entry.productCode}`);
    }

    await page.waitForTimeout(3000);
  }

  await browser.close();

  writeFileSync(
    "scripts/moab-browser-extracts.json",
    `${JSON.stringify(results, null, 2)}\n`
  );

  const ok = results.filter(r => r.title && r.priceFrom && r.heroUrl);
  console.log(`\nExtracted ${ok.length}/${results.length} products with full data.`);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
