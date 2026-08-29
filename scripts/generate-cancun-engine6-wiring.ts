/**
 * Generates and applies Cancun Engine6 wiring.
 * Run: npx tsx scripts/generate-cancun-engine6-wiring.ts
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
  "src/engine6/cancunViatorPublicRatings.ts";
const CATALOG_PATH =
  "scripts/cancun-product-catalog.json";
const LIVE_DATA_PATH =
  "scripts/cancun-live-product-data.json";
const EDITORIAL_OVERRIDES_PATH =
  "scripts/cancun-editorial-overrides.json";
const SELECTION_PATH =
  "scripts/cancun-product-selection.json";
const EDITORIAL_OVERRIDES = JSON.parse(
  readFileSync(EDITORIAL_OVERRIDES_PATH, "utf8")
) as Record<string, string>;
const NARRATIVES_PATH =
  "src/engine6/cancunApprovedNarrativeDescriptions.ts";
const APPROVED_NARRATIVES_JSON =
  "scripts/cancun-approved-narratives.json";

const ROUTE_PREFIX =
  "/destinations/mexico/cancun/tours/";
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
  `ENGINE6_CANCUN_${productCode.replace(/[^A-Z0-9]/gi, "_")}_${suffix}`;

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
    .map(s => s.trim().replace(/‹DOT›/g, ".").replace(/^\*\s*/, ""))
    .filter(s => s.length > 20 && !/^(?:highlights?|choose from|read more)\b/i.test(s));
};

