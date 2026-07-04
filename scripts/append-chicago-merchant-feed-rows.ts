import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_CHICAGO_PRODUCT_CODES = [
  "5580ARC",
  "76126P2",
  "76126P8",
  "5580SKY",
  "35169P12",
  "5680NIGHT",
  "5680DAY",
  "61552P17",
  "7812P133",
  "8841P19",
  "188341P1",
  "130651P13",
  "3397P10",
  "3332BITE",
  "316128P3",
  "5042P100",
  "46250P9",
  "68189P1",
  "61552P8",
  "3332DAY",
  "191307P3",
  "338277P2",
  "7812P19",
] as const;

const tours = NEW_CHICAGO_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Chicago tour for ${productCode}`);
  }

  return tour;
});

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Chicago",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
