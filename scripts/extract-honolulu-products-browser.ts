/**
 * Playwright extraction of live Honolulu Viator product pages.
 * Run: npx tsx scripts/extract-honolulu-products-browser.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

import { chromium } from "playwright";

import { EXTRACT_MOAB_PRODUCT_JS } from "./lib/moabBrowserExtract";

type CatalogEntry = { productCode: string; sourceUrl: string };

const REJECT_TITLE_PATTERN =
  /audio|self[- ]?guided|gps|app[- ]?based|smartphone|download|ghost|paranormal|supernatural|haunted|psychic|spirit/i;

const REJECT_WEAK_PATTERN =
  /airport|arrival transfer|departure transfer|shuttle only|general admission|admission ticket|transport only|ground transfer|port transfer|magical mystery show/i;

const PREFERRED_PATTERN =
  /private|premium|cultural|pearl harbor|north shore|food|hike|hiking|ocean|volcano|geology|histor|photograph|day trip|circle island|snorkel|luau|helicopter|sunset|sunrise|diamond head|waikiki|oahu|kualoa|polynesian|memorial|uss arizona|catamaran|whale|turtle|kayak|surf|waterfall|rainforest|botanical|monument|scenic|adventure|small group|exclusive|luxury|battleship|missouri|haleiwa|waimea|dole/i;

const isRealProductCode = (code: string) =>
  /^[0-9]+[A-Z0-9_]*$/i.test(code) && code.length >= 4;

const selectProducts = (
  candidates: Record<string, unknown>[],
  targetCount = 20,
  minPremiumShare = 0.5
) => {
  const minPremium = Math.ceil(targetCount * minPremiumShare);
  const selected: Record<string, unknown>[] = [];
  const selectedCodes = new Set<string>();

  const premium = candidates.filter(
    c => parseFloat(String(c.priceFrom).replace(/[^\d.]/g, "")) > 100
  );
  const standard = candidates.filter(
    c => parseFloat(String(c.priceFrom).replace(/[^\d.]/g, "")) <= 100
  );

  for (const entry of premium) {
    if (selected.length >= targetCount) break;
    selected.push(entry);
    selectedCodes.add(entry.productCode as string);
  }

  if (selected.length < minPremium) {
    throw new Error(
      `Only ${selected.length} premium (>$100) products available; need ${minPremium}`
    );
  }

  for (const entry of [...premium, ...standard]) {
    if (selected.length >= targetCount) break;
    if (selectedCodes.has(entry.productCode as string)) continue;
    selected.push(entry);
    selectedCodes.add(entry.productCode as string);
  }

  return selected.slice(0, targetCount);
};

const main = async () => {
  const catalog = (
    JSON.parse(
      readFileSync("scripts/honolulu-catalog-products.json", "utf8")
    ) as CatalogEntry[]
  ).filter(entry => isRealProductCode(entry.productCode));

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
      const titleText = String(parsed.title ?? "");
      const titleRejected =
        titleText &&
        (REJECT_TITLE_PATTERN.test(titleText) ||
          REJECT_WEAK_PATTERN.test(titleText));
      const preferred = PREFERRED_PATTERN.test(
        `${parsed.title ?? ""} ${(parsed.categories as string[])?.join(" ") ?? ""} ${parsed.overview ?? ""}`
      );
      const unavailable =
        /product unavailable|this product is unavailable|no longer available|this experience is unavailable/i.test(
          titleText
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
        !unavailable &&
        !/self[- ]?guided/i.test(titleText)
      ) {
        results.push(record);
        console.log(
          `  OK: ${parsed.title} ${parsed.priceFrom} (${parsed.reviewCount} reviews)`
        );
      } else {
        rejected.push({ ...record, priceNum, titleRejected, unavailable });
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

  const selected = selectProducts(results, 20, 0.5);
  const selectedCodes = selected.map(p => p.productCode);

  writeFileSync(
    "scripts/honolulu-browser-extracts.json",
    `${JSON.stringify({ available: results, rejected, selectedCodes }, null, 2)}\n`
  );
  writeFileSync(
    "scripts/honolulu-live-product-data.json",
    `${JSON.stringify(
      selected.map(p => ({
        productCode: p.productCode,
        productUrl: p.productUrl,
        title: p.title,
        priceFrom: p.priceFrom,
        rating: p.rating,
        reviewCount: p.reviewCount ?? 0,
        duration: p.duration ?? "TBD (approx.)",
        heroUrl: p.heroUrl,
        overview: p.overview,
        itineraryStops: p.itineraryStops,
        categories: p.categories,
      })),
      null,
      2
    )}\n`
  );
  writeFileSync(
    "scripts/honolulu-product-selection.json",
    `${JSON.stringify(
      {
        destinationLabel: "Honolulu",
        destinationCitySlug: "honolulu",
        viatorDestinationSlug: "Honolulu",
        targetPremiumShare: 0.5,
        selectedProductCodes: selectedCodes,
        qualifiedNotSelected: results
          .filter(r => !selectedCodes.includes(r.productCode as string))
          .map(r => ({
            productCode: r.productCode,
            title: r.title,
            priceFrom: r.priceFrom,
          })),
      },
      null,
      2
    )}\n`
  );

  const premiumCount = selected.filter(
    r => parseFloat(String(r.priceFrom).replace(/[^\d.]/g, "")) > 100
  ).length;
  console.log(
    `\nExtracted ${results.length}/${catalog.length} qualifying products. Selected ${selected.length}. Over $100 in selection: ${premiumCount}`
  );
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
