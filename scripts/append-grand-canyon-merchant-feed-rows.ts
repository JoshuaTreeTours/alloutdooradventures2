import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_GRAND_CANYON_PRODUCT_CODES = [
  "5662346P1",
  "5637206P8",
  "5637206P7",
  "109090P3",
  "5167SD",
  "6338P18",
  "265766P28",
  "5637206P4",
  "318692P1",
  "318692P2",
  "18678CS",
  "6613P24",
  "89776P1",
  "229754P2",
  "5488718P3",
  "7886P3",
  "3272GCER",
  "25576P9",
  "108446P2",
  "6338DISCOVERY",
  "229754P1",
  "3272GCSR2",
] as const;

const tours = NEW_GRAND_CANYON_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Grand Canyon tour for ${productCode}`);
  }

  return tour;
});

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Grand Canyon",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
