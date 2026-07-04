/**
 * One-off discovery: live Viator public page data for Philadelphia candidates.
 * Run: npx tsx scripts/discover-philadelphia-viator-catalog.ts
 */
import { writeFileSync } from "node:fs";

import {
  assessViatorPublicPageAvailability,
  fetchViatorPublicPage,
} from "../src/engine6/viatorPublicAvailability";

const CANDIDATES = [
  { productCode: "8841P1", sourceUrl: "https://www.viator.com/tours/Philadelphia/Private-City-of-Philadelphia-Driving-Tour/d906-8841P1" },
  { productCode: "8841P6", sourceUrl: "https://www.viator.com/tours/Philadelphia/Private-Half-Day-Philadelphia-Driving-Tour/d906-8841P6" },
  { productCode: "8841P70", sourceUrl: "https://www.viator.com/tours/Philadelphia/A-Day-in-Amish-Country/d906-8841P70" },
  { productCode: "8841P10", sourceUrl: "https://www.viator.com/tours/Philadelphia/Private-Driving-Tour-of-Lancaster-and-Amish-Country/d906-8841P10" },
  { productCode: "102233P1", sourceUrl: "https://www.viator.com/tours/Philadelphia/Discovering-Colonial-Philadelphia-to-now-Walking-Tour/d906-102233P1" },
  { productCode: "102233P3", sourceUrl: "https://www.viator.com/tours/Philadelphia/Hamilton-The-Tour-where-it-Happens/d906-102233P3" },
  { productCode: "255730P245", sourceUrl: "https://www.viator.com/tours/Philadelphia/Private-Family-Walking-Tour-In-the-Footsteps-of-the-Founders/d906-255730P245" },
  { productCode: "255730P256", sourceUrl: "https://www.viator.com/tours/Philadelphia/Private-Walking-Tour-of-Nazi-History-in-Berlin/d906-255730P256" },
  { productCode: "86032P3", sourceUrl: "https://www.viator.com/tours/Philadelphia/Historic-Food-Tour/d906-86032P3" },
  { productCode: "8841P73", sourceUrl: "https://www.viator.com/tours/Philadelphia/Valley-Forge-American-Revolution-Tour/d906-8841P73" },
  { productCode: "153296P3", sourceUrl: "https://www.viator.com/tours/Philadelphia/Customized-Tours-in-and-around-Philadelphia/d906-153296P3" },
  { productCode: "8841P82", sourceUrl: "https://www.viator.com/tours/Philadelphia/Italian-Market-Food-Tour-PRIVATE/d906-8841P82" },
  { productCode: "86032P1", sourceUrl: "https://www.viator.com/tours/Philadelphia/Flavors-of-Philly-Food-Tour/d906-86032P1" },
  { productCode: "8841P34", sourceUrl: "https://www.viator.com/tours/Philadelphia/Center-City-Philadelphia-Food-Tour-with-Reading-Market/d906-8841P34" },
  { productCode: "5582660P3", sourceUrl: "https://www.viator.com/tours/Philadelphia/Explore-Philadelphia-via-Vintage-Car-or-Electric-cart/d906-5582660P3" },
  { productCode: "6314PHILSEG", sourceUrl: "https://www.viator.com/tours/Philadelphia/Philadelphia-2-Hour-Electric-Cart-Tour/d906-6314PHILSEG" },
  { productCode: "5042PHLSPI", sourceUrl: "https://www.viator.com/tours/Philadelphia/City-Cruises-Philadelphia-Signature-Dinner-Cruise-with-Buffet/d906-5042PHLSPI" },
  { productCode: "5042P61", sourceUrl: "https://www.viator.com/tours/Philadelphia/City-Cruises-Philadelphia-Signature-Buffet-Lunch-Cruise/d906-5042P61" },
  { productCode: "8841P27", sourceUrl: "https://www.viator.com/tours/Philadelphia/Philadelphias-Italian-Market-Food-Tour/d906-8841P27" },
  { productCode: "25140P1", sourceUrl: "https://www.viator.com/tours/Philadelphia/Classic-Philadelphia-City-Bike-Tour/d906-25140P1" },
  { productCode: "115692P1", sourceUrl: "https://www.viator.com/tours/Philadelphia/Beyond-the-Bell-History-Walking-Tour/d906-115692P1" },
  { productCode: "52886P6", sourceUrl: "https://www.viator.com/tours/Philadelphia/Inside-the-Italian-Market-Chef-Led-Tasting-Journey/d906-52886P6" },
];

const extractFromHtml = (html: string) => {
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title = titleMatch?.[1]?.trim().replace(/\s+/g, " ") ?? null;
  const priceMatch =
    html.match(/From[\s$€£]*([0-9][0-9,]*(?:\.[0-9]{2})?)/i) ??
    html.match(/"fromPrice"\s*:\s*([0-9.]+)/i);
  const priceFrom = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, "")) : null;
  const ratingMatch =
    html.match(/"combinedAverageRating"\s*:\s*([0-9.]+)/i) ??
    html.match(/"averageRating"\s*:\s*([0-9.]+)/i);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
  const reviewMatch =
    html.match(/"totalReviews"\s*:\s*(\d+)/i) ??
    html.match(/"reviewCount"\s*:\s*(\d+)/i);
  const reviewCount = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, ""), 10) : null;
  const durationMatch = html.match(
    /(\d+(?:\s*to\s*\d+)?\s*(?:hours?|minutes?|days?)(?:\s*\d+\s*minutes?)?(?:\s*\(approx\.\))?)/i
  );
  const duration = durationMatch?.[1] ?? null;
  const heroMatch = html.match(
    /https:\/\/media\.tacdn\.com\/media\/attractions-splice-spp-674x446\/[^"'\s]+/i
  );
  const heroUrl = heroMatch?.[0] ?? null;
  return { title, priceFrom, rating, reviewCount, duration, heroUrl };
};

const main = async () => {
  const results = [];
  for (const candidate of CANDIDATES) {
    try {
      const page = await fetchViatorPublicPage(candidate.sourceUrl);
      const availability = assessViatorPublicPageAvailability({
        productCode: candidate.productCode,
        sourceUrl: candidate.sourceUrl,
        html: page.html,
        finalUrl: page.finalUrl,
        httpStatus: page.httpStatus,
      });
      const extracted = extractFromHtml(page.html);
      results.push({ ...candidate, ...extracted, available: availability.available, htmlLen: page.html.length });
      console.log(`${candidate.productCode}: hero=${extracted.heroUrl?.slice(-20)} rating=${extracted.rating} reviews=${extracted.reviewCount}`);
    } catch (e) {
      results.push({ ...candidate, error: String(e) });
      console.log(`ERR ${candidate.productCode}`);
    }
    await new Promise(r => setTimeout(r, 600));
  }
  writeFileSync("scripts/philadelphia-viator-discovery-results.json", JSON.stringify(results, null, 2));
};

main();
