import { readFileSync, writeFileSync } from "node:fs";

import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import { engine6ResolvedTours } from "../src/engine6/registry";

const OUTPUT_PATH = "data/merchantFeed.csv";
const SITEMAP_PATH = "public/sitemap-tours.xml";

const REMOVED_PRODUCT_CODES = new Set([
  "265766P9",
  "170406P19",
  "310623P1",
  "318343P2",
]);

const REPLACEMENT_PRODUCT_CODES = [
  "199627P12",
  "422797P4",
  "118887P10",
  "118744P3",
] as const;

const EXCLUDED_PRODUCT_CODES = new Set([
  ...REMOVED_PRODUCT_CODES,
  ...REPLACEMENT_PRODUCT_CODES,
]);

const URL_REPLACEMENTS: Array<[string, string]> = [
  [
    "https://www.alloutdooradventures.com/destinations/utah/zion-national-park/tours/zion-full-day-private-tour-hike-265766P9",
    "https://www.alloutdooradventures.com/destinations/utah/zion-national-park/tours/zion-private-guided-hike-gourmet-picnic-199627P12",
  ],
  [
    "https://www.alloutdooradventures.com/destinations/utah/zion-national-park/tours/private-angels-landing-day-hike-170406P19",
    "https://www.alloutdooradventures.com/destinations/utah/zion-national-park/tours/private-angels-landing-hike-permit-included-422797P4",
  ],
  [
    "https://www.alloutdooradventures.com/destinations/utah/zion-national-park/tours/east-zion-via-ferrata-canyoneering-rappelling-310623P1",
    "https://www.alloutdooradventures.com/destinations/utah/zion-national-park/tours/tallest-utah-via-ferrata-rappelling-118887P10",
  ],
  [
    "https://www.alloutdooradventures.com/destinations/utah/zion-national-park/tours/zion-kolob-ghost-town-slot-canyon-vistas-318343P2",
    "https://www.alloutdooradventures.com/destinations/utah/zion-national-park/tours/peekaboo-slot-canyon-4wd-tour-118744P3",
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
    throw new Error(`Missing resolved Zion replacement tour for ${productCode}`);
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
console.log(`Updated ${OUTPUT_PATH} with ${replacementRows.length} Zion replacements.`);

let sitemap = readFileSync(SITEMAP_PATH, "utf8");
for (const [oldUrl, newUrl] of URL_REPLACEMENTS) {
  sitemap = sitemap.replaceAll(oldUrl, newUrl);
}
writeFileSync(SITEMAP_PATH, sitemap, "utf8");
console.log(`Updated ${SITEMAP_PATH} with ${URL_REPLACEMENTS.length} URL replacements.`);
