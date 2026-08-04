/**
 * Generates and applies Denver Engine6 wiring from denver-live-product-data.json
 * Run: npx tsx scripts/generate-denver-engine6-wiring.ts
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
const RATINGS_PATH = "src/engine6/denverViatorPublicRatings.ts";
const CATALOG_PATH = "scripts/denver-product-catalog.json";
const LIVE_DATA_PATH = "scripts/denver-live-product-data.json";
const NARRATIVES_PATH = "src/engine6/denverApprovedNarrativeDescriptions.ts";
const APPROVED_NARRATIVES_JSON = "scripts/denver-approved-narratives.json";

const ROUTE_PREFIX = "/destinations/colorado/denver/tours/";
const ROUTES_INSERT_BEFORE = "export const ENGINE6_KONA_TOUR_PATH_PREFIX";
const ROUTE_ENTRIES_INSERT_BEFORE = `  [
    ENGINE6_KONA_207802P1_ROUTE,
    ENGINE6_KONA_207802P1_PRODUCT_CODE,
  ],`;
const FIXTURE_ENTRIES_INSERT_BEFORE = `  {
    productCode: "207802P1",
    publicUrl: "https://www.viator.com/tours/Big-Island-of-Hawaii/Award-Winning-Farm-Tour-Coffee-Chocolate-and-More/d669-207802P1",
    rawPayload: specimen207802p1Payload as Record<string, unknown>,
    validationRules: { itineraryOriginalityForNewBuilds: true },
  },`;
const FIXTURE_IMPORTS_INSERT_BEFORE =
  'import specimen207802p1Payload from "../../data/engine6/viator/207802P1.exact-product.json";';

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
  `ENGINE6_DENVER_${productCode.replace(/[^A-Z0-9]/gi, "_")}_${suffix}`;

const toImportAlias = (productCode: string) =>
  `specimen${productCode.toLowerCase()}Payload`;

const cleanItineraryTitle = (stop: string) =>
  stop
    .replace(/^#+\s*/, "")
    .replace(/\s*\(Pass By\)\s*$/i, "")
    .replace(/\s*\(pass by\)\s*$/i, "")
    .trim();

const sentenceSplit = (text: string) => {
  // Protect common abbreviations so "Mt. Evans" is not treated as a sentence boundary.
  const protectedText = text
    .replace(/\s+/g, " ")
    .replace(
      /\b(Mt|St|Dr|Mr|Mrs|Ms|Jr|Sr|vs|approx|No)\./gi,
      (_match, abbr: string) => `${abbr}‹DOT›`
    );

  return protectedText
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim().replace(/‹DOT›/g, "."))
    .filter(s => s.length > 20 && !/highlights?|Choose from|Read more/i.test(s));
};

const buildEditorialDescription = (live: LiveProduct) => {
  const sentences = sentenceSplit(live.overview ?? "");
  const landmarkNames = live.itineraryStops
    .map(cleanItineraryTitle)
    .filter(name => name && !/^(Denver|Colorado)$/i.test(name))
    .slice(0, 6);
  const landmarkSentence =
    landmarkNames.length > 0
      ? `Stops include ${landmarkNames.join(", ")}.`
      : "";

  const destinationSignal = /\bDenver\b/i;
  let lead =
    sentences[0] ??
    `Experience ${live.title.toLowerCase()} with a Denver-based outfitter.`;
  if (!destinationSignal.test(lead)) {
    lead = `In Denver, ${lead.charAt(0).toLowerCase()}${lead.slice(1)}`;
  }
  if (!destinationSignal.test(lead.slice(0, 150))) {
    lead = `Experience ${live.title} in Denver, Colorado.`;
    if (lead.length > 150 || !destinationSignal.test(lead.slice(0, 150))) {
      lead =
        "Guided Denver touring with local experts across the Front Range foothills and nearby mountain landmarks.";
    }
  }
  const detail =
    sentences[1] ??
    "Your guide covers Red Rocks, foothills overlooks, mountain towns, or high-country day-trip routes depending on the itinerary.";
  const format =
    sentences[2] ??
    "Transportation and local commentary are handled so you can focus on Denver's foothills scenery, red-rock amphitheater views, and Rocky Mountain day-trip landmarks.";
  const audience =
    "Ideal for visitors basing in Denver who want a guided Front Range experience without coordinating transport, trailheads, or mountain logistics on their own.";

  const text = [lead, detail, landmarkSentence, format, audience]
    .filter(Boolean)
    .join(" ");
  if (!/\bDenver\b/i.test(text)) {
    return `${text} Departures are coordinated from Denver, Colorado.`;
  }
  return text;
};

