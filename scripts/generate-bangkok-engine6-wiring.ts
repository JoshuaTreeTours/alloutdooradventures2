/**
 * Generates and applies Bangkok Engine6 wiring.
 * Run: npx tsx scripts/generate-bangkok-engine6-wiring.ts
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
  itineraryStops: string[];
  categories: string[];
};

const ROUTES_PATH = "src/engine6/routes.ts";
const VALIDATION_FIXTURES_PATH = "src/engine6/validationFixtures.ts";
const CATALOG_PATH = "scripts/bangkok-product-catalog.json";
const LIVE_DATA_PATH = "scripts/bangkok-live-product-data.json";
const SELECTION_PATH = "scripts/bangkok-product-selection.json";
const APPROVED_NARRATIVES_JSON = "scripts/bangkok-approved-narratives.json";
const EDITORIAL_OVERRIDES_PATH = "scripts/bangkok-editorial-overrides.json";

const ROUTE_PREFIX = "/destinations/thailand/bangkok/tours/";
const ROUTES_INSERT_BEFORE = "export const ENGINE6_KYOTO_92136P55_PRODUCT_CODE";
const ROUTE_ENTRIES_INSERT_BEFORE = `  [
    ENGINE6_KYOTO_92136P55_ROUTE,
    ENGINE6_KYOTO_92136P55_PRODUCT_CODE,
  ],`;
const FIXTURE_ENTRIES_INSERT_BEFORE = `  {
    productCode: "92136P55",
    publicUrl: "https://www.viator.com/tours/Kyoto/Kyoto-Full-day-Private-Custom-Tour-with-National-Licensed-Guide/d332-92136P55",
    rawPayload: specimen92136p55Payload as Record<string, unknown>,
    validationRules: { itineraryOriginalityForNewBuilds: true },
  },`;
const FIXTURE_IMPORTS_INSERT_BEFORE =
  'import specimen92136p55Payload from "../../data/engine6/viator/92136P55.exact-product.json";';

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
  `ENGINE6_BANGKOK_${productCode.replace(/[^A-Z0-9]/gi, "_")}_${suffix}`;

const toImportAlias = (productCode: string) =>
  `specimen${productCode.toLowerCase()}Payload`;

const cleanItineraryTitle = (stop: string) =>
  stop
    .replace(/^#+\s*/, "")
    .replace(/\s*\(Pass By\)\s*$/i, "")
    .replace(/\s*\(pass by\)\s*$/i, "")
    .trim();

const selection = JSON.parse(readFileSync(SELECTION_PATH, "utf8")) as {
  selectedProductCodes: string[];
};
const allProducts: LiveProduct[] = JSON.parse(
  readFileSync(LIVE_DATA_PATH, "utf8")
);
const products = selection.selectedProductCodes.map(code => {
  const product = allProducts.find(entry => entry.productCode === code);
  if (!product) {
    throw new Error(`Missing live product data for selected code ${code}`);
  }
  return product;
});

const EDITORIAL_OVERRIDES = JSON.parse(
  readFileSync(EDITORIAL_OVERRIDES_PATH, "utf8")
) as Record<string, string>;

writeFileSync(
  APPROVED_NARRATIVES_JSON,
  `${JSON.stringify(EDITORIAL_OVERRIDES, null, 2)}\n`
);

const catalog = products.map(product => ({
  productCode: product.productCode,
  productUrl: product.productUrl,
  title: product.title,
  duration: product.duration,
  priceFrom: parsePrice(product.priceFrom),
  rating: product.rating ?? 5.0,
  reviewCount: product.reviewCount,
  heroUrl: product.heroUrl,
  categories: product.categories,
  itineraryTitles: product.itineraryStops
    .map(cleanItineraryTitle)
    .filter(Boolean),
}));

