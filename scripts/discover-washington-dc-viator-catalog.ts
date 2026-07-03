/**
 * One-off discovery: live Viator public page data for Washington DC candidates.
 * Run: npx tsx scripts/discover-washington-dc-viator-catalog.ts
 */
import { writeFileSync } from "node:fs";

import {
  assessViatorPublicPageAvailability,
  fetchViatorPublicPage,
} from "../src/engine6/viatorPublicAvailability";

type Candidate = {
  productCode: string;
  sourceUrl: string;
  experienceType: string;
  commercialTier?: "premium" | "standard";
};

const CANDIDATES: Candidate[] = [
  {
    productCode: "67327P4",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Night-Tour-of-Washington-DC/d657-67327P4",
    experienceType: "private-night-tour",
    commercialTier: "premium",
  },
  {
    productCode: "7953P7",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Private-Night-City-Tour/d657-7953P7",
    experienceType: "private-night-tour",
    commercialTier: "premium",
  },
  {
    productCode: "32453P11",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Private-SUV-Night-Tour-with-Professional-Guide/d657-32453P11",
    experienceType: "private-night-tour",
    commercialTier: "premium",
  },
  {
    productCode: "149066P1",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Luxury-Tour-of-Washington-DC-at-Night-with-a-Chauffeur-Late-Model-SUV/d657-149066P1",
    experienceType: "private-night-tour",
    commercialTier: "premium",
  },
  {
    productCode: "255730P191",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Night-time-Walking-Tour-of-DCs-National-Mall/d657-255730P191",
    experienceType: "private-night-tour",
    commercialTier: "premium",
  },
  {
    productCode: "67327P5",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Mount-Vernon-and-Arlington-Cemetery-Tour/d657-67327P5",
    experienceType: "mount-vernon-arlington",
    commercialTier: "premium",
  },
  {
    productCode: "6349P24",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Small-Group-Mount-Vernon-and-Arlington-National-Cemetery-Tour/d657-6349P24",
    experienceType: "mount-vernon-arlington",
    commercialTier: "premium",
  },
  {
    productCode: "2890P28",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Mt-Vernon-and-Arlington-Cemetery-Tour/d657-2890P28",
    experienceType: "mount-vernon-arlington",
    commercialTier: "premium",
  },
  {
    productCode: "41503P1",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Private-DC-Monuments-at-Night-by-Bike/d657-41503P1",
    experienceType: "bike-tour",
    commercialTier: "premium",
  },
  {
    productCode: "41503P2",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Customized-DC-Sights-Bike-Tour/d657-41503P2",
    experienceType: "bike-tour",
    commercialTier: "premium",
  },
  {
    productCode: "3707SEGWAY",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Segway-Tour/d657-3707SEGWAY",
    experienceType: "segway-tour",
  },
  {
    productCode: "60725P1",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/See-the-City-Segway-Tour/d657-60725P1",
    experienceType: "segway-tour",
  },
  {
    productCode: "40048P18",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Small-Group-Walking-Tour-of-Capitol-Hill/d657-40048P18",
    experienceType: "capitol-hill-tour",
  },
  {
    productCode: "255730P179",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Walking-Tour-of-Capitol-Hill-and-the-National-Mall/d657-255730P179",
    experienceType: "capitol-mall-walking",
    commercialTier: "premium",
  },
  {
    productCode: "5046PATRIOTS",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Hop-On-Hop-Off-Patriots-Trolley-Tour/d657-5046PATRIOTS",
    experienceType: "hop-on-hop-off",
  },
  {
    productCode: "2384P20",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Bike-Tour-of-the-National-Mall/d657-2384P20",
    experienceType: "bike-tour",
  },
  {
    productCode: "2384P1",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Bike-Tour/d657-2384P1",
    experienceType: "bike-tour",
  },
  {
    productCode: "2384P2",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Best-of-Capitol-Hill-Bike-Tour/d657-2384P2",
    experienceType: "bike-tour",
  },
  {
    productCode: "67327P1",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Washington-DC-Day-Tour/d657-67327P1",
    experienceType: "private-city-tour",
    commercialTier: "premium",
  },
  {
    productCode: "67327P2",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Washington-DC-Monuments-Tour/d657-67327P2",
    experienceType: "private-monuments-tour",
    commercialTier: "premium",
  },
  {
    productCode: "67327P3",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Washington-DC-and-Arlington-Cemetery-Tour/d657-67327P3",
    experienceType: "arlington-cemetery",
    commercialTier: "premium",
  },
  {
    productCode: "2890P1",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Arlington-National-Cemetery-Tour/d657-2890P1",
    experienceType: "arlington-cemetery",
  },
  {
    productCode: "2890P2",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Mount-Vernon-Day-Trip-from-Washington-DC/d657-2890P2",
    experienceType: "mount-vernon-day-trip",
    commercialTier: "premium",
  },
  {
    productCode: "40048P1",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-National-Mall-Walking-Tour/d657-40048P1",
    experienceType: "national-mall-walking",
  },
  {
    productCode: "40048P2",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Walking-Tour/d657-40048P2",
    experienceType: "monuments-walking",
  },
  {
    productCode: "40048P3",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-by-Moonlight-Trolley-Tour/d657-40048P3",
    experienceType: "night-trolley",
  },
  {
    productCode: "40048P4",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-at-Night-Trolley-Tour/d657-40048P4",
    experienceType: "night-trolley",
  },
  {
    productCode: "40048P5",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Small-Group-Tour/d657-40048P5",
    experienceType: "small-group-sightseeing",
  },
  {
    productCode: "40048P6",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Bus-Tour/d657-40048P6",
    experienceType: "bus-sightseeing",
  },
  {
    productCode: "40048P7",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Night-Tour/d657-40048P7",
    experienceType: "night-bus-tour",
  },
  {
    productCode: "40048P8",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-Tour/d657-40048P8",
    experienceType: "private-monuments-tour",
    commercialTier: "premium",
  },
  {
    productCode: "40048P9",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-Walking-Tour/d657-40048P9",
    experienceType: "private-walking",
    commercialTier: "premium",
  },
  {
    productCode: "40048P10",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-Bus-Tour/d657-40048P10",
    experienceType: "private-bus-tour",
    commercialTier: "premium",
  },
  {
    productCode: "40048P11",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-Night-Tour/d657-40048P11",
    experienceType: "private-night-tour",
    commercialTier: "premium",
  },
  {
    productCode: "40048P12",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-Day-Tour/d657-40048P12",
    experienceType: "private-day-tour",
    commercialTier: "premium",
  },
  {
    productCode: "40048P13",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-Half-Day-Tour/d657-40048P13",
    experienceType: "private-half-day",
    commercialTier: "premium",
  },
  {
    productCode: "40048P14",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-Full-Day-Tour/d657-40048P14",
    experienceType: "private-full-day",
    commercialTier: "premium",
  },
  {
    productCode: "40048P15",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-Evening-Tour/d657-40048P15",
    experienceType: "private-evening",
    commercialTier: "premium",
  },
  {
    productCode: "40048P16",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-Sunset-Tour/d657-40048P16",
    experienceType: "private-sunset",
    commercialTier: "premium",
  },
  {
    productCode: "40048P17",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-Sunrise-Tour/d657-40048P17",
    experienceType: "private-sunrise",
    commercialTier: "premium",
  },
  {
    productCode: "40048P19",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-Photo-Tour/d657-40048P19",
    experienceType: "private-photo",
    commercialTier: "premium",
  },
  {
    productCode: "40048P20",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-Family-Tour/d657-40048P20",
    experienceType: "private-family",
    commercialTier: "premium",
  },
  {
    productCode: "40048P21",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-Group-Tour/d657-40048P21",
    experienceType: "private-group",
    commercialTier: "premium",
  },
  {
    productCode: "40048P22",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-VIP-Tour/d657-40048P22",
    experienceType: "private-vip",
    commercialTier: "premium",
  },
  {
    productCode: "40048P23",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-Luxury-Tour/d657-40048P23",
    experienceType: "private-luxury",
    commercialTier: "premium",
  },
  {
    productCode: "40048P24",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-Executive-Tour/d657-40048P24",
    experienceType: "private-executive",
    commercialTier: "premium",
  },
  {
    productCode: "40048P25",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-Chauffeur-Tour/d657-40048P25",
    experienceType: "private-chauffeur",
    commercialTier: "premium",
  },
  {
    productCode: "40048P26",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-SUV-Tour/d657-40048P26",
    experienceType: "private-suv",
    commercialTier: "premium",
  },
  {
    productCode: "40048P27",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-Sedan-Tour/d657-40048P27",
    experienceType: "private-sedan",
    commercialTier: "premium",
  },
  {
    productCode: "40048P28",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-Limousine-Tour/d657-40048P28",
    experienceType: "private-limousine",
    commercialTier: "premium",
  },
  {
    productCode: "40048P29",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-Minivan-Tour/d657-40048P29",
    experienceType: "private-minivan",
    commercialTier: "premium",
  },
  {
    productCode: "40048P30",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Private-Sprinter-Tour/d657-40048P30",
    experienceType: "private-sprinter",
    commercialTier: "premium",
  },
];

