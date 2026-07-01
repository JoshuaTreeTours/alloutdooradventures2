import { describe, expect, it } from "vitest";

import {
  areEngine6ExperienceTypesMateriallyCompatible,
  inferEngine6PrincipalExperienceTypeFromProduct,
  normalizeEngine6PrincipalExperienceType,
} from "./engine6PrincipalExperienceType";
import {
  ENGINE6_TAGGED_HERO_EXPERIENCE_TYPES,
  inferEngine6HeroExperienceType,
  resolveEngine6HeroWithIntegrityGovernance,
  runEngine6HeroIntegrityGovernance,
  validateEngine6HeroCandidate,
} from "./engine6HeroIntegrityGovernance";

const DRIVING_TOUR_PRODUCT = {
  productCode: "GLACIER-DRIVE-PRIMARY",
  title: "Going-to-the-Sun Road Scenic Red Bus Tour",
  experienceType: "driving-tour",
  productPrimaryHeroUrl:
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/drive/01/01.jpg",
  stateSlug: "montana",
  citySlug: "glacier-national-park",
};

const RAFTING_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/0a/7f/49/38.jpg";

describe("engine6PrincipalExperienceType", () => {
  it("normalizes slot experience type aliases", () => {
    expect(normalizeEngine6PrincipalExperienceType("van-tour")).toBe(
      "driving-tour"
    );
    expect(normalizeEngine6PrincipalExperienceType("whitewater-rafting")).toBe(
      "rafting"
    );
    expect(normalizeEngine6PrincipalExperienceType("e-bike")).toBe("bike-tour");
  });

  it("infers driving tours from Glacier red bus titles", () => {
    expect(
      inferEngine6PrincipalExperienceTypeFromProduct({
        experienceType: "driving-tour",
        title: "Going-to-the-Sun Road Scenic Red Bus Tour",
      })
    ).toBe("driving-tour");
  });

  it("detects material mismatch between rafting and driving tour", () => {
    expect(
      areEngine6ExperienceTypesMateriallyCompatible({
        productExperienceType: "driving-tour",
        heroExperienceType: "rafting",
      })
    ).toBe(false);
  });

  it("allows neutral destination heroes for any product", () => {
    expect(
      areEngine6ExperienceTypesMateriallyCompatible({
        productExperienceType: "driving-tour",
        heroExperienceType: "neutral-destination",
      })
    ).toBe(true);
  });
});

describe("engine6HeroIntegrityGovernance", () => {
  it("tags known rafting hero URLs separately from driving tours", () => {
    expect(ENGINE6_TAGGED_HERO_EXPERIENCE_TYPES[RAFTING_HERO_URL]).toBe(
      "rafting"
    );
    expect(
      inferEngine6HeroExperienceType({
        heroUrl: RAFTING_HERO_URL,
        sourceTier: "curated-product",
        productExperienceType: "rafting",
      })
    ).toBe("rafting");
  });

  it("rejects a rafting hero for a driving tour product", () => {
    const finding = validateEngine6HeroCandidate({
      product: DRIVING_TOUR_PRODUCT,
      candidate: {
        url: RAFTING_HERO_URL,
        tier: "curated-product",
        experienceType: "rafting",
      },
      hasValidProductPrimaryHero: true,
    });

    expect(finding?.reason).toBe("experience-mismatch");
    expect(finding?.productExperienceType).toBe("driving-tour");
    expect(finding?.heroExperienceType).toBe("rafting");
  });

  it("auto-replaces a mismatched hero with the validated product primary hero", () => {
    const result = resolveEngine6HeroWithIntegrityGovernance({
      product: DRIVING_TOUR_PRODUCT,
      currentHeroUrl: RAFTING_HERO_URL,
    });

    expect(result.resolution?.resolvedHeroUrl).toBe(
      DRIVING_TOUR_PRODUCT.productPrimaryHeroUrl
    );
    expect(result.resolution?.sourceTier).toBe("product-primary");
    expect(result.resolution?.replacedHeroUrl).toBe(RAFTING_HERO_URL);
    expect(result.findings.some(entry => entry.reason === "experience-mismatch")).toBe(
      true
    );
  });

  it("downgrades to neutral destination hero when no product hero exists", () => {
    const result = resolveEngine6HeroWithIntegrityGovernance({
      product: {
        ...DRIVING_TOUR_PRODUCT,
        productPrimaryHeroUrl: null,
        productAlternateHeroUrls: [],
      },
      currentHeroUrl: RAFTING_HERO_URL,
    });

    expect(result.resolution?.heroExperienceType).toBe("neutral-destination");
    expect(result.resolution?.replacedHeroUrl).toBe(RAFTING_HERO_URL);
  });

  it("runs batch hero integrity governance across a destination portfolio", () => {
    const report = runEngine6HeroIntegrityGovernance({
      products: [
        DRIVING_TOUR_PRODUCT,
        {
          productCode: "GLACIER-RAFT-PRIMARY",
          title: "Middle Fork Flathead River Whitewater Rafting",
          experienceType: "rafting",
          productPrimaryHeroUrl: RAFTING_HERO_URL,
          stateSlug: "montana",
          citySlug: "glacier-national-park",
        },
      ],
      currentHeroUrlsByProductCode: {
        "GLACIER-DRIVE-PRIMARY": RAFTING_HERO_URL,
        "GLACIER-RAFT-PRIMARY": RAFTING_HERO_URL,
      },
    });

    expect(report.passed).toBe(true);
    expect(report.productsPassed).toBe(2);
    expect(report.heroesReplaced).toBe(1);
    expect(
      report.resolutions.find(entry => entry.productCode === "GLACIER-DRIVE-PRIMARY")
        ?.resolvedHeroUrl
    ).toBe(DRIVING_TOUR_PRODUCT.productPrimaryHeroUrl);
  });
});
