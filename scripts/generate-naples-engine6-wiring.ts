/**
 * Generates and applies NEW Naples Engine6 wiring from naples-live-product-data.json
 * Run: npx tsx scripts/generate-naples-engine6-wiring.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

import { NEW_NAPLES_PRODUCT_CODES } from "./naples-new-product-codes";

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
const RATINGS_PATH = "src/engine6/naplesViatorPublicRatings.ts";
const CATALOG_PATH = "scripts/naples-product-catalog.json";
const LIVE_DATA_PATH = "scripts/naples-live-product-data.json";

const ROUTE_PREFIX = "/destinations/florida/naples/tours/";
const ROUTES_INSERT_BEFORE = "export const ENGINE6_MIAMI_PARASAILING_PRODUCT_CODE";
const ROUTE_ENTRIES_INSERT_BEFORE =
  "[ENGINE6_MIAMI_PARASAILING_ROUTE, ENGINE6_MIAMI_PARASAILING_PRODUCT_CODE],";
const FIXTURE_ENTRIES_INSERT_BEFORE = `  {
    productCode: "5546582P1",
    publicUrl:
      "https://www.viator.com/tours/Fort-Lauderdale/Ft-Lauderdale-Parasailing-Along-Ft-Lauderdale-Beach/d660-5546582P1",
    rawPayload: specimen5546582p1Payload as Record<string, unknown>,
    validationRules: { itineraryOriginalityForNewBuilds: true },
  },`;

const FIXTURE_IMPORTS_INSERT_BEFORE =
  'import specimen5546582p1Payload from "../../data/engine6/viator/5546582P1.exact-product.json";';

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
  `ENGINE6_NAPLES_${productCode.replace(/[^A-Z0-9]/gi, "_")}_${suffix}`;

const toImportAlias = (productCode: string) =>
  `specimen${productCode.toLowerCase()}Payload`;

const cleanItineraryTitle = (stop: string) =>
  stop
    .replace(/\s*\(Pass By\)\s*$/i, "")
    .replace(/\s*\(pass by\)\s*$/i, "")
    .trim();

const normalizeNewlines = (value: string) => value.replace(/\r\n/g, "\n");

const allLive: LiveProduct[] = JSON.parse(readFileSync(LIVE_DATA_PATH, "utf8"));
const products = allLive.filter(p =>
  NEW_NAPLES_PRODUCT_CODES.includes(
    p.productCode as (typeof NEW_NAPLES_PRODUCT_CODES)[number]
  )
);

const ratingsEntries = products
  .map(p => {
    const rating = p.rating ?? 5.0;
    return `  "${p.productCode}": { rating: ${rating}, reviewCount: ${p.reviewCount} },`;
  })
  .join("\n");

const ratingsTs = `export const NEW_NAPLES_PRODUCT_CODES = [
${NEW_NAPLES_PRODUCT_CODES.map(code => `  "${code}"`).join(",\n")},
] as const;

export type NaplesViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Naples d22381 Engine6 products. */
export const NAPLES_VIATOR_PUBLIC_RATINGS: Record<
  string,
  NaplesViatorPublicRating
> = {
${ratingsEntries}
};

export const NAPLES_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  NAPLES_VIATOR_PUBLIC_RATINGS
);
`;

writeFileSync(RATINGS_PATH, ratingsTs);

const catalog = products.map(p => ({
  productCode: p.productCode,
  productUrl: p.productUrl,
  title: p.title.replace(/\bFort Myers\b/gi, "Naples"),
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
  const route = slugifyRoute(
    p.title.replace(/\bFort Myers\b/gi, "Naples"),
    p.productCode
  );
  const codeConst = toConstName(p.productCode, "PRODUCT_CODE");
  const routeConst = toConstName(p.productCode, "ROUTE");
  return [
    `export const ${codeConst} = "${p.productCode}";`,
    `export const ${routeConst} =`,
    `  "${route}";`,
  ];
});

const routeBlock = `${routeConsts.join("\n")}

export const ENGINE6_NAPLES_TOUR_PATH_PREFIX =
  "${ROUTE_PREFIX}";

export const isEngine6NaplesTourCanonicalPath = (path: string) =>
  path.startsWith(ENGINE6_NAPLES_TOUR_PATH_PREFIX);

`;

const routeEntries = products
  .map(p => {
    const routeConst = toConstName(p.productCode, "ROUTE");
    const codeConst = toConstName(p.productCode, "PRODUCT_CODE");
    return `  [\n    ${routeConst},\n    ${codeConst},\n  ],`;
  })
  .join("\n");

let routesContent = readFileSync(ROUTES_PATH, "utf8");

if (!routesContent.includes("ENGINE6_NAPLES_TOUR_PATH_PREFIX")) {
  routesContent = routesContent.replace(
    ROUTES_INSERT_BEFORE,
    `${routeBlock}${ROUTES_INSERT_BEFORE}`
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");
  console.log(`Applied ${products.length} Naples route constants.`);
}

routesContent = readFileSync(ROUTES_PATH, "utf8");
if (!routesContent.includes("ENGINE6_NAPLES_293665P1_ROUTE,")) {
  const normalizedRoutes = normalizeNewlines(routesContent);
  const normalizedAnchor = normalizeNewlines(ROUTE_ENTRIES_INSERT_BEFORE);
  if (!normalizedRoutes.includes(normalizedAnchor)) {
    throw new Error("Missing Miami parasailing route anchor in routes.ts");
  }
  routesContent = normalizedRoutes.replace(
    normalizedAnchor,
    `${routeEntries}\n  ${normalizedAnchor}`
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");
  console.log(`Applied ${products.length} Naples route map entries.`);
} else {
  console.log("Naples route map entries already present.");
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

if (!fixturesContent.includes('productCode: "293665P1"')) {
  fixturesContent = fixturesContent.replace(
    FIXTURE_IMPORTS_INSERT_BEFORE,
    `${fixtureImports}\n${FIXTURE_IMPORTS_INSERT_BEFORE}`
  );
  const normalizedFixtures = normalizeNewlines(fixturesContent);
  const normalizedFixtureAnchor = normalizeNewlines(FIXTURE_ENTRIES_INSERT_BEFORE);
  if (!normalizedFixtures.includes(normalizedFixtureAnchor)) {
    throw new Error("Missing Fort Lauderdale fixture anchor in validationFixtures.ts");
  }
  fixturesContent = normalizedFixtures.replace(
    normalizedFixtureAnchor,
    `${fixtureEntries}\n${normalizedFixtureAnchor}`
  );
  writeFileSync(VALIDATION_FIXTURES_PATH, fixturesContent, "utf8");
  console.log(
    `Applied ${products.length} Naples validation fixture imports and entries.`
  );
} else {
  console.log("Naples validation fixtures already present.");
}

console.log(`Generated wiring for ${products.length} new Naples products.`);
