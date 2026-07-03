import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_SEDONA_PRODUCT_CODES = [
  "162351P6",
  "321860P2",
  "327849P2",
  "327849P1",
  "54668P2",
  "189623P3",
  "325517P1",
  "109073P8",
  "129182P3",
  "129182P1",
  "393812P1",
  "338750P2",
  "393812P3",
  "129182P2",
  "3925OBW",
  "3925P1",
  "25271P1",
  "15880P21",
  "15880P10",
  "32242P1",
  "291644P1",
  "115255P2",
] as const;

const tours = NEW_SEDONA_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Sedona tour for ${productCode}`);
  }

  return tour;
});

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Sedona",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
