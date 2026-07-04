import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_PHILADELPHIA_PRODUCT_CODES = [
  "8841P1",
  "8841P6",
  "8841P70",
  "8841P10",
  "102233P1",
  "102233P3",
  "255730P245",
  "255730P256",
  "86032P3",
  "8841P73",
  "153296P3",
  "8841P82",
  "86032P1",
  "8841P34",
  "5582660P3",
  "6314PHILSEG",
  "5042PHLSPI",
  "5042P61",
  "8841P27",
  "25140P1",
  "115692P1",
  "52886P6",
] as const;

const tours = NEW_PHILADELPHIA_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Philadelphia tour for ${productCode}`);
  }

  return tour;
});

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Philadelphia",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
