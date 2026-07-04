/**
 * Generates and applies Boston Engine6 wiring from boston-live-product-data.json
 * Run: npx tsx scripts/generate-boston-engine6-wiring.ts
 * Refresh: npx tsx scripts/generate-boston-engine6-wiring.ts --refresh
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
const RATINGS_PATH = "src/engine6/bostonViatorPublicRatings.ts";
const CATALOG_PATH = "scripts/boston-product-catalog.json";
const LIVE_DATA_PATH = "scripts/boston-live-product-data.json";

const ROUTE_PREFIX = "/destinations/massachusetts/boston/tours/";
const ROUTES_INSERT_BEFORE =
  "export const ENGINE6_GSM_THUNDERING_STREAMS_PRODUCT_CODE";
const ROUTE_ENTRIES_INSERT_BEFORE =
  "[ENGINE6_CHICAGO_7812P19_ROUTE, ENGINE6_CHICAGO_7812P19_PRODUCT_CODE],";
const FIXTURE_ENTRIES_INSERT_BEFORE = `  {
    productCode: "7812P19",
    publicUrl: "https://www.viator.com/tours/Chicago/Small-Group-Chicago-Loop-Food-Walking-Tour/d673-7812P19",
    rawPayload: specimen7812p19Payload as Record<string, unknown>,
    validationRules: { itineraryOriginalityForNewBuilds: true },
  },  {
    productCode: "5769MTVN",
    publicUrl:
      "https://www.viator.com/tours/Washington-DC/Mt-Vernon-and-Old-Town-Alexandria-Day-Trip-from-Washington-DC/d657-5769MTVN",
    rawPayload: specimen5769mtvnPayload as Record<string, unknown>,
    validationRules: { itineraryOriginalityForNewBuilds: true },
  },
];`;

const FIXTURE_IMPORTS_INSERT_BEFORE =
  "import specimen26480p10Payload from";

const BOSTON_ONLY_PRODUCT_CODES =
  /3283BWW|3283SSCRUISE|44921P7|3037DUCK|66111P3|26797P4|8843P7|7167P68|5046BOS_OTT|7812P131|8841P14|400049P3|8647P466|400049P5|385595P5|5046BOS_GG|3283CODZILLA|3978TOUR5|5042BOSDIN|5151BOSCY014|66192P8|255730P225/;

const stripBostonWiring = () => {
  let routesContent = readFileSync(ROUTES_PATH, "utf8");
  routesContent = routesContent.replace(
    /export const ENGINE6_BOSTON_[\s\S]*?export const isEngine6BostonTourCanonicalPath[\s\S]*?\n\n/,
    ""
  );
  routesContent = routesContent.replace(
    /\n  \[ENGINE6_BOSTON_[^\]]+\],/g,
    ""
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");

  let fixturesContent = readFileSync(VALIDATION_FIXTURES_PATH, "utf8");
  fixturesContent = fixturesContent.replace(
    /\r?\n  \{\r?\n    productCode: "[^"]+",[\s\S]*?\/d678-[^"]+[\s\S]*?validationRules: \{ itineraryOriginalityForNewBuilds: true \},\r?\n  \},/g,
    ""
  );
  fixturesContent = fixturesContent.replace(
    new RegExp(
      `^import specimen(${BOSTON_ONLY_PRODUCT_CODES.source})Payload[^\n]+\\n`,
      "gim"
    ),
    ""
  );
  writeFileSync(VALIDATION_FIXTURES_PATH, fixturesContent, "utf8");
  console.log("Stripped existing Boston Engine6 wiring.");
};

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
  `ENGINE6_BOSTON_${productCode.replace(/[^A-Z0-9]/gi, "_")}_${suffix}`;

const toImportAlias = (productCode: string) =>
  `specimen${productCode.toLowerCase()}Payload`;

const cleanItineraryTitle = (stop: string) =>
  stop
    .replace(/\s*\(Pass By\)\s*$/i, "")
    .replace(/\s*\(pass by\)\s*$/i, "")
    .trim();

if (process.argv.includes("--refresh")) {
  stripBostonWiring();
}

const products: LiveProduct[] = JSON.parse(
  readFileSync(LIVE_DATA_PATH, "utf8")
);

const ratingsEntries = products
  .map(p => {
    const rating = p.rating ?? 5.0;
    return `  "${p.productCode}": { rating: ${rating}, reviewCount: ${p.reviewCount} },`;
  })
  .join("\n");

const ratingsTs = `export type BostonViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Boston d678 Engine6 products. */
export const BOSTON_VIATOR_PUBLIC_RATINGS: Record<
  string,
  BostonViatorPublicRating
> = {
${ratingsEntries}
};

export const BOSTON_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  BOSTON_VIATOR_PUBLIC_RATINGS
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

export const ENGINE6_BOSTON_TOUR_PATH_PREFIX =
  "${ROUTE_PREFIX}";

export const isEngine6BostonTourCanonicalPath = (path: string) =>
  path.startsWith(ENGINE6_BOSTON_TOUR_PATH_PREFIX);

`;

const routeEntries = products
  .map(p => {
    const routeConst = toConstName(p.productCode, "ROUTE");
    const codeConst = toConstName(p.productCode, "PRODUCT_CODE");
    return `  [${routeConst}, ${codeConst}],`;
  })
  .join("\n");

const refresh = process.argv.includes("--refresh");

let routesContent = readFileSync(ROUTES_PATH, "utf8");

if (refresh || !routesContent.includes("ENGINE6_BOSTON_TOUR_PATH_PREFIX")) {
  routesContent = routesContent.replace(
    ROUTES_INSERT_BEFORE,
    `${routeBlock}${ROUTES_INSERT_BEFORE}`
  );
  routesContent = routesContent.replace(
    ROUTE_ENTRIES_INSERT_BEFORE,
    `${ROUTE_ENTRIES_INSERT_BEFORE}\n${routeEntries}`
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");
  console.log(`Applied ${products.length} Boston route constants and entries.`);
} else {
  console.log("Boston routes already present in routes.ts.");
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

if (refresh || !fixturesContent.includes('productCode: "3283BWW"')) {
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
    `Applied ${products.length} Boston validation fixture imports and entries.`
  );
} else {
  console.log("Boston validation fixtures already present.");
}

console.log(`Generated wiring for ${products.length} Boston products.`);
