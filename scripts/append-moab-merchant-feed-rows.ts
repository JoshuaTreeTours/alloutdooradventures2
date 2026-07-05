import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_MOAB_PRODUCT_CODES = [
  "5555934P1",
  "7016P4",
  "7016OFFROAD",
  "22803P18",
  "132679P2",
  "5555934P2",
  "22803P33",
  "6896MOABCPARK",
  "349715P2",
  "458439P2",
  "334588P4",
  "132679P1",
  "6896MOABAPARK",
  "349715P3",
  "349715P1",
  "18497P15",
  "16649P13",
  "131994P3",
  "334588P3",
  "252408P1",
  "349715P4",
  "16847P11",
  "260792P5",
  "165224P7",
  "169760P14",
  "265766P59",
] as const;

const tours = NEW_MOAB_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Moab tour for ${productCode}`);
  }

  return tour;
});

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Moab",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
