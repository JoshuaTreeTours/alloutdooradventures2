/**
 * Playwright extraction of Maui Viator catalog product links.
 * Run: npx tsx scripts/extract-maui-catalog-browser.ts
 */
import { writeFileSync } from "node:fs";

import { chromium } from "playwright";

const CATALOG_URL = "https://www.viator.com/Maui/d671-ttd";
const VIATOR_DESTINATION_ID = "d671";

const EXTRACT_CATALOG_JS = `(() => {
  const products = new Map();
  const slugPatterns = ["Maui", "Lahaina", "Kihei", "Wailea", "Kahului", "Hawaii"];
  for (const slug of slugPatterns) {
    const reFull = new RegExp(
      "https:\\\\/\\\\/www\\\\.viator\\\\.com\\\\/tours\\\\/" + slug + "\\\\/[^\"'\\\\s]+?\\\\/" + "${VIATOR_DESTINATION_ID}" + "-([A-Z0-9_]+)",
      "gi"
    );
    for (const match of document.documentElement.innerHTML.matchAll(reFull)) {
      products.set(match[1].toUpperCase(), match[0]);
    }
    const rePath = new RegExp(
      "\\\\/tours\\\\/" + slug + "\\\\/[^\"'\\\\s]+?\\\\/" + "${VIATOR_DESTINATION_ID}" + "-([A-Z0-9_]+)",
      "gi"
    );
    for (const match of document.documentElement.innerHTML.matchAll(rePath)) {
      const code = match[1].toUpperCase();
      if (!products.has(code)) {
        products.set(code, "https://www.viator.com" + match[0]);
      }
    }
  }
  for (const a of document.querySelectorAll('a[href*="${VIATOR_DESTINATION_ID}-"]')) {
    const href = a.href || a.getAttribute("href") || "";
    const m = href.match(/${VIATOR_DESTINATION_ID}-([A-Z0-9_]+)/i);
    if (m) {
      const code = m[1].toUpperCase();
      const url = href.startsWith("http")
        ? href.split("?")[0]
        : "https://www.viator.com" + href.split("?")[0];
      if (!products.has(code)) products.set(code, url);
    }
  }
  return JSON.stringify(
    [...products.entries()].map(([productCode, sourceUrl]) => ({ productCode, sourceUrl }))
  );
})()`;

const main = async () => {
  const browser = await chromium.launch({
    headless: true,
    channel: "chrome",
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    viewport: { width: 1400, height: 900 },
  });

  const page = await context.newPage();
  console.log(`Navigating to ${CATALOG_URL}...`);
  await page.goto(CATALOG_URL, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(12000);

  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
  }

  const title = await page.title();
  const htmlLen = (await page.content()).length;
  console.log(`Page title: ${title}, htmlLen: ${htmlLen}`);

  const raw = await page.evaluate(EXTRACT_CATALOG_JS);
  const products = JSON.parse(raw) as { productCode: string; sourceUrl: string }[];
  console.log(`Found ${products.length} catalog products`);

  writeFileSync(
    "scripts/maui-catalog-products.json",
    `${JSON.stringify(products, null, 2)}\n`
  );
  writeFileSync(
    "scripts/maui-viator-discovery-results.json",
    `${JSON.stringify({ catalogCount: products.length, products }, null, 2)}\n`
  );

  await browser.close();
  console.log("Wrote scripts/maui-catalog-products.json");
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
