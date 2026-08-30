/**
 * Playwright extraction of live Buenos Aires Viator product pages.
 * Run: npx tsx scripts/extract-buenos-aires-products-browser.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

import { chromium } from "playwright";

import { EXTRACT_MOAB_PRODUCT_JS } from "./lib/moabBrowserExtract";

type CatalogEntry = {
  productCode: string;
  sourceUrl: string;
  experienceType?: string;
};

const REJECT_TITLE_PATTERN =
  /audio|self[- ]?guided|gps|app[- ]?based|smartphone|download|hop[- ]?on|admission ticket only|airport transfer only/i;

const NON_USD_PRICE = /From\s*(A\$|CA\$|£|€|DKK|SGD|NZ\$|ARS|R\$|CHF|NOK|SEK|ZAR)/i;

const main = async () => {
  const catalog = JSON.parse(
    readFileSync("scripts/buenos-aires-catalog-products.json", "utf8")
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
    timezoneId: "America/New_York",
    geolocation: { latitude: 40.7128, longitude: -74.006 },
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
      await page.waitForTimeout(7000);

      const title = await page.title();
      if (
        /verification required|captcha|access denied|datadome/i.test(title) ||
        (title.length < 20 && /viator\.com$/i.test(title))
      ) {
        console.log(`  BLOCKED: ${title}`);
        rejected.push({
          productCode: entry.productCode,
          productUrl: entry.sourceUrl,
          experienceType: entry.experienceType,
          error: `blocked:${title}`,
        });
        continue;
      }

      const raw = await page.evaluate(EXTRACT_MOAB_PRODUCT_JS);
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const extra = await page.evaluate(() => {
        const html = document.documentElement.innerHTML;
        const inclusions: string[] = [];
        const inclusionHeading = [...document.querySelectorAll("h2,h3")].find(
          heading => /what.?s included/i.test(heading.textContent || "")
        );
        if (inclusionHeading) {
          const list = inclusionHeading.parentElement?.querySelectorAll("li");
          for (const item of list ?? []) {
            const text = item.textContent?.replace(/\s+/g, " ").trim();
            if (text && text.length > 2 && text.length < 160) {
              inclusions.push(text);
            }
          }
        }
        const startMatch =
          html.match(/"startLocation"[^}]*"description"\s*:\s*"((?:\\.|[^"\\])+)"/i) ??
          html.match(/Meet your guide[^.]*\./i);
        const startDescription = startMatch
          ? String(startMatch[1] ?? startMatch[0])
              .replace(/\\n/g, " ")
              .replace(/\\"/g, '"')
              .replace(/\s+/g, " ")
              .trim()
          : null;
        const currencyMatch =
          html.match(/"currency"\s*:\s*"([A-Z]{3})"/i) ??
          html.match(/\b(USD|AUD|CAD|GBP|EUR|ARS|BRL|CHF|NOK|SEK|DKK|ZAR)\b/);
        return {
          inclusions: inclusions.slice(0, 8),
          startDescription,
          currency: currencyMatch?.[1] ?? null,
        };
      });

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
      const nonUsd =
        NON_USD_PRICE.test(String(parsed.priceFrom ?? "")) ||
        (extra.currency != null && extra.currency !== "USD");

      const record = {
        ...parsed,
        ...extra,
        productCode: entry.productCode,
        productUrl: entry.sourceUrl,
        experienceType: entry.experienceType,
      };

      if (
        parsed.title &&
        priceNum > 0 &&
        parsed.heroUrl &&
        parsed.rating &&
        parsed.reviewCount &&
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
          `  SKIP: price=${priceNum} currency=${extra.currency} hero=${!!parsed.heroUrl} rating=${parsed.rating} reviews=${parsed.reviewCount} title=${parsed.title}`
        );
      }
    } catch (error) {
      rejected.push({
        productCode: entry.productCode,
        productUrl: entry.sourceUrl,
        experienceType: entry.experienceType,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`  ERR: ${entry.productCode}: ${error}`);
    }

    await page.waitForTimeout(1800);
  }

  await browser.close();

  writeFileSync(
    "scripts/buenos-aires-browser-extracts.json",
    `${JSON.stringify({ available: results, rejected }, null, 2)}\n`
  );
  writeFileSync(
    "scripts/buenos-aires-live-product-data.json",
    `${JSON.stringify(results, null, 2)}\n`
  );
  console.log(
    `\nExtracted ${results.length} qualifying / ${rejected.length} skipped of ${catalog.length}`
  );
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
