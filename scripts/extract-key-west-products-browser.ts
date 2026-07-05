/**
 * Playwright extraction of live Key West Viator product pages.
 * Run: npx tsx scripts/extract-key-west-products-browser.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

import { chromium } from "playwright";

import { EXTRACT_MOAB_PRODUCT_JS } from "./lib/moabBrowserExtract";

type CatalogEntry = { productCode: string; sourceUrl: string };

const REJECT_TITLE_PATTERN =
  /audio|self[- ]?guided|gps|app[- ]?based|smartphone|download/i;

const PREFERRED_PATTERN =
  /private|charter|snorkel|sail|sunset|dry tortuga|food|history|ghost|kayak|eco|dolphin|wildlife|sandbar|boat|cruise|fishing|parasail|jet ski|reef|catamaran|yacht|seaplane|helicopter|walking|cultural|hemingway|conch/i;

const isRealProductCode = (code: string) =>
  /^[0-9]+[A-Z0-9_]*$/i.test(code) && code.length >= 4;

const main = async () => {
  const catalog = (JSON.parse(
    readFileSync("scripts/key-west-catalog-products.json", "utf8")
  ) as CatalogEntry[]).filter(entry => isRealProductCode(entry.productCode));

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
  const rejected: Record<string, unknown>[] = [];

  for (const entry of catalog) {
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
        rejected.push({
          productCode: entry.productCode,
          productUrl: entry.sourceUrl,
          error: "DataDome captcha",
        });
        continue;
      }

      const raw = await page.evaluate(EXTRACT_MOAB_PRODUCT_JS);
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const priceNum = parsed.priceFrom
        ? parseFloat(String(parsed.priceFrom).replace(/[^\d.]/g, ""))
        : 0;
      const titleRejected =
        parsed.title && REJECT_TITLE_PATTERN.test(String(parsed.title));
      const preferred = PREFERRED_PATTERN.test(
        `${parsed.title ?? ""} ${(parsed.categories as string[])?.join(" ") ?? ""}`
      );

      const record = {
        ...parsed,
        productCode: entry.productCode,
        productUrl: entry.sourceUrl,
        preferred,
      };

      if (
        parsed.title &&
        priceNum > 50 &&
        parsed.heroUrl &&
        !titleRejected &&
        !/unavailable|similar experiences/i.test(String(parsed.title))
      ) {
        results.push(record);
        console.log(
          `  OK: ${parsed.title} ${parsed.priceFrom} (${parsed.reviewCount} reviews)`
        );
      } else {
        rejected.push({ ...record, priceNum, titleRejected });
        console.log(
          `  SKIP: price=${priceNum} hero=${!!parsed.heroUrl} title=${parsed.title}`
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

    await page.waitForTimeout(2500);
  }

  await browser.close();

  results.sort((a, b) => {
    const preferredA = (a.preferred as boolean) ? 1 : 0;
    const preferredB = (b.preferred as boolean) ? 1 : 0;
    if (preferredB !== preferredA) return preferredB - preferredA;
    const priceA = parseFloat(String(a.priceFrom).replace(/[^\d.]/g, ""));
    const priceB = parseFloat(String(b.priceFrom).replace(/[^\d.]/g, ""));
    if (priceB !== priceA) return priceB - priceA;
    return ((b.reviewCount as number) ?? 0) - ((a.reviewCount as number) ?? 0);
  });

  writeFileSync(
    "scripts/key-west-browser-extracts.json",
    `${JSON.stringify({ available: results, rejected }, null, 2)}\n`
  );
  writeFileSync(
    "scripts/key-west-live-product-data.json",
    `${JSON.stringify(results, null, 2)}\n`
  );

  const premiumCount = results.filter(
    r => parseFloat(String(r.priceFrom).replace(/[^\d.]/g, "")) > 100
  ).length;
  console.log(
    `\nExtracted ${results.length}/${catalog.length} qualifying products. Over $100: ${premiumCount}`
  );
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
