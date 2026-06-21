import { readFileSync } from "node:fs";
import path from "node:path";
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./ts-extension-loader.mjs", pathToFileURL("./scripts/"));

const { extractEngine6Product } = await import(
  "../api/engine6/viatorExtractors.ts"
);
const {
  mergeEngine6NativeItineraryWithLive,
  getEngine6ItineraryMergeMode,
} = await import("../src/engine6/mergeEngine6LiveItinerary.ts");
const { getEngine6PositionalItineraryRowTitle } = await import(
  "../api/engine6/itineraryTitlePolicy.ts"
);

const repoRoot = path.resolve(import.meta.dirname, "..");
const fixtureDir = path.join(repoRoot, "data", "engine6", "viator");

const NYC_PRODUCTS = [
  "233384P2",
  "7081NYCDAY",
  "62527P11",
  "5250LIBERTYELLIS",
  "5614063P8",
  "3857PHI",
  "3156P13",
  "5024MANSKY",
];

const EXPECTED_233384P2 = [
  "City Hall Area",
  "Brooklyn Bridge",
  "Brooklyn Heights Promenade",
  "Brooklyn Bridge Park",
  "DUMBO",
  "Brooklyn Navy Yard",
];

const BUNDLED_PREFIX_BY_PRODUCT = {
  "233384P2": EXPECTED_233384P2,
  "7081NYCDAY": [
    "Central Park",
    "Rockefeller Center",
    "Fifth Avenue",
    "Gansevoort Liberty Market",
    "The National 9/11 Memorial & Museum",
    "New York Harbor",
  ],
  "62527P11": ["Midtown Manhattan Departure", "Niagara Falls"],
  "5250LIBERTYELLIS": ["Battery Park", "Liberty Island", "Ellis Island"],
  "5614063P8": ["Departure from New York", "Washington, D.C. Landmarks"],
  "3857PHI": ["Philadelphia", "Amish Country"],
  "3156P13": [
    "City Hall & Civic Center",
    "Hudson River Greenway",
    "Central Manhattan Highlights",
    "Finish Near Central Park South",
  ],
  "5024MANSKY": [
    "Downtown Manhattan Heliport check-in",
    "Governors Island",
    "Statue of Liberty",
    "Ellis Island",
    "One World Trade Center",
    "Empire State Building",
    "Chrysler Building",
    "Central Park",
    "Manhattan skyline helicopter flight return leg",
  ],
};

const results = [];
let failed = 0;

const pass = name => {
  results.push(`PASS  ${name}`);
};

const fail = (name, detail) => {
  failed += 1;
  results.push(`FAIL  ${name}${detail ? `: ${detail}` : ""}`);
};

const loadFixture = productCode => {
  const fixture = JSON.parse(
    readFileSync(path.join(fixtureDir, `${productCode}.exact-product.json`), "utf8")
  );
  return { fixture, extraction: extractEngine6Product(fixture) };
};

const loadNativeItinerary = productCode => {
  const { extraction } = loadFixture(productCode);
  return extraction.extracted.itinerary ?? [];
};

const loadBundledRawProduct = productCode => {
  const { extraction } = loadFixture(productCode);
  return extraction.product;
};

const buildNeutralExplicitLiveItinerary = count =>
  Array.from({ length: count }, (_, index) => ({
    title: `Itinerary Stop ${index + 1}`,
    titleSource: "explicit",
    description: `Live refreshed description for stop ${index + 1}.`,
  }));

