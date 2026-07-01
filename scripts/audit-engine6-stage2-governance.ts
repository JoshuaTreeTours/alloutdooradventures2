import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  formatEngine6LiveViatorProductionValidationReport,
  validateConfiguredEngine6ProductionViatorProducts,
  type Engine6LiveViatorValidationMode,
} from "../src/engine6/engine6LiveViatorProductionValidation";
import {
  buildEngine6Stage2GovernanceAudit,
  formatEngine6Stage2GovernanceAuditMarkdown,
} from "../src/engine6/engine6Stage2GovernanceAudit";
import { engine6ResolvedTours } from "../src/engine6/registry";
import { resolveEngine6ProductCodesChangedSinceRefSafe } from "../src/engine6/resolveEngine6ChangedProductCodes";

const REPORT_DIR = path.resolve("reports");
const JSON_PATH = path.join(REPORT_DIR, "engine6-stage2-governance-audit.json");
const MD_PATH = path.join(REPORT_DIR, "engine6-stage2-governance-audit.md");

const readValidationMode = (): Engine6LiveViatorValidationMode => {
  if (process.argv.includes("--strict")) {
    return "strict";
  }

  if (process.argv.includes("--pr-scoped")) {
    return "pr-scoped";
  }

  // Stage 2 consolidated audit defaults to deploy-scoped blocking for new/modified
  // products while legacy catalog drift remains report-only.
  return "pr-scoped";
};

const shouldIncludeLiveViator = () => !process.argv.includes("--skip-live-viator");

const mode = readValidationMode();
const headRef =
  process.env.ENGINE6_STAGE2_GOVERNANCE_HEAD_REF?.trim() || "HEAD";
const scopedResolution = resolveEngine6ProductCodesChangedSinceRefSafe({
  headRef,
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
    mode,
    scopedProductCodes:
      mode === "pr-scoped" ? scopedResolution.productCodes : [],
  });
  console.log(formatEngine6LiveViatorProductionValidationReport(liveViator));
}

const merchantFeedCsvContent = readFileSync("data/merchantFeed.csv", "utf8");
const sitemapTourXmlContent = readFileSync("public/sitemap-tours.xml", "utf8");

const report = await buildEngine6Stage2GovernanceAudit({
  tours: engine6ResolvedTours,
  merchantFeedCsvContent,
  sitemapTourXmlContent,
  mode,
  scopedProductCodes: scopedResolution.productCodes,
  liveViator,
});

const markdown = formatEngine6Stage2GovernanceAuditMarkdown(report);

mkdirSync(REPORT_DIR, { recursive: true });
writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(MD_PATH, markdown);

console.log(`Wrote ${JSON_PATH}`);
console.log(`Wrote ${MD_PATH}`);
console.log(
  JSON.stringify(
    {
      mode: report.mode,
      blockingPassed: report.blockingPassed,
      passed: report.passed,
      blockingFindings: report.totals.blockingFindings,
      legacyFindings: report.totals.legacyFindings,
      areasPassed: report.totals.areasPassed,
    },
    null,
    2
  )
);

if (!report.blockingPassed) {
  console.error(
    "\nEngine6 Stage 2 governance audit rejected: one or more blocking findings remain for new or modified products."
  );
  process.exit(1);
}

if (report.totals.legacyFindings > 0) {
  console.warn(
    `\nEngine6 Stage 2 governance audit passed with ${report.totals.legacyFindings} legacy finding(s) reported separately (report-only in pr-scoped mode).`
  );
}

console.log("\nEngine6 Stage 2 governance audit passed.");
