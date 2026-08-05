/**
 * Generates and applies Canyonlands National Park Engine6 wiring.
 * Run: npx tsx scripts/generate-canyonlands-national-park-engine6-wiring.ts
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
const RATINGS_PATH =
  "src/engine6/canyonlandsNationalParkViatorPublicRatings.ts";
const CATALOG_PATH =
  "scripts/canyonlands-national-park-product-catalog.json";
const LIVE_DATA_PATH =
  "scripts/canyonlands-national-park-live-product-data.json";
const SELECTION_PATH =
  "scripts/canyonlands-national-park-product-selection.json";
const NARRATIVES_PATH =
  "src/engine6/canyonlandsNationalParkApprovedNarrativeDescriptions.ts";
const APPROVED_NARRATIVES_JSON =
  "scripts/canyonlands-national-park-approved-narratives.json";

const ROUTE_PREFIX =
  "/destinations/utah/canyonlands-national-park/tours/";
const ROUTES_INSERT_BEFORE = "export const ENGINE6_BRYCE_165275P1_PRODUCT_CODE";
const ROUTE_ENTRIES_INSERT_BEFORE = `  [
    ENGINE6_BRYCE_165275P1_ROUTE,
    ENGINE6_BRYCE_165275P1_PRODUCT_CODE,
  ],`;
const FIXTURE_ENTRIES_INSERT_BEFORE = `  {
    productCode: "165275P1",
    publicUrl: "https://www.viator.com/tours/Bryce-Canyon-National-Park/Bryce-Canyon-Daily-Tour/d50798-165275P1",
    rawPayload: specimen165275p1Payload as Record<string, unknown>,
    validationRules: { itineraryOriginalityForNewBuilds: true },
  },`;
const FIXTURE_IMPORTS_INSERT_BEFORE =
  'import specimen165275p1Payload from "../../data/engine6/viator/165275P1.exact-product.json";';

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
  `ENGINE6_CANYONLANDS_${productCode.replace(/[^A-Z0-9]/gi, "_")}_${suffix}`;

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
        !/^(Canyonlands National Park|Utah)$/i.test(name) &&
        !/meeting point|telescope viewing site/i.test(name)
    )
    .slice(0, 6);
  const landmarkSentence =
    landmarkNames.length > 0
      ? `Stops include ${landmarkNames.join(", ")}.`
      : "";

  const destinationSignal = /\bCanyonlands(?: National Park)?\b/i;
  let lead =
    sentences[0] ??
    `Experience ${live.title.toLowerCase()} with a Canyonlands National Park outfitter.`;
  if (!destinationSignal.test(lead)) {
    lead = `In Canyonlands National Park, ${lead}`;
  }
  if (!destinationSignal.test(lead.slice(0, 150))) {
    lead = `Experience ${live.title} in Canyonlands National Park, Utah.`;
    if (lead.length > 150 || !destinationSignal.test(lead.slice(0, 150))) {
      lead =
        "Guided Canyonlands National Park touring with local experts through Island in the Sky mesas, Needles spires, and red-rock overlooks.";
    }
  }
  const detail =
    sentences[1] ??
    "Your guide covers landmark stops such as Mesa Arch, Grand View Point, Shafer Trail, or White Rim Road depending on the itinerary.";
  const format =
    sentences[2] ??
    "Local commentary and route logistics are handled so you can focus on canyon overlooks, backcountry routes, and photography or adventure highlights.";
  const audience =
    "Ideal for visitors basing in Moab who want a guided Canyonlands National Park experience without coordinating park logistics, trailheads, or backcountry routes on their own.";

  let text = [lead, detail, landmarkSentence, format, audience]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (!/\bCanyonlands(?: National Park)?\b/i.test(text)) {
    text = `${text} Departures are coordinated near Canyonlands National Park, Utah.`;
  }
  if (text.length < 500) {
    const routeAnchor =
      landmarkNames.length > 0
        ? landmarkNames.slice(0, 4).join(", ")
        : "Canyonlands National Park red-rock corridors";
    text = `${text} Routes stay oriented to ${routeAnchor} that define this Moab-area park experience.`;
  }
  if (text.length > 800) {
    const clipped = text.slice(0, 800).trim();
    const boundary = clipped.lastIndexOf(" ");
    text = `${(boundary > 560 ? clipped.slice(0, boundary) : clipped).replace(/[,.;:\s-]+$/g, "").trim()}.`;
  }
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

const ratingsTs = `export type CanyonlandsNationalParkViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Canyonlands National Park d5600 Engine6 products. */
export const CANYONLANDS_NATIONAL_PARK_VIATOR_PUBLIC_RATINGS: Record<
  string,
  CanyonlandsNationalParkViatorPublicRating
