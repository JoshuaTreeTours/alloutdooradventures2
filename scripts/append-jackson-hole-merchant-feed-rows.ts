import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_JACKSON_HOLE_PRODUCT_CODES = [
  "6029YOFWILD",
  "6029WILDSAF",
  "15073P5",
  "156172P2",
  "156172P1",
  "6252SCENIC",
  "38400P2",
  "6252P5",
  "15073P1",
  "15073P6",
  "320113P1",
  "15739P3",
  "56481P3",
  "35441P2",
  "35441P1",
  "460738P6",
  "342881P1",
  "38400P8",
  "6029WINTER",
  "156172P5",
] as const;

const tours = NEW_JACKSON_HOLE_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Jackson Hole tour for ${productCode}`);
  }

  return tour;
});

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Jackson Hole",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
