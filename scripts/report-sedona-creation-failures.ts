import { extractEngine6Product } from "../api/engine6/viatorExtractors";
import { mapViatorToEngine6Tour } from "../src/engine6/mapViatorToEngine6Tour";
import { validateEngine6CreationContract } from "../src/engine6/creationValidation";
import { ENGINE6_VALIDATION_FIXTURES } from "../src/engine6/validationFixtures";
import { SEDONA_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/sedonaViatorPublicRatings";

const results: Array<{
  productCode: string;
  title: string;
  violations: string[];
}> = [];

for (const productCode of SEDONA_VIATOR_PUBLIC_PRODUCT_CODES) {
  const fixture = ENGINE6_VALIDATION_FIXTURES.find(
    entry => entry.productCode === productCode
  );
  if (!fixture) {
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
    fixture,
  });

  if (report.violations.length === 0) {
    continue;
  }

  const raw = fixture.rawPayload as {
    product?: { title?: string };
  };

  results.push({
    productCode,
    title: raw.product?.title ?? tour.title,
    violations: report.violations,
  });
}

console.log(JSON.stringify(results, null, 2));
process.exit(results.length > 0 ? 1 : 0);
