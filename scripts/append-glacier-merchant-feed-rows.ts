import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_GLACIER_PRODUCT_CODES = [
  "123783P1",
  "70248P3",
  "70248P2",
  "299521P2",
  "299521P8",
  "86727P7",
  "487722P4",
] as const;

const tours = NEW_GLACIER_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Glacier tour for ${productCode}`);
  }

  return tour;
});

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Glacier National Park",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
