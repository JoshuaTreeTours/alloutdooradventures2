import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_OLYMPIC_PRODUCT_CODES = [
  "132218P140",
  "132218P405",
  "265766P14",
  "265766P23",
  "265766P73",
  "318681P15",
  "3657P1",
  "383259P1",
  "5412OLYM",
  "5412P36",
  "5557524P1",
  "88081P1",
  "88081P2",
  "88081P4",
] as const;

const main = async () => {
  process.env.ENGINE6_PRODUCT_CODE_ALLOWLIST =
    NEW_OLYMPIC_PRODUCT_CODES.join(",");

  const tours = NEW_OLYMPIC_PRODUCT_CODES.map(productCode => {
    const tour = engine6ResolvedTours.find(
      entry => entry.productCode === productCode
    );
    if (!tour) {
      throw new Error(`Missing resolved Engine6 tour for ${productCode}`);
    }
    return tour;
  });

  await appendMerchantFeedRowsWithImageGovernance({
    outputPath: OUTPUT_PATH,
    tours,
    destinationLabel: "Olympic",
    optionalBlankFields: ["average_rating", "rating_count", "review_count"],
  });
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
