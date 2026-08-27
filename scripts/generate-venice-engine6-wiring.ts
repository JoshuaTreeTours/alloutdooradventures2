/**
 * Generates and applies Venice Engine6 wiring.
 * Run: npx tsx scripts/generate-venice-engine6-wiring.ts
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
  experienceType?: string;
};

const ROUTES_PATH = "src/engine6/routes.ts";
const VALIDATION_FIXTURES_PATH = "src/engine6/validationFixtures.ts";
const RATINGS_PATH =
  "src/engine6/veniceViatorPublicRatings.ts";
const CATALOG_PATH =
  "scripts/venice-product-catalog.json";
const LIVE_DATA_PATH =
  "scripts/venice-live-product-data.json";
const SELECTION_PATH =
  "scripts/venice-product-selection.json";
const NARRATIVES_PATH =
  "src/engine6/veniceApprovedNarrativeDescriptions.ts";
const APPROVED_NARRATIVES_JSON =
  "scripts/venice-approved-narratives.json";

const ROUTE_PREFIX =
  "/destinations/italy/venice/tours/";
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
  `ENGINE6_VENICE_${productCode.replace(/[^A-Z0-9]/gi, "_")}_${suffix}`;

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
    .filter(s => s.length > 20 && !/^(?:highlights?|choose from|read more)\b/i.test(s));
};

const buildEditorialDescription = (live: LiveProduct) => {
  const sentences = sentenceSplit(live.overview ?? "");
  const landmarkNames = live.itineraryStops
    .map(cleanItineraryTitle)
    .filter(
      name =>
        name &&
        !/^(Venice|Italy)$/i.test(name) &&
        !/meeting point|telescope viewing site/i.test(name)
    )
    .slice(0, 6);
  const landmarkSentence =
    landmarkNames.length > 0
      ? `Stops include ${landmarkNames.join(", ")}.`
      : "";

  const destinationSignal = /\bVenice\b/i;
  let lead =
    sentences[0] ??
    `Experience ${live.title.toLowerCase()} with a Venice guide.`;
  if (!destinationSignal.test(lead)) {
    lead = `In Venice, ${lead}`;
  }
  if (!destinationSignal.test(lead.slice(0, 150))) {
    lead = `Experience ${live.title} in Venice.`;
    if (lead.length > 150 || !destinationSignal.test(lead.slice(0, 150))) {
      lead =
        "Guided Venice touring with local experts past St. Mark's Basilica, the Doge's Palace, the Grand Canal, and the Rialto Bridge.";
    }
  }
  const detail =
    sentences[1] ??
    "Your guide covers landmark stops such as the St. Mark's Basilica, Doge's Palace, Cannaregio, or the Grand Canal depending on the itinerary.";
  const experienceType = live.experienceType ?? "";
  const format =
    sentences[2] ??
    (experienceType.includes("wine")
      ? "Private transport, cellar visits, and tasting-room timing are handled so visitors can stay with the vineyards rather than planning rural driving."
      : experienceType.includes("dolomite")
        ? "An English-speaking driver-guide handles alpine transfers so visitors can focus on mountain scenery rather than self-driving."
        : experienceType.includes("photo")
          ? "A professional photographer handles posing, light, and route pacing so visitors can focus on portraits rather than logistics."
          : experienceType.includes("food") ||
              experienceType.includes("cicchetti")
            ? "A local guide keeps the walking route on neighborhood eateries rather than generic tourist-trap menus."
            : experienceType.includes("island") ||
                experienceType.includes("murano")
              ? "Boat transfers and workshop visits are coordinated so visitors can spend time on the islands rather than public-ferry waits."
              : "Local commentary and route logistics are handled so visitors can focus on Venice landmarks, piazzas, and neighborhood walking routes.");
  const audience =
    experienceType.includes("wine")
      ? "Ideal for visitors basing in Venice who want a guided Prosecco Hills day without coordinating rural driving or winery appointments on their own."
      : experienceType.includes("dolomite")
        ? "Ideal for visitors basing in Venice who want a guided Dolomites day without self-driving mountain roads."
        : experienceType.includes("after-hours")
          ? "Ideal for visitors basing in Venice who want after-hours basilica access without daytime crowds."
          : "Ideal for visitors basing in Venice who want a guided city experience without coordinating attraction tickets or landmark timing on their own.";

  let text = [lead, detail, landmarkSentence, format, audience]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (!/\bVenice\b/i.test(text)) {
    text = `${text} Departures are coordinated in Venice, Italy.`;
  }
  const wordCount = (value: string) =>
    value.split(/\s+/).filter(Boolean).length;
  const routeAnchor =
    landmarkNames.length > 0
      ? landmarkNames.slice(0, 4).join(", ")
      : "central Venice landmarks around the historic center";
  if (wordCount(text) < 120) {
    const logistics =
      experienceType.includes("wine")
        ? "with a guide handling winery timing, tasting-room visits, and return transfers to Venice"
        : experienceType.includes("dolomite")
          ? "with a driver-guide handling alpine transfers, seasonal routing, and return to Venice"
          : experienceType.includes("photo")
            ? "with a photographer handling posing, light, and neighborhood pacing"
            : "with a guide handling ticket windows, boat or walking connections, and neighborhood pacing";
    text = `${text} Routes stay oriented to ${routeAnchor} that define this Venice experience, ${logistics} so the day stays focused on the outing rather than logistics.`;
  }
  if (wordCount(text) < 120) {
    text = `${text} Meeting points are confirmed at booking in Venice, and the itinerary keeps visitors close to piazza views, museum galleries, and historic streets that shape this Venetian lagoon tour.`;
  }
  if (wordCount(text) > 250) {
    const words = text.split(/\s+/).filter(Boolean).slice(0, 248);
    text = `${words.join(" ").replace(/[,.;:\s-]+$/g, "").trim()}.`;
  }
  text = text.replace(/\btravelers\b/gi, "visitors");
  text = text
    .replace(/\bbucket list\b/gi, "notable sights")
    .replace(/\bLimited time in Venice\b/g, "A short stay in Venice")
    .replace(/\blimited time\b/gi, "a short stay")
    .replace(/^In Venice, ([A-Z])/g, (_match, letter: string) =>
      `In Venice, ${letter.toLowerCase()}`
    );
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

const ratingsTs = `export type VeniceViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Venice d522 Engine6 products. */
export const VENICE_VIATOR_PUBLIC_RATINGS: Record<
  string,
  VeniceViatorPublicRating
