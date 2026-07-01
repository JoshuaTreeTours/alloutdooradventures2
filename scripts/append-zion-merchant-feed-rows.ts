import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_ZION_PRODUCT_CODES = [
  "199627P12",
  "199627P1",
  "422797P4",
  "118887P10",
  "118744P3",
  "265766P10",
  "265766P27",
  "286874P2",
  "300061P2",
  "163873P9",
  "163873P18",
  "118887P1",
  "118887P5",
  "118887P2",
  "275087P2",
  "163873P1",
  "118744P4",
] as const;

const tours = NEW_ZION_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Zion tour for ${productCode}`);
  }

  return tour;
});

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Zion",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
