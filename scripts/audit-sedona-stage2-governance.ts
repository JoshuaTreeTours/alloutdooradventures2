import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

import {
  buildEngine6Stage2GovernanceAudit,
  formatEngine6Stage2GovernanceAuditMarkdown,
} from "../src/engine6/engine6Stage2GovernanceAudit";
import { resolveEngine6Stage2GovernanceModeFromEnv } from "../src/engine6/engine6Stage2GovernanceAudit";
import { engine6ResolvedTours } from "../src/engine6/registry";
import {
  parseGitNameStatusOutput,
  resolveEngine6ProductScopeFromChangedFiles,
} from "../src/engine6/resolveEngine6ChangedProductCodes";
import {
  extractEngine6DestinationLabelsFromChangedFiles,
  resolveEngine6DestinationLabelsForProductCodes,
} from "../src/engine6/resolveEngine6GovernanceScope";
import { SEDONA_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/sedonaViatorPublicRatings";

const { mode } = resolveEngine6Stage2GovernanceModeFromEnv();
const nameStatusOutput = execSync("git diff --name-status origin/main", {
  encoding: "utf8",
});
const changedFiles = parseGitNameStatusOutput(nameStatusOutput);

const catalogDiffs: Record<string, string> = {};
for (const file of changedFiles) {
  if (
    (file.status === "A" || file.status === "M" || file.status === "?") &&
    /^(?:src\/engine6\/(?:validationFixtures\.ts|routes\.ts|.*ViatorPublicRatings\.ts)|data\/merchantFeed\.csv|data\/engine6\/viator\/.*\.exact-product\.json)$/.test(
      file.path
    )
  ) {
    try {
      catalogDiffs[file.path] = execSync(
        `git diff origin/main -- ${file.path}`,
        { encoding: "utf8" }
      );
    } catch {
      catalogDiffs[file.path] = "";
    }
  }
}

const productScope = resolveEngine6ProductScopeFromChangedFiles({
  changedFiles,
  catalogDiffs,
});

const scopedProductCodes =
  productScope.deployScoped.length > 0
    ? productScope.deployScoped
    : [...SEDONA_VIATOR_PUBLIC_PRODUCT_CODES];

const scopedDestinationLabels = [
  ...new Set([
    ...extractEngine6DestinationLabelsFromChangedFiles(changedFiles),
    ...resolveEngine6DestinationLabelsForProductCodes(
      scopedProductCodes,
      engine6ResolvedTours
    ),
  ]),
].sort();

const report = await buildEngine6Stage2GovernanceAudit({
  tours: engine6ResolvedTours,
  merchantFeedCsvContent: readFileSync("data/merchantFeed.csv", "utf8"),
  sitemapTourXmlContent: readFileSync("public/sitemap-tours.xml", "utf8"),
  governanceMode: "audit",
  mode: "pr-scoped",
  scopedProductCodes,
  scopedDestinationLabels,
  fullSiteValidation: false,
});

console.log(formatEngine6Stage2GovernanceAuditMarkdown(report));
console.log(
  JSON.stringify(
    {
      mode: report.mode,
      scopedProductCodes: report.scopedProductCodes,
      scopedDestinationLabels: report.scopedDestinationLabels,
      blockingPassed: report.blockingPassed,
      passed: report.passed,
      blockingFindings: report.totals.blockingFindings,
      warningFindings: report.totals.warningFindings,
      legacyFindings: report.totals.legacyFindings,
    },
    null,
    2
  )
);

process.exit(report.blockingPassed ? 0 : 1);
