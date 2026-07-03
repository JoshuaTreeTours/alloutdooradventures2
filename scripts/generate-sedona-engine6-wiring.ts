/**
 * Generates Sedona Engine6 wiring artifacts from sedona-live-product-data.json
 * Run: npx tsx scripts/generate-sedona-engine6-wiring.ts
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
  return `/destinations/arizona/sedona/tours/${base}-${productCode}`;
};

const toConstName = (productCode: string, suffix: string) =>
  `ENGINE6_SEDONA_${productCode.replace(/[^A-Z0-9]/gi, "_")}_${suffix}`;

const cleanItineraryTitle = (stop: string) =>
  stop
    .replace(/\s*\(Pass By\)\s*$/i, "")
    .replace(/\s*\(pass by\)\s*$/i, "")
    .trim();

const products: LiveProduct[] = JSON.parse(
  readFileSync("scripts/sedona-live-product-data.json", "utf8")
);

// Ratings file
const ratingsEntries = products
  .map(p => {
    const rating = p.rating ?? 5.0;
    return `  "${p.productCode}": { rating: ${rating}, reviewCount: ${p.reviewCount} },`;
  })
  .join("\n");

const ratingsTs = `export type SedonaViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Sedona d750 Engine6 products. */
export const SEDONA_VIATOR_PUBLIC_RATINGS: Record<
  string,
  SedonaViatorPublicRating
> = {
${ratingsEntries}
};

export const SEDONA_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  SEDONA_VIATOR_PUBLIC_RATINGS
);
`;

writeFileSync("src/engine6/sedonaViatorPublicRatings.ts", ratingsTs);

// Catalog file
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

writeFileSync(
  "scripts/sedona-product-catalog.json",
  `${JSON.stringify(catalog, null, 2)}\n`
);

// Routes snippet
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

const routeEntries = products
  .map(p => {
    const routeConst = toConstName(p.productCode, "ROUTE");
    const codeConst = toConstName(p.productCode, "PRODUCT_CODE");
    return `  [${routeConst}, ${codeConst}],`;
  })
  .join("\n");

writeFileSync(
  "scripts/sedona-routes-snippet.ts",
  `${routeConsts.join("\n")}

export const ENGINE6_SEDONA_TOUR_PATH_PREFIX =
  "/destinations/arizona/sedona/tours/";

export const isEngine6SedonaTourCanonicalPath = (path: string) =>
  path.startsWith(ENGINE6_SEDONA_TOUR_PATH_PREFIX);

// Add to ENGINE6_ROUTE_PRODUCT_CODE_ENTRIES:
/*
${routeEntries}
*/
`
);

// Validation fixtures snippet
const imports = products
  .map(
    p =>
      `import specimen${p.productCode.toLowerCase()}Payload from "../../data/engine6/viator/${p.productCode}.exact-product.json";`
  )
  .join("\n");

const fixtureEntries = products
  .map(p => {
    return `  {
    productCode: "${p.productCode}",
    publicUrl: "${p.productUrl}",
    rawPayload: specimen${p.productCode.toLowerCase()}Payload as Record<string, unknown>,
    validationRules: { itineraryOriginalityForNewBuilds: true },
  },`;
  })
  .join("\n");

writeFileSync(
  "scripts/sedona-validation-fixtures-snippet.ts",
  `// IMPORTS:\n${imports}\n\n// ENTRIES:\n${fixtureEntries}\n`
);

console.log(`Generated wiring for ${products.length} Sedona products.`);