const extractFromHtml = (html: string) => {
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title = titleMatch?.[1]?.trim().replace(/\s+/g, " ") ?? null;

  const priceMatch =
    html.match(/From[\s$€£¥]*([0-9][0-9,]*(?:\.[0-9]{2})?)/i) ??
    html.match(/"fromPrice"\s*:\s*([0-9.]+)/i) ??
    html.match(/"price"\s*:\s*([0-9.]+)/i);
  const priceFrom = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, "")) : null;

  const ratingMatch =
    html.match(/"combinedAverageRating"\s*:\s*([0-9.]+)/i) ??
    html.match(/"averageRating"\s*:\s*([0-9.]+)/i);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

  const reviewMatch =
    html.match(/"totalReviews"\s*:\s*(\d+)/i) ??
    html.match(/"reviewCount"\s*:\s*(\d+)/i);
  const reviewCount = reviewMatch ? parseInt(reviewMatch[1], 10) : null;

  const durationMatch = html.match(
    /(\d+(?:\s*to\s*\d+)?\s*(?:hours?|minutes?|days?)(?:\s*\d+\s*minutes?)?(?:\s*\(approx\.\))?)/i
  );
  const duration = durationMatch?.[1] ?? null;

  const heroMatch =
    html.match(
      /https:\/\/media\.tacdn\.com\/media\/attractions-splice-spp-674x446\/[^"'\s]+/i
    ) ??
    html.match(
      /https:\/\/media\.tacdn\.com\/media\/attractions-splice-spp-674x446\/r\/[^"'\s]+/i
    );
  const heroUrl = heroMatch?.[0] ?? null;

  const productUrlMatch = html.match(
    /https:\/\/www\.viator\.com\/tours\/Washington-DC\/[^"'\s]+/i
  );
  const resolvedUrl = productUrlMatch?.[0] ?? null;

  const categoryMatches = [
    ...html.matchAll(/"categoryName"\s*:\s*"([^"]+)"/gi),
  ].map(match => match[1]);
  const categories = [...new Set(categoryMatches)].slice(0, 6);

  const rejectAudio =
    /\baudio tour\b|\bself[- ]guided\b|\bgps tour\b|\bapp[- ]based\b/i.test(
      `${title ?? ""} ${html.slice(0, 8000)}`
    );

  return {
    title,
    priceFrom,
    rating,
    reviewCount,
    duration,
    heroUrl,
    resolvedUrl,
    categories,
    rejectAudio,
  };
};

const main = async () => {
  const results: Record<string, unknown>[] = [];
  const rejected: Record<string, unknown>[] = [];

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

      const entry = {
        ...candidate,
        available: availability.available,
        availabilityReason: availability.reason,
        httpStatus: page.httpStatus,
        finalUrl: page.finalUrl,
        ...extracted,
      };

      if (
        availability.available &&
        extracted.title &&
        extracted.priceFrom &&
        !extracted.rejectAudio
      ) {
        results.push(entry);
        console.log(
          `OK ${candidate.productCode}: ${extracted.title} ($${extracted.priceFrom}, ${extracted.reviewCount ?? "?"} reviews)`
        );
      } else {
        rejected.push(entry);
        console.log(
          `SKIP ${candidate.productCode}: available=${availability.available} title=${!!extracted.title} price=${extracted.priceFrom} audio=${extracted.rejectAudio}`
        );
      }
    } catch (error) {
      rejected.push({
        ...candidate,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`ERR ${candidate.productCode}: ${error}`);
    }

    await new Promise(resolve => setTimeout(resolve, 400));
  }

  writeFileSync(
    "scripts/washington-dc-viator-discovery-results.json",
    `${JSON.stringify({ available: results, rejected }, null, 2)}\n`
  );
  console.log(`\nAvailable: ${results.length}, Rejected: ${rejected.length}`);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
