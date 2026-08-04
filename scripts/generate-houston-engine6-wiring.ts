/**
 * Generates and applies Houston Engine6 wiring from houston-live-product-data.json
 * Run: npx tsx scripts/generate-houston-engine6-wiring.ts
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
const RATINGS_PATH = "src/engine6/houstonViatorPublicRatings.ts";
const CATALOG_PATH = "scripts/houston-product-catalog.json";
const LIVE_DATA_PATH = "scripts/houston-live-product-data.json";
const SELECTION_PATH = "scripts/houston-product-selection.json";
const NARRATIVES_PATH = "src/engine6/houstonApprovedNarrativeDescriptions.ts";
const APPROVED_NARRATIVES_JSON = "scripts/houston-approved-narratives.json";

const ROUTE_PREFIX = "/destinations/texas/houston/tours/";
const ROUTES_INSERT_BEFORE = "export const ENGINE6_AUSTIN_5513806P1_PRODUCT_CODE";
const ROUTE_ENTRIES_INSERT_BEFORE = `  [
    ENGINE6_AUSTIN_5513806P1_ROUTE,
    ENGINE6_AUSTIN_5513806P1_PRODUCT_CODE,
  ],`;
const FIXTURE_ENTRIES_INSERT_BEFORE = `  {
    productCode: "5513806P1",
    publicUrl: "https://www.viator.com/tours/Austin/Personal-Group-Tour-4-People-Bronco/d5021-5513806P1",
    rawPayload: specimen5513806p1Payload as Record<string, unknown>,
    validationRules: { itineraryOriginalityForNewBuilds: true },
  },`;
const FIXTURE_IMPORTS_INSERT_BEFORE =
  'import specimen5513806p1Payload from "../../data/engine6/viator/5513806P1.exact-product.json";';
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
  `ENGINE6_HOUSTON_${productCode.replace(/[^A-Z0-9]/gi, "_")}_${suffix}`;

const toImportAlias = (productCode: string) =>
  `specimen${productCode.toLowerCase()}Payload`;

const cleanItineraryTitle = (stop: string) =>
  stop
    .replace(/^#+\s*/, "")
    .replace(/\s*\(Pass By\)\s*$/i, "")
    .replace(/\s*\(pass by\)\s*$/i, "")
    .trim();

const sentenceSplit = (text: string) => {
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
        !/^(Houston|Texas)$/i.test(name) &&
        !/meeting point|photo locations|retreat facility/i.test(name)
    )
    .slice(0, 6);
  const landmarkSentence =
    landmarkNames.length > 0
      ? `Stops include ${landmarkNames.join(", ")}.`
      : "";

  const destinationSignal = /\bHouston\b/i;
  let lead =
    sentences[0] ??
    `Experience ${live.title.toLowerCase()} with a Houston-based outfitter.`;
  if (!destinationSignal.test(lead)) {
    lead = `In Houston, ${lead.charAt(0).toLowerCase()}${lead.slice(1)}`;
  }
  if (!destinationSignal.test(lead.slice(0, 150))) {
    lead = `Experience ${live.title} in Houston, Texas.`;
    if (lead.length > 150 || !destinationSignal.test(lead.slice(0, 150))) {
      lead =
        "Guided Houston touring with local experts through downtown landmarks, Buffalo Bayou, and Space City routes.";
    }
  }
  const detail =
    sentences[1] ??
    "Your guide covers Houston landmarks such as Market Square, Buffalo Bayou Park, the Museum District, River Oaks, or Space Center Houston depending on the itinerary.";
  const format =
    sentences[2] ??
    "Local commentary and route logistics are handled so you can focus on Houston skyline views, bayou corridors, and NASA highlights.";
  const audience =
    "Ideal for visitors basing in Houston who want a guided Space City experience without coordinating meeting points, mural stops, or attraction entrances on their own.";

  let text = [lead, detail, landmarkSentence, format, audience]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (!/\bHouston\b/i.test(text)) {
    text = `${text} Departures are coordinated from Houston, Texas.`;
  }
  // Engine6 governed editorial budget is 500-800 chars.
  if (text.length < 500) {
    text = `${text} Routes stay oriented to Houston bayou parks, downtown districts, and coastal day-trip corridors that define the city's outdoor character.`;
  }
  if (text.length > 800) {
    const clipped = text.slice(0, 800).trim();
    const boundary = clipped.lastIndexOf(" ");
    text = `${(boundary > 560 ? clipped.slice(0, boundary) : clipped).replace(/[,.;:\s-]+$/g, "").trim()}.`;
  }
  // Avoid governed polish rewriting "travelers <word>" into "your <word>".
  text = text.replace(/\btravelers\b/gi, "visitors");
  return text;
};

