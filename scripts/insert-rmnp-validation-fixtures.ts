import { readFileSync, writeFileSync } from "node:fs";

const products = JSON.parse(
  readFileSync("scripts/rocky-mountain-national-park-live-product-data.json", "utf8")
) as Array<{ productCode: string; productUrl: string }>;

const entries = products
  .map(
    p => `  {
    productCode: "${p.productCode}",
    publicUrl: "${p.productUrl}",
    rawPayload: specimen${p.productCode.toLowerCase()}Payload as Record<string, unknown>,
    validationRules: { itineraryOriginalityForNewBuilds: true },
  },`
  )
  .join("\n");

const fixturesPath = "src/engine6/validationFixtures.ts";
let content = readFileSync(fixturesPath, "utf8");

if (content.includes('productCode: "366391P1"')) {
  console.log("Fixture entries already present");
  process.exit(0);
}

content = content.replace(
  `  {
    productCode: "6029_4DAYPARK",`,
  `${entries}
  {
    productCode: "6029_4DAYPARK",`
);

writeFileSync(fixturesPath, content);
console.log(`Inserted ${products.length} RMNP validation fixture entries.`);
