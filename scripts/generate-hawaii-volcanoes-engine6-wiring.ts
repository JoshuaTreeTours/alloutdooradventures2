/**
 * Generates and applies Hawaii Volcanoes National Park Engine6 wiring from
 * hawaii-volcanoes-live-product-data.json
 * Run: npx tsx scripts/generate-hawaii-volcanoes-engine6-wiring.ts
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
const RATINGS_PATH = "src/engine6/hawaiiVolcanoesViatorPublicRatings.ts";
const CATALOG_PATH = "scripts/hawaii-volcanoes-product-catalog.json";
const LIVE_DATA_PATH = "scripts/hawaii-volcanoes-live-product-data.json";
const NARRATIVES_PATH = "src/engine6/hawaiiVolcanoesApprovedNarrativeDescriptions.ts";
const APPROVED_NARRATIVES_JSON =
  "scripts/hawaii-volcanoes-approved-narratives.json";

const ROUTE_PREFIX =
  "/destinations/hawaii/hawaii-volcanoes-national-park/tours/";
const ROUTES_INSERT_BEFORE = "export const ENGINE6_HONOLULU_TOUR_PATH_PREFIX";
const ROUTE_ENTRIES_INSERT_BEFORE = `  [
    ENGINE6_MAUI_5069WEST45_ROUTE,
    ENGINE6_MAUI_5069WEST45_PRODUCT_CODE,
  ],`;
const FIXTURE_ENTRIES_INSERT_BEFORE = `  {
    productCode: "5069WEST45",
    publicUrl: "https://www.viator.com/tours/Maui/West-Maui-and-Molokai-Exclusive-45-Minute-Helicopter-Tour/d671-5069WEST45",
    rawPayload: specimen5069west45Payload as Record<string, unknown>,
    validationRules: { itineraryOriginalityForNewBuilds: true },
  },`;
const FIXTURE_IMPORTS_INSERT_BEFORE =
  'import specimen5501haskyPayload from "../../data/engine6/viator/5501HASKY.exact-product.json";';

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
  `ENGINE6_HVNP_${productCode.replace(/[^A-Z0-9]/gi, "_")}_${suffix}`;

const toImportAlias = (productCode: string) =>
  `specimen${productCode.toLowerCase()}Payload`;

const cleanItineraryTitle = (stop: string) =>
  stop
    .replace(/^#+\s*/, "")
    .replace(/\s*\(Pass By\)\s*$/i, "")
    .replace(/\s*\(pass by\)\s*$/i, "")
    .trim();

const sentenceSplit = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && !/highlights?|Choose from|Read more/i.test(s));

const buildEditorialDescription = (live: LiveProduct) => {
  const sentences = sentenceSplit(live.overview ?? "");
  const landmarkNames = live.itineraryStops
    .map(cleanItineraryTitle)
    .filter(
      name =>
        name &&
        !/^(Hawaii|Big Island|Hawaii Volcanoes National Park)$/i.test(name)
    )
    .slice(0, 6);
  const landmarkPhrase =
    landmarkNames.length > 0
      ? ` Stops include ${landmarkNames.join(", ")}.`
      : "";

  const destinationSignal =
    /\b(?:Hawaii Volcanoes National Park|Volcanoes National Park|Big Island)\b/i;
  let lead =
    sentences[0] ??
    `Experience ${live.title} around Hawaii Volcanoes National Park on the Big Island.`;
  if (!destinationSignal.test(lead)) {
    lead = `On the Big Island, ${lead.charAt(0).toLowerCase()}${lead.slice(1)}`;
  }
  // Listing cards excerpt the first ~150 chars; keep the destination signal inside that window.
  if (!destinationSignal.test(lead.slice(0, 150))) {
    lead = `Experience ${live.title} on the Big Island near Hawaii Volcanoes National Park.`;
    if (lead.length > 150 || !destinationSignal.test(lead.slice(0, 150))) {
      lead =
        "Guided Big Island touring near Hawaii Volcanoes National Park with local experts.";
    }
  }
  const detail =
    (sentences[1] ??
      "Your guide covers Kilauea overlooks, lava landscapes, coastal black-sand beaches, and waterfall routes tied to the park day.") +
    landmarkPhrase;
  const format =
    sentences[2] ??
    "Transportation, park logistics, and local commentary are handled so you can focus on crater rim views, rainforest trails, and Big Island geology.";
  const audience =
    "Ideal for visitors touring Hawaii Volcanoes National Park who want a guided Big Island experience without coordinating transport, gear, or park logistics on their own.";

  const text = [lead, detail, format, audience].join(" ");
  if (
    !/\bHawaii Volcanoes National Park\b/i.test(text) &&
    !/\bVolcanoes National Park\b/i.test(text)
  ) {
    return `${text} Departures are coordinated for Hawaii Volcanoes National Park on the Big Island of Hawaii.`;
  }
  return text;
};

