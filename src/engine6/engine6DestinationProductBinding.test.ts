import { describe, expect, it } from "vitest";

import {
  bindEngine6DestinationProducts,
  buildEngine6HeroIntegrityInputsFromBinding,
  inferPrincipalExperienceTypeForAcceptedProduct,
} from "./engine6DestinationProductBinding";
import type { Engine6ProductSelectionAcceptedCandidate } from "./engine6ProductSelectionGovernance";
import type { Engine6HeroIntegrityResolution } from "./engine6HeroIntegrityGovernance";

const buildAccepted = (
  overrides: Partial<Engine6ProductSelectionAcceptedCandidate> = {}
): Engine6ProductSelectionAcceptedCandidate => ({
  productCode: "GLACIER-DRIVE-PRIMARY",
  sourceUrl:
    "https://www.viator.com/tours/Glacier-National-Park/Going-to-the-Sun-Road-Scenic-Drive/d1234-GLACIER-DRIVE-PRIMARY",
  title: "Going-to-the-Sun Road Scenic Red Bus Tour",
  experienceType: "driving-tour",
  commercialTier: "standard",
  replacedProductCode: null,
  validationResult: {
    productCode: "GLACIER-DRIVE-PRIMARY",
    sourceUrl:
      "https://www.viator.com/tours/Glacier-National-Park/Going-to-the-Sun-Road-Scenic-Drive/d1234-GLACIER-DRIVE-PRIMARY",
    passed: true,
    publicPageAvailable: true,
    apiConfirmedActive: true,
    canonicalProductCodeMatches: true,
    merchantUrlMatches: true,
    bookable: true,
    knownUnavailableBlocklistHit: false,
    reason: null,
  },
  ...overrides,
});

const buildHeroResolution = (
  overrides: Partial<Engine6HeroIntegrityResolution> = {}
): Engine6HeroIntegrityResolution => ({
  productCode: "GLACIER-DRIVE-PRIMARY",
  resolvedHeroUrl:
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/drive/01/01.jpg",
  sourceTier: "product-primary",
  productExperienceType: "driving-tour",
  heroExperienceType: "driving-tour",
  ...overrides,
});

describe("engine6DestinationProductBinding", () => {
  it("binds accepted portfolio products to governed hero URLs", () => {
    const report = bindEngine6DestinationProducts({
      input: {
        config: {
          destinationLabel: "Glacier National Park",
          stateSlug: "montana",
          citySlug: "glacier-national-park",
          slots: [],
        },
        accepted: [buildAccepted()],
        heroResolutions: [buildHeroResolution()],
      },
    });

    expect(report.passed).toBe(true);
    expect(report.boundProducts).toHaveLength(1);
    expect(report.boundProducts[0]?.heroUrl).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/drive/01/01.jpg"
    );
    expect(report.boundProducts[0]?.principalExperienceType).toBe("driving-tour");
    expect(report.boundProducts[0]?.stateSlug).toBe("montana");
    expect(report.boundProducts[0]?.citySlug).toBe("glacier-national-park");
  });

  it("fails binding when hero resolutions are missing", () => {
    const report = bindEngine6DestinationProducts({
      input: {
        config: {
          destinationLabel: "Glacier National Park",
          stateSlug: "montana",
          citySlug: "glacier-national-park",
          slots: [],
        },
        accepted: [buildAccepted()],
        heroResolutions: [],
      },
    });

    expect(report.passed).toBe(false);
    expect(report.missingHeroResolutions).toEqual(["GLACIER-DRIVE-PRIMARY"]);
  });

  it("builds hero integrity inputs from accepted products and live hero URLs", () => {
    const accepted = [buildAccepted()];
    const inputs = buildEngine6HeroIntegrityInputsFromBinding({
      config: {
        destinationLabel: "Glacier National Park",
        stateSlug: "montana",
        citySlug: "glacier-national-park",
        slots: [],
      },
      accepted,
      liveProductHeroUrls: {
        "GLACIER-DRIVE-PRIMARY": {
          primaryHeroUrl:
            "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/drive/01/01.jpg",
          alternateHeroUrls: [
            "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/drive/02/02.jpg",
          ],
        },
      },
    });

    expect(inputs[0]?.productPrimaryHeroUrl).toContain("/aa/drive/01/01.jpg");
    expect(inputs[0]?.productAlternateHeroUrls).toHaveLength(1);
    expect(inputs[0]?.stateSlug).toBe("montana");
  });

  it("infers principal experience type from accepted product metadata", () => {
    expect(
      inferPrincipalExperienceTypeForAcceptedProduct(buildAccepted())
    ).toBe("driving-tour");
  });
});
