import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";
import { requireEngine6ParagonMerchantFeedGate } from "./lib/requireEngine6ParagonDownstreamArtifactGate";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_YOSEMITE_PREMIUM_PRODUCT_CODES = [
  "18808P20",
  "18808P17",
  "18808P15",
  "69029P8",
  "7011P11",
  "19970P1",
  "460648P15",
  "5582835P5",
  "449449P2",
] as const;

const main = async () => {
  const tours = await requireEngine6ParagonMerchantFeedGate({
    destinationLabel: "Yosemite National Park",
    destinationCitySlug: "yosemite",
    viatorDestinationSlug: "Yosemite-National-Park",
    productCodes: NEW_YOSEMITE_PREMIUM_PRODUCT_CODES,
    resolvedTours: engine6ResolvedTours,
  });

  await appendMerchantFeedRowsWithImageGovernance({
    outputPath: OUTPUT_PATH,
    tours,
    destinationLabel: "Yosemite premium",
  });
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
