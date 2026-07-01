import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  formatEngine6LiveViatorProductionValidationReport,
  resolveEngine6LiveViatorValidationBaseRef,
  resolveEngine6LiveViatorValidationMode,
  validateConfiguredEngine6ProductionViatorProducts,
  type Engine6LiveViatorValidationMode,
} from "../src/engine6/engine6LiveViatorProductionValidation";
import { resolveEngine6ProductCodesChangedSinceRef } from "../src/engine6/resolveEngine6ChangedProductCodes";

const OUTPUT_PATH = path.resolve(
  process.cwd(),
  process.env.ENGINE6_LIVE_VIATOR_VALIDATION_REPORT_PATH ??
    "artifacts/engine6-live-viator-production-validation.json"
);

const readValidationMode = (): Engine6LiveViatorValidationMode => {
  if (process.argv.includes("--strict")) {
    return "strict";
  }

  if (process.argv.includes("--pr-scoped")) {
    return "pr-scoped";
  }

  return resolveEngine6LiveViatorValidationMode();
};

const resolveScopedProductCodes = (mode: Engine6LiveViatorValidationMode) => {
  if (mode !== "pr-scoped") {
    return [];
  }

  const baseRef = resolveEngine6LiveViatorValidationBaseRef();
  if (!baseRef) {
    throw new Error(
      "ENGINE6_LIVE_VIATOR_VALIDATION_BASE_REF is required when ENGINE6_LIVE_VIATOR_VALIDATION_MODE=pr-scoped"
    );
  }

  const headRef =
    process.env.ENGINE6_LIVE_VIATOR_VALIDATION_HEAD_REF?.trim() || "HEAD";

  return resolveEngine6ProductCodesChangedSinceRef({
    baseRef,
    headRef,
  });
};

const publishGithubStepSummary = async (
  formattedReport: string,
  report: Awaited<ReturnType<typeof validateConfiguredEngine6ProductionViatorProducts>>
) => {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) {
    return;
  }

  const lines = [
    "## Engine6 live Viator validation",
    "",
    `- Mode: \`${report.mode}\``,
    `- Products validated: ${report.results.length}`,
    `- Scoped blocking products: ${report.scopedProductCodes.length}`,
    `- Blocking failures: ${report.blockingFailures.length}`,
    `- Legacy failures (report-only): ${report.legacyFailures.length}`,
    "",
  ];

  if (report.mode === "pr-scoped" && report.scopedProductCodes.length > 0) {
    lines.push(
      "### Deploy-scoped blocking products",
      "",
      report.scopedProductCodes.map(code => `- \`${code}\``).join("\n"),
      ""
    );
  }

  if (report.blockingFailures.length > 0) {
    lines.push("### Blocking failures", "");
    for (const failure of report.blockingFailures) {
      lines.push(
        `- \`${failure.productCode}\`: ${failure.reason ?? "validation failed"}`
      );
    }
    lines.push("");
  }

  if (report.legacyFailures.length > 0) {
    lines.push("### Legacy failures (report-only)", "");
    for (const failure of report.legacyFailures) {
      lines.push(
        `- \`${failure.productCode}\`: ${failure.reason ?? "validation failed"}`
      );
    }
    lines.push("");
  }

  lines.push("### Full report", "", "```text", formattedReport, "```", "");

  await writeFile(summaryPath, `${lines.join("\n")}\n`, "utf8");
};

const mode = readValidationMode();
const scopedProductCodes = resolveScopedProductCodes(mode);

const report = await validateConfiguredEngine6ProductionViatorProducts({
  mode,
  scopedProductCodes,
});
const formatted = formatEngine6LiveViatorProductionValidationReport(report);

await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(
  OUTPUT_PATH,
  `${JSON.stringify({ ...report, formattedReport: formatted }, null, 2)}\n`,
  "utf8"
);

console.log(formatted);
await publishGithubStepSummary(formatted, report);

if (!report.blockingPassed) {
  console.error(
    report.mode === "pr-scoped"
      ? "\nEngine6 deploy-scoped validation rejected: one or more newly introduced or modified Viator products failed live validation."
      : "\nEngine6 strict validation rejected: one or more configured Viator products failed live validation."
  );
  process.exit(1);
}

if (report.mode === "pr-scoped" && report.legacyFailures.length > 0) {
  console.warn(
    `\nEngine6 deploy-scoped validation passed with ${report.legacyFailures.length} legacy failure(s) reported separately (report-only until strict mode is re-enabled).`
  );
}

console.log("\nEngine6 live Viator production validation passed.");
