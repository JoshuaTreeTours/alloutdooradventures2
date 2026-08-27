import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";
import { DUBLIN_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/dublinViatorPublicRatings";

const OUTPUT_PATH = "data/merchantFeed.csv";

const tours = DUBLIN_VIATOR_PUBLIC_PRODUCT_CODES.map(
  productCode => {
    const tour = engine6ResolvedTours.find(
      entry => entry.productCode === productCode
    );
    if (!tour) {
      throw new Error(
        `Missing resolved Dublin tour for ${productCode}`
      );
    }

    return tour;
  }
);

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Dublin",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
