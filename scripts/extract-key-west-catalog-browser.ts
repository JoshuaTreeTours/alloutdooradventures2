/**
 * Playwright extraction of Key West Viator catalog product links.
 * Run: npx tsx scripts/extract-key-west-catalog-browser.ts
 */
import { writeFileSync } from "node:fs";

import { chromium } from "playwright";

const CATALOG_URL = "https://www.viator.com/Key-West/d661-ttd";

const EXTRACT_CATALOG_JS = `(() => {
  const html = document.documentElement.innerHTML;
  const products = new Map();
  for (const match of html.matchAll(/https:\\/\\/www\\.viator\\.com\\/tours\\/Key-West\\/[^"'\\s]+?\\/d661-([A-Z0-9_]+)/gi)) {
    products.set(match[1].toUpperCase(), match[0]);
  }
  for (const match of html.matchAll(/\\/tours\\/Key-West\\/[^"'\\s]+?\\/d661-([A-Z0-9_]+)/gi)) {
    const code = match[1].toUpperCase();
    if (!products.has(code)) products.set(code, 'https://www.viator.com' + match[0]);
  }
  for (const a of document.querySelectorAll('a[href*="d661-"]')) {
    const href = a.href || a.getAttribute('href') || '';
    const m = href.match(/d661-([A-Z0-9_]+)/i);
    if (m) {
      const code = m[1].toUpperCase();
      const url = href.startsWith('http') ? href.split('?')[0] : 'https://www.viator.com' + href.split('?')[0];
      if (!products.has(code)) products.set(code, url);
    }
  }
  return JSON.stringify([...products.entries()].map(([productCode, sourceUrl]) => ({ productCode, sourceUrl })));
})()`;

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
  console.log(`Navigating to ${CATALOG_URL}...`);
  await page.goto(CATALOG_URL, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(12000);

  for (let i = 0; i < 5; i++) {
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
    "scripts/key-west-catalog-products.json",
    `${JSON.stringify(products, null, 2)}\n`
  );

  await browser.close();
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
