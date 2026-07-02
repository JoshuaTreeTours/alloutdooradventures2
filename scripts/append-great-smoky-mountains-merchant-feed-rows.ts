import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_GSM_PRODUCT_CODES = [
  "26480P10",
  "26480P2",
  "26480P11",
  "26480P6",
  "335817P3",
  "335817P10",
  "26480P8",
  "26480P14",
] as const;

const tours = NEW_GSM_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Great Smoky Mountains tour for ${productCode}`);
  }

  return tour;
});

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Great Smoky Mountains National Park",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
