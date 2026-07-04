import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  ENGINE6_DESTINATION_INFRASTRUCTURE_SPECS,
  assertEngine6DestinationInfrastructureReady,
  formatEngine6DestinationInfrastructureReport,
  validateEngine6DestinationInfrastructure,
  type Engine6DestinationInfrastructureSpec,
} from "../src/engine6/engine6DestinationInfrastructureValidation";
import { extractEngine6DestinationSlugFromChangedPath } from "../src/engine6/resolveEngine6GovernanceScope";
import { parseGitNameStatusOutput } from "../src/engine6/resolveEngine6ChangedProductCodes";
import { execSync } from "node:child_process";
import { verifyGitRefExists } from "../src/engine6/resolveEngine6ChangedProductCodes";

const REPORT_DIR = path.resolve("reports");
const JSON_PATH = path.join(
  REPORT_DIR,
  "engine6-destination-infrastructure-validation.json"
);
const MD_PATH = path.join(
  REPORT_DIR,
  "engine6-destination-infrastructure-validation.md"
);

const readSpecFromArgv = (): Engine6DestinationInfrastructureSpec | null => {
  const destinationArg = process.argv.find(arg =>
    arg.startsWith("--destination=")
  );
  if (!destinationArg) {
    return null;
  }

  const slug = destinationArg.split("=")[1]?.trim().toLowerCase();
  if (!slug) {
    return null;
  }

  return ENGINE6_DESTINATION_INFRASTRUCTURE_SPECS[slug] ?? null;
};

const resolveChangedDestinationSpecs = () => {
  const candidates = [
    process.env.ENGINE6_GOVERNANCE_BASE_REF?.trim(),
    process.env.ENGINE6_LIVE_VIATOR_VALIDATION_BASE_REF?.trim(),
    "origin/main",
  ].filter((value): value is string => Boolean(value?.trim()));

  let baseRef: string | null = null;
  for (const candidate of candidates) {
    if (verifyGitRefExists(candidate)) {
      baseRef = candidate;
      break;
    }
  }

  if (!baseRef) {
    return [];
  }

  const nameStatusOutput = execSync(`git diff --name-status ${baseRef}...HEAD`, {
    encoding: "utf8",
  });
  const changedFiles = parseGitNameStatusOutput(nameStatusOutput);
  const slugs = new Set<string>();

  for (const file of changedFiles) {
    if (file.status === "D") {
      continue;
    }

    const slug = extractEngine6DestinationSlugFromChangedPath(file.path);
    if (slug && ENGINE6_DESTINATION_INFRASTRUCTURE_SPECS[slug]) {
      slugs.add(slug);
    }
  }

  return [...slugs]
    .map(slug => ENGINE6_DESTINATION_INFRASTRUCTURE_SPECS[slug])
    .filter((spec): spec is Engine6DestinationInfrastructureSpec => Boolean(spec));
};

const specs = (() => {
  const explicit = readSpecFromArgv();
  if (explicit) {
    return [explicit];
  }

  return resolveChangedDestinationSpecs();
})();

if (specs.length === 0) {
  console.log(
    "Engine6 destination infrastructure validation skipped: no deploy-scoped destination spec detected."
  );
  process.exit(0);
}

const reports = specs.map(spec =>
  validateEngine6DestinationInfrastructure({ spec })
);

const markdown = reports
  .map(report => formatEngine6DestinationInfrastructureReport(report))
  .join("\n\n---\n\n");

mkdirSync(REPORT_DIR, { recursive: true });
writeFileSync(JSON_PATH, `${JSON.stringify(reports, null, 2)}\n`);
writeFileSync(MD_PATH, markdown);

console.log(`Wrote ${JSON_PATH}`);
console.log(`Wrote ${MD_PATH}`);

for (const report of reports) {
  console.log(formatEngine6DestinationInfrastructureReport(report));
}

const blocking = reports.filter(report => !report.pass);
if (blocking.length > 0) {
  for (const report of blocking) {
    try {
      assertEngine6DestinationInfrastructureReady({
        spec: {
          destinationLabel: report.destinationLabel,
          destinationCitySlug: report.destinationCitySlug,
          stateSlug: report.stateSlug,
          citySlug: report.citySlug,
        },
      });
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }
  }
  process.exit(1);
}

console.log("\nEngine6 destination infrastructure validation passed.");
