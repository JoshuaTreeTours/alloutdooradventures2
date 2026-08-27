import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";
import { ROME_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/romeViatorPublicRatings";

const OUTPUT_PATH = "data/merchantFeed.csv";

const tours = ROME_VIATOR_PUBLIC_PRODUCT_CODES.map(
  productCode => {
    const tour = engine6ResolvedTours.find(
      entry => entry.productCode === productCode
    );
    if (!tour) {
      throw new Error(
        `Missing resolved Rome tour for ${productCode}`
      );
    }

    return tour;
  }
);

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Rome",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
