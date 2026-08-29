import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

import {
  buildEngine6Stage2GovernanceAudit,
  formatEngine6Stage2GovernanceAuditMarkdown,
} from "../src/engine6/engine6Stage2GovernanceAudit";
import { engine6ResolvedTours } from "../src/engine6/registry";
import {
  parseGitNameStatusOutput,
  resolveEngine6ProductScopeFromChangedFiles,
} from "../src/engine6/resolveEngine6ChangedProductCodes";
import {
  extractEngine6DestinationLabelsFromChangedFiles,
  resolveEngine6DestinationLabelsForProductCodes,
} from "../src/engine6/resolveEngine6GovernanceScope";
import { CABO_SAN_LUCAS_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/caboSanLucasViatorPublicRatings";

const nameStatusOutput = execSync("git diff --name-status origin/main", {
  encoding: "utf8",
});
const changedFiles = parseGitNameStatusOutput(nameStatusOutput);

// Include untracked Engine6 catalog artifacts so pre-commit audits still scope.
const untrackedOutput = execSync("git ls-files --others --exclude-standard", {
  encoding: "utf8",
});
for (const path of untrackedOutput
  .split("\n")
  .map(line => line.trim())
  .filter(Boolean)) {
  if (
    changedFiles.some(file => file.path === path) ||
    !/^(?:src\/engine6\/(?:validationFixtures\.ts|routes\.ts|.*ViatorPublicRatings\.ts)|data\/merchantFeed\.csv|data\/engine6\/viator\/.*\.exact-product\.json)$/.test(
      path
    )
  ) {
    continue;
  }
  changedFiles.push({ status: "A", path });
}

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
    : [...CABO_SAN_LUCAS_VIATOR_PUBLIC_PRODUCT_CODES];

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
      totals: report.totals,
    },
    null,
    2
  )
);

mkdirSync("reports", { recursive: true });
writeFileSync(
  "reports/cabo-san-lucas-engine6-stage2-governance-audit.json",
  `${JSON.stringify(report, null, 2)}\n`
);
writeFileSync(
  "reports/cabo-san-lucas-engine6-stage2-governance-audit.md",
  `${formatEngine6Stage2GovernanceAuditMarkdown(report)}\n`
);

if (!report.blockingPassed) {
  process.exit(1);
}
