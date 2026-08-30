import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";
import { SEOUL_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/seoulViatorPublicRatings";

const OUTPUT_PATH = "data/merchantFeed.csv";

const tours = SEOUL_VIATOR_PUBLIC_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Seoul tour for ${productCode}`);
  }

  return tour;
});

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Seoul",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
