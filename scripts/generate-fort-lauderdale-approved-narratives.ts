import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { NEW_FORT_LAUDERDALE_PRODUCT_CODES } from "./fort-lauderdale-new-product-codes";

const escapeString = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const descriptions = NEW_FORT_LAUDERDALE_PRODUCT_CODES.map(productCode => {
  const fixturePath = path.join(
    process.cwd(),
    "data",
    "engine6",
    "viator",
    `${productCode}.exact-product.json`
  );
  const payload = JSON.parse(readFileSync(fixturePath, "utf8")) as {
    product: { description: { text: string } };
  };
  return { productCode, description: payload.product.description.text.trim() };
});

const entries = descriptions
  .map(
    ({ productCode, description }) =>
      `  "${productCode}":\n    "${escapeString(description)}",`
  )
  .join("\n");

const output = `export const FORT_LAUDERDALE_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
${NEW_FORT_LAUDERDALE_PRODUCT_CODES.map(code => `  "${code}"`).join(",\n")}
] as const;

export type FortLauderdaleTargetedNarrativeDescriptionProductCode =
  (typeof FORT_LAUDERDALE_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const FORT_LAUDERDALE_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  FortLauderdaleTargetedNarrativeDescriptionProductCode,
  string
> = {
${entries}
};

export const getFortLauderdaleTargetedNarrativeDescription = (productCode: string) =>
  FORT_LAUDERDALE_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as FortLauderdaleTargetedNarrativeDescriptionProductCode
  ];
`;

writeFileSync(
  "src/engine6/fortLauderdaleApprovedNarrativeDescriptions.ts",
  output,
  "utf8"
);
console.log(
  `Wrote fortLauderdaleApprovedNarrativeDescriptions.ts (${NEW_FORT_LAUDERDALE_PRODUCT_CODES.length} products).`
);
