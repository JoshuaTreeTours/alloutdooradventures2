/**
 * Playwright extraction of live Aspen Viator product pages.
 * Run: npx tsx scripts/extract-aspen-products-browser.ts
 */
import { writeFileSync } from "node:fs";

import { chromium } from "playwright";

const CANDIDATES = [
  {
    productCode: "74828P1",
    sourceUrl:
      "https://www.viator.com/tours/Aspen/Aspens-DarkSide-Ghost-Tour/d26395-74828P1",
  },
  {
    productCode: "74828P2",
    sourceUrl:
      "https://www.viator.com/tours/Aspen/Aspens-Past-to-Present-Historic-Tour/d26395-74828P2",
  },
  {
    productCode: "74828P3",
    sourceUrl:
      "https://www.viator.com/tours/Aspen/Glimpse-of-Aspen-Tour/d26395-74828P3",
  },
  {
    productCode: "74828P4",
    sourceUrl:
      "https://www.viator.com/tours/Aspen/Aspens-Off-the-Beaten-Path-Tour/d26395-74828P4",
  },
  {
    productCode: "74828P5",
    sourceUrl:
      "https://www.viator.com/tours/Aspen/Aspen-East-End-Light-Hike/d26395-74828P5",
  },
  {
    productCode: "147508P175",
    sourceUrl:
      "https://www.viator.com/tours/Aspen/Photographer-and-Professional-Photoshoot-in-Aspen/d26395-147508P175",
  },
  {
    productCode: "172188P151",
    sourceUrl:
      "https://www.viator.com/tours/Aspen/Private-Professional-photoshoot-in-Aspen/d26395-172188P151",
  },
  {
    productCode: "104204P37",
    sourceUrl:
      "https://www.viator.com/tours/Aspen/Lets-Roams-Aspen-Scavenger-Hunt-Get-An-Altitude-Adjustment/d26395-104204P37",
  },
  {
    productCode: "200006P106",
    sourceUrl:
      "https://www.viator.com/tours/Aspen/Amazing-Aspen-Scavenger-Hunt/d26395-200006P106",
  },
  {
    productCode: "565104P4",
    sourceUrl:
      "https://www.viator.com/tours/Colorado/Guided-Fly-Fishing-Adventure-on-the-Roaring-Fork-River/d273-565104P4",
  },
];