const products: LiveProduct[] = JSON.parse(
  readFileSync(LIVE_DATA_PATH, "utf8")
);

const ratingsEntries = products
  .map(p => {
    const rating = p.rating ?? 5.0;
    return `  "${p.productCode}": { rating: ${rating}, reviewCount: ${p.reviewCount} },`;
  })
  .join("\n");

const ratingsTs = `export type HawaiiVolcanoesViatorPublicRating = {
  rating: number;
  reviewCount: number;
};

/** Viator public combined rating/review counts for Hawaii Volcanoes National Park Engine6 products. */
export const HAWAII_VOLCANOES_VIATOR_PUBLIC_RATINGS: Record<
  string,
  HawaiiVolcanoesViatorPublicRating
> = {
${ratingsEntries}
};

export const HAWAII_VOLCANOES_VIATOR_PUBLIC_PRODUCT_CODES = Object.keys(
  HAWAII_VOLCANOES_VIATOR_PUBLIC_RATINGS
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

const narrativesTs = `export const HAWAII_VOLCANOES_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
${narrativeCodes}
] as const;

export type HawaiiVolcanoesTargetedNarrativeDescriptionProductCode =
  (typeof HAWAII_VOLCANOES_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const HAWAII_VOLCANOES_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  HawaiiVolcanoesTargetedNarrativeDescriptionProductCode,
  string
> = {
${narrativeEntries}
};

export const getHawaiiVolcanoesTargetedNarrativeDescription = (
  productCode: string
) =>
  HAWAII_VOLCANOES_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as HawaiiVolcanoesTargetedNarrativeDescriptionProductCode
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

export const ENGINE6_HVNP_TOUR_PATH_PREFIX =
  "${ROUTE_PREFIX}";

export const isEngine6HvnpTourCanonicalPath = (path: string) =>
  path.startsWith(ENGINE6_HVNP_TOUR_PATH_PREFIX);

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

if (!routesContent.includes("ENGINE6_HVNP_TOUR_PATH_PREFIX")) {
  routesContent = routesContent.replace(
    ROUTES_INSERT_BEFORE,
    `${routeBlock}${ROUTES_INSERT_BEFORE}`
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");
  console.log(`Applied ${products.length} HVNP route constants.`);
}

routesContent = readFileSync(ROUTES_PATH, "utf8");
if (!routesContent.includes("ENGINE6_HVNP_6651BIOD_ROUTE,")) {
  const normalizedRoutes = normalizeNewlines(routesContent);
  const normalizedAnchor = normalizeNewlines(ROUTE_ENTRIES_INSERT_BEFORE);
  if (!normalizedRoutes.includes(normalizedAnchor)) {
    throw new Error("Missing Maui route anchor in routes.ts");
  }
  routesContent = normalizedRoutes.replace(
    normalizedAnchor,
    `${ROUTE_ENTRIES_INSERT_BEFORE}\n${routeEntries}`
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");
  console.log(`Applied ${products.length} HVNP route map entries.`);
} else {
  console.log("HVNP route map entries already present.");
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

if (!fixturesContent.includes('productCode: "6651BIOD"')) {
  fixturesContent = fixturesContent.replace(
    FIXTURE_IMPORTS_INSERT_BEFORE,
    `${FIXTURE_IMPORTS_INSERT_BEFORE}\n${fixtureImports}`
  );
  const normalizedFixtures = normalizeNewlines(fixturesContent);
  const normalizedFixtureAnchor = normalizeNewlines(
    FIXTURE_ENTRIES_INSERT_BEFORE
  );
  if (!normalizedFixtures.includes(normalizedFixtureAnchor)) {
    throw new Error("Missing Maui fixture anchor in validationFixtures.ts");
  }
  fixturesContent = normalizedFixtures.replace(
    normalizedFixtureAnchor,
    `${FIXTURE_ENTRIES_INSERT_BEFORE}\n${fixtureEntries}`
  );
  writeFileSync(VALIDATION_FIXTURES_PATH, fixturesContent, "utf8");
  console.log(
    `Applied ${products.length} HVNP validation fixture imports and entries.`
  );
} else {
  console.log("HVNP validation fixtures already present.");
}

console.log(`Generated wiring for ${products.length} HVNP products.`);
