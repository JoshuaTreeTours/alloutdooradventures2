import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";
import { NEW_NAPLES_PRODUCT_CODES } from "./naples-new-product-codes";

const OUTPUT_PATH = "data/merchantFeed.csv";

const tours = NEW_NAPLES_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Naples tour for ${productCode}`);
  }

  return tour;
});

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Naples",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
