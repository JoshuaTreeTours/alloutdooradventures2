import { readFileSync, writeFileSync } from "node:fs";
import { enforceMerchantFeedImageGovernanceOnRows } from "../src/engine6/merchantFeedImageGovernance";
import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import { engine6ResolvedTours } from "../src/engine6/registry";
import { DUBLIN_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/dublinViatorPublicRatings";

const OUTPUT_PATH = "data/merchantFeed.csv";
const CODES = DUBLIN_VIATOR_PUBLIC_PRODUCT_CODES;
const escapeCsv = (value: string) =>
  /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
const tours = CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(entry => entry.productCode === productCode);
  if (!tour) throw new Error(`Missing tour ${productCode}`);
  return tour;
});
const governedRows = await enforceMerchantFeedImageGovernanceOnRows({
  rows: tours.map(buildMerchantFeedRowFromProductSchema),
  tours,
});
const rowsById = new Map(governedRows.map(row => [row.id, row]));
const lines = readFileSync(OUTPUT_PATH, "utf8").split(/\r?\n/).filter(Boolean);
const [header, ...dataLines] = lines;
const nextLines = [header];
for (const line of dataLines) {
  const productCode = line.split(",")[0];
  const replacement = rowsById.get(productCode);
  if (!replacement) {
    nextLines.push(line);
    continue;
  }
  nextLines.push(
    [
      replacement.id,
      replacement.title,
      replacement.description,
      replacement.link,
      replacement.image_link,
      replacement.availability,
      replacement.price,
      replacement.condition,
      replacement.brand,
      replacement.average_rating,
      replacement.rating_count,
      replacement.review_count,
    ]
      .map(v => escapeCsv(String(v)))
      .join(",")
  );
  rowsById.delete(productCode);
}
if (rowsById.size > 0) throw new Error(`Missing rows ${[...rowsById.keys()]}`);
writeFileSync(OUTPUT_PATH, `${nextLines.join("\n")}\n`, "utf8");
console.log(`Updated merchant descriptions for ${CODES.join(", ")}`);
