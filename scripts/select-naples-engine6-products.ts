import { readFileSync, writeFileSync } from "node:fs";
import { ENGINE6_CONFIGURED_PRODUCT_CODES } from "../src/engine6/routes.ts";

const configured = new Set(ENGINE6_CONFIGURED_PRODUCT_CODES.map(c => c.toUpperCase()));
const available = JSON.parse(readFileSync("scripts/naples-live-product-data.json", "utf8")) as Record<string, unknown>[];
const priceOf = (r: Record<string, unknown>) => parseFloat(String(r.priceFrom).replace(/[^\d.]/g, ""));

const exclusivitySkipped = available.filter(r => configured.has(String(r.productCode).toUpperCase()));
const pool = available.filter(r => !configured.has(String(r.productCode).toUpperCase()) && !/bachelorette|birthday celebration|frenzy hunt/i.test(String(r.title ?? "")));

pool.sort((a, b) => {
  const preferredA = (a.preferred as boolean) ? 1 : 0;
  const preferredB = (b.preferred as boolean) ? 1 : 0;
  if (preferredB !== preferredA) return preferredB - preferredA;
  const priceDiff = priceOf(b) - priceOf(a);
  if (priceDiff !== 0) return priceDiff;
  return ((b.reviewCount as number) ?? 0) - ((a.reviewCount as number) ?? 0);
});

const TARGET = 24;
const minPremium = Math.ceil(TARGET / 2);
const selected: Record<string, unknown>[] = [];
const used = new Set<string>();
const take = (list: Record<string, unknown>[]) => {
  for (const item of list) {
    if (selected.length >= TARGET) break;
    const code = String(item.productCode);
    if (used.has(code)) continue;
    selected.push(item);
    used.add(code);
  }
};

const premium = pool.filter(r => priceOf(r) > 100);
const standard = pool.filter(r => priceOf(r) > 50 && priceOf(r) <= 100);
take(premium.slice(0, minPremium + 8));
take(premium);
take(standard);

while (selected.length < 22) {
  for (const item of pool) {
    const code = String(item.productCode);
    if (used.has(code)) continue;
    selected.push(item);
    used.add(code);
    if (selected.length >= 22) break;
  }
  break;
}

const selectedCodes = selected.map(r => String(r.productCode));
writeFileSync(
  "scripts/naples-product-selection.json",
  `${JSON.stringify(
    {
      destinationLabel: "Naples",
      destinationCitySlug: "naples",
      viatorDestinationSlug: "Naples",
      targetPremiumShare: 0.5,
      selectedProductCodes: selectedCodes,
    },
    null,
    2
  )}\n`
);
writeFileSync(
  "scripts/naples-new-product-codes.ts",
  `export const NEW_NAPLES_PRODUCT_CODES = [\n${selectedCodes.map(c => `  "${c}",`).join("\n")}\n] as const;\n`
);

const premiumCount = selected.filter(r => priceOf(r) > 100).length;
console.log(
  JSON.stringify(
    {
      selectedCount: selected.length,
      premiumCount,
      exclusivitySkipped: exclusivitySkipped.map(r => ({
        code: r.productCode,
        title: r.title,
        price: r.priceFrom,
      })),
      selected: selected.map(r => ({
        code: r.productCode,
        title: r.title,
        price: r.priceFrom,
      })),
    },
    null,
    2
  )
);