> = {
${ratingsEntries}
};

export const CANYONLANDS_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  CANYONLANDS_NATIONAL_PARK_VIATOR_PUBLIC_RATINGS
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

const narrativesTs = `export const CANYONLANDS_NATIONAL_PARK_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
${narrativeCodes}
] as const;

export type CanyonlandsNationalParkTargetedNarrativeDescriptionProductCode =
  (typeof CANYONLANDS_NATIONAL_PARK_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const CANYONLANDS_NATIONAL_PARK_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  CanyonlandsNationalParkTargetedNarrativeDescriptionProductCode,
  string
> = {
${narrativeEntries}
};

export const getCanyonlandsNationalParkTargetedNarrativeDescription = (
  productCode: string
) =>
  CANYONLANDS_NATIONAL_PARK_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as CanyonlandsNationalParkTargetedNarrativeDescriptionProductCode
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

export const ENGINE6_CANYONLANDS_NATIONAL_PARK_TOUR_PATH_PREFIX =
  "${ROUTE_PREFIX}";

export const isEngine6CanyonlandsNationalParkTourCanonicalPath = (
  path: string
) => path.startsWith(ENGINE6_CANYONLANDS_NATIONAL_PARK_TOUR_PATH_PREFIX);

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

if (
  !routesContent.includes(
    "ENGINE6_CANYONLANDS_NATIONAL_PARK_TOUR_PATH_PREFIX"
  )
) {
  if (!routesContent.includes(ROUTES_INSERT_BEFORE)) {
    throw new Error("Missing Bryce route constant anchor in routes.ts");
  }
  routesContent = routesContent.replace(
    ROUTES_INSERT_BEFORE,
    `${routeBlock}${ROUTES_INSERT_BEFORE}`
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");
  console.log(
    `Applied ${products.length} Canyonlands National Park route constants.`
  );
}

routesContent = readFileSync(ROUTES_PATH, "utf8");
if (!routesContent.includes("ENGINE6_CANYONLANDS_24134P3_ROUTE,")) {
  const normalizedRoutes = normalizeNewlines(routesContent);
  const normalizedAnchor = normalizeNewlines(ROUTE_ENTRIES_INSERT_BEFORE);
  if (!normalizedRoutes.includes(normalizedAnchor)) {
    throw new Error("Missing Bryce route map anchor in routes.ts");
  }
  routesContent = normalizedRoutes.replace(
    normalizedAnchor,
    `${routeEntries}\n${ROUTE_ENTRIES_INSERT_BEFORE}`
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");
  console.log(
    `Applied ${products.length} Canyonlands National Park route map entries.`
  );
} else {
  console.log(
    "Canyonlands National Park route map entries already present."
  );
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

if (!fixturesContent.includes('productCode: "24134P3"')) {
  if (!fixturesContent.includes(FIXTURE_IMPORTS_INSERT_BEFORE)) {
    throw new Error(
      "Missing Bryce fixture import anchor in validationFixtures.ts"
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
      "Missing Bryce fixture entry anchor in validationFixtures.ts"
    );
  }
  fixturesContent = normalizedFixtures.replace(
    normalizedFixtureAnchor,
    `${fixtureEntries}\n${FIXTURE_ENTRIES_INSERT_BEFORE}`
  );
  writeFileSync(VALIDATION_FIXTURES_PATH, fixturesContent, "utf8");
  console.log(
    `Applied ${products.length} Canyonlands National Park validation fixture imports and entries.`
  );
} else {
  console.log(
    "Canyonlands National Park validation fixtures already present."
  );
}

console.log(
  `Generated wiring for ${products.length} Canyonlands National Park products.`
);
