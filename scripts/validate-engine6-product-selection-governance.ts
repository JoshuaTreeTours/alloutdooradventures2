import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { formatEngine6ProductSelectionGovernanceReport } from "../src/engine6/engine6ProductSelectionGovernance";
import { resolveEngine6ProductCodesChangedSinceRefSafe } from "../src/engine6/resolveEngine6ChangedProductCodes";
import {
  assertEngine6ParagonArtifactStageAllowed,
  finalizeEngine6DestinationBuildGate,
  persistEngine6ParagonGovernanceBlocklistAdditions,
  runEngine6ParagonProductSelectionPipelineWithReports,
} from "./lib/engine6ParagonGovernancePipeline";
import { readEngine6ParagonProductSelectionConfigFromArgv } from "./lib/readEngine6ParagonProductSelectionConfig";

const REPORT_DIR = path.resolve("reports");
const JSON_PATH = path.join(
  REPORT_DIR,
  "engine6-product-selection-governance.json"
);
const MD_PATH = path.join(
  REPORT_DIR,
  "engine6-product-selection-governance.md"
);

const readMode = () => {
  if (process.argv.includes("--strict") || process.argv.includes("--destination-build")) {
    return "strict" as const;
  }

  return "pr-scoped" as const;
};

const isDestinationBuild = () =>
  process.argv.includes("--destination-build") ||
  Boolean(process.env.ENGINE6_DESTINATION_BUILD?.trim());

const mode = readMode();
const destinationBuild = isDestinationBuild();
const { config } = readEngine6ParagonProductSelectionConfigFromArgv();
const headRef =
  process.env.ENGINE6_PRODUCT_SELECTION_HEAD_REF?.trim() || "HEAD";
const scopedResolution = resolveEngine6ProductCodesChangedSinceRefSafe({
  headRef,
});

if (scopedResolution.warning) {
  console.warn("[engine6-paragon-governance]", scopedResolution.warning);
}

const build = await runEngine6ParagonProductSelectionPipelineWithReports({
  config,
  destinationBuild,
  mode,
  scopedProductCodes:
    mode === "pr-scoped" ? scopedResolution.productCodes : [],
  headRef,
});

if (destinationBuild) {
  assertEngine6ParagonArtifactStageAllowed({
    context: build.context,
    stage: "fixtures",
  });
}

if (!destinationBuild) {
  mkdirSync(REPORT_DIR, { recursive: true });
  writeFileSync(
    JSON_PATH,
    `${JSON.stringify(build.context.report, null, 2)}\n`
  );
  writeFileSync(
    MD_PATH,
    formatEngine6ProductSelectionGovernanceReport(build.context.report)
  );
}

const blocklist = persistEngine6ParagonGovernanceBlocklistAdditions({
  report: build.context.report,
  config,
});

console.log(build.reports.formatted);
console.log(`Wrote ${build.reports.jsonPath}`);
console.log(`Wrote ${build.reports.markdownPath}`);

if (build.reports.failureMarkdownPath) {
  console.log(`Wrote ${build.reports.failureMarkdownPath}`);
}

if (blocklist.persistedCount > 0) {
  console.log(
    `[engine6-paragon-governance] Persisted ${blocklist.persistedCount} permanent blocklist addition(s) to ${blocklist.blocklistPath}`
  );
}

const gate = finalizeEngine6DestinationBuildGate(build.context.report);

if (!gate.ok) {
  console.error(`\n${gate.message}`);
  process.exit(gate.exitCode);
}

console.log("\nEngine6 Paragon product-selection governance passed.");
