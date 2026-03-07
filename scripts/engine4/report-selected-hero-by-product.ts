import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  engine4ViatorApiFallbackByProductCode,
  engine4ViatorTours,
} from "../../src/engine4/data/viatorTours";
import { selectEngine4ViatorImage } from "../../src/engine4/viator/selectEngine4ViatorImage";

const report = engine4ViatorTours.map(record => {
  const apiTour = engine4ViatorApiFallbackByProductCode[record.productCode];
  const selection = selectEngine4ViatorImage({
    productCode: record.productCode,
    apiTour,
    recordHeroImage: record.heroImage,
  });

  return {
    productCode: record.productCode,
    slug: record.slug,
    city: record.destination.city,
    selectedImage: selection.selected ?? null,
    candidates: selection.candidates,
    rejected: selection.rejected,
    missingImage: !selection.selected,
  };
});

const outPath = path.resolve("reports/engine4-selected-hero-by-product.json");
mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(
  outPath,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), report }, null, 2)}\n`,
  "utf8"
);

const missing = report.filter(row => row.missingImage);
console.info(`Wrote ${outPath}`);
console.info(`Engine4 products: ${report.length}`);
console.info(`Missing canonical image: ${missing.length}`);
if (missing.length) {
  missing.forEach(item => {
    console.error(`Missing image for ${item.productCode} (${item.slug})`);
  });
  process.exitCode = 1;
}
