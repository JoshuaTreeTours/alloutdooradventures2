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
      passed: false,
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
    });

    expect(formatted).toContain("TESTP1");
    expect(formatted).toContain("public page unavailable");
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
