import { engine6ResolvedTours } from "../src/engine6/registry";
import { appendMerchantFeedRowsWithImageGovernance } from "./lib/appendMerchantFeedRowsWithImageGovernance";
import { requireEngine6ParagonMerchantFeedGate } from "./lib/requireEngine6ParagonDownstreamArtifactGate";

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

const main = async () => {
  const tours = await requireEngine6ParagonMerchantFeedGate({
    destinationLabel: "Zion National Park",
    destinationCitySlug: "zion-national-park",
    viatorDestinationSlug: "Zion-National-Park",
    productCodes: NEW_ZION_PRODUCT_CODES,
    resolvedTours: engine6ResolvedTours,
  });

  await appendMerchantFeedRowsWithImageGovernance({
    outputPath: OUTPUT_PATH,
    tours,
    destinationLabel: "Zion",
  });
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
