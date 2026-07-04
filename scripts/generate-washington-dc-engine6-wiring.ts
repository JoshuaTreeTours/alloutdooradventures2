/**
 * Generates and applies Washington D.C. Engine6 wiring from washington-dc-live-product-data.json
 * Run: npx tsx scripts/generate-washington-dc-engine6-wiring.ts
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
const RATINGS_PATH = "src/engine6/washingtonDcViatorPublicRatings.ts";
const CATALOG_PATH = "scripts/washington-dc-product-catalog.json";
const LIVE_DATA_PATH = "scripts/washington-dc-live-product-data.json";

const ROUTE_PREFIX = "/destinations/district-of-columbia/washington/tours/";
const ROUTES_INSERT_BEFORE =
  "export const ENGINE6_GSM_THUNDERING_STREAMS_PRODUCT_CODE";
const ROUTE_ENTRIES_INSERT_BEFORE =
  "[ENGINE6_SEDONA_115255P2_ROUTE, ENGINE6_SEDONA_115255P2_PRODUCT_CODE],";
const FIXTURE_ENTRIES_INSERT_BEFORE = `  {
    productCode: "115255P2",
    publicUrl:
      "https://www.viator.com/tours/Sedona/Hopi-Cultural-and-Archaeological-Tour/d750-115255P2",
    rawPayload: specimen115255p2Payload as Record<string, unknown>,
    validationRules: { itineraryOriginalityForNewBuilds: true },
  },
];`;

const FIXTURE_IMPORTS_INSERT_BEFORE =
  "import specimen26480p10Payload from";

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
  `ENGINE6_WASHINGTON_DC_${productCode.replace(/[^A-Z0-9]/gi, "_")}_${suffix}`;

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

const ratingsTs = `export type WashingtonDcViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Washington D.C. d657 Engine6 products. */
export const WASHINGTON_DC_VIATOR_PUBLIC_RATINGS: Record<
  string,
  WashingtonDcViatorPublicRating
> = {
${ratingsEntries}
};

export const WASHINGTON_DC_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  WASHINGTON_DC_VIATOR_PUBLIC_RATINGS
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

export const ENGINE6_WASHINGTON_DC_TOUR_PATH_PREFIX =
  "${ROUTE_PREFIX}";

export const isEngine6WashingtonDcTourCanonicalPath = (path: string) =>
  path.startsWith(ENGINE6_WASHINGTON_DC_TOUR_PATH_PREFIX);

`;

const routeEntries = products
  .map(p => {
    const routeConst = toConstName(p.productCode, "ROUTE");
    const codeConst = toConstName(p.productCode, "PRODUCT_CODE");
    return `  [${routeConst}, ${codeConst}],`;
  })
  .join("\n");

let routesContent = readFileSync(ROUTES_PATH, "utf8");

if (!routesContent.includes("ENGINE6_WASHINGTON_DC_TOUR_PATH_PREFIX")) {
  routesContent = routesContent.replace(
    ROUTES_INSERT_BEFORE,
    `${routeBlock}${ROUTES_INSERT_BEFORE}`
  );
  routesContent = routesContent.replace(
    ROUTE_ENTRIES_INSERT_BEFORE,
    `${ROUTE_ENTRIES_INSERT_BEFORE}\n${routeEntries}`
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");
  console.log(`Applied ${products.length} Washington D.C. route constants and entries.`);
} else {
  console.log("Washington D.C. routes already present in routes.ts.");
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

if (!fixturesContent.includes('productCode: "67327P4"')) {
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
    `Applied ${products.length} Washington D.C. validation fixture imports and entries.`
  );
} else {
  console.log("Washington D.C. validation fixtures already present.");
}

console.log(`Generated wiring for ${products.length} Washington D.C. products.`);
