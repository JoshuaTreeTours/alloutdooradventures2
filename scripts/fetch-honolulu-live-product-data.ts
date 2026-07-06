/**
 * Fetch live Viator public page data for Honolulu catalog candidates.
 * Run: npx tsx scripts/fetch-honolulu-live-product-data.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

import {
  assessViatorPublicPageAvailability,
  fetchViatorPublicPage,
} from "../src/engine6/viatorPublicAvailability";

type CatalogEntry = {
  productCode: string;
  sourceUrl: string;
};

const REJECT_TITLE_PATTERN =
  /audio|self[- ]?guided|gps|app[- ]?based|smartphone|download|ghost|paranormal|supernatural|haunted|psychic|spirit/i;

const REJECT_WEAK_PATTERN =
  /airport|arrival transfer|departure transfer|shuttle only|general admission|admission ticket|transport only|ground transfer|port transfer/i;

const PREFERRED_PATTERN =
  /private|premium|cultural|pearl harbor|north shore|food|hike|hiking|ocean|volcano|geology|histor|photograph|day trip|circle island|snorkel|luau|helicopter|sunset|sunrise|diamond head|waikiki|oahu|kualoa|polynesian|memorial|uss arizona|catamaran|whale|turtle|kayak|surf|waterfall|rainforest|botanical|monument|scenic|adventure|small group|exclusive|luxury|battleship|missouri|haleiwa|waimea|dole/i;

const extractFromHtml = (html: string) => {
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title = titleMatch?.[1]?.trim().replace(/\s+/g, " ") ?? null;

  const priceMatch =
    html.match(/From[\s$€£]*([0-9][0-9,]*(?:\.[0-9]{2})?)/i) ??
    html.match(/"fromPrice"\s*:\s*([0-9.]+)/i) ??
    html.match(/"price"\s*:\s*([0-9.]+)/i);
  const priceFrom = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, "")) : null;

  const ratingMatch =
    html.match(/"combinedAverageRating"\s*:\s*([0-9.]+)/i) ??
    html.match(/"averageRating"\s*:\s*([0-9.]+)/i);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

  const reviewMatch =
    html.match(/"totalReviews"\s*:\s*(\d+)/i) ??
    html.match(/"reviewCount"\s*:\s*(\d+)/i) ??
    html.match(/(\d[\d,]*)\s+Reviews/i);
  const reviewCount = reviewMatch
    ? parseInt(reviewMatch[1].replace(/,/g, ""), 10)
    : null;

  const durationMatch = html.match(
    /(\d+(?:\s*to\s*\d+)?\s*(?:hours?|minutes?|days?)(?:\s*\d+\s*minutes?)?(?:\s*\(approx\.\))?)/i
  );
  const duration = durationMatch?.[1] ?? null;

  const heroMatch =
    html.match(
      /https:\/\/media\.tacdn\.com\/media\/attractions-splice-spp-674x446\/[^"'\s]+/i
    ) ??
    html.match(
      /https:\/\/dynamic-media\.tacdn\.com\/media\/photo-o\/[^"'\s]+/i
    );
  const heroUrl = heroMatch?.[0] ?? null;

  const categories: string[] = [];
  for (const match of html.matchAll(/"categoryName"\s*:\s*"([^"]+)"/gi)) {
    if (!categories.includes(match[1])) {
      categories.push(match[1]);
    }
  }

  const itineraryStops: string[] = [];
  for (const match of html.matchAll(/"pointOfInterestName"\s*:\s*"([^"]+)"/gi)) {
    if (!itineraryStops.includes(match[1])) {
      itineraryStops.push(match[1]);
    }
  }

  const overviewMatch = html.match(/"overview"\s*:\s*"([^"]{50,})"/i);
  const overview = overviewMatch?.[1]?.replace(/\\n/g, " ").trim() ?? null;

  return {
    title,
    priceFrom,
    rating,
    reviewCount,
    duration,
    heroUrl,
    itineraryStops,
    categories,
    overview,
  };
};

const selectProducts = (
  candidates: Record<string, unknown>[],
  targetCount = 20,
  minPremiumShare = 0.5
) => {
  const minPremium = Math.ceil(targetCount * minPremiumShare);
  const selected: Record<string, unknown>[] = [];
  const selectedCodes = new Set<string>();

  const premium = candidates.filter(c => (c.priceFrom as number) > 100);
  const standard = candidates.filter(c => (c.priceFrom as number) <= 100);

  for (const entry of premium) {
    if (selected.length >= targetCount) break;
    selected.push(entry);
    selectedCodes.add(entry.productCode as string);
  }

  const premiumSelected = selected.length;
  if (premiumSelected < minPremium) {
    throw new Error(
      `Only ${premiumSelected} premium (>$100) products available; need ${minPremium}`
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
  const candidates = JSON.parse(
    readFileSync("scripts/honolulu-catalog-products.json", "utf8")
  ) as CatalogEntry[];

  const results: Record<string, unknown>[] = [];
  const rejected: Record<string, unknown>[] = [];

  for (const candidate of candidates) {
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
      const titleRejected =
        extracted.title &&
        (REJECT_TITLE_PATTERN.test(extracted.title) ||
          REJECT_WEAK_PATTERN.test(extracted.title));
      const preferred = PREFERRED_PATTERN.test(
        `${extracted.title ?? ""} ${extracted.categories?.join(" ") ?? ""} ${extracted.overview ?? ""}`
      );

      const entry = {
        productCode: candidate.productCode,
        productUrl: candidate.sourceUrl,
        priceFrom: extracted.priceFrom
          ? `From $${extracted.priceFrom.toFixed(2)}`
          : null,
        rating: extracted.rating,
        reviewCount: extracted.reviewCount ?? 0,
        duration: extracted.duration ?? "TBD (approx.)",
        heroUrl: extracted.heroUrl ?? "",
        overview: extracted.overview,
        itineraryStops: extracted.itineraryStops,
        categories: extracted.categories,
        title: extracted.title,
        available: availability.available,
        availabilityReason: availability.reason,
        preferred,
        priceValue: extracted.priceFrom,
      };

      if (
        availability.available &&
        extracted.title &&
        extracted.priceFrom &&
        extracted.priceFrom > 50 &&
        extracted.heroUrl &&
        !titleRejected
      ) {
        results.push(entry);
        console.log(
          `OK ${candidate.productCode}: ${extracted.title} ($${extracted.priceFrom})`
        );
      } else {
        rejected.push({
          ...entry,
          rejectReasons: {
            titleRejected,
            priceLow: extracted.priceFrom !== null && extracted.priceFrom <= 50,
            noHero: !extracted.heroUrl,
          },
        });
        console.log(
          `SKIP ${candidate.productCode}: available=${availability.available} price=${extracted.priceFrom}`
        );
      }
    } catch (error) {
      rejected.push({
        ...candidate,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`ERR ${candidate.productCode}`);
    }

    await new Promise(resolve => setTimeout(resolve, 450));
  }

  results.sort((a, b) => {
    const preferredA = (a.preferred as boolean) ? 1 : 0;
    const preferredB = (b.preferred as boolean) ? 1 : 0;
    if (preferredB !== preferredA) return preferredB - preferredA;
    const priceA = (a.priceValue as number) ?? 0;
    const priceB = (b.priceValue as number) ?? 0;
    if (priceB !== priceA) return priceB - priceA;
    return ((b.reviewCount as number) ?? 0) - ((a.reviewCount as number) ?? 0);
  });

  const selected = selectProducts(results, 20, 0.5);
  const selectedCodes = selected.map(p => p.productCode);

  writeFileSync(
    "scripts/honolulu-live-product-data.json",
    `${JSON.stringify(
      selected.map(p => ({
        productCode: p.productCode,
        productUrl: p.productUrl,
        title: p.title,
        priceFrom: p.priceFrom,
        rating: p.rating,
        reviewCount: p.reviewCount,
        duration: p.duration,
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

  writeFileSync(
    "scripts/honolulu-viator-discovery-results.json",
    `${JSON.stringify({ available: results, rejected, selectedCodes }, null, 2)}\n`
  );

  const premiumCount = selected.filter(
    p => parseFloat(String(p.priceFrom).replace(/[^\d.]/g, "")) > 100
  ).length;
  console.log(
    `\nQualified: ${results.length}, Selected: ${selected.length}, Over $100 in selection: ${premiumCount}`
  );
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
