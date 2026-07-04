import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_BOSTON_PRODUCT_CODES = [
  "3283BWW",
  "3283SSCRUISE",
  "44921P7",
  "3037DUCK",
  "66111P3",
  "26797P4",
  "8843P7",
  "7167P68",
  "5046BOS_OTT",
  "7812P131",
  "8841P14",
  "400049P3",
  "8647P466",
  "400049P5",
  "385595P5",
  "5046BOS_GG",
  "3283CODZILLA",
  "3978TOUR5",
  "5042BOSDIN",
  "5151BOSCY014",
  "66192P8",
  "255730P225",
] as const;

const tours = NEW_BOSTON_PRODUCT_CODES.map(productCode => {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  if (!tour) {
    throw new Error(`Missing resolved Boston tour for ${productCode}`);
  }

  return tour;
});

appendMerchantFeedRowsWithImageGovernance({
  outputPath: OUTPUT_PATH,
  tours,
  destinationLabel: "Boston",
}).catch(error => {
  console.error(error);
  process.exit(1);
});
