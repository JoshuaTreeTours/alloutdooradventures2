import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";
import { PUERTO_VALLARTA_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/puertoVallartaViatorPublicRatings";

const OUTPUT_PATH = "data/merchantFeed.csv";

const tours = PUERTO_VALLARTA_VIATOR_PUBLIC_PRODUCT_CODES.map(
  productCode => {
    const tour = engine6ResolvedTours.find(
      entry => entry.productCode === productCode
    );
    if (!tour) {
      throw new Error(
        `Missing resolved Puerto Vallarta tour for ${productCode}`
      );
    }

    return tour;
  }
);

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Puerto Vallarta",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
