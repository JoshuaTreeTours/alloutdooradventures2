import { readFileSync, writeFileSync } from "node:fs";

const codes = JSON.parse(
  readFileSync("scripts/honolulu-product-selection.json", "utf8")
).selectedProductCodes as string[];

const descriptions: Record<string, string> = {};
for (const code of codes) {
  const fixture = JSON.parse(
    readFileSync(`data/engine6/viator/${code}.exact-product.json`, "utf8")
  ) as { product: { description: { text: string } } };
  descriptions[code] = fixture.product.description.text;
}

const entries = codes
  .map(code => `  "${code}": ${JSON.stringify(descriptions[code])},`)
  .join("\n");

const out = `export const HONOLULU_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
${codes.map(code => `  "${code}"`).join(",\n")}
] as const;

export type HonoluluTargetedNarrativeDescriptionProductCode =
  (typeof HONOLULU_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const HONOLULU_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  HonoluluTargetedNarrativeDescriptionProductCode,
  string
> = {
${entries}
};

export const getHonoluluTargetedNarrativeDescription = (productCode: string) =>
  HONOLULU_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as HonoluluTargetedNarrativeDescriptionProductCode
  ];
`;

writeFileSync("src/engine6/honoluluApprovedNarrativeDescriptions.ts", out);
console.log(`Wrote ${codes.length} Honolulu approved narratives.`);
