import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { buildEngine6ItineraryGovernanceAudit } from "../src/engine6/itineraryGovernanceAudit";
import { engine6ResolvedTours } from "../src/engine6/registry";

const REPORT_DIR = path.resolve("reports");
const JSON_PATH = path.join(REPORT_DIR, "engine6-itinerary-governance-audit.json");
const MD_PATH = path.join(REPORT_DIR, "engine6-itinerary-governance-audit.md");

const escapeCell = (value: string | number) =>
  String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");

const report = buildEngine6ItineraryGovernanceAudit(engine6ResolvedTours);

const markdown = [
  "# Engine6 Itinerary Governance Audit",
  "",
  "Report-only audit aligned with `src/engine6/ITINERARY_GOVERNANCE_POLICY.md` v2.",
  "",
  `Generated: ${report.generatedAt}`,
  "",
  "## Totals",
  "",
  `- Total Engine6 tours audited: ${report.totals.engine6ToursAudited}`,
  `- Total itinerary rows audited: ${report.totals.itineraryRowsAudited}`,
  `- Rows with findings: ${report.rows.length}`,
  `- Critical rows: ${report.totals.criticalRows}`,
  `- Review rows: ${report.totals.reviewRows}`,
  `- Affected tours: ${report.totals.affectedTours}`,
  "",
  "## Top findings",
  "",
  "| Severity | Finding | Count |",
  "| --- | --- | ---: |",
  ...report.topFindings.map(
    finding =>
      `| ${escapeCell(finding.severity)} | ${escapeCell(finding.reason)} | ${finding.count} |`
  ),
  "",
  "## Affected products",
  "",
  "| Route | Product ID | Suspicious rows | Examples |",
  "| --- | --- | ---: | --- |",
  ...report.affectedProducts.map(
    product =>
      `| ${escapeCell(product.route)} | ${escapeCell(product.productId)} | ${product.suspiciousRowCount} | ${escapeCell(product.examples.join("; "))} |`
  ),
  "",
  "## Full findings",
  "",
  "See `reports/engine6-itinerary-governance-audit.json` for row-level findings, severities, rendered title/description, and titleSource.",
  "",
].join("\n");

mkdirSync(REPORT_DIR, { recursive: true });
writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(MD_PATH, markdown);

console.log(`Wrote ${JSON_PATH}`);
console.log(`Wrote ${MD_PATH}`);
console.log(JSON.stringify(report.totals, null, 2));
