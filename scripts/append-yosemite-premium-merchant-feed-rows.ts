import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_YOSEMITE_PREMIUM_PRODUCT_CODES = [
  "18808P20",
  "18808P17",
  "18808P15",
  "69029P8",
  "7011P11",
  "19970P1",
  "460648P15",
  "5582835P5",
  "449449P2",
] as const;

const tours = NEW_YOSEMITE_PREMIUM_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Yosemite tour for ${productCode}`);
  }

  return tour;
});

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Yosemite premium",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