const EXTRACT_JS = `(() => {
  const html = document.documentElement.innerHTML;
  const title = document.querySelector('h1')?.textContent?.trim() || null;
  const priceHeading = [...document.querySelectorAll('h2')].find(h => /^From \\$/.test(h.textContent || ''));
  const priceText = (priceHeading?.textContent || document.body.innerText).match(/From\\s*\\$([0-9][0-9,]*(?:\\.[0-9]{2})?)/i);
  const price = priceText ? parseFloat(priceText[1].replace(/,/g, '')) : null;
  const reviewBtn = [...document.querySelectorAll('button')].find(b => /Reviews/i.test(b.textContent || ''));
  const reviewMatch = reviewBtn?.textContent?.match(/([0-9][0-9,]*)\\s+Reviews/i);
  const reviewCount = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, ''), 10) : null;
  const ratingMatch = document.body.textContent?.match(/([0-9]\\.[0-9])\\s*\\([0-9,]+\\s+Reviews/i);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
  const durationLi = [...document.querySelectorAll('li')].map(li => li.textContent?.trim()).find(t => /hours?|minutes?|days?/i.test(t || '') && /approx/i.test(t || ''))
    || [...document.querySelectorAll('li')].map(li => li.textContent?.trim()).find(t => /\\d+\\s*(?:to\\s*\\d+\\s*)?(?:hours?|minutes?|days?)/i.test(t || ''))
    || null;
  const overviewSection = [...document.querySelectorAll('h2')].find(h => h.textContent === 'Overview');
  let overview = '';
  if (overviewSection) {
    overview = (overviewSection.parentElement?.textContent || '').replace('Overview', '').trim().slice(0, 1200);
  }
  const highlights = [];
  if (overviewSection) {
    for (const li of overviewSection.parentElement?.querySelectorAll('li') || []) {
      const t = li.textContent?.trim();
      if (t && t.length > 15 && t.length < 160) highlights.push(t);
    }
  }
  const itineraryHeading = [...document.querySelectorAll('h2')].find(h => h.textContent === 'Itinerary');
  const stops = [];
  if (itineraryHeading) {
    let capture = false;
    for (const h of [...document.querySelectorAll('h2,h3')]) {
      if (h.textContent === 'Itinerary') { capture = true; continue; }
      if (capture && h.tagName === 'H2') break;
      if (capture && h.tagName === 'H3') {
        const t = h.textContent?.trim();
        if (t && !['Pickup points','Pickup details','Arranged start time'].includes(t)) stops.push(t);
      }
    }
  }
  const meetingHeading = [...document.querySelectorAll('h2')].find(h => h.textContent === 'Meeting and Pickup');
  let startDescription = '';
  if (meetingHeading) {
    const details = [...document.querySelectorAll('h3')].find(h => h.textContent === 'Pickup details');
    startDescription = details?.nextElementSibling?.textContent?.trim()
      || meetingHeading.parentElement?.textContent?.replace('Meeting and Pickup','').trim().slice(0,400)
      || '';
  }
  const inclusions = [];
  const inclHeading = [...document.querySelectorAll('h2')].find(h => h.textContent === "What's Included");
  if (inclHeading) {
    for (const li of inclHeading.parentElement?.querySelectorAll('li') || []) {
      const t = li.textContent?.trim();
      if (t) inclusions.push(t);
    }
  }
  const categories = [...new Set(
    [...document.querySelectorAll('a')]
      .map(a => a.textContent?.trim())
      .filter(t => t && /Tours|Hiking|Photography|Ghost|Private|Day Trip|Nature|Sightseeing|Historical|Walking|Outdoor/i.test(t))
      .slice(0, 8)
  )];
  const heroCandidates = [
    ...(html.match(/https:\\/\\/dynamic-media\\.tacdn\\.com\\/media\\/photo-o\\/[^"'\\s]+/gi) || []),
    ...(html.match(/https:\\/\\/media\\.tacdn\\.com\\/media\\/attractions-splice-spp-674x446\\/[^"'\\s]+/gi) || []),
    ...(html.match(/https:\\/\\/media\\.tacdn\\.com\\/media\\/attractions-splice-spp-720x480\\/[^"'\\s]+/gi) || []),
  ].map(u => u.replace(/&amp;/g, '&'));
  const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || null;
  const bodyText = document.body.innerText || '';
  return JSON.stringify({
    productCode: (location.href.match(/d\\d+-([A-Z0-9_]+)/i) || [])[1] || null,
    productUrl: location.href.split('?')[0],
    title,
    priceFrom: price != null ? ('From $' + price.toFixed(2)) : null,
    price,
    rating,
    reviewCount,
    duration: durationLi,
    heroUrl: heroCandidates[0] || ogImage,
    heroCandidates: heroCandidates.slice(0, 6),
    overview,
    highlights: highlights.slice(0, 8),
    itineraryStops: stops.filter(s => s && !/Review|Response from Host/i.test(s)).slice(0, 12),
    startDescription: startDescription.slice(0, 400),
    inclusions: inclusions.slice(0, 10),
    categories: categories.length ? categories : ['Sightseeing Tours'],
    isPrivate: /This is a private tour\\/activity|Only your group will participate/i.test(bodyText),
    selfGuided: /self[- ]guided|audio tour|smartphone app|Let's Roam|download the app/i.test(bodyText + ' ' + (title || '')),
    unavailable: /currently unavailable|no longer available|This experience is unavailable/i.test(bodyText),
    pageTitle: document.title
  });
})()`;

const main = async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    viewport: { width: 1400, height: 900 },
  });

  const page = await context.newPage();
  const results: Record<string, unknown>[] = [];

  try {
    await page.goto("https://www.viator.com/Aspen/d26395-ttd", {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    await page.waitForTimeout(5000);
    console.log("Catalog title:", await page.title());
  } catch (error) {
    console.log("Catalog warm-up failed:", error);
  }

  for (const entry of CANDIDATES) {
    console.log(`Extracting ${entry.productCode}...`);
    try {
      await page.goto(entry.sourceUrl, {
        waitUntil: "domcontentloaded",
        timeout: 120000,
      });
      await page.waitForTimeout(8000);

      const title = await page.title();
      const content = await page.content();
      if (
        (/verification required|captcha/i.test(title) && title.length < 40) ||
        /Please enable JS and disable any ad blocker/i.test(content)
      ) {
        console.log(`  BLOCKED for ${entry.productCode}: ${title}`);
        results.push({
          productCode: entry.productCode,
          productUrl: entry.sourceUrl,
          error: "DataDome captcha",
          pageTitle: title,
        });
        continue;
      }

      const raw = await page.evaluate(EXTRACT_JS);
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      results.push(parsed);
      console.log(
        `  OK: ${parsed.title} | ${parsed.priceFrom} | ${parsed.rating} (${parsed.reviewCount}) | hero=${Boolean(parsed.heroUrl)} | stops=${(parsed.itineraryStops as string[])?.length ?? 0} | selfGuided=${parsed.selfGuided}`
      );
    } catch (error) {
      results.push({
        productCode: entry.productCode,
        productUrl: entry.sourceUrl,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`  ERR: ${entry.productCode}`);
    }

    await page.waitForTimeout(2500);
  }

  await browser.close();

  writeFileSync(
    "scripts/aspen-browser-extracts.json",
    `${JSON.stringify(results, null, 2)}\n`
  );

  const ok = results.filter(r => r.title && r.priceFrom && r.heroUrl);
  console.log(`\nExtracted ${ok.length}/${results.length} products with full data.`);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
