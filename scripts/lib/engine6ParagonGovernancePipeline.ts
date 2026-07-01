import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  formatEngine6DestinationBuildFailureReport,
  formatEngine6ProductSelectionGovernanceReport,
  type Engine6DestinationBuildConfig,
  type Engine6ProductSelectionGovernanceReport,
} from "../src/engine6/engine6ProductSelectionGovernance";
import {
  collectEngine6ProductSelectionBlocklistAdditions,
  persistEngine6ProductSelectionBlocklistAdditions,
} from "../src/engine6/engine6ProductSelectionBlocklist";
import {
  assertEngine6ParagonArtifactStageAllowed,
  buildEngine6ParagonProductSelectionConfig,
  buildEngine6ParagonProductSelectionConfigFromResolvedTours,
  filterEngine6ParagonCatalogByValidatedProductCodes,
  runEngine6ParagonProductSelectionPipeline,
  type Engine6ParagonDestinationCatalogTour,
  type Engine6ParagonGovernanceDownstreamArtifactStage,
  type Engine6ParagonGovernancePipelineContext,
} from "../src/engine6/engine6ParagonGovernancePipeline";

export {
  assertEngine6ParagonArtifactStageAllowed,
  buildEngine6ParagonProductSelectionConfig,
  buildEngine6ParagonProductSelectionConfigFromResolvedTours,
  ENGINE6_PARAGON_GOVERNANCE_DOWNSTREAM_ARTIFACT_STAGES,
  ENGINE6_PARAGON_GOVERNANCE_PIPELINE_ID,
  filterEngine6ParagonCatalogByValidatedProductCodes,
  runEngine6ParagonProductSelectionPipeline,
  type Engine6ParagonDestinationCatalogTour,
  type Engine6ParagonGovernanceDownstreamArtifactStage,
  type Engine6ParagonGovernancePipelineContext,
} from "../src/engine6/engine6ParagonGovernancePipeline";

const REPORT_DIR = path.resolve("reports");
const JSON_PATH = path.join(
  REPORT_DIR,
  "engine6-product-selection-governance.json"
);
const MD_PATH = path.join(
  REPORT_DIR,
  "engine6-product-selection-governance.md"
);
const FAILURE_MD_PATH = path.join(
  REPORT_DIR,
  "engine6-destination-build-failure.md"
);

export const writeEngine6ParagonGovernanceReports = (args: {
  report: Engine6ProductSelectionGovernanceReport;
  config: Engine6DestinationBuildConfig;
}) => {
  const formatted = formatEngine6ProductSelectionGovernanceReport(args.report);
  mkdirSync(REPORT_DIR, { recursive: true });
  writeFileSync(JSON_PATH, `${JSON.stringify(args.report, null, 2)}\n`);
  writeFileSync(MD_PATH, formatted);

  if (args.report.buildTerminated) {
    writeFileSync(
      FAILURE_MD_PATH,
      formatEngine6DestinationBuildFailureReport(args.report)
    );
  }

  return {
    jsonPath: JSON_PATH,
    markdownPath: MD_PATH,
    failureMarkdownPath: args.report.buildTerminated ? FAILURE_MD_PATH : null,
    formatted,
  };
};

export const persistEngine6ParagonGovernanceBlocklistAdditions = (args: {
  report: Engine6ProductSelectionGovernanceReport;
  config: Engine6DestinationBuildConfig;
}) => {
  const candidateTitlesByCode = Object.fromEntries(
    args.config.slots.flatMap(slot =>
      slot.candidates.map(candidate => [candidate.productCode, candidate.title])
    )
  );

  const additions = collectEngine6ProductSelectionBlocklistAdditions({
    rejected: args.report.rejected,
    destinationLabel: args.config.destinationLabel,
    generatedAt: args.report.generatedAt,
    candidateTitlesByCode,
  });

  return persistEngine6ProductSelectionBlocklistAdditions(additions);
};

export const runEngine6ParagonProductSelectionPipelineWithReports = async (args: {
  config: Engine6DestinationBuildConfig;
  destinationBuild?: boolean;
  mode?: "strict" | "pr-scoped";
  scopedProductCodes?: string[];
  headRef?: string;
  fetchImpl?: typeof fetch;
}) => {
  let context: Engine6ParagonGovernancePipelineContext;

  try {
    context = await runEngine6ParagonProductSelectionPipeline({
      config: args.config,
      destinationBuild: args.destinationBuild,
      mode: args.mode,
      scopedProductCodes: args.scopedProductCodes,
      headRef: args.headRef,
      fetchImpl: args.fetchImpl,
    });
  } catch (error) {
    const report =
      error &&
      typeof error === "object" &&
      "report" in error &&
      error.report
        ? (error.report as Engine6ProductSelectionGovernanceReport)
        : null;

    if (report) {
      writeEngine6ParagonGovernanceReports({
        report,
        config: args.config,
      });
      persistEngine6ParagonGovernanceBlocklistAdditions({
        report,
        config: args.config,
      });
    }

    throw error;
  }

  const reports = writeEngine6ParagonGovernanceReports({
    report: context.report,
    config: args.config,
  });
  const blocklist = persistEngine6ParagonGovernanceBlocklistAdditions({
    report: context.report,
    config: args.config,
  });

  return {
    context,
    reports,
    blocklist,
  };
};

export const requireEngine6ParagonProductSelectionGate = async (args: {
  config: Engine6DestinationBuildConfig;
  stage: Engine6ParagonGovernanceDownstreamArtifactStage;
  destinationBuild?: boolean;
}) => {
  const result = await runEngine6ParagonProductSelectionPipelineWithReports({
    config: args.config,
    destinationBuild: args.destinationBuild ?? true,
  });

  assertEngine6ParagonArtifactStageAllowed({
    context: result.context,
    stage: args.stage,
  });

  return result;
};

export const prepareEngine6ParagonFixturesStage = async <
  T extends Engine6ParagonDestinationCatalogTour,
>(args: {
  destinationLabel: string;
  destinationCitySlug: string;
  viatorDestinationSlug?: string;
  targetPremiumShare?: number;
  tours: T[];
}) => {
  const config = buildEngine6ParagonProductSelectionConfig(args);
  const result = await requireEngine6ParagonProductSelectionGate({
    config,
    stage: "fixtures",
  });

  return {
    ...result,
    config,
    tours: filterEngine6ParagonCatalogByValidatedProductCodes(
      args.tours,
      result.context.validatedProductCodes
    ),
  };
};

export const prepareEngine6ParagonDownstreamStageFromResolvedTours = async (args: {
  destinationLabel: string;
  destinationCitySlug: string;
  viatorDestinationSlug?: string;
  targetPremiumShare?: number;
  stage: Exclude<
    Engine6ParagonGovernanceDownstreamArtifactStage,
    "fixtures" | "destination-pages" | "previews"
  >;
  tours: Array<{
    productCode: string;
    bookingUrl: string;
    title: string;
    priceAmount: number | null;
    categories?: string[];
  }>;
}) => {
  const config = buildEngine6ParagonProductSelectionConfigFromResolvedTours(args);

  return requireEngine6ParagonProductSelectionGate({
    config,
    stage: args.stage,
  });
};

export { finalizeEngine6DestinationBuildGate } from "./engine6DestinationBuildGovernance";
