import { readFileSync, writeFileSync } from "node:fs";

import catalog from "./moab-catalog-products.json";

/** DOM extraction for Moab Viator product pages (Glass browser / Browser MCP). */
export const EXTRACT_MOAB_PRODUCT_JS = `(() => {
  const html = document.documentElement.innerHTML;
  const hero =
    (html.match(/https:\\/\\/media\\.tacdn\\.com\\/media\\/attractions-splice-spp-674x446\\/[^"'\\s]+/i) ||
      [])[0] ||
    document.querySelector('img[src*="attractions-splice-spp-674x446"]')?.getAttribute("src") ||
    null;
  const title = document.querySelector("h1")?.textContent?.trim().replace(/\\s+/g, " ") || null;
  const priceHeading = [...document.querySelectorAll("h2")].find(h =>
    /^From \\$/.test(h.textContent || "")
  );
  const priceText = priceHeading?.textContent?.match(/\\$([0-9][0-9,]*(?:\\.[0-9]{2})?)/);
  const price = priceText ? parseFloat(priceText[1].replace(/,/g, "")) : null;
  const reviewBtn = [...document.querySelectorAll("button")].find(b =>
    /Reviews/i.test(b.textContent || "")
  );
  const reviewMatch = reviewBtn?.textContent?.match(/([0-9][0-9,]*)\\s+Reviews/i);
  const reviewCount = reviewMatch
    ? parseInt(reviewMatch[1].replace(/,/g, ""), 10)
    : null;
  const ratingMatch = document.body.textContent?.match(
    /([0-9]\\.[0-9])\\s*\\([0-9,]+\\s+Reviews/i
  );
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
  const durationLi = [...document.querySelectorAll("li")]
    .map(li => li.textContent?.trim())
    .find(
      t =>
        /hours?|minutes?|days?/i.test(t || "") && /approx/i.test(t || "")
    );
  const duration =
    durationLi ||
    [...document.querySelectorAll("li")]
      .map(li => li.textContent?.trim())
      .find(t =>
        /\\d+\\s*(?:to\\s*\\d+\\s*)?(?:hours?|minutes?|days?)/i.test(t || "")
      ) ||
    null;
  const overviewSection = [...document.querySelectorAll("h2")].find(
    h => h.textContent === "Overview"
  );
  let overview = "";
  if (overviewSection) {
    const parent = overviewSection.parentElement;
    overview = (parent?.textContent || "")
      .replace("Overview", "")
      .trim()
      .slice(0, 800);
  }
  const highlights: string[] = [];
  if (overviewSection) {
    for (const li of overviewSection.parentElement?.querySelectorAll("li") || []) {
      const t = li.textContent?.trim();
      if (t && t.length > 15 && t.length < 140) highlights.push(t);
    }
  }
  const itineraryHeading = [...document.querySelectorAll("h2")].find(
    h => h.textContent === "Itinerary"
  );
  const stops: string[] = [];
  if (itineraryHeading) {
    let el = itineraryHeading.nextElementSibling;
    while (el) {
      const h3s = el.querySelectorAll ? el.querySelectorAll("h3") : [];
      for (const h3 of h3s) {
        const t = h3.textContent?.trim();
        if (
          t &&
          !["Pickup points", "Pickup details", "Arranged start time"].includes(t)
        ) {
          stops.push(t);
        }
      }
      if (stops.length) break;
      el = el.nextElementSibling;
    }
    if (!stops.length) {
      let capture = false;
      for (const h of [...document.querySelectorAll("h2,h3")]) {
        if (h.textContent === "Itinerary") {
          capture = true;
          continue;
        }
        if (capture && h.tagName === "H2") break;
        if (capture && h.tagName === "H3") stops.push(h.textContent?.trim() || "");
      }
    }
  }
  for (const match of html.matchAll(
    /"pointOfInterestName"\\s*:\\s*"([^"]+)"/gi
  )) {
    if (!stops.includes(match[1])) stops.push(match[1]);
  }
  const meetingHeading = [...document.querySelectorAll("h2")].find(
    h => h.textContent === "Meeting and Pickup"
  );
  let startDescription = "";
  if (meetingHeading) {
    const details = [...document.querySelectorAll("h3")].find(
      h => h.textContent === "Pickup details"
    );
    startDescription =
      details?.nextElementSibling?.textContent?.trim() ||
      meetingHeading.parentElement
        ?.textContent?.replace("Meeting and Pickup", "")
        .trim()
        .slice(0, 300) ||
      "";
  }
  const inclusions: string[] = [];
  const inclHeading = [...document.querySelectorAll("h2")].find(
    h => h.textContent === "What's Included"
  );
  if (inclHeading) {
    for (const li of inclHeading.parentElement?.querySelectorAll("li") || []) {
      const t = li.textContent?.trim();
      if (t) inclusions.push(t);
    }
  }
  const categories = [
    ...new Set(
      [...document.querySelectorAll("a")]
        .map(a => a.textContent?.trim())
        .filter(
          t =>
            t &&
            /Tours|Rafting|4x4|Jeep|UTV|ATV|Hiking|Private|National Park|Photography|Canyoneering|Scenic|Day Trip|Off-Road|River/i.test(
              t
            )
        )
        .slice(0, 6)
    ),
  ];
  return JSON.stringify({
    productCode: (location.href.match(/d\\d+-([A-Z0-9_]+)/i) || [])[1],
    productUrl: location.href.split("?")[0],
    title,
    priceFrom: price ? "From $" + price.toFixed(2) : null,
    price,
    rating,
    reviewCount,
    duration,
    heroUrl: hero,
    overview: overview.slice(0, 800),
    highlights: highlights.slice(0, 5),
    itineraryStops: stops
      .filter(s => s && !/Review|Response from Host/i.test(s))
      .slice(0, 10),
    startDescription: startDescription.slice(0, 300),
    endDescription:
      "Return to your Moab pickup location or meeting point after the final stop on the itinerary.",
    inclusions: inclusions.slice(0, 6),
    categories: categories.length
      ? categories
      : ["Sightseeing Tours", "Outdoor Activities"],
  });
})()`;

