/**
 * Generates and applies Moab Engine6 wiring from moab-live-product-data.json
 * Run: npx tsx scripts/generate-moab-engine6-wiring.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

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
const RATINGS_PATH = "src/engine6/moabViatorPublicRatings.ts";
const CATALOG_PATH = "scripts/moab-product-catalog.json";
const LIVE_DATA_PATH = "scripts/moab-live-product-data.json";

const ROUTE_PREFIX = "/destinations/utah/moab/tours/";
const ROUTES_INSERT_BEFORE =
  "export const ENGINE6_JACKSON_HOLE_6029YOFWILD_PRODUCT_CODE";
const ROUTE_ENTRIES_INSERT_BEFORE =
  `  [
    ENGINE6_JACKSON_HOLE_6029YOFWILD_ROUTE,
    ENGINE6_JACKSON_HOLE_6029YOFWILD_PRODUCT_CODE,
  ],`;
const FIXTURE_ENTRIES_INSERT_BEFORE = `  {
    productCode: "6029YOFWILD",
    publicUrl:
      "https://www.viator.com/tours/Jackson/Yellowstone-National-Park-Small-Group-Wildlife-Safari-by-Jeep/d51006-6029YOFWILD",
    rawPayload: specimen6029yofwildPayload as Record<string, unknown>,
    validationRules: { itineraryOriginalityForNewBuilds: true },
  },`;

const FIXTURE_IMPORTS_INSERT_BEFORE =
  'import specimen6029yofwildPayload from "../../data/engine6/viator/6029YOFWILD.exact-product.json";';

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
  `ENGINE6_MOAB_${productCode.replace(/[^A-Z0-9]/gi, "_")}_${suffix}`;

const toImportAlias = (productCode: string) =>
  `specimen${productCode.toLowerCase()}Payload`;

const cleanItineraryTitle = (stop: string) =>
  stop
    .replace(/\s*\(Pass By\)\s*$/i, "")
    .replace(/\s*\(pass by\)\s*$/i, "")
    .trim();

const products: LiveProduct[] = JSON.parse(
  readFileSync(LIVE_DATA_PATH, "utf8")
);

const ratingsEntries = products
  .map(p => {
    const rating = p.rating ?? 5.0;
    return `  "${p.productCode}": { rating: ${rating}, reviewCount: ${p.reviewCount} },`;
  })
  .join("\n");

const ratingsTs = `export type MoabViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Moab d5600 Engine6 products. */
export const MOAB_VIATOR_PUBLIC_RATINGS: Record<
  string,
  MoabViatorPublicRating
> = {
${ratingsEntries}
};

export const MOAB_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  MOAB_VIATOR_PUBLIC_RATINGS
);
`;

writeFileSync(RATINGS_PATH, ratingsTs);

const catalog = products.map(p => ({
  productCode: p.productCode,
  productUrl: p.productUrl,
  title: p.title,
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
  const route = slugifyRoute(p.title, p.productCode);
  const codeConst = toConstName(p.productCode, "PRODUCT_CODE");
  const routeConst = toConstName(p.productCode, "ROUTE");
  return [
    `export const ${codeConst} = "${p.productCode}";`,
    `export const ${routeConst} =`,
    `  "${route}";`,
  ];
});

const routeBlock = `${routeConsts.join("\n")}

export const ENGINE6_MOAB_TOUR_PATH_PREFIX =
  "${ROUTE_PREFIX}";

export const isEngine6MoabTourCanonicalPath = (path: string) =>
  path.startsWith(ENGINE6_MOAB_TOUR_PATH_PREFIX);

`;

const routeEntries = products
  .map(p => {
    const routeConst = toConstName(p.productCode, "ROUTE");
    const codeConst = toConstName(p.productCode, "PRODUCT_CODE");
    return `  [
    ${routeConst},
    ${codeConst},
  ],`;
  })
  .join("\n");

let routesContent = readFileSync(ROUTES_PATH, "utf8");

if (!routesContent.includes("ENGINE6_MOAB_TOUR_PATH_PREFIX")) {
  routesContent = routesContent.replace(
    ROUTES_INSERT_BEFORE,
    `${routeBlock}${ROUTES_INSERT_BEFORE}`
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");
  console.log(`Applied ${products.length} Moab route constants.`);
}

const normalizeNewlines = (value: string) => value.replace(/\r\n/g, "\n");

routesContent = readFileSync(ROUTES_PATH, "utf8");
if (!routesContent.includes("ENGINE6_MOAB_5555934P1_ROUTE,")) {
  const normalizedRoutes = normalizeNewlines(routesContent);
  const normalizedAnchor = normalizeNewlines(ROUTE_ENTRIES_INSERT_BEFORE);
  if (!normalizedRoutes.includes(normalizedAnchor)) {
    throw new Error("Missing Jackson Hole route anchor in routes.ts");
  }
  routesContent = normalizedRoutes.replace(
    normalizedAnchor,
    `${routeEntries}\n${ROUTE_ENTRIES_INSERT_BEFORE}`
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");
  console.log(`Applied ${products.length} Moab route map entries.`);
} else {
  console.log("Moab route map entries already present.");
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

if (!fixturesContent.includes('productCode: "5555934P1"')) {
  fixturesContent = fixturesContent.replace(
    FIXTURE_IMPORTS_INSERT_BEFORE,
    `${fixtureImports}\n${FIXTURE_IMPORTS_INSERT_BEFORE}`
  );
  const normalizedFixtures = normalizeNewlines(fixturesContent);
  const normalizedFixtureAnchor = normalizeNewlines(FIXTURE_ENTRIES_INSERT_BEFORE);
  if (!normalizedFixtures.includes(normalizedFixtureAnchor)) {
    throw new Error("Missing Jackson Hole fixture anchor in validationFixtures.ts");
  }
  fixturesContent = normalizedFixtures.replace(
    normalizedFixtureAnchor,
    `${fixtureEntries}\n${FIXTURE_ENTRIES_INSERT_BEFORE}`
  );
  writeFileSync(VALIDATION_FIXTURES_PATH, fixturesContent, "utf8");
  console.log(
    `Applied ${products.length} Moab validation fixture imports and entries.`
  );
} else {
  console.log("Moab validation fixtures already present.");
}

console.log(`Generated wiring for ${products.length} Moab products.`);
