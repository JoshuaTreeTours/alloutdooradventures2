import fs from "node:fs";
import path from "node:path";

import { extractEngine6Product } from "../api/engine6/viatorExtractors";

const DATA_DIR = path.join(process.cwd(), "data/engine6/viator");

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const asString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const genericTitle =
  /^(?:stop|itinerary item|point of interest|location|destination|place)(?:\s*#?\s*\d+)?$/i;
const meaningful = (value: unknown) => {
  const text = asString(value);
  return text && !genericTitle.test(text) ? text : null;
};

const rawItems = (product: Record<string, unknown>) => {
  const direct = product.itineraryItems;
  if (Array.isArray(direct)) return direct;
  const itinerary = asRecord(product.itinerary);
  const nested = itinerary?.itineraryItems;
  return Array.isArray(nested) ? nested : [];
};

const oldTitleFor = (row: Record<string, unknown>) => {
  const poi = asRecord(row.pointOfInterest);
  const poiLocation = asRecord(row.pointOfInterestLocation);
  const stop = asRecord(row.stop);
  const location = asRecord(row.location);
  return (
    meaningful(poiLocation?.locationName) ??
    meaningful(poiLocation?.title) ??
    meaningful(poiLocation?.name) ??
    meaningful(row.title) ??
    meaningful(row.name) ??
    meaningful(row.label) ??
    meaningful(poi?.title) ??
    meaningful(poi?.name) ??
    meaningful(stop?.name) ??
    meaningful(stop?.title) ??
    meaningful(location?.name) ??
    "<description-derived or unavailable>"
  );
};

const rows: Array<{
  productCode: string;
  sourceTitle: string;
  currentRenderedTitle: string;
  proposedRenderedTitle: string;
}> = [];

for (const file of fs
  .readdirSync(DATA_DIR)
  .filter(name => name.endsWith(".exact-product.json"))) {
  const payload = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, file), "utf8")
  );
  const product = asRecord(payload.product);
  if (!product) continue;
  const productCode =
    asString(product.productCode) ?? file.replace(/\.exact-product\.json$/, "");
  const extracted = extractEngine6Product(payload as Record<string, unknown>)
    .extracted.itinerary;
  rawItems(product).forEach((value, index) => {
    const row = asRecord(value);
    const proposed = extracted[index]?.title;
    if (!row || !proposed) return;
    const sourceTitle =
      meaningful(row.title) ?? meaningful(row.name) ?? meaningful(row.label);
    const currentRenderedTitle = oldTitleFor(row);
    if (sourceTitle && currentRenderedTitle !== proposed) {
      rows.push({
        productCode,
        sourceTitle,
        currentRenderedTitle,
        proposedRenderedTitle: proposed,
      });
    }
  });
}

const affectedProducts = new Set(rows.map(row => row.productCode));
const lines = [
  "# Engine6 Itinerary Source Title Preservation Audit",
  "",
  "Scope: bundled Engine6 Viator exact-product payloads under `data/engine6/viator`.",
  "",
  `- Total affected Engine6 products: ${affectedProducts.size}`,
  `- Total affected itinerary rows: ${rows.length}`,
  "",
  "| Product code | Source title | Current rendered title | Proposed rendered title |",
  "|---|---|---|---|",
  ...rows.map(
    row =>
      `| ${row.productCode} | ${row.sourceTitle.replace(/\|/g, "\\|")} | ${row.currentRenderedTitle.replace(/\|/g, "\\|")} | ${row.proposedRenderedTitle.replace(/\|/g, "\\|")} |`
  ),
  "",
];
fs.writeFileSync(
  "artifacts/engine6-itinerary-source-title-audit.md",
  lines.join("\n")
);
console.log(`Affected Engine6 products: ${affectedProducts.size}`);
console.log(`Affected itinerary rows: ${rows.length}`);