try {
  const native233 = loadNativeItinerary("233384P2");
  const live233 = buildNeutralExplicitLiveItinerary(8);
  const bundled233 = loadBundledRawProduct("233384P2");
  const merged233 = mergeEngine6NativeItineraryWithLive(native233, live233, {
    productCode: "233384P2",
    bundledRawProduct: bundled233,
  });
  const firstFive = merged233.slice(0, 5).map(item => item.title);

  if (JSON.stringify(firstFive) === JSON.stringify(EXPECTED_233384P2.slice(0, 5))) {
    pass("264853/233384P2 first five rendered titles");
  } else {
    fail("264853/233384P2 first five rendered titles", JSON.stringify(firstFive));
  }

  if (getEngine6ItineraryMergeMode(native233, live233) === "diverged") {
    pass("233384P2 count mismatch classified diverged");
  } else {
    fail("233384P2 count mismatch classified diverged");
  }

  for (const productCode of NYC_PRODUCTS) {
    const native = loadNativeItinerary(productCode);
    const bundledPrefix = BUNDLED_PREFIX_BY_PRODUCT[productCode];
    if (!bundledPrefix) {
      continue;
    }

    const liveCount = native.length + 2;
    const live = buildNeutralExplicitLiveItinerary(liveCount);
    const merged = mergeEngine6NativeItineraryWithLive(native, live, {
      productCode,
      bundledRawProduct: loadBundledRawProduct(productCode),
    });

    const prefixTitles = merged
      .slice(0, bundledPrefix.length)
      .map(item => item.title);
    const hasGenericInPrefix = prefixTitles.some(title =>
      /^Itinerary Stop \d+$/i.test(title)
    );

    if (!hasGenericInPrefix && JSON.stringify(prefixTitles) === JSON.stringify(bundledPrefix)) {
      pass(`${productCode} bundled prefix titles preserved`);
    } else {
      fail(
        `${productCode} bundled prefix titles preserved`,
        JSON.stringify(prefixTitles)
      );
    }

    const tail = merged.slice(bundledPrefix.length);
    if (
      tail.length > 0 &&
      tail.every(item => /^Itinerary Stop \d+$/i.test(item.title))
    ) {
      pass(`${productCode} tail rows use neutral fallback only beyond bundled count`);
    } else if (tail.length === 0) {
      pass(`${productCode} no tail rows beyond bundled count`);
    } else {
      fail(
        `${productCode} tail rows use neutral fallback only beyond bundled count`,
        JSON.stringify(tail.map(item => item.title))
      );
    }
  }

  const { fixture: pedicabFixture, extraction: pedicabExtraction } =
    loadFixture("414460P1");
  const pedicabNativeCount = pedicabExtraction.extracted.itinerary?.length ?? 0;
  const pedicabBundledTitles = (pedicabExtraction.extracted.itinerary ?? []).map(
    item => item.title
  );
  const hasProductWrapper = Boolean(pedicabFixture.product);
  const rootLevelItineraryItems = Array.isArray(pedicabFixture.itineraryItems);
  const positionalFromBundled = [0, 1, 2].map(index =>
    getEngine6PositionalItineraryRowTitle(
      pedicabExtraction.product,
      index
    )?.title ?? null
  );

  pass("414460P1 fixture exists (not missing)");
  if (!hasProductWrapper && rootLevelItineraryItems) {
    pass("414460P1 classified: different fixture row shape (root-level productCode, no product wrapper)");
  } else {
    fail("414460P1 fixture shape audit");
  }
  if (pedicabNativeCount === 3) {
    pass("414460P1 bundled extraction yields 3 positional titles");
  } else {
    fail("414460P1 bundled extraction count", String(pedicabNativeCount));
  }
  if (JSON.stringify(pedicabBundledTitles) === JSON.stringify(positionalFromBundled.filter(Boolean))) {
    pass("414460P1 positional JSON titles available in bundled product");
  } else {
    fail(
      "414460P1 positional JSON titles",
      JSON.stringify({ pedicabBundledTitles, positionalFromBundled })
    );
  }

  const pedicabNative = loadNativeItinerary("414460P1");
  const pedicabLive = buildNeutralExplicitLiveItinerary(21);
  if (getEngine6ItineraryMergeMode(pedicabNative, pedicabLive) === "diverged") {
    pass("414460P1 classified: count mismatch (native 3 vs simulated live 21)");
  } else {
    fail("414460P1 diverged classification");
  }

  const pedicabMerged = mergeEngine6NativeItineraryWithLive(
    pedicabNative,
    pedicabLive,
    {
      productCode: "414460P1",
      bundledRawProduct: loadBundledRawProduct("414460P1"),
    }
  );
  if (
    JSON.stringify(pedicabMerged.slice(0, 3).map(item => item.title)) ===
    JSON.stringify([
      "Bethesda Fountain",
      "Bow Bridge",
      "Strawberry Fields, John Lennon Memorial",
    ])
  ) {
    pass("414460P1 first bundled rows repaired via positional merge");
  } else {
    fail(
      "414460P1 first bundled rows repaired",
      JSON.stringify(pedicabMerged.slice(0, 3).map(item => item.title))
    );
  }
} catch (error) {
  failed += 1;
  results.push(`FAIL  verification runner crashed: ${error?.stack ?? error}`);
}

console.log("NYC itinerary title repair verification");
console.log("=====================================");
for (const line of results) {
  console.log(line);
}
console.log("=====================================");
console.log(`Total: ${results.length} checks, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
