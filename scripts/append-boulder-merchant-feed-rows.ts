import { readFileSync } from "node:fs";

import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_BOULDER_PRODUCT_CODES = JSON.parse(
  readFileSync("scripts/boulder-product-selection.json", "utf8")
).selectedProductCodes as string[];

const tours = NEW_BOULDER_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Boulder tour for ${productCode}`);
  }

  return tour;
});

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Boulder",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
