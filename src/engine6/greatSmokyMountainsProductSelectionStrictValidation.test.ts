import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("./routes.js", async importOriginal => {
  const actual = await importOriginal<typeof import("./routes.js")>();
  const gsmProductCodePaths = {
    "26480P10":
      "/destinations/tennessee/great-smoky-mountains-national-park/tours/thundering-streams-falls-guided-hike-26480P10",
    "26480P2":
      "/destinations/tennessee/great-smoky-mountains-national-park/tours/historic-river-town-ramble-26480P2",
    "26480P11":
      "/destinations/tennessee/great-smoky-mountains-national-park/tours/clear-creek-falls-hike-26480P11",
    "26480P6":
      "/destinations/tennessee/great-smoky-mountains-national-park/tours/smoky-mountain-scenic-van-tour-26480P6",
    "335817P3":
      "/destinations/tennessee/great-smoky-mountains-national-park/tours/classic-national-park-tour-335817P3",
    "335817P10":
      "/destinations/tennessee/great-smoky-mountains-national-park/tours/half-day-fly-fishing-smoky-mountains-335817P10",
    "26480P8":
      "/destinations/tennessee/great-smoky-mountains-national-park/tours/fall-color-tour-smoky-mountains-26480P8",
    "26480P14":
      "/destinations/tennessee/great-smoky-mountains-national-park/tours/smokies-custom-private-tour-26480P14",
  } as const;

  return {
    ...actual,
    resolveEngine6PathForProductCode: (productCode: string) => {
      const normalized = productCode.trim().toUpperCase();
      return (
        gsmProductCodePaths[
          normalized as keyof typeof gsmProductCodePaths
        ] ?? actual.resolveEngine6PathForProductCode(productCode)
      );
    },
  };
});

import { assessEngine6DestinationProductBinding } from "./engine6DestinationProductBinding";
import { selectEngine6DestinationPortfolio } from "./engine6ProductSelectionGovernance";
import type { Engine6LiveViatorValidationResult } from "./engine6LiveViatorProductionValidation";
import { normalizeEngine6ParagonProductSelectionConfig } from "./normalizeEngine6ParagonProductSelectionConfig";

const GSM_PRODUCT_CODES = [
  "26480P10",
  "26480P2",
  "26480P11",
  "26480P6",
  "335817P3",
  "335817P10",
  "26480P8",
  "26480P14",
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

describe("great smoky mountains product-selection strict validation", () => {
  it("accepts Gatlinburg Viator products bound to great-smoky-mountains-national-park", async () => {
    const raw = JSON.parse(
      readFileSync("scripts/great-smoky-mountains-product-selection.json", "utf8")
    ) as unknown;
    const config = normalizeEngine6ParagonProductSelectionConfig({
      configPath: "scripts/great-smoky-mountains-product-selection.json",
      raw,
    });

    expect(config.destinationCitySlug).toBe("great-smoky-mountains-national-park");
    expect(config.viatorDestinationSlug).toBe("Gatlinburg");
    expect(config.configPathSlug).toBe("great-smoky-mountains");

    for (const productCode of GSM_PRODUCT_CODES) {
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

      expect(binding.boundCitySlug).toBe("great-smoky-mountains-national-park");
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

    for (const productCode of GSM_PRODUCT_CODES) {
      expect(
        report.rejected.some(entry => entry.productCode === productCode),
        `${productCode} should not be rejected`
      ).toBe(false);
      expect(
        report.accepted.some(entry => entry.productCode === productCode),
        `${productCode} should be accepted`
      ).toBe(true);
    }

    expect(report.productsAccepted).toBe(GSM_PRODUCT_CODES.length);
    expect(report.buildTerminated).toBe(false);
    expect(report.passed).toBe(true);
  });
});
