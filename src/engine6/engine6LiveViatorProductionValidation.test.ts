import { describe, expect, it } from "vitest";

import {
  formatEngine6LiveViatorProductionValidationReport,
  validateEngine6LiveViatorCandidate,
} from "./engine6LiveViatorProductionValidation";
import { assessViatorPublicPageAvailability } from "./viatorPublicAvailability";

describe("engine6LiveViatorProductionValidation", () => {
  it("rejects known unavailable blocklist products", async () => {
    const result = await validateEngine6LiveViatorCandidate({
      productCode: "3454P41",
      sourceUrl:
        "https://www.viator.com/tours/Yosemite-National-Park/Best-of-Yosemite-Tour-Giant-Sequoias-and-Glacier-Point/d5265-3454P41",
    });

    expect(result.passed).toBe(false);
    expect(result.knownUnavailableBlocklistHit).toBe(true);
  });

  it("formats validation reports with failure details", () => {
    const formatted = formatEngine6LiveViatorProductionValidationReport({
      mode: "strict",
      passed: false,
      blockingPassed: false,
      scopedProductCodes: [],
      validatedAt: "2026-06-30T00:00:00.000Z",
      results: [],
      failures: [
        {
          productCode: "TESTP1",
          sourceUrl: "https://www.viator.com/tours/Test/d5610-TESTP1",
          passed: false,
          publicPageAvailable: false,
          apiConfirmedActive: false,
          canonicalProductCodeMatches: false,
          merchantUrlMatches: true,
          bookable: false,
          knownUnavailableBlocklistHit: false,
          reason: "public page unavailable",
        },
      ],
      blockingFailures: [
        {
          productCode: "TESTP1",
          sourceUrl: "https://www.viator.com/tours/Test/d5610-TESTP1",
          passed: false,
          publicPageAvailable: false,
          apiConfirmedActive: false,
          canonicalProductCodeMatches: false,
          merchantUrlMatches: true,
          bookable: false,
          knownUnavailableBlocklistHit: false,
          reason: "public page unavailable",
        },
      ],
      legacyFailures: [],
    });

    expect(formatted).toContain("TESTP1");
    expect(formatted).toContain("public page unavailable");
  });

  it("separates blocking and legacy failures in pr-scoped mode", () => {
    const formatted = formatEngine6LiveViatorProductionValidationReport({
      mode: "pr-scoped",
      passed: true,
      blockingPassed: true,
      scopedProductCodes: ["NEWPRODUCTP1"],
      validatedAt: "2026-06-30T00:00:00.000Z",
      results: [],
      failures: [
        {
          productCode: "LEGACYP1",
          sourceUrl: "https://www.viator.com/tours/Test/d5610-LEGACYP1",
          passed: false,
          publicPageAvailable: false,
          apiConfirmedActive: false,
          canonicalProductCodeMatches: true,
          merchantUrlMatches: true,
          bookable: false,
          knownUnavailableBlocklistHit: false,
          reason: "legacy failure",
        },
      ],
      blockingFailures: [],
      legacyFailures: [
        {
          productCode: "LEGACYP1",
          sourceUrl: "https://www.viator.com/tours/Test/d5610-LEGACYP1",
          passed: false,
          publicPageAvailable: false,
          apiConfirmedActive: false,
          canonicalProductCodeMatches: true,
          merchantUrlMatches: true,
          bookable: false,
          knownUnavailableBlocklistHit: false,
          reason: "legacy failure",
        },
      ],
    });

    expect(formatted).toContain("Legacy failures (report-only)");
    expect(formatted).toContain("LEGACYP1");
    expect(formatted).not.toContain("\nBlocking failures:\n");
  });

  it("accepts active public-page HTML signals for candidate assessment", () => {
    const assessment = assessViatorPublicPageAvailability({
      productCode: "199627P12",
      sourceUrl:
        "https://www.viator.com/tours/Zion-National-Park/Zion-Guided-Hike-and-Gourmet-Picnic/d5610-199627P12",
      html: `<html><body><button>Check availability</button><script>{"productCode":"199627P12","productStatus":"ACTIVE"}</script></body></html>`,
      finalUrl:
        "https://www.viator.com/tours/Zion-National-Park/Zion-Guided-Hike-and-Gourmet-Picnic/d5610-199627P12",
      httpStatus: 200,
    });

    expect(assessment.available).toBe(true);
  });
});
