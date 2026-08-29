/**
 * Playwright extraction of live Mexico City Viator product pages.
 * Run: npx tsx scripts/extract-mexico-city-products-browser.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

import { chromium } from "playwright";

import { EXTRACT_MOAB_PRODUCT_JS } from "./lib/moabBrowserExtract";

type CatalogEntry = { productCode: string; sourceUrl: string };

const REJECT_TITLE_PATTERN =
  /audio|self[- ]?guided|gps|app[- ]?based|smartphone|download|hop[- ]?on|admission ticket only/i;

const main = async () => {
  const catalog = JSON.parse(
    readFileSync("scripts/mexico-city-catalog-products.json", "utf8")
  ) as CatalogEntry[];

  const browser = await chromium.launch({
    headless: true,
    channel: "chrome",
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  const context = await browser.newContext({
    locale: "en-US",
    timezoneId: "America/Mexico_City",
    geolocation: { latitude: 19.4326, longitude: -99.1332 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    viewport: { width: 1400, height: 900 },
    extraHTTPHeaders: {
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  const page = await context.newPage();
  const results: Record<string, unknown>[] = [];
  const rejected: Record<string, unknown>[] = [];

  for (const entry of catalog) {
    console.log(`Extracting ${entry.productCode}...`);
    try {
      await page.goto(entry.sourceUrl, {
        waitUntil: "domcontentloaded",
        timeout: 120000,
      });
      await page.waitForTimeout(6000);

      const title = await page.title();
      if (
        /verification required|captcha|access denied|datadome/i.test(title) ||
        (title.length < 20 && /viator\.com$/i.test(title))
      ) {
        console.log(`  BLOCKED: ${title}`);
        rejected.push({
          productCode: entry.productCode,
          productUrl: entry.sourceUrl,
          error: `blocked:${title}`,
        });
        continue;
      }

      const raw = await page.evaluate(EXTRACT_MOAB_PRODUCT_JS);
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const priceNum = parsed.priceFrom
        ? parseFloat(String(parsed.priceFrom).replace(/[^\d.]/g, ""))
        : 0;
      const titleText = String(parsed.title ?? "");
      const titleRejected = Boolean(
        titleText && REJECT_TITLE_PATTERN.test(titleText)
      );
      const unavailable =
        /product unavailable|this product is unavailable|no longer available|this experience is unavailable/i.test(
          `${title} ${titleText}`
        );
      const nonUsd = /From\s*(A\$|CA\$|£|€|DKK|SGD|NZ\$)/i.test(
        String(parsed.priceFrom ?? "")
      );

      const record = {
        ...parsed,
        productCode: entry.productCode,
        productUrl: entry.sourceUrl,
      };

      if (
        parsed.title &&
        priceNum > 0 &&
        parsed.heroUrl &&
        parsed.rating &&
        !titleRejected &&
        !unavailable &&
        !nonUsd
      ) {
        results.push(record);
        console.log(
          `  OK: ${parsed.title} ${parsed.priceFrom} ${parsed.rating}/${parsed.reviewCount}`
        );
      } else {
        rejected.push({
          ...record,
          priceNum,
          titleRejected,
          unavailable,
          nonUsd,
        });
        console.log(
          `  SKIP: price=${priceNum} hero=${!!parsed.heroUrl} rating=${parsed.rating} title=${parsed.title}`
        );
      }
    } catch (error) {
      rejected.push({
        productCode: entry.productCode,
        productUrl: entry.sourceUrl,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`  ERR: ${entry.productCode}`);
    }

    await page.waitForTimeout(1500);
  }

  await browser.close();

  writeFileSync(
    "scripts/mexico-city-browser-extracts.json",
    `${JSON.stringify({ available: results, rejected }, null, 2)}\n`
  );
  console.log(
    `\nExtracted ${results.length} qualifying / ${rejected.length} skipped of ${catalog.length}`
  );
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