> = {
${ratingsEntries}
};

export const VENICE_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  VENICE_VIATOR_PUBLIC_RATINGS
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

const narrativesTs = `export const VENICE_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
${narrativeCodes}
] as const;

export type VeniceTargetedNarrativeDescriptionProductCode =
  (typeof VENICE_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const VENICE_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  VeniceTargetedNarrativeDescriptionProductCode,
  string
> = {
${narrativeEntries}
};

export const getVeniceTargetedNarrativeDescription = (
  productCode: string
) =>
  VENICE_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as VeniceTargetedNarrativeDescriptionProductCode
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

export const ENGINE6_VENICE_TOUR_PATH_PREFIX =
  "${ROUTE_PREFIX}";

export const isEngine6VeniceTourCanonicalPath = (
  path: string
) => path.startsWith(ENGINE6_VENICE_TOUR_PATH_PREFIX);

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
    "ENGINE6_VENICE_TOUR_PATH_PREFIX"
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
    `Applied ${products.length} Venice route constants.`
  );
}

routesContent = readFileSync(ROUTES_PATH, "utf8");
if (!routesContent.includes("ENGINE6_VENICE_140596P2_ROUTE,")) {
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
    `Applied ${products.length} Venice route map entries.`
  );
} else {
  console.log(
    "Venice route map entries already present."
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

if (!fixturesContent.includes('productCode: "140596P2"')) {
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
    `Applied ${products.length} Venice validation fixture imports and entries.`
  );
} else {
  console.log(
    "Venice validation fixtures already present."
  );
}

console.log(
  `Generated wiring for ${products.length} Venice products.`
);