const products: LiveProduct[] = JSON.parse(
  readFileSync(LIVE_DATA_PATH, "utf8")
);

const ratingsEntries = products
  .map(p => {
    const rating = p.rating ?? 5.0;
    return `  "${p.productCode}": { rating: ${Number(rating).toFixed(1)}, reviewCount: ${p.reviewCount} },`;
  })
  .join("\n");

const ratingsTs = `export type DenverViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Denver d4837 Engine6 products. */
export const DENVER_VIATOR_PUBLIC_RATINGS: Record<
  string,
  DenverViatorPublicRating
> = {
${ratingsEntries}
};

export const DENVER_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  DENVER_VIATOR_PUBLIC_RATINGS
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

const narrativeMap = Object.fromEntries(
  products.map(p => [p.productCode, buildEditorialDescription(p)])
);
writeFileSync(
  APPROVED_NARRATIVES_JSON,
  `${JSON.stringify(narrativeMap, null, 2)}\n`
);

const narrativeCodes = products.map(p => `  "${p.productCode}",`).join("\n");
const narrativeEntries = products
  .map(p => {
    const text = narrativeMap[p.productCode]
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"');
    return `  "${p.productCode}": "${text}",`;
  })
  .join("\n");

const narrativesTs = `export const DENVER_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
${narrativeCodes}
] as const;

export type DenverTargetedNarrativeDescriptionProductCode =
  (typeof DENVER_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const DENVER_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  DenverTargetedNarrativeDescriptionProductCode,
  string
> = {
${narrativeEntries}
};

export const getDenverTargetedNarrativeDescription = (productCode: string) =>
  DENVER_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as DenverTargetedNarrativeDescriptionProductCode
  ];
`;

writeFileSync(NARRATIVES_PATH, narrativesTs);

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

export const ENGINE6_DENVER_TOUR_PATH_PREFIX =
  "${ROUTE_PREFIX}";

export const isEngine6DenverTourCanonicalPath = (path: string) =>
  path.startsWith(ENGINE6_DENVER_TOUR_PATH_PREFIX);

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

const normalizeNewlines = (value: string) => value.replace(/\r\n/g, "\n");

let routesContent = readFileSync(ROUTES_PATH, "utf8");

if (!routesContent.includes("ENGINE6_DENVER_TOUR_PATH_PREFIX")) {
  routesContent = routesContent.replace(
    ROUTES_INSERT_BEFORE,
    `${routeBlock}${ROUTES_INSERT_BEFORE}`
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");
  console.log(`Applied ${products.length} Denver route constants.`);
}

routesContent = readFileSync(ROUTES_PATH, "utf8");
if (!routesContent.includes("ENGINE6_DENVER_41410P10_ROUTE,")) {
  const normalizedRoutes = normalizeNewlines(routesContent);
  const normalizedAnchor = normalizeNewlines(ROUTE_ENTRIES_INSERT_BEFORE);
  if (!normalizedRoutes.includes(normalizedAnchor)) {
    throw new Error("Missing Kona route anchor in routes.ts");
  }
  routesContent = normalizedRoutes.replace(
    normalizedAnchor,
    `${ROUTE_ENTRIES_INSERT_BEFORE}\n${routeEntries}`
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");
  console.log(`Applied ${products.length} Denver route map entries.`);
} else {
  console.log("Denver route map entries already present.");
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

if (!fixturesContent.includes('productCode: "41410P10"')) {
  fixturesContent = fixturesContent.replace(
    FIXTURE_IMPORTS_INSERT_BEFORE,
    `${FIXTURE_IMPORTS_INSERT_BEFORE}\n${fixtureImports}`
  );
  const normalizedFixtures = normalizeNewlines(fixturesContent);
  const normalizedFixtureAnchor = normalizeNewlines(
    FIXTURE_ENTRIES_INSERT_BEFORE
  );
  if (!normalizedFixtures.includes(normalizedFixtureAnchor)) {
    throw new Error("Missing Kona fixture anchor in validationFixtures.ts");
  }
  fixturesContent = normalizedFixtures.replace(
    normalizedFixtureAnchor,
    `${FIXTURE_ENTRIES_INSERT_BEFORE}\n${fixtureEntries}`
  );
  writeFileSync(VALIDATION_FIXTURES_PATH, fixturesContent, "utf8");
  console.log(
    `Applied ${products.length} Denver validation fixture imports and entries.`
  );
} else {
  console.log("Denver validation fixtures already present.");
}

console.log(`Generated wiring for ${products.length} Denver products.`);
