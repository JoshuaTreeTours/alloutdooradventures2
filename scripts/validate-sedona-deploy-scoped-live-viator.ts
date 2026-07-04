import { writeFileSync } from "node:fs";

import {
  formatEngine6LiveViatorProductionValidationReport,
  validateEngine6LiveViatorCandidate,
} from "../src/engine6/engine6LiveViatorProductionValidation";
import { ENGINE6_VALIDATION_FIXTURES } from "../src/engine6/validationFixtures";
import { SEDONA_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/sedonaViatorPublicRatings";
import { resolveViatorApiConfig } from "../api/engine6/resolveEngine6ViatorProductCommercialExtract";

const OUTPUT_PATH = "artifacts/engine6-live-viator-production-validation.json";

const main = async () => {
  const { apiKey } = resolveViatorApiConfig();
  if (!apiKey) {
    console.error(
      "VIATOR_API_KEY is required for strict Sedona deploy-scoped live validation."
    );
    process.exit(1);
  }

  const fixtureByCode = new Map(
    ENGINE6_VALIDATION_FIXTURES.map(fixture => [
      fixture.productCode.toUpperCase(),
      fixture,
    ])
  );

  const results = [];
  for (const productCode of SEDONA_VIATOR_PUBLIC_PRODUCT_CODES) {
    const fixture = fixtureByCode.get(productCode.toUpperCase());
    if (!fixture) {
      throw new Error(`Missing validation fixture for Sedona product ${productCode}`);
    }

    results.push(
      await validateEngine6LiveViatorCandidate({
        productCode: fixture.productCode,
        sourceUrl: fixture.publicUrl,
      })
    );
  }

  const failures = results.filter(result => !result.passed);
  const report = {
    mode: "strict",
    governanceMode: "strict",
    passed: failures.length === 0,
    blockingPassed: failures.length === 0,
    skipped: false,
    skipReason: null,
    credentialsRequired: true,
    credentialsAvailable: true,
    scopedProductCodes: [...SEDONA_VIATOR_PUBLIC_PRODUCT_CODES].sort(),
    validatedAt: new Date().toISOString(),
    results,
    failures,
    blockingFailures: failures,
    legacyFailures: [],
    formattedReport: "",
  };

  report.formattedReport = formatEngine6LiveViatorProductionValidationReport(
    report
  );

  writeFileSync(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(report.formattedReport);
  console.log(
    JSON.stringify(
      {
        passed: report.passed,
        blockingPassed: report.blockingPassed,
        failures: failures.map(failure => ({
          productCode: failure.productCode,
          reason: failure.reason,
          apiConfirmedActive: failure.apiConfirmedActive,
        })),
      },
      null,
      2
    )
  );

  process.exit(report.blockingPassed ? 0 : 1);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
