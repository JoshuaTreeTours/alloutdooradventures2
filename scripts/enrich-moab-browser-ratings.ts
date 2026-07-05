/**
 * Enrich moab-browser-extracts.json with ratingValue/reviewCount from live page JSON.
 * Run: npx tsx scripts/enrich-moab-browser-ratings.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

import { chromium } from "playwright";

type Extract = {
  productCode: string;
  productUrl: string;
  rating: number | null;
  reviewCount: number | null;
  [key: string]: unknown;
};

const extracts = JSON.parse(
  readFileSync("scripts/moab-browser-extracts.json", "utf8")
) as Extract[];

const main = async () => {
  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const page = await browser.newPage();

  const pending = extracts.filter((row) => row.rating === null);
  console.log(`Enriching ${pending.length}/${extracts.length} products with null ratings...`);

  for (const row of pending) {
    await page.goto(row.productUrl, {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    await page.waitForTimeout(8000);

    const enriched = await page.evaluate(() => {
      const html = document.documentElement.innerHTML;
      const ratingValue = html.match(/"ratingValue"\s*:\s*([0-9.]+)/i);
      const combined = html.match(/"combinedAverageRating"\s*:\s*([0-9.]+)/i);
      const reviewCount =
        html.match(/"reviewCount"\s*:\s*(\d+)/i) ??
        html.match(/"totalReviews"\s*:\s*(\d+)/i);
      let rating: number | null = ratingValue
        ? parseFloat(ratingValue[1])
        : combined
          ? parseFloat(combined[1])
          : null;
      if (rating === null) {
        const bodyRating = document.body.textContent?.match(
          /([0-9]\.[0-9])\s*\([0-9,]+\s*Reviews/i
        );
        if (bodyRating) rating = parseFloat(bodyRating[1]);
      }
      if (rating === null) {
        const starButtons = [...document.querySelectorAll("button")].filter((b) =>
          /Show \d star reviews/i.test(b.textContent || "")
        );
        if (starButtons.length) {
          let total = 0;
          let weighted = 0;
          for (const btn of starButtons) {
            const m = (btn.textContent || "").match(
              /Show (\d) star reviews,\s*\(?([0-9,]+) reviews?\)?/i
            );
            if (m) {
              const stars = parseInt(m[1], 10);
              const count = parseInt(m[2].replace(/,/g, ""), 10);
              weighted += stars * count;
              total += count;
            }
          }
          if (total > 0) rating = Math.round((weighted / total) * 10) / 10;
        }
      }
      let reviews = reviewCount ? parseInt(reviewCount[1], 10) : null;
      if (reviews === null) {
        const reviewBtn = [...document.querySelectorAll("button")].find((b) =>
          /Reviews/i.test(b.textContent || "")
        );
        const btnMatch = reviewBtn?.textContent?.match(/([0-9][0-9,]*)\s+Reviews/i);
        if (btnMatch) reviews = parseInt(btnMatch[1].replace(/,/g, ""), 10);
      }
      return { rating, reviewCount: reviews };
    });

    row.rating = enriched.rating;
    if (enriched.reviewCount) {
      row.reviewCount = enriched.reviewCount;
    }
    console.log(
      `${row.productCode}: rating=${row.rating} reviews=${row.reviewCount}`
    );
    await page.waitForTimeout(1500);
  }

  await browser.close();
  writeFileSync(
    "scripts/moab-browser-extracts.json",
    `${JSON.stringify(extracts, null, 2)}\n`
  );
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
