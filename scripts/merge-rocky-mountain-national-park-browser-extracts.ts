import { readFileSync, writeFileSync } from "node:fs";

import catalog from "./rocky-mountain-national-park-catalog-products.json";

/** Adapted from scripts/lib/viatorBrowserExtract.ts for RMNP / Estes Park departures. */
export const EXTRACT_RMNP_PRODUCT_JS = `(() => {
  const html = document.documentElement.innerHTML;
  const hero = (html.match(/https:\\/\\/media\\.tacdn\\.com\\/media\\/attractions-splice-spp-674x446\\/[^"'\\s]+/i) || [])[0] || null;
  const title = document.querySelector('h1')?.textContent?.trim() || null;
  const priceHeading = [...document.querySelectorAll('h2')].find(h => /^From \\$/.test(h.textContent || ''));
  const priceText = priceHeading?.textContent?.match(/\\$([0-9][0-9,]*(?:\\.[0-9]{2})?)/);
  const price = priceText ? parseFloat(priceText[1].replace(/,/g, '')) : null;
  const reviewBtn = [...document.querySelectorAll('button')].find(b => /Reviews/i.test(b.textContent || ''));
  const reviewMatch = reviewBtn?.textContent?.match(/([0-9][0-9,]*)\\s+Reviews/i);
  const reviewCount = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, ''), 10) : null;
  const ratingMatch = document.body.textContent?.match(/([0-9]\\.[0-9])\\s*\\([0-9,]+\\s+Reviews/i);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
  const durationLi = [...document.querySelectorAll('li')].map(li => li.textContent?.trim()).find(t => /hours?|minutes?|days?/i.test(t || '') && /approx/i.test(t || ''));
  const duration = durationLi || [...document.querySelectorAll('li')].map(li => li.textContent?.trim()).find(t => /\\d+\\s*(?:to\\s*\\d+\\s*)?(?:hours?|minutes?|days?)/i.test(t || '')) || null;
  const overviewSection = [...document.querySelectorAll('h2')].find(h => h.textContent === 'Overview');
  let overview = '';
  if (overviewSection) {
    const parent = overviewSection.parentElement;
    overview = (parent?.textContent || '').replace('Overview', '').trim().split('Travel through')[0].trim();
    if (!overview) overview = (parent?.textContent || '').replace('Overview', '').trim().slice(0, 600);
  }
  const highlights = [];
  if (overviewSection) {
    const lis = overviewSection.parentElement?.querySelectorAll('li') || [];
    for (const li of lis) {
      const t = li.textContent?.trim();
      if (t && t.length > 15 && t.length < 140) highlights.push(t);
    }
  }
  const itineraryHeading = [...document.querySelectorAll('h2')].find(h => h.textContent === 'Itinerary');
  const stops = [];
  if (itineraryHeading) {
    let el = itineraryHeading.nextElementSibling;
    while (el) {
      const h3s = el.querySelectorAll ? el.querySelectorAll('h3') : [];
      for (const h3 of h3s) {
        const t = h3.textContent?.trim();
        if (t && !['Pickup points','Pickup details','Arranged start time'].includes(t)) stops.push(t);
      }
      if (stops.length) break;
      el = el.nextElementSibling;
    }
    if (!stops.length) {
      let capture = false;
      for (const h of [...document.querySelectorAll('h2,h3')]) {
        if (h.textContent === 'Itinerary') { capture = true; continue; }
        if (capture && h.tagName === 'H2') break;
        if (capture && h.tagName === 'H3') stops.push(h.textContent?.trim());
      }
    }
  }
  const meetingHeading = [...document.querySelectorAll('h2')].find(h => h.textContent === 'Meeting and Pickup');
  let startDescription = '';
  if (meetingHeading) {
    const details = [...document.querySelectorAll('h3')].find(h => h.textContent === 'Pickup details');
    startDescription = details?.nextElementSibling?.textContent?.trim() || meetingHeading.parentElement?.textContent?.replace('Meeting and Pickup','').trim().slice(0,300) || '';
  }
  const inclusions = [];
  const inclHeading = [...document.querySelectorAll('h2')].find(h => h.textContent === "What's Included");
  if (inclHeading) {
    for (const li of inclHeading.parentElement?.querySelectorAll('li') || []) {
      const t = li.textContent?.trim();
      if (t) inclusions.push(t);
    }
  }
  const categories = [...new Set([...document.querySelectorAll('a')].map(a => a.textContent?.trim()).filter(t => t && /Tours|Wildlife|Hiking|Private|National Park|Photography|Safari|Jeep|Horseback|Snowshoe|Scenic|Day Trip/i.test(t)).slice(0, 6))];
  return JSON.stringify({
    productCode: (location.href.match(/d\\d+-([A-Z0-9_]+)/i) || [])[1],
    productUrl: location.href.split('?')[0],
    title, priceFrom: price ? 'From $' + price.toFixed(2) : null, price,
    rating, reviewCount, duration, heroUrl: hero,
    overview: overview.slice(0, 500), highlights: highlights.slice(0, 5),
    itineraryStops: stops.filter(s => s && !/Review|Response from Host/i.test(s)).slice(0, 10),
    startDescription: startDescription.slice(0, 300),
    endDescription: 'Return to your Estes Park or Rocky Mountain National Park meeting point after the final stop.',
    inclusions: inclusions.slice(0, 6),
    categories: categories.length ? categories : ['Sightseeing Tours', 'National Parks']
  });
})()`;

