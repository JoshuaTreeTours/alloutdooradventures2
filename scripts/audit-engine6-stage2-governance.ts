import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  resolveEngine6GovernanceMode,
  resolveEngine6GovernanceRequiresFullSiteValidation,
  resolveEngine6Stage2GovernanceAuditOutcome,
} from "../src/engine6/engine6GovernanceMode";
import {
  formatEngine6LiveViatorProductionValidationReport,
  validateConfiguredEngine6ProductionViatorProducts,
} from "../src/engine6/engine6LiveViatorProductionValidation";
import {
  buildEngine6Stage2GovernanceAudit,
  formatEngine6Stage2GovernanceAuditMarkdown,
  resolveEngine6Stage2GovernanceModeFromEnv,
} from "../src/engine6/engine6Stage2GovernanceAudit";
import { engine6ResolvedTours } from "../src/engine6/registry";
import { resolveEngine6GovernanceScope } from "../src/engine6/resolveEngine6GovernanceScope";

const REPORT_DIR = path.resolve("reports");
const JSON_PATH = path.join(REPORT_DIR, "engine6-stage2-governance-audit.json");
const MD_PATH = path.join(REPORT_DIR, "engine6-stage2-governance-audit.md");

const readGovernanceMode = () => {
  if (process.argv.includes("--strict")) {
    return "strict" as const;
  }

  if (process.argv.includes("--warn")) {
    return "warn" as const;
  }

  if (process.argv.includes("--audit")) {
    return "audit" as const;
  }

  return resolveEngine6GovernanceMode();
};

const shouldIncludeLiveViator = () => !process.argv.includes("--skip-live-viator");

const governanceMode = readGovernanceMode();
const { mode } = resolveEngine6Stage2GovernanceModeFromEnv();
const fullSiteValidation =
  resolveEngine6GovernanceRequiresFullSiteValidation(governanceMode);
const headRef =
  process.env.ENGINE6_STAGE2_GOVERNANCE_HEAD_REF?.trim() || "HEAD";
const scopedResolution = resolveEngine6GovernanceScope({
  headRef,
  fullSiteValidation,
  tours: engine6ResolvedTours,
});

if (scopedResolution.warning) {
  console.warn(
    "[engine6-stage2-governance-audit]",
    scopedResolution.warning
  );
}

let liveViator:
  | Awaited<ReturnType<typeof validateConfiguredEngine6ProductionViatorProducts>>
  | undefined;

if (shouldIncludeLiveViator()) {
  liveViator = await validateConfiguredEngine6ProductionViatorProducts({
    governanceMode,
    mode,
    scopedProductCodes:
      mode === "pr-scoped" ? scopedResolution.scopedProductCodes : [],
  });
  console.log(formatEngine6LiveViatorProductionValidationReport(liveViator));
}

const merchantFeedCsvContent = readFileSync("data/merchantFeed.csv", "utf8");
const sitemapTourXmlContent = readFileSync("public/sitemap-tours.xml", "utf8");

const report = await buildEngine6Stage2GovernanceAudit({
  tours: engine6ResolvedTours,
  merchantFeedCsvContent,
  sitemapTourXmlContent,
  governanceMode,
  mode,
  scopedProductCodes: scopedResolution.scopedProductCodes,
  scopedDestinationLabels: scopedResolution.scopedDestinationLabels,
  fullSiteValidation,
  liveViator,
});

const markdown = formatEngine6Stage2GovernanceAuditMarkdown(report);
const auditOutcome = resolveEngine6Stage2GovernanceAuditOutcome({
  mode: governanceMode,
  blockingPassed: report.blockingPassed,
  warningFindings: report.totals.warningFindings,
  legacyFindings: report.totals.legacyFindings,
});

mkdirSync(REPORT_DIR, { recursive: true });
writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(MD_PATH, markdown);

console.log(`Wrote ${JSON_PATH}`);
console.log(`Wrote ${MD_PATH}`);
console.log(
  JSON.stringify(
    {
      governanceMode: report.governanceMode,
      mode: report.mode,
      blockingPassed: report.blockingPassed,
      passed: report.passed,
      blockingFindings: report.totals.blockingFindings,
      warningFindings: report.totals.warningFindings,
      legacyFindings: report.totals.legacyFindings,
      areasPassed: report.totals.areasPassed,
    },
    null,
    2
  )
);

if (auditOutcome.exitCode !== 0 && !report.blockingPassed) {
  console.error(
    "\nEngine6 Stage 2 governance audit rejected: one or more blocking findings remain for deploy-scoped products."
  );
  process.exit(1);
}

if (auditOutcome.exitCode !== 0 && report.totals.warningFindings > 0) {
  console.error(
    `\nEngine6 Stage 2 governance audit rejected: ${report.totals.warningFindings} warning finding(s) remain in strict mode.`
  );
  process.exit(1);
}

if (auditOutcome.shouldReportLegacyFindings) {
  console.warn(
    `\nEngine6 Stage 2 governance audit completed with ${report.totals.legacyFindings} legacy finding(s) reported separately.`
  );
}

if (report.totals.warningFindings > 0 && governanceMode === "warn") {
  console.warn(
    `\nEngine6 Stage 2 governance audit passed with ${report.totals.warningFindings} warning finding(s) (non-blocking in warn mode).`
  );
}

console.log("\nEngine6 Stage 2 governance audit passed.");
