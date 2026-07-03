import { describe, expect, it } from "vitest";

import {
  formatEngine6ProductSelectionSelfReplacementReport,
  isEngine6LiveValidationFailureEligibleForSelfReplacement,
  isEngine6LiveValidationInfrastructureFailure,
  runEngine6ProductSelectionSelfReplacementGovernance,
} from "./engine6ProductSelectionSelfReplacementGovernance";
import type { Engine6LiveViatorValidationResult } from "./engine6LiveViatorProductionValidation";

const buildValidationResult = (
  overrides: Partial<Engine6LiveViatorValidationResult> = {}
): Engine6LiveViatorValidationResult => ({
  productCode: "TESTP1",
  sourceUrl: "https://www.viator.com/tours/Washington-DC/Example/d657-TESTP1",
  passed: true,
  publicPageAvailable: true,
  apiConfirmedActive: true,
  canonicalProductCodeMatches: true,
  merchantUrlMatches: true,
  bookable: true,
  knownUnavailableBlocklistHit: false,
  reason: null,
  ...overrides,
});

describe("engine6ProductSelectionSelfReplacementGovernance", () => {
  it("treats infrastructure validation failures as ineligible for self-replacement", () => {
    expect(
      isEngine6LiveValidationInfrastructureFailure({
        reason:
          "public Viator fetch blocked by bot protection; API cross-check required; Viator API key not configured",
      })
    ).toBe(true);

    expect(
      isEngine6LiveValidationFailureEligibleForSelfReplacement({
        validationResult: buildValidationResult({
          passed: false,
          apiConfirmedActive: false,
          reason:
            "public Viator fetch blocked by bot protection; API cross-check required; Viator API key not configured",
        }),
      })
    ).toBe(false);
  });

  it("treats inactive and 404 API failures as eligible for self-replacement", () => {
    expect(
      isEngine6LiveValidationFailureEligibleForSelfReplacement({
        validationResult: buildValidationResult({
          passed: false,
          apiConfirmedActive: false,
          reason: "Viator API reports inactive status INACTIVE",
        }),
      })
    ).toBe(true);

    expect(
      isEngine6LiveValidationFailureEligibleForSelfReplacement({
        validationResult: buildValidationResult({
          passed: false,
          apiConfirmedActive: false,
          reason: "Viator API returned HTTP 404",
        }),
      })
    ).toBe(true);
  });

  it("replaces deploy-scoped failed products with the next validated backup", async () => {
    const report = await runEngine6ProductSelectionSelfReplacementGovernance({
      config: {
        destinationLabel: "Washington, D.C.",
        destinationCitySlug: "washington",
        viatorDestinationSlug: "Washington-DC",
        slots: [
          {
            experienceType: "private-night-tour",
            desiredCount: 1,
            candidates: [
              {
                productCode: "FAILP1",
                sourceUrl:
                  "https://www.viator.com/tours/Washington-DC/Failed/d657-FAILP1",
                title: "Failed Night Tour",
                experienceType: "private-night-tour",
                priceFrom: 425,
                priority: 1,
              },
              {
                productCode: "GOODP1",
                sourceUrl:
                  "https://www.viator.com/tours/Washington-DC/Good/d657-GOODP1",
                title: "Private Night Tour",
                experienceType: "private-night-tour",
                priceFrom: 450,
                priority: 2,
              },
            ],
          },
          {
            experienceType: "day-tour",
            desiredCount: 1,
            candidates: [
              {
                productCode: "DAYP1",
                sourceUrl:
                  "https://www.viator.com/tours/Washington-DC/Day/d657-DAYP1",
                title: "Day Tour",
                experienceType: "day-tour",
                priceFrom: 99,
                priority: 1,
              },
            ],
          },
        ],
      },
      selectedProductCodes: ["FAILP1", "DAYP1"],
      mode: "strict",
      scopedProductCodes: [],
      validateCandidate: async args =>
        buildValidationResult({
          productCode: args.productCode,
          sourceUrl: args.sourceUrl,
          passed: args.productCode !== "FAILP1",
          apiConfirmedActive: args.productCode !== "FAILP1",
          reason:
            args.productCode === "FAILP1"
              ? "Viator API reports inactive status INACTIVE"
              : null,
        }),
      generatedAt: "2026-07-03T20:00:00.000Z",
    });

    expect(report.removedProductCodes).toEqual(["FAILP1"]);
    expect(report.replacementProductCodes).toEqual(["GOODP1"]);
    expect(report.validatedProductCodes).toEqual(["GOODP1", "DAYP1"]);
    expect(report.replacements).toEqual([
      expect.objectContaining({
        removedProductCode: "FAILP1",
        replacementProductCode: "GOODP1",
      }),
    ]);
    expect(report.passed).toBe(true);
    expect(report.blocklistAdditions).toEqual(["FAILP1"]);
  });

  it("does not replace legacy products outside deploy scope in pr-scoped mode", async () => {
    const report = await runEngine6ProductSelectionSelfReplacementGovernance({
      config: {
        destinationLabel: "Washington, D.C.",
        destinationCitySlug: "washington",
        viatorDestinationSlug: "Washington-DC",
        slots: [
          {
            experienceType: "day-tour",
            desiredCount: 1,
            candidates: [
              {
                productCode: "LEGACYP1",
                sourceUrl:
                  "https://www.viator.com/tours/Washington-DC/Legacy/d657-LEGACYP1",
                title: "Legacy Day Tour",
                experienceType: "day-tour",
                priceFrom: 99,
                priority: 1,
              },
              {
                productCode: "BACKP1",
                sourceUrl:
                  "https://www.viator.com/tours/Washington-DC/Backup/d657-BACKP1",
                title: "Backup Day Tour",
                experienceType: "day-tour",
                priceFrom: 109,
                priority: 2,
              },
            ],
          },
        ],
      },
      selectedProductCodes: ["LEGACYP1"],
      mode: "pr-scoped",
      scopedProductCodes: ["NEWP1"],
      scopedAddedOrModified: ["NEWP1"],
      validateCandidate: async args =>
        buildValidationResult({
          productCode: args.productCode,
          sourceUrl: args.sourceUrl,
          passed: false,
          apiConfirmedActive: false,
          reason: "Viator API reports inactive status INACTIVE",
        }),
    });

    expect(report.removedProductCodes).toEqual([]);
    expect(report.replacementProductCodes).toEqual([]);
    expect(report.legacyUntouchedProductCodes).toEqual(["LEGACYP1"]);
  });

  it("formats a self-replacement report with replacement validation details", async () => {
    const report = await runEngine6ProductSelectionSelfReplacementGovernance({
      config: {
        destinationLabel: "Washington, D.C.",
        destinationCitySlug: "washington",
        viatorDestinationSlug: "Washington-DC",
        slots: [
          {
            experienceType: "bike-tour",
            desiredCount: 1,
            candidates: [
              {
                productCode: "2384P1",
                sourceUrl:
                  "https://www.viator.com/tours/Washington-DC/Bike/d657-2384P1",
                title: "Bike Tour",
                experienceType: "bike-tour",
                priceFrom: 59,
                priority: 1,
              },
              {
                productCode: "2384P20",
                sourceUrl:
                  "https://www.viator.com/tours/Washington-DC/Bike-Replacement/d657-2384P20",
                title: "Replacement Bike Tour",
                experienceType: "bike-tour",
                priceFrom: 59,
                priority: 2,
              },
            ],
          },
        ],
      },
      selectedProductCodes: ["2384P1"],
      mode: "strict",
      scopedProductCodes: [],
      validateCandidate: async args =>
        buildValidationResult({
          productCode: args.productCode,
          sourceUrl: args.sourceUrl,
          passed: args.productCode === "2384P20",
          apiConfirmedActive: args.productCode === "2384P20",
          reason:
            args.productCode === "2384P1"
              ? "Viator API returned HTTP 404"
              : null,
        }),
    });

    const formatted = formatEngine6ProductSelectionSelfReplacementReport(report);
    expect(formatted).toContain("2384P1 -> 2384P20");
    expect(formatted).toContain("Replacement live API validation");
  });
});
