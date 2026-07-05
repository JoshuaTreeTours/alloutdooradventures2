import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_KEY_WEST_PRODUCT_CODES = [
  "331502P3",
  "362955P2",
  "119664P1",
  "288166P2",
  "328038P9",
  "102533P9",
  "2642P5",
  "418765P2",
  "2642P21",
  "2642P34",
  "2642P30",
  "7506P2",
  "7506P1",
  "5395SUNSET",
  "5264HDRS",
  "3800P30",
  "6426SHARKECO",
  "2642P6",
  "44502P1",
  "7812P77",
  "328038P8",
  "18235P1",
  "5264DC",
  "2642P16",
] as const;

const tours = NEW_KEY_WEST_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Key West tour for ${productCode}`);
  }

  return tour;
});

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Key West",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
