import { YOSEMITE_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/yosemiteViatorPublicRatings";
import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";
import { requireEngine6ParagonMerchantFeedGate } from "./lib/requireEngine6ParagonDownstreamArtifactGate";

const OUTPUT_PATH = "data/merchantFeed.csv";

const main = async () => {
  const tours = await requireEngine6ParagonMerchantFeedGate({
    destinationLabel: "Yosemite National Park",
    destinationCitySlug: "yosemite",
    viatorDestinationSlug: "Yosemite-National-Park",
    productCodes: YOSEMITE_VIATOR_PUBLIC_PRODUCT_CODES,
    resolvedTours: engine6ResolvedTours,
  });

  await appendMerchantFeedRowsWithImageGovernance({
    outputPath: OUTPUT_PATH,
    tours,
    destinationLabel: "Yosemite",
  });
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
