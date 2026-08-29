import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";
import { LIMA_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/limaViatorPublicRatings";

const OUTPUT_PATH = "data/merchantFeed.csv";

const tours = LIMA_VIATOR_PUBLIC_PRODUCT_CODES.map(
  productCode => {
    const tour = engine6ResolvedTours.find(
      entry => entry.productCode === productCode
    );
    if (!tour) {
      throw new Error(
        `Missing resolved Lima tour for ${productCode}`
      );
    }

    return tour;
  }
);

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Lima",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
