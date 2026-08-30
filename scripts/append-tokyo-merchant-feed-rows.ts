import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";
import { TOKYO_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/tokyoViatorPublicRatings";

const OUTPUT_PATH = "data/merchantFeed.csv";

const tours = TOKYO_VIATOR_PUBLIC_PRODUCT_CODES.map(
  productCode => {
    const tour = engine6ResolvedTours.find(
      entry => entry.productCode === productCode
    );
    if (!tour) {
      throw new Error(
        `Missing resolved Tokyo tour for ${productCode}`
      );
    }

    return tour;
  }
);

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Tokyo",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