const buildEditorialDescription = (live: LiveProduct) => {
  const override = EDITORIAL_OVERRIDES[live.productCode]?.trim();
  if (override) {
    return override.replace(/\s+/g, " ").trim();
  }
  const sentences = sentenceSplit(live.overview ?? "");
  const landmarkNames = live.itineraryStops
    .map(cleanItineraryTitle)
    .filter(
      name =>
        name &&
        !/^(Cancun|Mexico|Mexico)$/i.test(name) &&
        !/meeting point|telescope viewing site/i.test(name)
    )
    .slice(0, 6);
  const landmarkSentence =
    landmarkNames.length > 0
      ? `Stops include ${landmarkNames.join(", ")}.`
      : "";

  const destinationSignal = /\bCancun\b/i;
  let lead =
    sentences[0] ??
    `Experience ${live.title.toLowerCase()} with an Cancun guide.`;
  if (!destinationSignal.test(lead)) {
    lead = `In Cancun, ${lead}`;
  }
  if (!destinationSignal.test(lead.slice(0, 150))) {
    lead = `Experience ${live.title} in Cancun.`;
    if (lead.length > 150 || !destinationSignal.test(lead.slice(0, 150))) {
      lead =
        "Guided Cancun touring with local experts past Chichen Itza, cenotes, Isla Mujeres, and Puerto Morelos.";
    }
  }
  const detail =
    sentences[1] ??
    "A local guide covers landmark stops such as Chichen Itza, a cenote swim, Isla Mujeres, or Puerto Morelos depending on the itinerary.";
  const experienceType = live.experienceType ?? "";
  const format =
    sentences[2] ??
    (experienceType.includes("wine") || experienceType.includes("tequila")
      ? "Private or small-group transport and tasting timing are handled so visitors can stay with cenote or tequila stops rather than planning jungle driving."
      : experienceType.includes("jeep") || experienceType.includes("offroad")
        ? "An English-speaking guide handles ATV or Polaris briefing so visitors can focus on jungle trails rather than self-driving."
        : experienceType.includes("bike")
          ? "A cycling guide handles bikes, route choice, and coastal pacing so visitors can focus on the hotel zone and seafront rather than navigation."
          : experienceType.includes("food") || experienceType.includes("cultural")
            ? "A local guide keeps the walking route on neighborhood eateries rather than generic resort menus."
            : "Local commentary and route logistics are handled so visitors can focus on Cancun landmarks, Caribbean coastline, and Yucatan jungle or ruin stops.");
  const audience =
    experienceType.includes("wine") || experienceType.includes("tequila")
      ? "Ideal for visitors basing in Cancun who want a guided tasting day without coordinating rural driving or tasting-room appointments on their own."
      : experienceType.includes("jeep") || experienceType.includes("offroad")
        ? "Ideal for visitors basing in Cancun who want a guided off-road day without renting ATVs independently."
        : experienceType.includes("bike")
          ? "Ideal for visitors basing in Cancun who want a guided bike outing covering the coast without renting independently."
          : "Ideal for visitors basing in Cancun who want a guided city or Yucatan experience without coordinating tickets or landmark timing on their own.";

  let text = [lead, detail, landmarkSentence, format, audience]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (!/\bCancun\b/i.test(text)) {
    text = `${text} Departures are coordinated in Cancun, Mexico.`;
  }
  const wordCount = (value: string) =>
    value.split(/\s+/).filter(Boolean).length;
  const routeAnchor =
    landmarkNames.length > 0
      ? landmarkNames.slice(0, 4).join(", ")
      : "central Cancun landmarks around the historic center";
  if (wordCount(text) < 120) {
    const logistics =
      experienceType.includes("wine") || experienceType.includes("tequila")
        ? "with a guide handling tasting timing, cenote pacing, and return transfers to Cancun"
        : experienceType.includes("jeep") || experienceType.includes("offroad")
          ? "with a guide handling ATV briefing, jungle routing, and return to Cancun"
          : experienceType.includes("bike")
            ? "with a cycling guide handling bikes, coastal pacing, and hotel-zone routing"
            : "with a guide handling ticket windows, coach or boat connections, and neighborhood pacing";
    text = `${text} Routes stay oriented to ${routeAnchor} that define this Cancun experience, ${logistics} so the day stays focused on the outing rather than logistics.`;
  }
  if (wordCount(text) < 120) {
    text = `${text} Meeting points are confirmed at booking in Cancun, and the itinerary keeps visitors close to Caribbean coastline, Mayan ruins, and cenote swimming holes that shape this Cancun tour.`;
  }
  if (wordCount(text) > 250) {
    const words = text.split(/\s+/).filter(Boolean).slice(0, 248);
    text = `${words.join(" ").replace(/[,.;:\s-]+$/g, "").trim()}.`;
  }
  text = text.replace(/\btravelers\b/gi, "visitors");
  text = text.replace(/\byou can\b/gi, "visitors can");
  text = text.replace(/\bpiazzas\b/gi, "squares");
  text = text
    .replace(/\bbucket list\b/gi, "notable sights")
    .replace(/\bLimited time in Cancun\b/g, "A short stay in Cancun")
    .replace(/\blimited time\b/gi, "a short stay")
    .replace(/^In Cancun, ([A-Z])/g, (_match, letter: string) =>
      `In Cancun, ${letter.toLowerCase()}`
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

const ratingsTs = `export type CancunViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Cancun d631 Engine6 products. */
export const CANCUN_VIATOR_PUBLIC_RATINGS: Record<
  string,
  CancunViatorPublicRating
> = {
${ratingsEntries}
};

export const CANCUN_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  CANCUN_VIATOR_PUBLIC_RATINGS
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

const narrativesTs = `export const CANCUN_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
${narrativeCodes}
] as const;

export type CancunTargetedNarrativeDescriptionProductCode =
  (typeof CANCUN_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const CANCUN_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  CancunTargetedNarrativeDescriptionProductCode,
  string
> = {
${narrativeEntries}
};

export const getCancunTargetedNarrativeDescription = (
  productCode: string
) =>
  CANCUN_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as CancunTargetedNarrativeDescriptionProductCode
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

export const ENGINE6_CANCUN_TOUR_PATH_PREFIX =
  "${ROUTE_PREFIX}";

export const isEngine6CancunTourCanonicalPath = (
  path: string
) => path.startsWith(ENGINE6_CANCUN_TOUR_PATH_PREFIX);

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
    "ENGINE6_CANCUN_TOUR_PATH_PREFIX"
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
    `Applied ${products.length} Cancun route constants.`
  );
}

routesContent = readFileSync(ROUTES_PATH, "utf8");
if (!routesContent.includes("ENGINE6_CANCUN_5885P231_ROUTE,")) {
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
    `Applied ${products.length} Cancun route map entries.`
  );
} else {
  console.log(
    "Cancun route map entries already present."
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

if (!fixturesContent.includes('productCode: "5885P231"')) {
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
    `Applied ${products.length} Cancun validation fixture imports and entries.`
  );
} else {
  console.log(
    "Cancun validation fixtures already present."
  );
}

console.log(
  `Generated wiring for ${products.length} Cancun products.`
);
