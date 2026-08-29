import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";
import { CABO_SAN_LUCAS_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/caboSanLucasViatorPublicRatings";

const OUTPUT_PATH = "data/merchantFeed.csv";

const tours = CABO_SAN_LUCAS_VIATOR_PUBLIC_PRODUCT_CODES.map(
  productCode => {
    const tour = engine6ResolvedTours.find(
      entry => entry.productCode === productCode
    );
    if (!tour) {
      throw new Error(
        `Missing resolved Cabo San Lucas tour for ${productCode}`
      );
    }

    return tour;
  }
);

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Cabo San Lucas",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
