import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";
import { requireEngine6ParagonMerchantFeedGate } from "./lib/requireEngine6ParagonDownstreamArtifactGate";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_GRAND_CANYON_PRODUCT_CODES = [
  "5662346P1",
  "5637206P8",
  "5637206P7",
  "109090P3",
  "5167SD",
  "6338P18",
  "265766P28",
  "5637206P4",
  "318692P1",
  "318692P2",
  "18678CS",
  "6613P24",
  "89776P1",
  "229754P2",
  "5488718P3",
  "7886P3",
  "3272GCER",
  "25576P9",
  "6613P14",
  "6338DISCOVERY",
  "229754P1",
  "3272GCSR2",
] as const;

const main = async () => {
  const tours = await requireEngine6ParagonMerchantFeedGate({
    destinationLabel: "Grand Canyon National Park",
    destinationCitySlug: "grand-canyon-national-park",
    viatorDestinationSlug: "Grand-Canyon-National-Park",
    productCodes: NEW_GRAND_CANYON_PRODUCT_CODES,
    resolvedTours: engine6ResolvedTours,
  });

  await appendMerchantFeedRowsWithImageGovernance({
    outputPath: OUTPUT_PATH,
    tours,
    destinationLabel: "Grand Canyon",
  });
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
