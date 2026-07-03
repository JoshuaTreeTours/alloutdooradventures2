import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_WASHINGTON_DC_PRODUCT_CODES = [
  "67327P4",
  "7953P7",
  "67327P13",
  "149066P1",
  "255730P191",
  "67327P5",
  "41503P1",
  "41503P2",
  "6349P59",
  "6766SIGTOUR",
  "67327P3",
  "7812P219",
  "6349DAYTOUR",
  "6349NIGHT",
  "6766P11",
  "41377P2",
  "60725P1",
  "14782P1",
  "5046WAS_MON",
  "6349VIPDC",
  "2384P20",
  "5769MTVN",
] as const;

const tours = NEW_WASHINGTON_DC_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Washington D.C. tour for ${productCode}`);
  }

  return tour;
});

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Washington, D.C.",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
