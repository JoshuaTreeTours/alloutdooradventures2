import { extractEngine6Product } from "../api/engine6/viatorExtractors";
import { mapViatorToEngine6Tour } from "../src/engine6/mapViatorToEngine6Tour";
import { validateEngine6CreationContract } from "../src/engine6/creationValidation";
import { ENGINE6_VALIDATION_FIXTURES } from "../src/engine6/validationFixtures";
import { SEDONA_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/sedonaViatorPublicRatings";

const codes = new Set<string>(SEDONA_VIATOR_PUBLIC_PRODUCT_CODES);
const failures: Array<{ code: string; violations: string[] }> = [];

for (const fixture of ENGINE6_VALIDATION_FIXTURES) {
  if (!codes.has(fixture.productCode)) {
    continue;
  }

  const extraction = extractEngine6Product(fixture.rawPayload);
  const payload = {
    source: "live-api" as const,
    rawProductCode: fixture.productCode,
    rawProduct: extraction.product,
    diagnostics: extraction.diagnostics,
    extracted: extraction.extracted,
  };
  const tour = mapViatorToEngine6Tour(payload);
  const report = validateEngine6CreationContract({
    tour,
    rawPayload: fixture.rawPayload,
  });

  if (report.violations.length > 0) {
    failures.push({
      code: fixture.productCode,
      violations: report.violations,
    });
  }
}

console.log(`Sedona creation contract failures: ${failures.length}`);
for (const failure of failures) {
  console.log(`${failure.code}: ${failure.violations.join(" | ")}`);
}

if (failures.length === 0) {
  console.log("All 22 Sedona products pass creationValidation.");
}

process.exit(failures.length > 0 ? 1 : 0);
