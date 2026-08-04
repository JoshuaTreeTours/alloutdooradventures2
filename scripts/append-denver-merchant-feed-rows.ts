import { readFileSync } from "node:fs";

import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_DENVER_PRODUCT_CODES = JSON.parse(
  readFileSync("scripts/denver-product-selection.json", "utf8")
).selectedProductCodes as string[];

const tours = NEW_DENVER_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Denver tour for ${productCode}`);
  }

  return tour;
});

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Denver",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
