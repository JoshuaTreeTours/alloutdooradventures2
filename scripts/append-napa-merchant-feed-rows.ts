import { NAPA_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/napaViatorPublicRatings";
import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";
import { requireEngine6ParagonMerchantFeedGate } from "./lib/requireEngine6ParagonDownstreamArtifactGate";

const OUTPUT_PATH = "data/merchantFeed.csv";

const main = async () => {
  const tours = await requireEngine6ParagonMerchantFeedGate({
    destinationLabel: "Napa Valley",
    destinationCitySlug: "napa",
    viatorDestinationSlug: "Napa-and-Sonoma",
    productCodes: NAPA_VIATOR_PUBLIC_PRODUCT_CODES,
    resolvedTours: engine6ResolvedTours,
  });

  await appendMerchantFeedRowsWithImageGovernance({
    outputPath: OUTPUT_PATH,
    tours,
    destinationLabel: "Napa",
  });
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
