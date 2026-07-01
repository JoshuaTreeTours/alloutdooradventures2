import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("./routes.js", async importOriginal => {
  const actual = await importOriginal<typeof import("./routes.js")>();
  const glacierProductCodePaths = {
    "123783P1":
      "/destinations/montana/glacier-national-park/tours/half-day-whitewater-rafting-123783P1",
    "70248P3":
      "/destinations/montana/glacier-national-park/tours/full-day-whitewater-lunch-70248P3",
    "70248P2":
      "/destinations/montana/glacier-national-park/tours/half-day-scenic-float-70248P2",
    "299521P2":
      "/destinations/montana/glacier-national-park/tours/driving-tour-glacier-national-park-299521P2",
    "299521P8":
      "/destinations/montana/glacier-national-park/tours/driving-tour-west-glacier-299521P8",
    "86727P7":
      "/destinations/montana/glacier-national-park/tours/nature-walk-glacier-86727P7",
    "487722P4":
      "/destinations/montana/glacier-national-park/tours/sunset-clear-paddleboard-487722P4",
  } as const;

  return {
    ...actual,
    resolveEngine6PathForProductCode: (productCode: string) => {
      const normalized = productCode.trim().toUpperCase();
      return (
        glacierProductCodePaths[
          normalized as keyof typeof glacierProductCodePaths
        ] ?? actual.resolveEngine6PathForProductCode(productCode)
      );
    },
  };
});

import { assessEngine6DestinationProductBinding } from "./engine6DestinationProductBinding";
import { selectEngine6DestinationPortfolio } from "./engine6ProductSelectionGovernance";
import type { Engine6LiveViatorValidationResult } from "./engine6LiveViatorProductionValidation";
import { normalizeEngine6ParagonProductSelectionConfig } from "./normalizeEngine6ParagonProductSelectionConfig";

const GLACIER_PRODUCT_CODES = [
  "123783P1",
  "70248P3",
  "70248P2",
  "299521P2",
  "299521P8",
  "86727P7",
  "487722P4",
] as const;

const buildValidationResult = (
  args: Pick<Engine6LiveViatorValidationResult, "productCode" | "sourceUrl">
): Engine6LiveViatorValidationResult => ({
  ...args,
  passed: true,
  publicPageAvailable: true,
  apiConfirmedActive: true,
  canonicalProductCodeMatches: true,
  merchantUrlMatches: true,
  bookable: true,
  knownUnavailableBlocklistHit: false,
  reason: null,
});

describe("glacier product-selection strict validation", () => {
  it("accepts Glacier products already bound to glacier-national-park", async () => {
    const raw = JSON.parse(
      readFileSync("scripts/glacier-product-selection.json", "utf8")
    ) as unknown;
    const config = normalizeEngine6ParagonProductSelectionConfig({
      configPath: "scripts/glacier-product-selection.json",
      raw,
    });

    expect(config.destinationCitySlug).toBe("west-glacier");
    expect(config.configPathSlug).toBe("glacier");

    for (const productCode of GLACIER_PRODUCT_CODES) {
      const candidate = config.slots
        .flatMap(slot => slot.candidates)
        .find(entry => entry.productCode === productCode);

      expect(candidate).toBeDefined();

      const binding = assessEngine6DestinationProductBinding({
        productCode,
        sourceUrl: candidate!.sourceUrl,
        destinationCitySlug: config.destinationCitySlug,
        viatorDestinationSlug: config.viatorDestinationSlug,
        configPathSlug: config.configPathSlug,
      });

      expect(binding.boundCitySlug).toBe("glacier-national-park");
      expect(binding.violation).toBeNull();
    }

    const report = await selectEngine6DestinationPortfolio({
      ...config,
      mode: "strict",
      scopedProductCodes: [],
      validateCandidate: async args =>
        buildValidationResult({
          productCode: args.productCode,
          sourceUrl: args.sourceUrl,
        }),
    });

    expect(
      report.rejected.filter(
        entry => entry.reason === "duplicate-engine6-assignment"
      )
    ).toEqual([]);

    for (const productCode of GLACIER_PRODUCT_CODES) {
      expect(
        report.rejected.some(entry => entry.productCode === productCode),
        `${productCode} should not be rejected`
      ).toBe(false);
      expect(
        report.accepted.some(entry => entry.productCode === productCode),
        `${productCode} should be accepted`
      ).toBe(true);
    }

    expect(report.productsAccepted).toBe(GLACIER_PRODUCT_CODES.length);
    expect(report.buildTerminated).toBe(false);
    expect(report.passed).toBe(true);
  });
});
