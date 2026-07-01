import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  formatEngine6LiveViatorProductionValidationReport,
  validateConfiguredEngine6ProductionViatorProducts,
} from "../src/engine6/engine6LiveViatorProductionValidation";

const OUTPUT_PATH = path.resolve(
  process.cwd(),
  process.env.ENGINE6_LIVE_VIATOR_VALIDATION_REPORT_PATH ??
    "artifacts/engine6-live-viator-production-validation.json"
);

const report = await validateConfiguredEngine6ProductionViatorProducts();
const formatted = formatEngine6LiveViatorProductionValidationReport(report);

await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(
  OUTPUT_PATH,
  `${JSON.stringify({ ...report, formattedReport: formatted }, null, 2)}\n`,
  "utf8"
);

console.log(formatted);

if (!report.passed) {
  console.error(
    "\nEngine6 production build rejected: one or more configured Viator products failed live validation."
  );
  process.exit(1);
}

console.log("\nEngine6 live Viator production validation passed.");
