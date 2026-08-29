import { readFileSync, writeFileSync } from "node:fs";

import catalog from "./cancun-product-catalog.json";
import { resolveEngine6PathForProductCode } from "../src/engine6/routes";

const sitemapPath = "public/sitemap-tours.xml";
const baseUrl = "https://www.alloutdooradventures.com";
const existing = readFileSync(sitemapPath, "utf8");

const newUrls = catalog
  .map(product => {
    const path = resolveEngine6PathForProductCode(product.productCode);
    if (!path) {
      throw new Error(`Missing route for ${product.productCode}`);
    }
    return `  <url><loc>${baseUrl}${path}</loc><priority>0.8</priority></url>`;
  })
  .filter(line => !existing.includes(line.trim()));

if (newUrls.length === 0) {
  console.log(
    "Sitemap already contains Cancun tour URLs."
  );
  process.exit(0);
}

const closingTag = "</urlset>";
const next = existing.replace(
  closingTag,
  `${newUrls.join("\n")}\n${closingTag}`
);
writeFileSync(sitemapPath, next, "utf8");
console.log(
  `Appended ${newUrls.length} Cancun sitemap URLs.`
);
