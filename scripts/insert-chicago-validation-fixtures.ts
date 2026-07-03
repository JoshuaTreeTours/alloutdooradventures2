import { readFileSync, writeFileSync } from "node:fs";

const products = JSON.parse(
  readFileSync("scripts/chicago-live-product-data.json", "utf8")
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

const path = "src/engine6/validationFixtures.ts";
let content = readFileSync(path, "utf8").replace(/\r\n/g, "\n");

if (content.includes('productCode: "5580ARC"')) {
  console.log("Chicago fixture entries already present.");
  process.exit(0);
}

const marker = `\n  {\n    productCode: "5769MTVN",`;

const markerIndex = content.indexOf(marker);
if (markerIndex === -1) {
  throw new Error("5769MTVN marker not found in validationFixtures.ts");
}

content =
  content.slice(0, markerIndex + 1) +
  entries +
  content.slice(markerIndex + 1);

writeFileSync(path, content);
console.log(`Inserted ${products.length} Chicago fixture entries.`);
