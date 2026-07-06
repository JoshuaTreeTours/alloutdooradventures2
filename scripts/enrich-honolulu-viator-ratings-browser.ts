/**
 * Enrich honolulu-live-product-data.json with ratings from live Viator pages.
 * Run: npx tsx scripts/enrich-honolulu-viator-ratings-browser.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

import { chromium } from "playwright";

type LiveProduct = {
  productCode: string;
  productUrl: string;
  title: string;
  priceFrom: string;
  rating: number | null;
  reviewCount: number;
  duration: string;
  heroUrl: string;
  overview: string | null;
  itineraryStops: string[];
  categories: string[];
};

const LIVE_DATA_PATH = "scripts/honolulu-live-product-data.json";
const RATINGS_PATH = "src/engine6/honoluluViatorPublicRatings.ts";

const writeRatingsFile = (products: LiveProduct[]) => {
  const ratingsEntries = products
    .map(p => {
      if (p.rating === null) {
        throw new Error(`Missing live Viator rating for ${p.productCode}`);
      }
      return `  "${p.productCode}": { rating: ${p.rating}, reviewCount: ${p.reviewCount} },`;
    })
    .join("\n");

  const ratingsTs = `export type HonoluluViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Honolulu d59070 Engine6 products. */
export const HONOLULU_VIATOR_PUBLIC_RATINGS: Record<
  string,
  HonoluluViatorPublicRating
> = {
${ratingsEntries}
};

export const HONOLULU_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  HONOLULU_VIATOR_PUBLIC_RATINGS
);
`;

  writeFileSync(RATINGS_PATH, ratingsTs);
};

const main = async () => {
  const products = JSON.parse(
    readFileSync(LIVE_DATA_PATH, "utf8")
  ) as LiveProduct[];

  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const page = await browser.newPage();

  const pending = products;
  console.log(
    `Enriching ${pending.length}/${products.length} Honolulu products with live Viator ratings...`
  );

  for (const row of pending) {
    await page.goto(row.productUrl, {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    await page.waitForTimeout(8000);

    const enriched = await page.evaluate(() => {
      const html = document.documentElement.innerHTML;
      const combined = html.match(/"combinedAverageRating"\s*:\s*([0-9.]+)/i);
      const ratingValue = html.match(/"ratingValue"\s*:\s*([0-9.]+)/i);
      const reviewCount =
        html.match(/"totalReviews"\s*:\s*(\d+)/i) ??
        html.match(/"reviewCount"\s*:\s*(\d+)/i);

      let rating: number | null = combined
        ? parseFloat(combined[1])
        : ratingValue
          ? parseFloat(ratingValue[1])
          : null;

      if (rating === null) {
        const bodyText = document.body.textContent ?? "";
        const multilineMatch = bodyText.match(
          /([0-9]\.[0-9])\s*\n\s*([0-9][0-9,]*)\s*\n\s*Reviews/i
        );
        if (multilineMatch) {
          rating = parseFloat(multilineMatch[1]);
        }
      }

      if (rating === null) {
        const bodyRating = document.body.textContent?.match(
          /([0-9]\.[0-9])\s*\n\s*([0-9][0-9,]*)\s*Reviews/i
        );
        if (bodyRating) rating = parseFloat(bodyRating[1]);
      }

      if (rating === null) {
        const inlineRating = document.body.textContent?.match(
          /([0-9]\.[0-9])\s*\([0-9,]+\s*Reviews/i
        );
        if (inlineRating) rating = parseFloat(inlineRating[1]);
      }

      if (rating === null) {
        const starButtons = [...document.querySelectorAll("button")].filter(b =>
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
        const bodyText = document.body.textContent ?? "";
        const multilineReviewMatch = bodyText.match(
          /[0-9]\.[0-9]\s*\n\s*([0-9][0-9,]*)\s*\n\s*Reviews/i
        );
        if (multilineReviewMatch) {
          reviews = parseInt(multilineReviewMatch[1].replace(/,/g, ""), 10);
        }
      }

      if (reviews === null) {
        const reviewBtn = [...document.querySelectorAll("button")].find(b =>
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

  writeFileSync(LIVE_DATA_PATH, `${JSON.stringify(products, null, 2)}\n`);
  writeRatingsFile(products);
  console.log(`Updated ${LIVE_DATA_PATH} and ${RATINGS_PATH}.`);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