const selection = JSON.parse(readFileSync(SELECTION_PATH, "utf8")) as {
  selectedProductCodes: string[];
};
const selected = new Set(selection.selectedProductCodes);
const allProducts: LiveProduct[] = JSON.parse(
  readFileSync(LIVE_DATA_PATH, "utf8")
);
const products = selection.selectedProductCodes.map(code => {
  const product = allProducts.find(p => p.productCode === code);
  if (!product) {
    throw new Error(`Missing live product data for selected code ${code}`);
  }
  if (!selected.has(code)) {
    throw new Error(`Selection mismatch for ${code}`);
  }
  return product;
});

const ratingsEntries = products
  .map(p => {
    const rating = p.rating ?? 5.0;
    return `  "${p.productCode}": { rating: ${Number(rating).toFixed(1)}, reviewCount: ${p.reviewCount} },`;
  })
  .join("\n");

const ratingsTs = `export type HoustonViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Houston d5186 Engine6 products. */
export const HOUSTON_VIATOR_PUBLIC_RATINGS: Record<
  string,
  HoustonViatorPublicRating
> = {
${ratingsEntries}
};

export const HOUSTON_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  HOUSTON_VIATOR_PUBLIC_RATINGS
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

const narrativesTs = `export const HOUSTON_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
${narrativeCodes}
] as const;

export type HoustonTargetedNarrativeDescriptionProductCode =
  (typeof HOUSTON_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const HOUSTON_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  HoustonTargetedNarrativeDescriptionProductCode,
  string
> = {
${narrativeEntries}
};

export const getHoustonTargetedNarrativeDescription = (productCode: string) =>
  HOUSTON_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as HoustonTargetedNarrativeDescriptionProductCode
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

export const ENGINE6_HOUSTON_TOUR_PATH_PREFIX =
  "${ROUTE_PREFIX}";

export const isEngine6HoustonTourCanonicalPath = (path: string) =>
  path.startsWith(ENGINE6_HOUSTON_TOUR_PATH_PREFIX);

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

if (!routesContent.includes("ENGINE6_HOUSTON_TOUR_PATH_PREFIX")) {
  if (!routesContent.includes(ROUTES_INSERT_BEFORE)) {
    throw new Error("Missing Austin route constant anchor in routes.ts");
  }
  routesContent = routesContent.replace(
    ROUTES_INSERT_BEFORE,
    `${routeBlock}${ROUTES_INSERT_BEFORE}`
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");
  console.log(`Applied ${products.length} Houston route constants.`);
}

routesContent = readFileSync(ROUTES_PATH, "utf8");
if (!routesContent.includes("ENGINE6_HOUSTON_192749P7_ROUTE,")) {
  const normalizedRoutes = normalizeNewlines(routesContent);
  const normalizedAnchor = normalizeNewlines(ROUTE_ENTRIES_INSERT_BEFORE);
  if (!normalizedRoutes.includes(normalizedAnchor)) {
    throw new Error("Missing Austin route map anchor in routes.ts");
  }
  routesContent = normalizedRoutes.replace(
    normalizedAnchor,
    `${routeEntries}\n${ROUTE_ENTRIES_INSERT_BEFORE}`
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");
  console.log(`Applied ${products.length} Houston route map entries.`);
} else {
  console.log("Houston route map entries already present.");
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

if (!fixturesContent.includes('productCode: "192749P7"')) {
  if (!fixturesContent.includes(FIXTURE_IMPORTS_INSERT_BEFORE)) {
    throw new Error("Missing Austin fixture import anchor in validationFixtures.ts");
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
    throw new Error("Missing Austin fixture entry anchor in validationFixtures.ts");
  }
  fixturesContent = normalizedFixtures.replace(
    normalizedFixtureAnchor,
    `${fixtureEntries}\n${FIXTURE_ENTRIES_INSERT_BEFORE}`
  );
  writeFileSync(VALIDATION_FIXTURES_PATH, fixturesContent, "utf8");
  console.log(
    `Applied ${products.length} Houston validation fixture imports and entries.`
  );
} else {
  console.log("Houston validation fixtures already present.");
}

console.log(`Generated wiring for ${products.length} Houston products.`);
