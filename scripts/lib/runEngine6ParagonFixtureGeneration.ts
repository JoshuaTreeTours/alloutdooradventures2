import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  prepareEngine6ParagonFixturesStage,
  type Engine6ParagonDestinationCatalogTour,
} from "./engine6ParagonGovernancePipeline";

export const runEngine6ParagonFixtureGeneration = async <
  T extends Engine6ParagonDestinationCatalogTour,
>(args: {
  destinationLabel: string;
  destinationCitySlug: string;
  viatorDestinationSlug?: string;
  targetPremiumShare?: number;
  tours: T[];
  buildFixture: (tour: T) => Record<string, unknown>;
  destinationLogLabel: string;
}) => {
  const { tours } = await prepareEngine6ParagonFixturesStage({
    destinationLabel: args.destinationLabel,
    destinationCitySlug: args.destinationCitySlug,
    viatorDestinationSlug: args.viatorDestinationSlug,
    targetPremiumShare: args.targetPremiumShare,
    tours: args.tours,
  });

  const outputDir = path.join(process.cwd(), "data", "engine6", "viator");
  mkdirSync(outputDir, { recursive: true });

  for (const tour of tours) {
    const filePath = path.join(outputDir, `${tour.productCode}.exact-product.json`);
    writeFileSync(
      filePath,
      `${JSON.stringify(args.buildFixture(tour), null, 2)}\n`,
      "utf8"
    );
    console.log(`Wrote ${filePath}`);
  }

  console.log(
    `Generated ${tours.length} ${args.destinationLogLabel} Engine6 fixtures after Engine6 Paragon governance.`
  );
};
