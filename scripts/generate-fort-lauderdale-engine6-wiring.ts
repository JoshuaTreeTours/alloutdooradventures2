/**
 * Generates and applies NEW Fort Lauderdale Engine6 wiring from fort-lauderdale-live-product-data.json
 * Run: npx tsx scripts/generate-fort-lauderdale-engine6-wiring.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

import { NEW_FORT_LAUDERDALE_PRODUCT_CODES } from "./fort-lauderdale-new-product-codes";

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

const ROUTES_PATH = "src/engine6/routes.ts";
const VALIDATION_FIXTURES_PATH = "src/engine6/validationFixtures.ts";
const CATALOG_PATH = "scripts/fort-lauderdale-product-catalog.json";
const LIVE_DATA_PATH = "scripts/fort-lauderdale-live-product-data.json";

const ROUTE_PREFIX = "/destinations/florida/fort-lauderdale/tours/";
const ROUTES_INSERT_BEFORE = "export const ENGINE6_MIAMI_PARASAILING_PRODUCT_CODE";
const ROUTE_ENTRIES_INSERT_BEFORE =
  "[\n    ENGINE6_FORT_LAUDERDALE_TROPICAL_KAYAK_ROUTE,\n    ENGINE6_FORT_LAUDERDALE_TROPICAL_KAYAK_PRODUCT_CODE,\n  ],";
const FIXTURE_ENTRIES_INSERT_BEFORE = `  {
    productCode: "89173P10",
    publicUrl:
      "https://www.viator.com/tours/Fort-Lauderdale/Fort-Lauderdales-Tropical-Kayak-Tour-and-Island-Adventure/d660-89173P10",
    rawPayload: specimen89173p10Payload as Record<string, unknown>,
    validationRules: { itineraryOriginalityForNewBuilds: true },
  },`;

const FIXTURE_IMPORTS_INSERT_BEFORE =
  'import specimen89173p10Payload from "../../data/engine6/viator/89173P10.exact-product.json";';

const parsePrice = (raw: string) => {
  const match = raw.match(/([0-9][0-9,]*(?:\.[0-9]{2})?)/);
  return match ? parseFloat(match[1].replace(/,/g, "")) : 0;
};

const slugifyRoute = (title: string, productCode: string) => {
  const base = title
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 55)
    .replace(/-$/, "");
  return `${ROUTE_PREFIX}${base}-${productCode}`;
};

const toConstName = (productCode: string, suffix: string) =>
  `ENGINE6_FORT_LAUDERDALE_${productCode.replace(/[^A-Z0-9]/gi, "_")}_${suffix}`;

const toImportAlias = (productCode: string) =>
  `specimen${productCode.toLowerCase()}Payload`;

const cleanItineraryTitle = (stop: string) =>
  stop
    .replace(/\s*\(Pass By\)\s*$/i, "")
    .replace(/\s*\(pass by\)\s*$/i, "")
    .trim();

const allLive: LiveProduct[] = JSON.parse(readFileSync(LIVE_DATA_PATH, "utf8"));
const products = allLive.filter(p =>
  NEW_FORT_LAUDERDALE_PRODUCT_CODES.includes(
    p.productCode as (typeof NEW_FORT_LAUDERDALE_PRODUCT_CODES)[number]
  )
);

const catalog = products.map(p => ({
  productCode: p.productCode,
  productUrl: p.productUrl,
  title: p.title.replace(/\bMiami\b/gi, "Fort Lauderdale"),
  duration: p.duration,
  priceFrom: parsePrice(p.priceFrom),
  rating: p.rating ?? 5.0,
  reviewCount: p.reviewCount,
  heroUrl: p.heroUrl,
  categories: p.categories,
  itineraryTitles: p.itineraryStops.map(cleanItineraryTitle).filter(Boolean),
}));

writeFileSync(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`);

const routeConsts = products.flatMap(p => {
  const route = slugifyRoute(p.title.replace(/\bMiami\b/gi, "Fort Lauderdale"), p.productCode);
  const codeConst = toConstName(p.productCode, "PRODUCT_CODE");
  const routeConst = toConstName(p.productCode, "ROUTE");
  return [
    `export const ${codeConst} = "${p.productCode}";`,
    `export const ${routeConst} =`,
    `  "${route}";`,
  ];
});

const routeBlock = `${routeConsts.join("\n")}

export const ENGINE6_FORT_LAUDERDALE_TOUR_PATH_PREFIX =
  "${ROUTE_PREFIX}";

export const isEngine6FortLauderdaleTourCanonicalPath = (path: string) =>
  path.startsWith(ENGINE6_FORT_LAUDERDALE_TOUR_PATH_PREFIX);

`;

const routeEntries = products
  .map(p => {
    const routeConst = toConstName(p.productCode, "ROUTE");
    const codeConst = toConstName(p.productCode, "PRODUCT_CODE");
    return `  [\n    ${routeConst},\n    ${codeConst},\n  ],`;
  })
  .join("\n");

let routesContent = readFileSync(ROUTES_PATH, "utf8");

if (!routesContent.includes("ENGINE6_FORT_LAUDERDALE_TOUR_PATH_PREFIX")) {
  routesContent = routesContent.replace(
    ROUTES_INSERT_BEFORE,
    `${routeBlock}${ROUTES_INSERT_BEFORE}`
  );
  routesContent = routesContent.replace(
    ROUTE_ENTRIES_INSERT_BEFORE,
    `${ROUTE_ENTRIES_INSERT_BEFORE}\n${routeEntries}`
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");
  console.log(
    `Applied ${products.length} new Fort Lauderdale route constants and entries.`
  );
} else {
  console.log("Fort Lauderdale path prefix already present in routes.ts.");
}

const fixtureImports = products
  .map(
    p =>
      `import ${toImportAlias(p.productCode)} from "../../data/engine6/viator/${p.productCode}.exact-product.json";`
  )
  .join("\n");

const fixtureEntries = products
  .map(p => {
    return `  {
    productCode: "${p.productCode}",
    publicUrl: "${p.productUrl}",
    rawPayload: ${toImportAlias(p.productCode)} as Record<string, unknown>,
    validationRules: { itineraryOriginalityForNewBuilds: true },
  },`;
  })
  .join("\n");

let fixturesContent = readFileSync(VALIDATION_FIXTURES_PATH, "utf8");

if (!fixturesContent.includes('productCode: "155077P1"')) {
  fixturesContent = fixturesContent.replace(
    FIXTURE_IMPORTS_INSERT_BEFORE,
    `${fixtureImports}\n${FIXTURE_IMPORTS_INSERT_BEFORE}`
  );
  fixturesContent = fixturesContent.replace(
    FIXTURE_ENTRIES_INSERT_BEFORE,
    `${fixtureEntries}\n${FIXTURE_ENTRIES_INSERT_BEFORE}`
  );
  writeFileSync(VALIDATION_FIXTURES_PATH, fixturesContent, "utf8");
  console.log(
    `Applied ${products.length} Fort Lauderdale validation fixture imports and entries.`
  );
} else {
  console.log("Fort Lauderdale validation fixtures already present.");
}

console.log(`Generated wiring for ${products.length} new Fort Lauderdale products.`);
