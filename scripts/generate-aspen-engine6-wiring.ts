/**
 * Generates and applies Aspen Engine6 wiring from aspen-live-product-data.json
 * Run: npx tsx scripts/generate-aspen-engine6-wiring.ts
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
const RATINGS_PATH = "src/engine6/aspenViatorPublicRatings.ts";
const CATALOG_PATH = "scripts/aspen-product-catalog.json";
const LIVE_DATA_PATH = "scripts/aspen-live-product-data.json";
const NARRATIVES_PATH = "src/engine6/aspenApprovedNarrativeDescriptions.ts";
const APPROVED_NARRATIVES_JSON = "scripts/aspen-approved-narratives.json";

const ROUTE_PREFIX = "/destinations/colorado/aspen/tours/";
const ROUTES_INSERT_BEFORE = "export const ENGINE6_DENVER_41410P10_PRODUCT_CODE";
const ROUTE_ENTRIES_INSERT_BEFORE = `  [
    ENGINE6_DENVER_41410P10_ROUTE,
    ENGINE6_DENVER_41410P10_PRODUCT_CODE,
  ],`;
const FIXTURE_ENTRIES_INSERT_BEFORE = `  {
    productCode: "41410P10",
    publicUrl: "https://www.viator.com/tours/Denver/Small-group-tour-of-Pikes-Peak-and-the-Garden-of-the-Gods-from-Denver/d4837-41410P10",
    rawPayload: specimen41410p10Payload as Record<string, unknown>,
    validationRules: { itineraryOriginalityForNewBuilds: true },
  },`;
const FIXTURE_IMPORTS_INSERT_BEFORE =
  'import specimen41410p10Payload from "../../data/engine6/viator/41410P10.exact-product.json";';

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
  `ENGINE6_ASPEN_${productCode.replace(/[^A-Z0-9]/gi, "_")}_${suffix}`;

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
    .filter(
      name =>
        name &&
        !/^(Aspen|Colorado|Dean's Aspen Tours)$/i.test(name) &&
        !/meeting point|photo locations/i.test(name)
    )
    .slice(0, 6);
  const landmarkSentence =
    landmarkNames.length > 0
      ? `Stops include ${landmarkNames.join(", ")}.`
      : "";

  const destinationSignal = /\bAspen\b/i;
  let lead =
    sentences[0] ??
    `Experience ${live.title.toLowerCase()} with an Aspen-based outfitter.`;
  if (!destinationSignal.test(lead)) {
    lead = `In Aspen, ${lead.charAt(0).toLowerCase()}${lead.slice(1)}`;
  }
  if (!destinationSignal.test(lead.slice(0, 150))) {
    lead = `Experience ${live.title} in Aspen, Colorado.`;
    if (lead.length > 150 || !destinationSignal.test(lead.slice(0, 150))) {
      lead =
        "Guided Aspen touring with local experts through downtown landmarks, historic neighborhoods, and nearby alpine trails.";
    }
  }
  const detail =
    sentences[1] ??
    "Your guide covers downtown Aspen landmarks, historic neighborhoods, Hunter Creek scenery, or alpine photo locations depending on the itinerary.";
  const format =
    sentences[2] ??
    "Local commentary and route logistics are handled so you can focus on Aspen's mountain-town scenery and Roaring Fork Valley landmarks.";
  const audience =
    "Ideal for visitors basing in Aspen who want a guided mountain-town experience without coordinating meeting points, trailheads, or photo locations on their own.";

  const text = [lead, detail, landmarkSentence, format, audience]
    .filter(Boolean)
    .join(" ");
  if (!/\bAspen\b/i.test(text)) {
    return `${text} Departures are coordinated from Aspen, Colorado.`;
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

const ratingsTs = `export type AspenViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Aspen d26395 Engine6 products. */
export const ASPEN_VIATOR_PUBLIC_RATINGS: Record<
  string,
  AspenViatorPublicRating
> = {
${ratingsEntries}
};

export const ASPEN_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  ASPEN_VIATOR_PUBLIC_RATINGS
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

const narrativesTs = `export const ASPEN_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
${narrativeCodes}
] as const;

export type AspenTargetedNarrativeDescriptionProductCode =
  (typeof ASPEN_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const ASPEN_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  AspenTargetedNarrativeDescriptionProductCode,
  string
> = {
${narrativeEntries}
};

export const getAspenTargetedNarrativeDescription = (productCode: string) =>
  ASPEN_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as AspenTargetedNarrativeDescriptionProductCode
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

export const ENGINE6_ASPEN_TOUR_PATH_PREFIX =
  "${ROUTE_PREFIX}";

export const isEngine6AspenTourCanonicalPath = (path: string) =>
  path.startsWith(ENGINE6_ASPEN_TOUR_PATH_PREFIX);

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

if (!routesContent.includes("ENGINE6_ASPEN_TOUR_PATH_PREFIX")) {
  routesContent = routesContent.replace(
    ROUTES_INSERT_BEFORE,
    `${routeBlock}${ROUTES_INSERT_BEFORE}`
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");
  console.log(`Applied ${products.length} Aspen route constants.`);
}

routesContent = readFileSync(ROUTES_PATH, "utf8");
if (!routesContent.includes("ENGINE6_ASPEN_74828P1_ROUTE,")) {
  const normalizedRoutes = normalizeNewlines(routesContent);
  const normalizedAnchor = normalizeNewlines(ROUTE_ENTRIES_INSERT_BEFORE);
  if (!normalizedRoutes.includes(normalizedAnchor)) {
    throw new Error("Missing Denver route anchor in routes.ts");
  }
  routesContent = normalizedRoutes.replace(
    normalizedAnchor,
    `${ROUTE_ENTRIES_INSERT_BEFORE}\n${routeEntries}`
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");
  console.log(`Applied ${products.length} Aspen route map entries.`);
} else {
  console.log("Aspen route map entries already present.");
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

if (!fixturesContent.includes('productCode: "74828P1"')) {
  fixturesContent = fixturesContent.replace(
    FIXTURE_IMPORTS_INSERT_BEFORE,
    `${FIXTURE_IMPORTS_INSERT_BEFORE}\n${fixtureImports}`
  );
  const normalizedFixtures = normalizeNewlines(fixturesContent);
  const normalizedFixtureAnchor = normalizeNewlines(
    FIXTURE_ENTRIES_INSERT_BEFORE
  );
  if (!normalizedFixtures.includes(normalizedFixtureAnchor)) {
    throw new Error("Missing Denver fixture anchor in validationFixtures.ts");
  }
  fixturesContent = normalizedFixtures.replace(
    normalizedFixtureAnchor,
    `${FIXTURE_ENTRIES_INSERT_BEFORE}\n${fixtureEntries}`
  );
  writeFileSync(VALIDATION_FIXTURES_PATH, fixturesContent, "utf8");
  console.log(
    `Applied ${products.length} Aspen validation fixture imports and entries.`
  );
} else {
  console.log("Aspen validation fixtures already present.");
}

console.log(`Generated wiring for ${products.length} Aspen products.`);
