export {
  prepareEngine6ParagonDownstreamStageFromResolvedTours,
  prepareEngine6ParagonFixturesStage,
  requireEngine6ParagonProductSelectionGate,
  runEngine6ParagonProductSelectionPipelineWithReports,
  writeEngine6ParagonGovernanceReports,
  persistEngine6ParagonGovernanceBlocklistAdditions,
} from "./engine6ParagonGovernancePipeline";

export { readEngine6ParagonProductSelectionConfigFromArgv } from "./readEngine6ParagonProductSelectionConfig";

import {
  requireEngine6ParagonProductSelectionGate,
  runEngine6ParagonProductSelectionPipelineWithReports,
} from "./engine6ParagonGovernancePipeline";
import { readEngine6ParagonProductSelectionConfigFromArgv } from "./readEngine6ParagonProductSelectionConfig";
import { assertEngine6CommitPullRequestGate } from "../../src/engine6/engine6ProductSelectionGovernance";

/** @deprecated Use the Engine6 Paragon governance pipeline exports instead. */
export const readEngine6DestinationBuildConfigFromArgv =
  readEngine6ParagonProductSelectionConfigFromArgv;

/** @deprecated Use runEngine6ParagonProductSelectionPipelineWithReports instead. */
export const runEngine6DestinationBuildFromConfig = (args: {
  config: Parameters<
    typeof runEngine6ParagonProductSelectionPipelineWithReports
  >[0]["config"];
  destinationBuild?: boolean;
}) =>
  runEngine6ParagonProductSelectionPipelineWithReports(args).then(result => ({
    report: result.context.report,
    validatedProductCodes: result.context.validatedProductCodes,
    completedBuildStages: result.context.completedBuildStages,
    reports: result.reports,
    blocklist: result.blocklist,
  }));

/** @deprecated Use writeEngine6ParagonGovernanceReports instead. */
export { writeEngine6ParagonGovernanceReports as writeEngine6DestinationBuildReports } from "./engine6ParagonGovernancePipeline";

/** @deprecated Use persistEngine6ParagonGovernanceBlocklistAdditions instead. */
export { persistEngine6ParagonGovernanceBlocklistAdditions as persistEngine6DestinationBuildBlocklistAdditions } from "./engine6ParagonGovernancePipeline";

/** @deprecated Use requireEngine6ParagonProductSelectionGate instead. */
export const finalizeEngine6DestinationBuildGate = (
  report: Parameters<typeof assertEngine6CommitPullRequestGate>[0]
) => {
  if (report.buildTerminated || !report.passed) {
    return {
      ok: false as const,
      exitCode: 1,
      message:
        report.buildTerminationReason ??
        "Engine6 destination build terminated before artifact generation.",
    };
  }

  assertEngine6CommitPullRequestGate(report);

  return {
    ok: true as const,
    exitCode: 0,
    message:
      "Engine6 Paragon governance passed live validation and portfolio gates.",
  };
};

export const runEngine6ParagonDestinationBuildFromArgv = async () => {
  const { configPath, config } = readEngine6ParagonProductSelectionConfigFromArgv();
  const build = await requireEngine6ParagonProductSelectionGate({
    config,
    stage: "fixtures",
    destinationBuild: true,
  });

  return {
    configPath,
    config,
    ...build,
  };
};
