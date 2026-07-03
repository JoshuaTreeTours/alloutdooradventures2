import { readFileSync, writeFileSync } from "node:fs";

import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import { engine6ResolvedTours } from "../src/engine6/registry";

const OUTPUT_PATH = "data/merchantFeed.csv";
const SITEMAP_PATH = "public/sitemap-tours.xml";

const REMOVED_PRODUCT_CODES = new Set([
  "32453P11",
  "6349P24",
  "2890P28",
  "5713P68",
  "2384P1",
  "2890P2",
]);

const REPLACEMENT_PRODUCT_CODES = [
  "67327P2",
  "6349P59",
  "6766SIGTOUR",
  "7812P219",
  "2384P20",
  "5769MTVN",
] as const;

const EXCLUDED_PRODUCT_CODES = new Set([
  ...REMOVED_PRODUCT_CODES,
  ...REPLACEMENT_PRODUCT_CODES,
]);

const URL_REPLACEMENTS: Array<[string, string]> = [
  [
    "https://www.alloutdooradventures.com/destinations/district-of-columbia/washington/tours/private-under-the-stars-night-tour-32453P11",
    "https://www.alloutdooradventures.com/destinations/district-of-columbia/washington/tours/private-washington-dc-monuments-tour-67327P2",
  ],
  [
    "https://www.alloutdooradventures.com/destinations/district-of-columbia/washington/tours/small-group-mount-vernon-and-arlington-6349P24",
    "https://www.alloutdooradventures.com/destinations/district-of-columbia/washington/tours/mount-vernon-estate-and-old-town-alexandria-6349P59",
  ],
  [
    "https://www.alloutdooradventures.com/destinations/district-of-columbia/washington/tours/mt-vernon-and-arlington-cemetery-tour-2890P28",
    "https://www.alloutdooradventures.com/destinations/district-of-columbia/washington/tours/dc-in-a-day-monuments-and-potomac-cruise-6766SIGTOUR",
  ],
  [
    "https://www.alloutdooradventures.com/destinations/district-of-columbia/washington/tours/private-dc-food-and-history-h-street-5713P68",
    "https://www.alloutdooradventures.com/destinations/district-of-columbia/washington/tours/washington-dc-secret-food-tours-walking-tasting-7812P219",
  ],
  [
    "https://www.alloutdooradventures.com/destinations/district-of-columbia/washington/tours/monuments-and-memorials-bike-tour-2384P1",
    "https://www.alloutdooradventures.com/destinations/district-of-columbia/washington/tours/washington-dc-bike-tour-of-the-national-mall-2384P20",
  ],
  [
    "https://www.alloutdooradventures.com/destinations/district-of-columbia/washington/tours/mount-vernon-day-trip-2890P2",
    "https://www.alloutdooradventures.com/destinations/district-of-columbia/washington/tours/mount-vernon-and-old-town-alexandria-day-trip-5769MTVN",
  ],
];

const escapeCsv = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const existingCsv = readFileSync(OUTPUT_PATH, "utf8");
const lines = existingCsv.split(/\r?\n/).filter(Boolean);
const header = lines[0];
const keptRows = lines.slice(1).filter(line => {
  const productCode = line.split(",")[0];
  return !EXCLUDED_PRODUCT_CODES.has(productCode);
});

const replacementRows = REPLACEMENT_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(
      `Missing resolved Washington D.C. replacement tour for ${productCode}`
    );
  }

  const row = buildMerchantFeedRowFromProductSchema(tour);
  for (const [key, value] of Object.entries(row)) {
    if (value == null || String(value).trim() === "") {
      throw new Error(`Blank merchant feed field ${key} for ${row.id}`);
    }
  }

  return [
    row.id,
    row.title,
    row.description,
    row.link,
    row.image_link,
    row.availability,
    row.price,
    row.condition,
    row.brand,
    row.average_rating,
    row.rating_count,
    row.review_count,
  ]
    .map(value => escapeCsv(String(value)))
    .join(",");
});

const nextCsv = [header, ...keptRows, ...replacementRows].join("\n") + "\n";
writeFileSync(OUTPUT_PATH, nextCsv, "utf8");
console.log(
  `Updated ${OUTPUT_PATH} with ${replacementRows.length} Washington D.C. replacements.`
);

let sitemap = readFileSync(SITEMAP_PATH, "utf8");
for (const [oldUrl, newUrl] of URL_REPLACEMENTS) {
  sitemap = sitemap.replaceAll(oldUrl, newUrl);
}
writeFileSync(SITEMAP_PATH, sitemap, "utf8");
console.log(
  `Updated ${SITEMAP_PATH} with ${URL_REPLACEMENTS.length} URL replacements.`
);
