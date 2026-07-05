/**
 * One-off patch: register Moab routes in map and validation fixtures.
 * Run: npx tsx scripts/patch-moab-engine6-wiring.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

import liveProducts from "./moab-live-product-data.json";

const ROUTES_PATH = "src/engine6/routes.ts";
const FIXTURES_PATH = "src/engine6/validationFixtures.ts";

const toConstName = (productCode: string, suffix: string) =>
  `ENGINE6_MOAB_${productCode.replace(/[^A-Z0-9]/gi, "_")}_${suffix}`;

const toImportAlias = (productCode: string) =>
  `specimen${productCode.toLowerCase()}Payload`;

const routeEntries = liveProducts
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

const jacksonHoleRouteAnchor = `  [
    ENGINE6_JACKSON_HOLE_6029YOFWILD_ROUTE,
    ENGINE6_JACKSON_HOLE_6029YOFWILD_PRODUCT_CODE,
  ],`;

let routes = readFileSync(ROUTES_PATH, "utf8");
if (!routes.includes("ENGINE6_MOAB_5555934P1_ROUTE,")) {
  const normalizedRoutes = normalizeNewlines(routes);
  const normalizedAnchor = normalizeNewlines(jacksonHoleRouteAnchor);
  if (!normalizedRoutes.includes(normalizedAnchor)) {
    throw new Error("Missing Jackson Hole route anchor in routes.ts");
  }
  routes = normalizedRoutes.replace(
    normalizedAnchor,
    `${routeEntries}\n${jacksonHoleRouteAnchor}`
  );
  writeFileSync(ROUTES_PATH, routes, "utf8");
  console.log("Patched Moab route map entries.");
} else {
  console.log("Moab route map entries already patched.");
}

const fixtureEntries = liveProducts
  .map(
    p => `  {
    productCode: "${p.productCode}",
    publicUrl: "${p.productUrl}",
    rawPayload: ${toImportAlias(p.productCode)} as Record<string, unknown>,
    validationRules: { itineraryOriginalityForNewBuilds: true },
  },`
  )
  .join("\n");

let fixtures = readFileSync(FIXTURES_PATH, "utf8");

const jacksonHoleFixtureAnchor = `  {
    productCode: "6029YOFWILD",
    publicUrl:
      "https://www.viator.com/tours/Jackson/Yellowstone-National-Park-Small-Group-Wildlife-Safari-by-Jeep/d51006-6029YOFWILD",
    rawPayload: specimen6029yofwildPayload as Record<string, unknown>,
    validationRules: { itineraryOriginalityForNewBuilds: true },
  },`;

const duplicateImportBlock = fixtures.match(
  /import specimen5555934p1Payload[\s\S]*?import specimen265766p59Payload from "\.\.\/\.\.\/data\/engine6\/viator\/265766P59\.exact-product\.json";\r?\nimport specimen5555934p1Payload/
);
if (duplicateImportBlock) {
  fixtures = fixtures.replace(
    /import specimen265766p59Payload from "\.\.\/\.\.\/data\/engine6\/viator\/265766P59\.exact-product\.json";\r?\nimport specimen5555934p1Payload[\s\S]*?import specimen265766p59Payload from "\.\.\/\.\.\/data\/engine6\/viator\/265766P59\.exact-product\.json";\r?\n/,
    'import specimen265766p59Payload from "../../data/engine6/viator/265766P59.exact-product.json";\n'
  );
  console.log("Removed duplicate Moab fixture imports.");
}

if (!fixtures.includes('productCode: "5555934P1"')) {
  const normalizedFixtures = normalizeNewlines(fixtures);
  const normalizedFixtureAnchor = normalizeNewlines(jacksonHoleFixtureAnchor);
  if (!normalizedFixtures.includes(normalizedFixtureAnchor)) {
    throw new Error("Missing Jackson Hole fixture anchor in validationFixtures.ts");
  }
  fixtures = normalizedFixtures.replace(
    normalizedFixtureAnchor,
    `${fixtureEntries}\n${jacksonHoleFixtureAnchor}`
  );
  writeFileSync(FIXTURES_PATH, fixtures, "utf8");
  console.log("Patched Moab validation fixture entries.");
} else {
  writeFileSync(FIXTURES_PATH, fixtures, "utf8");
  console.log("Moab validation fixture entries already patched.");
}