const CATEGORY_MAP: Record<string, string[]> = {
  "5555934P1": ["4WD Tours", "UTV Tours", "Off-Road Tours"],
  "7016P4": ["National Parks", "Sightseeing Tours", "4WD Tours"],
  "7016OFFROAD": ["4WD Tours", "Off-Road Tours", "Adventure Tours"],
  "22803P18": ["River Rafting & Tubing", "Adventure Tours", "Outdoor Activities"],
  "132679P2": ["4WD Tours", "Sunset Tours", "Off-Road Tours"],
  "5555934P2": ["UTV Tours", "4WD Tours", "Adventure Tours"],
  "22803P33": ["National Parks", "Day Trips", "Sightseeing Tours"],
  "6896MOABCPARK": ["National Parks", "Day Trips", "Sightseeing Tours"],
  "349715P2": ["4WD Tours", "Adventure Tours", "Off-Road Tours"],
  "458439P2": ["Private Tours", "Hiking Tours", "Photography Tours"],
  "334588P4": ["National Parks", "Sunset Tours", "Sightseeing Tours"],
  "132679P1": ["4WD Tours", "Off-Road Tours", "Adventure Tours"],
  "6896MOABAPARK": ["National Parks", "4WD Tours", "Adventure Tours"],
  "349715P3": ["4WD Tours", "Sunset Tours", "Off-Road Tours"],
  "349715P1": ["UTV Tours", "4WD Tours", "Adventure Tours"],
  "18497P15": ["Day Trips", "National Parks", "Private Tours"],
  "16649P13": ["River Rafting & Tubing", "Adventure Tours", "Outdoor Activities"],
  "131994P3": ["UTV Tours", "4WD Tours", "Off-Road Tours"],
  "334588P3": ["National Parks", "4WD Tours", "Day Trips"],
  "252408P1": ["UTV Tours", "ATV Tours", "Adventure Tours"],
  "349715P4": ["UTV Tours", "Sunset Tours", "Off-Road Tours"],
  "16847P11": ["River Rafting & Tubing", "White Water Rafting", "Adventure Tours"],
  "260792P5": ["ATV Tours", "Sunset Tours", "Off-Road Tours"],
  "165224P7": ["River Rafting & Tubing", "White Water Rafting", "Adventure Tours"],
  "169760P14": ["Private Tours", "Hiking Tours", "Day Trips"],
  "265766P59": ["Private Tours", "National Parks", "Hiking Tours"],
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

type CatalogEntry = { productCode: string; sourceUrl: string };

const extracts = JSON.parse(
  readFileSync("scripts/moab-browser-extracts.json", "utf8")
) as BrowserExtract[];

const merged = extracts.map(row => {
  const price = row.price ?? 0;
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
  "scripts/moab-live-product-data.json",
  `${JSON.stringify(merged, null, 2)}\n`
);

const catalogRows = catalog as CatalogEntry[];
writeFileSync(
  "scripts/moab-product-catalog.json",
  `${JSON.stringify(
    merged.map(row => ({
      productCode: row.productCode,
      productUrl: row.productUrl,
      title: row.title,
      duration: row.duration,
      priceFrom: parseFloat(row.priceFrom.replace(/[^\d.]/g, "")),
      rating: row.rating ?? 5,
      reviewCount: row.reviewCount,
      heroUrl: row.heroUrl,
      categories: row.categories,
      itineraryTitles: row.itineraryStops,
    })),
    null,
    2
  )}\n`
);

console.log(`Merged ${merged.length} Moab browser extracts into live-product-data.`);
