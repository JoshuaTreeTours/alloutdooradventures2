import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";
import { BUENOS_AIRES_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/buenosAiresViatorPublicRatings";

const OUTPUT_PATH = "data/merchantFeed.csv";

const tours = BUENOS_AIRES_VIATOR_PUBLIC_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Buenos Aires tour for ${productCode}`);
  }

  return tour;
});

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Buenos Aires",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
