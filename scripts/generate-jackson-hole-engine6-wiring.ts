/**
 * Generates and applies Jackson Hole Engine6 wiring from jackson-hole-live-product-data.json
 * Run: npx tsx scripts/generate-jackson-hole-engine6-wiring.ts
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
const RATINGS_PATH = "src/engine6/jacksonHoleViatorPublicRatings.ts";
const CATALOG_PATH = "scripts/jackson-hole-product-catalog.json";
const LIVE_DATA_PATH = "scripts/jackson-hole-live-product-data.json";

const ROUTE_PREFIX = "/destinations/wyoming/jackson/tours/";
const ROUTES_INSERT_BEFORE =
  "export const ENGINE6_JACKSON_YELLOWSTONE_GRAND_TETON_PRODUCT_CODE";
const ROUTE_ENTRIES_INSERT_BEFORE =
  "[\n    ENGINE6_JACKSON_YELLOWSTONE_GRAND_TETON_ROUTE,\n    ENGINE6_JACKSON_YELLOWSTONE_GRAND_TETON_PRODUCT_CODE,\n  ],";
const FIXTURE_ENTRIES_INSERT_BEFORE = `  {
    productCode: "6029_4DAYPARK",
    publicUrl:
      "https://www.viator.com/tours/Jackson/4-Day-Yellowstone-and-Grand-Teton-National-Parks-Wildlife-Adventure/d51006-6029_4DAYPARK",
    rawPayload: specimen60294dayparkPayload as Record<string, unknown>,
  },`;

const FIXTURE_IMPORTS_INSERT_BEFORE =
  "import specimen60294dayparkPayload from";

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
  `ENGINE6_JACKSON_HOLE_${productCode.replace(/[^A-Z0-9]/gi, "_")}_${suffix}`;

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

const ratingsTs = `export type JacksonHoleViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Jackson Hole d51006/d5261 Engine6 products. */
export const JACKSON_HOLE_VIATOR_PUBLIC_RATINGS: Record<
  string,
  JacksonHoleViatorPublicRating
> = {
${ratingsEntries}
};

export const JACKSON_HOLE_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  JACKSON_HOLE_VIATOR_PUBLIC_RATINGS
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

export const ENGINE6_JACKSON_HOLE_TOUR_PATH_PREFIX =
  "${ROUTE_PREFIX}";

export const isEngine6JacksonHoleTourCanonicalPath = (path: string) =>
  path.startsWith(ENGINE6_JACKSON_HOLE_TOUR_PATH_PREFIX);

`;

const routeEntries = products
  .map(p => {
    const routeConst = toConstName(p.productCode, "ROUTE");
    const codeConst = toConstName(p.productCode, "PRODUCT_CODE");
    return `  [${routeConst}, ${codeConst}],`;
  })
  .join("\n");

let routesContent = readFileSync(ROUTES_PATH, "utf8");

if (!routesContent.includes("ENGINE6_JACKSON_HOLE_TOUR_PATH_PREFIX")) {
  routesContent = routesContent.replace(
    ROUTES_INSERT_BEFORE,
    `${routeBlock}${ROUTES_INSERT_BEFORE}`
  );
  routesContent = routesContent.replace(
    ROUTE_ENTRIES_INSERT_BEFORE,
    `${routeEntries}\n  ${ROUTE_ENTRIES_INSERT_BEFORE}`
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");
  console.log(
    `Applied ${products.length} Jackson Hole route constants and entries.`
  );
} else {
  console.log("Jackson Hole routes already present in routes.ts.");
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

if (!fixturesContent.includes('productCode: "6029YOFWILD"')) {
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
    `Applied ${products.length} Jackson Hole validation fixture imports and entries.`
  );
} else {
  console.log("Jackson Hole validation fixtures already present.");
}

console.log(`Generated wiring for ${products.length} Jackson Hole products.`);
