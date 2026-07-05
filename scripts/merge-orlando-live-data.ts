/**
 * Merge browser extracts into Orlando live product data and filter to selection.
 * Run: npx tsx scripts/merge-orlando-live-data.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

const selection = JSON.parse(
  readFileSync("scripts/orlando-product-selection.json", "utf8")
).selectedProductCodes as string[];

const live = JSON.parse(
  readFileSync("scripts/orlando-live-product-data.json", "utf8")
) as Record<string, unknown>[];

const browser = JSON.parse(
  readFileSync("scripts/orlando-browser-extracts.json", "utf8")
) as Record<string, unknown>[];

const byCode = new Map<string, Record<string, unknown>>();
for (const entry of [...live, ...browser]) {
  byCode.set(String(entry.productCode), entry);
}

const merged = selection.map(code => {
  const entry = byCode.get(code);
  if (!entry) {
    throw new Error(`Missing live data for selected product ${code}`);
  }
  return entry;
});

writeFileSync(
  "scripts/orlando-live-product-data.json",
  `${JSON.stringify(merged, null, 2)}\n`
);
console.log(`Merged ${merged.length} Orlando products for selection.`);
