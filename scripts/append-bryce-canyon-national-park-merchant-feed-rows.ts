import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";
import { BRYCE_CANYON_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/bryceCanyonNationalParkViatorPublicRatings";

const OUTPUT_PATH = "data/merchantFeed.csv";

const tours = BRYCE_CANYON_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES.map(
  productCode => {
    const tour = engine6ResolvedTours.find(
      entry => entry.productCode === productCode
    );
    if (!tour) {
      throw new Error(
        `Missing resolved Bryce Canyon National Park tour for ${productCode}`
      );
    }

    return tour;
  }
);

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Bryce Canyon National Park",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
