import { readFile } from "node:fs/promises";
import path from "node:path";
import { tsImport } from "tsx/esm/api";

/**
 * Vercel rewrites /destinations/:state/:city/tours/:slug to the physical
 * /dist/.../index.html. A promoted Lead-to-Gold card is unusable if that
 * artifact is missing or if the booking CTA points to a dead AOA /book page.
 *
 * Audit EVERY migrated FH product before allowing a production build.
 */
const { getFareHarborProofProducts } = await tsImport(
  "../src/data/fareharborLeadToGoldProof.ts",
  import.meta.url
);
const products = getFareHarborProofProducts();
const failures = [];
const regions = new Set();

for (const product of products) {
  const parts = product.publicPath.split("/").filter(Boolean);
  const state = parts[1], city = parts[2];
  regions.add(`${state}/${city}`);
  const file = path.join("dist", ...parts, "index.html");
  let html;
  try {
    html = await readFile(file, "utf8");
  } catch {
    failures.push(`${product.publicPath}: missing deployed HTML (${file})`);
    continue;
  }

  const checkoutPath = `fareharbor.com/embeds/book/${product.company}/items/${product.itemId}/`;
  if (!html.includes(checkoutPath)) {
    failures.push(`${product.publicPath}: attributed FareHarbor checkout missing from HTML`);
  }
  if (html.includes("Tour not found") || html.includes("Booking not found")) {
    failures.push(`${product.publicPath}: error text found in rendered page`);
  }
  if (!html.includes("Check availability")) {
    failures.push(`${product.publicPath}: missing booking CTA`);
  }
}

if (failures.length) {
  console.error(
    `[fareharbor-gold-link-audit] ${failures.length} failed products across ${regions.size} locations:`
  );
  for (const problem of failures.slice(0, 90)) console.error(`  ${problem}`);
  throw new Error("Lead-to-Gold URLs are not deployable; refusing production build");
}

console.log(
  `[fareharbor-gold-link-audit] PASS: ${products.length} physical route pages and attributed booking links across ${regions.size} locations`
);
