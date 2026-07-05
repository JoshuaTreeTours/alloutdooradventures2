/**
 * Patch missing Fort Lauderdale route entries and validation fixtures.
 * Run: npx tsx scripts/patch-fort-lauderdale-wiring-entries.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

import catalog from "./fort-lauderdale-product-catalog.json";
import { NEW_FORT_LAUDERDALE_PRODUCT_CODES } from "./fort-lauderdale-new-product-codes";

const ROUTES_PATH = "src/engine6/routes.ts";
const VALIDATION_FIXTURES_PATH = "src/engine6/validationFixtures.ts";

const toConstSuffix = (productCode: string) =>
  productCode.replace(/[^A-Z0-9]/gi, "_");

const toImportAlias = (productCode: string) =>
  `specimen${productCode.toLowerCase()}Payload`;

const routeEntries = NEW_FORT_LAUDERDALE_PRODUCT_CODES.map(code => {
  const suffix = toConstSuffix(code);
  return `  [
    ENGINE6_FORT_LAUDERDALE_${suffix}_ROUTE,
    ENGINE6_FORT_LAUDERDALE_${suffix}_PRODUCT_CODE,
  ],`;
}).join("\n");

let routesContent = readFileSync(ROUTES_PATH, "utf8");
if (!routesContent.includes("ENGINE6_FORT_LAUDERDALE_155077P1_ROUTE,")) {
  routesContent = routesContent.replace(
    `  [
    ENGINE6_FORT_LAUDERDALE_TROPICAL_KAYAK_ROUTE,
    ENGINE6_FORT_LAUDERDALE_TROPICAL_KAYAK_PRODUCT_CODE,
  ],
  [ENGINE6_MIAMI_PARASAILING_ROUTE, ENGINE6_MIAMI_PARASAILING_PRODUCT_CODE],`,
    `  [
    ENGINE6_FORT_LAUDERDALE_TROPICAL_KAYAK_ROUTE,
    ENGINE6_FORT_LAUDERDALE_TROPICAL_KAYAK_PRODUCT_CODE,
  ],
${routeEntries}
  [ENGINE6_MIAMI_PARASAILING_ROUTE, ENGINE6_MIAMI_PARASAILING_PRODUCT_CODE],`
  );
  writeFileSync(ROUTES_PATH, routesContent, "utf8");
  console.log("Patched route entries.");
} else {
  console.log("Route entries already present.");
}

const fixtureEntries = catalog
  .map(
    product => `  {
    productCode: "${product.productCode}",
    publicUrl: "${product.productUrl}",
    rawPayload: ${toImportAlias(product.productCode)} as Record<string, unknown>,
    validationRules: { itineraryOriginalityForNewBuilds: true },
  },`
  )
  .join("\n");

let fixturesContent = readFileSync(VALIDATION_FIXTURES_PATH, "utf8");
if (!fixturesContent.includes('productCode: "155077P1"')) {
  fixturesContent = fixturesContent.replace(
    `  {
    productCode: "89173P10",
    publicUrl:
      "https://www.viator.com/tours/Fort-Lauderdale/Fort-Lauderdales-Tropical-Kayak-Tour-and-Island-Adventure/d660-89173P10",
    rawPayload: specimen89173p10Payload as Record<string, unknown>,
  },`,
    `${fixtureEntries}
  {
    productCode: "89173P10",
    publicUrl:
      "https://www.viator.com/tours/Fort-Lauderdale/Fort-Lauderdales-Tropical-Kayak-Tour-and-Island-Adventure/d660-89173P10",
    rawPayload: specimen89173p10Payload as Record<string, unknown>,
  },`
  );
  writeFileSync(VALIDATION_FIXTURES_PATH, fixturesContent, "utf8");
  console.log("Patched validation fixture entries.");
} else {
  console.log("Validation fixture entries already present.");
}
