import { readFileSync, writeFileSync } from "node:fs";

import catalog from "./jackson-hole-catalog-products.json";

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
  inclusions: string[];
};

const CATALOG_PRICE: Record<string, number> = Object.fromEntries(
  (catalog as { productCode: string; price: number }[]).map(p => [
    p.productCode,
    p.price,
  ])
);

const CATEGORY_MAP: Record<string, string[]> = {
  "6029YOFWILD": ["Day Trips", "Wildlife Tours", "National Parks"],
  "6029WILDSAF": ["Wildlife Tours", "Safaris", "National Parks"],
  "15073P5": ["Day Trips", "Sightseeing Tours", "National Parks"],
  "156172P2": ["Wildlife Tours", "Sunset Tours", "National Parks"],
  "156172P1": ["Wildlife Tours", "Sunrise Tours", "National Parks"],
  "6252SCENIC": ["Rafting", "Wildlife Tours", "Scenic Floats"],
  "38400P2": ["Horseback Riding", "Outdoor Activities"],
  "6252P5": ["Rafting", "White Water Rafting"],
  "15073P1": ["Rafting", "Scenic Floats", "Wildlife Tours"],
  "15073P6": ["Day Trips", "National Parks", "Wildlife Tours"],
  "320113P1": ["Rafting", "Scenic Floats", "Wildlife Tours"],
  "15739P3": ["Rafting", "White Water Rafting"],
  "56481P3": ["Rafting", "Scenic Floats", "Wildlife Tours"],
  "35441P2": ["Day Trips", "National Parks", "Sightseeing Tours"],
  "35441P1": ["Day Trips", "National Parks", "Wildlife Tours"],
  "460738P6": ["Wildlife Tours", "Safaris", "National Parks"],
  "342881P1": ["Horseback Riding", "Outdoor Activities"],
  "38400P8": ["Horseback Riding", "Food Tours"],
  "6029WINTER": ["Wildlife Tours", "Winter Tours", "National Parks"],
  "156172P5": ["Private Tours", "Wildlife Tours", "National Parks"],
};

const extracts = JSON.parse(
  readFileSync("scripts/jackson-hole-browser-extracts.json", "utf8")
) as BrowserExtract[];

const merged = extracts.map(row => {
  const price =
    row.price ?? CATALOG_PRICE[row.productCode] ?? 0;
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
    categories: CATEGORY_MAP[row.productCode] ?? ["Sightseeing Tours"],
  };
});

writeFileSync(
  "scripts/jackson-hole-live-product-data.json",
  `${JSON.stringify(merged, null, 2)}\n`
);
console.log(`Merged ${merged.length} Jackson Hole live product rows.`);
