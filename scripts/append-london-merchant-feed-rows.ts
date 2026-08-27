import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";
import { LONDON_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/londonViatorPublicRatings";

const OUTPUT_PATH = "data/merchantFeed.csv";

const tours = LONDON_VIATOR_PUBLIC_PRODUCT_CODES.map(
  productCode => {
    const tour = engine6ResolvedTours.find(
      entry => entry.productCode === productCode
    );
    if (!tour) {
      throw new Error(
        `Missing resolved London tour for ${productCode}`
      );
    }

    return tour;
  }
);

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "London",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
