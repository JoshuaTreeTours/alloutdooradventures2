import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  resolveEngine6ExactProductFixtureWriteDecision,
  summarizeEngine6ExactProductFixtureDecisions,
} from "../../src/engine6/engine6ExactProductFixtureGovernance";
import {
  assertEngine6DestinationInfrastructureReady,
  type Engine6DestinationInfrastructureSpec,
} from "../../src/engine6/engine6DestinationInfrastructureValidation";
import {
  prepareEngine6ParagonFixturesStage,
  type Engine6ParagonDestinationCatalogTour,
} from "./engine6ParagonGovernancePipeline";

export const runEngine6ParagonFixtureGeneration = async <
  T extends Engine6ParagonDestinationCatalogTour,
>(args: {
  destinationLabel: string;
  destinationCitySlug: string;
  stateSlug?: string;
  citySlug?: string;
  viatorDestinationSlug?: string;
  targetPremiumShare?: number;
  tours: T[];
  buildFixture: (tour: T) => Record<string, unknown>;
  destinationLogLabel: string;
  stateSlug?: string;
  citySlug?: string;
  skipInfrastructureValidation?: boolean;
}) => {
  const infrastructureSpec: Engine6DestinationInfrastructureSpec | null =
    args.stateSlug && args.citySlug
      ? {
          destinationLabel: args.destinationLabel,
          destinationCitySlug: args.destinationCitySlug,
          stateSlug: args.stateSlug,
          citySlug: args.citySlug,
        }
      : null;

  const { tours, context } = await prepareEngine6ParagonFixturesStage({
    destinationLabel: args.destinationLabel,
    destinationCitySlug: args.destinationCitySlug,
    viatorDestinationSlug: args.viatorDestinationSlug,
    targetPremiumShare: args.targetPremiumShare,
    tours: args.tours,
  });

  if (infrastructureSpec && !args.skipInfrastructureValidation) {
    assertEngine6DestinationInfrastructureReady({
      spec: infrastructureSpec,
      deployScopedProductCodes: context.validatedProductCodes,
    });
  }

  const outputDir = path.join(process.cwd(), "data", "engine6", "viator");
  mkdirSync(outputDir, { recursive: true });

  const decisions = tours.map(tour => {
    const proposedPayload = args.buildFixture(tour);
    return resolveEngine6ExactProductFixtureWriteDecision({
      productCode: tour.productCode,
      destinationCitySlug: args.destinationCitySlug,
      proposedPayload,
    });
  });

  const summary = summarizeEngine6ExactProductFixtureDecisions(decisions);

  for (const collision of summary.namespaceCollisions) {
    console.warn(
      `[engine6-fixture-governance] Namespace collision for ${collision.productCode}: ${collision.message}`
    );
  }

  for (const report of summary.invalidHeroReports) {
    console.warn(
      `[engine6-fixture-governance] Invalid hero for ${report.productCode}: ${report.message}`
    );
  }

  for (const decision of decisions) {
    if (decision.action !== "write") {
      continue;
    }

    const filePath = path.join(outputDir, `${decision.productCode}.exact-product.json`);
    const tour = tours.find(
      entry => entry.productCode.trim().toUpperCase() === decision.productCode
    );
    if (!tour) {
      continue;
    }

    writeFileSync(
      filePath,
      `${JSON.stringify(args.buildFixture(tour), null, 2)}\n`,
      "utf8"
    );
    console.log(`Wrote ${filePath}`);
  }

  if (summary.invalidHeroReports.length > 0) {
    throw new Error(
      `Engine6 fixture generation reported ${summary.invalidHeroReports.length} product(s) with invalid authoritative hero URLs: ${summary.invalidHeroReports
        .map(report => report.productCode)
        .join(", ")}`
    );
  }

  console.log(
    `Generated ${summary.written.length} ${args.destinationLogLabel} Engine6 fixtures after Engine6 Paragon governance.`
  );

  if (summary.preserved.length > 0) {
    console.log(
      `Preserved ${summary.preserved.length} existing exact-product fixture(s) outside deploy scope: ${summary.preserved.join(", ")}`
    );
  }

  return {
    ...summary,
    validatedProductCodes: context.validatedProductCodes,
  };
};
