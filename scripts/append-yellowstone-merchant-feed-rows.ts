import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";
import { requireEngine6ParagonMerchantFeedGate } from "./lib/requireEngine6ParagonDownstreamArtifactGate";

const OUTPUT_PATH = "data/merchantFeed.csv";

const NEW_YELLOWSTONE_PRODUCT_CODES = [
  "52661P41",
  "5639875P7",
  "52661P40",
  "151830P1",
  "151830P3",
  "151830P8",
  "316119P3",
  "5591554P17",
  "5591554P23",
  "137381P3",
  "481298P1",
  "265766P66",
  "463268P4",
  "463268P1",
  "52661P26",
  "5584219P8",
  "23667P10",
  "23667P2",
  "23667P3",
  "316119P4",
  "23667P4",
  "23667P1",
  "463268P2",
] as const;

const main = async () => {
  const tours = await requireEngine6ParagonMerchantFeedGate({
    destinationLabel: "Yellowstone National Park",
    destinationCitySlug: "yellowstone-national-park",
    viatorDestinationSlug: "Yellowstone-National-Park",
    productCodes: NEW_YELLOWSTONE_PRODUCT_CODES,
    resolvedTours: engine6ResolvedTours,
  });

  await appendMerchantFeedRowsWithImageGovernance({
    outputPath: OUTPUT_PATH,
    tours,
    destinationLabel: "Yellowstone",
    optionalBlankFields: ["average_rating", "rating_count", "review_count"],
  });
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