writeFileSync(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`);

const routeConsts = products.flatMap(product => {
  const route = slugifyRoute(product.title, product.productCode);
  const codeConst = toConstName(product.productCode, "PRODUCT_CODE");
  const routeConst = toConstName(product.productCode, "ROUTE");
  return [
    `export const ${codeConst} = "${product.productCode}";`,
    `export const ${routeConst} =`,
    `  "${route}";`,
  ];
});

const routeBlock = `${routeConsts.join("\n")}

export const ENGINE6_BANGKOK_TOUR_PATH_PREFIX =
  "${ROUTE_PREFIX}";

export const isEngine6BangkokTourCanonicalPath = (
  path: string
) => path.startsWith(ENGINE6_BANGKOK_TOUR_PATH_PREFIX);

`;

const routeEntries = products
  .map(product => {
    const routeConst = toConstName(product.productCode, "ROUTE");
    const codeConst = toConstName(product.productCode, "PRODUCT_CODE");
    return `  [
    ${routeConst},
    ${codeConst},
  ],`;
  })
  .join("\n");

const normalizeNewlines = (value: string) => value.replace(/\r\n/g, "\n");

let routesContent = readFileSync(ROUTES_PATH, "utf8");

if (!routesContent.includes("ENGINE6_BANGKOK_TOUR_PATH_PREFIX")) {
  if (!routesContent.includes(ROUTES_INSERT_BEFORE)) {
    throw new Error("Missing Kyoto route constant anchor in routes.ts");
  }
  routesContent = routesContent.replace(
    ROUTES_INSERT_BEFORE,
    `${routeBlock}${ROUTES_INSERT_BEFORE}`
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");
  console.log(`Applied ${products.length} Bangkok route constants.`);
}

routesContent = readFileSync(ROUTES_PATH, "utf8");
if (
  !routesContent.includes(
    `ENGINE6_BANGKOK_${products[0].productCode.replace(/[^A-Z0-9]/gi, "_")}_ROUTE,`
  )
) {
  const normalizedRoutes = normalizeNewlines(routesContent);
  const normalizedAnchor = normalizeNewlines(ROUTE_ENTRIES_INSERT_BEFORE);
  if (!normalizedRoutes.includes(normalizedAnchor)) {
    throw new Error("Missing Kyoto route map anchor in routes.ts");
  }
  routesContent = normalizedRoutes.replace(
    normalizedAnchor,
    `${routeEntries}\n${ROUTE_ENTRIES_INSERT_BEFORE}`
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");
  console.log(`Applied ${products.length} Bangkok route map entries.`);
} else {
  console.log("Bangkok route map entries already present.");
}

const fixtureImports = products
  .map(
    product =>
      `import ${toImportAlias(product.productCode)} from "../../data/engine6/viator/${product.productCode}.exact-product.json";`
  )
  .join("\n");

const fixtureEntries = products
  .map(
    product => `  {
    productCode: "${product.productCode}",
    publicUrl: "${product.productUrl}",
    rawPayload: ${toImportAlias(product.productCode)} as Record<string, unknown>,
    validationRules: { itineraryOriginalityForNewBuilds: true },
  },`
  )
  .join("\n");

let fixturesContent = readFileSync(VALIDATION_FIXTURES_PATH, "utf8");

if (!fixturesContent.includes(`productCode: "${products[0].productCode}"`)) {
  if (!fixturesContent.includes(FIXTURE_IMPORTS_INSERT_BEFORE)) {
    throw new Error(
      "Missing Kyoto fixture import anchor in validationFixtures.ts"
    );
  }
  fixturesContent = fixturesContent.replace(
    FIXTURE_IMPORTS_INSERT_BEFORE,
    `${fixtureImports}\n${FIXTURE_IMPORTS_INSERT_BEFORE}`
  );
  const normalizedFixtures = normalizeNewlines(fixturesContent);
  const normalizedFixtureAnchor = normalizeNewlines(
    FIXTURE_ENTRIES_INSERT_BEFORE
  );
  if (!normalizedFixtures.includes(normalizedFixtureAnchor)) {
    throw new Error(
      "Missing Kyoto fixture entry anchor in validationFixtures.ts"
    );
  }
  fixturesContent = normalizedFixtures.replace(
    normalizedFixtureAnchor,
    `${fixtureEntries}\n${FIXTURE_ENTRIES_INSERT_BEFORE}`
  );
  writeFileSync(VALIDATION_FIXTURES_PATH, fixturesContent, "utf8");
  console.log(
    `Applied ${products.length} Bangkok validation fixture imports and entries.`
  );
} else {
  console.log("Bangkok validation fixtures already present.");
}

console.log(`Generated wiring for ${products.length} Bangkok products.`);
