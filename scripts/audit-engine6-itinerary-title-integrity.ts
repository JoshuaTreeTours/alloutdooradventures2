import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { buildEngine6ItineraryTitleIntegrityAudit } from "../src/engine6/itineraryTitleIntegrityAudit";
import { engine6ResolvedTours } from "../src/engine6/registry";

const REPORT_DIR = path.resolve("reports");
const JSON_PATH = path.join(
  REPORT_DIR,
  "engine6-itinerary-title-integrity-audit.json"
);
const MD_PATH = path.join(
  REPORT_DIR,
  "engine6-itinerary-title-integrity-audit.md"
);

const escapeCell = (value: string | number) =>
  String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");

const report = buildEngine6ItineraryTitleIntegrityAudit(engine6ResolvedTours);

const markdown = [
  "# Engine6 Itinerary Title Integrity Audit",
  "",
  `Generated: ${report.generatedAt}`,
  "",
  "## Totals",
  "",
  `- Total Engine6 tours audited: ${report.totals.engine6ToursAudited}`,
  `- Total itinerary rows audited: ${report.totals.itineraryRowsAudited}`,
  `- Suspicious rows: ${report.totals.suspiciousRows}`,
  `- Affected tours: ${report.totals.affectedTours}`,
  "",
  "## Top suspicious patterns",
  "",
  "| Pattern | Count |",
  "| --- | ---: |",
  ...report.topSuspiciousPatterns.map(
    pattern => `| ${escapeCell(pattern.reason)} | ${pattern.count} |`
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
  "## Full suspicious rows",
  "",
  "See `reports/engine6-itinerary-title-integrity-audit.json` for product ID, route, tour title, itinerary index, rendered title, rendered description, titleSource, duration, admission status, and suspicious reasons for each row.",
  "",
].join("\n");

mkdirSync(REPORT_DIR, { recursive: true });
writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(MD_PATH, markdown);

console.log(`Wrote ${JSON_PATH}`);
console.log(`Wrote ${MD_PATH}`);
console.log(JSON.stringify(report.totals, null, 2));