if (process.argv.includes("--print-js")) {
  console.log(EXTRACT_RMNP_PRODUCT_JS);
  process.exit(0);
}

type CatalogRow = {
  productCode: string;
  href: string;
  title: string;
  price: number;
};

type BrowserExtract = {
  productCode: string;
  productUrl: string;
  title: string;
  priceFrom: string | null;
  price: number | null;
  rating: number | null;
  reviewCount: number;
  duration: string;
  heroUrl: string;
  overview: string;
  highlights: string[];
  itineraryStops: string[];
  startDescription: string;
  endDescription: string;
  inclusions: string[];
  categories: string[];
};

const CATALOG_PRICE: Record<string, number> = Object.fromEntries(
  (catalog as CatalogRow[]).map(p => [p.productCode, p.price])
);

const CATEGORY_MAP: Record<string, string[]> = {
  "366391P1": ["Private Tours", "Wildlife Tours", "National Parks"],
  "366391P5": ["Private Tours", "Hiking Tours", "Wildlife Tours"],
  "366391P3": ["Private Tours", "Sightseeing Tours", "National Parks"],
  "366391P2": ["Private Tours", "Snowshoe Tours", "Winter Sports"],
  "449630P3": ["Stargazing", "Night Tours", "National Parks"],
  "449630P1": ["Hiking Tours", "Sunrise Tours", "National Parks"],
  "337166P4": ["Day Trips", "Private Tours", "National Parks"],
  "148657P6": ["Photography Tours", "Sunset Tours", "National Parks"],
  "424860P1": ["Safaris", "Sightseeing Tours", "National Parks"],
  "450284P2": ["Photography Tours", "4WD Tours", "National Parks"],
  "5663796P1": ["Horseback Riding", "Outdoor Activities", "National Parks"],
  "264314P1": ["Jeep Tours", "Scenic Drives", "National Parks"],
  "242506P3": ["Sunrise Tours", "Private Tours", "National Parks"],
  "337022P1": ["Photography Tours", "Private Tours", "National Parks"],
  "264314P3": ["Sightseeing Tours", "National Parks", "Scenic Drives"],
  "450284P5": ["4WD Tours", "Adventure Tours", "National Parks"],
  "299786P1": ["Wildlife Tours", "Safaris", "National Parks"],
  "450284P3": ["Photography Tours", "Sunset Tours", "Wildlife Tours"],
  "477432P1": ["Hiking Tours", "Walking Tours", "National Parks"],
  "337022P3": ["Photography Tours", "Day Trips", "National Parks"],
  "242506P2": ["Private Tours", "Sightseeing Tours", "National Parks"],
  "242506P1": ["Private Tours", "Sightseeing Tours", "National Parks"],
  "265766P15": ["Private Tours", "Hiking Tours", "Day Trips"],
  "148657P3": ["Photography Tours", "Hiking Tours", "National Parks"],
  "264314P7": ["Scenic Drives", "Day Trips", "National Parks"],
};

const extracts = JSON.parse(
  readFileSync("scripts/rocky-mountain-national-park-browser-extracts.json", "utf8")
) as BrowserExtract[];

const merged = extracts.map(row => {
  const price = row.price ?? CATALOG_PRICE[row.productCode] ?? 0;
  const priceFrom =
    row.priceFrom ?? (price > 0 ? `From $${price.toFixed(2)}` : "From $0.00");

  return {
    productCode: row.productCode,
    productUrl: row.productUrl,
    title: row.title,
    priceFrom,
    rating: row.rating,
    reviewCount: row.reviewCount,
    duration: row.duration,
    heroUrl: row.heroUrl,
    overview: row.overview,
    itineraryStops: row.itineraryStops,
    categories: CATEGORY_MAP[row.productCode] ?? row.categories,
  };
});

writeFileSync(
  "scripts/rocky-mountain-national-park-live-product-data.json",
  `${JSON.stringify(merged, null, 2)}\n`
);
console.log(`Merged ${merged.length} RMNP live product rows.`);
