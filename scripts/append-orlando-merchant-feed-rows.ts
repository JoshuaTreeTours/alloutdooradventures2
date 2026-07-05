import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_ORLANDO_PRODUCT_CODES = [
  "3170P78",
  "331790P2",
  "42054P2",
  "3170P51",
  "42054P4",
  "3170P40",
  "123164P1",
  "120040P3",
  "317042",
  "3170P41",
  "42054P5",
  "3170P32",
  "42627P1",
  "5580079P3",
  "109065P4",
  "105290P7",
  "58194P1",
  "39750P18",
  "37177P6",
  "5039P5",
  "53748P4",
  "357987P1",
] as const;

const tours = NEW_ORLANDO_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Orlando tour for ${productCode}`);
  }

  return tour;
});

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Orlando",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
