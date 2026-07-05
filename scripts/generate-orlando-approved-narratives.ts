import { readFileSync, writeFileSync } from "node:fs";

const codes = JSON.parse(
  readFileSync("scripts/orlando-product-selection.json", "utf8")
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

const out = `export const ORLANDO_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
${codes.map(code => `  "${code}"`).join(",\n")}
] as const;

export type OrlandoTargetedNarrativeDescriptionProductCode =
  (typeof ORLANDO_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const ORLANDO_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  OrlandoTargetedNarrativeDescriptionProductCode,
  string
> = {
${entries}
};

export const getOrlandoTargetedNarrativeDescription = (productCode: string) =>
  ORLANDO_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as OrlandoTargetedNarrativeDescriptionProductCode
  ];
`;

writeFileSync("src/engine6/orlandoApprovedNarrativeDescriptions.ts", out);
console.log(`Wrote ${codes.length} Orlando approved narratives.`);
