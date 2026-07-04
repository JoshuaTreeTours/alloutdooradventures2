import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const PRODUCT_CODES = [
  "8841P1",
  "8841P6",
  "8841P70",
  "8841P10",
  "102233P1",
  "102233P3",
  "255730P245",
  "255730P256",
  "86032P3",
  "8841P73",
  "153296P3",
  "8841P82",
  "86032P1",
  "8841P34",
  "5582660P3",
  "6314PHILSEG",
  "5042PHLSPI",
  "5042P61",
  "8841P27",
  "25140P1",
  "115692P1",
  "52886P6",
] as const;

const escapeString = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const descriptions = PRODUCT_CODES.map(productCode => {
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

const output = `export const PHILADELPHIA_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
${PRODUCT_CODES.map(code => `  "${code}"`).join(",\n")}
] as const;

export type PhiladelphiaTargetedNarrativeDescriptionProductCode =
  (typeof PHILADELPHIA_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const PHILADELPHIA_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  PhiladelphiaTargetedNarrativeDescriptionProductCode,
  string
> = {
${entries}
};

export const getPhiladelphiaTargetedNarrativeDescription = (productCode: string) =>
  PHILADELPHIA_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as PhiladelphiaTargetedNarrativeDescriptionProductCode
  ];
`;

writeFileSync(
  "src/engine6/philadelphiaApprovedNarrativeDescriptions.ts",
  output,
  "utf8"
);
console.log(
  `Wrote philadelphiaApprovedNarrativeDescriptions.ts (${PRODUCT_CODES.length} products).`
);
