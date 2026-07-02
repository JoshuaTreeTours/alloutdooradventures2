import { describe, expect, it } from "vitest";

import {
  extractProductSelectionSlugFromConfigPath,
  normalizeEngine6ParagonProductSelectionConfig,
  slugToDestinationLabel,
} from "./normalizeEngine6ParagonProductSelectionConfig";

describe("normalizeEngine6ParagonProductSelectionConfig", () => {
  it("accepts legacy configs that only define slots", () => {
    const config = normalizeEngine6ParagonProductSelectionConfig({
      configPath: "scripts/zion-product-selection.json",
      raw: {
        slots: [
          {
            experienceType: "day-tour",
            desiredCount: 1,
            candidates: [
              {
                productCode: "GOODP1",
                sourceUrl:
                  "https://www.viator.com/tours/Zion-National-Park/Tour/d5610-GOODP1",
                title: "Zion Day Tour",
                experienceType: "day-tour",
                priceFrom: 149,
              },
            ],
          },
        ],
      },
    });

    expect(config.destinationLabel).toBe("Zion");
    expect(config.destinationCitySlug).toBe("zion-national-park");
    expect(config.viatorDestinationSlug).toBe("Zion-National-Park");
    expect(config.slots).toHaveLength(1);
  });

  it("preserves explicit Paragon destination fields when present", () => {
    const config = normalizeEngine6ParagonProductSelectionConfig({
      configPath: "scripts/example-national-park.product-selection.json",
      raw: {
        destinationLabel: "Example National Park",
        destinationCitySlug: "example-national-park",
        viatorDestinationSlug: "Example-National-Park",
        targetPremiumShare: 0.5,
        slots: [
          {
            experienceType: "private-tour",
            desiredCount: 1,
            candidates: [
              {
                productCode: "GOODP1",
                sourceUrl:
                  "https://www.viator.com/tours/Example-National-Park/Tour/d9999-GOODP1",
                title: "Example Tour",
                experienceType: "private-tour",
                priceFrom: 799,
              },
            ],
          },
        ],
      },
    });

    expect(config.destinationLabel).toBe("Example National Park");
    expect(config.destinationCitySlug).toBe("example-national-park");
    expect(config.viatorDestinationSlug).toBe("Example-National-Park");
    expect(config.targetPremiumShare).toBe(0.5);
  });

  it("honors legacy destination overrides from CLI-style inputs", () => {
    const config = normalizeEngine6ParagonProductSelectionConfig({
      configPath: "scripts/custom.product-selection.json",
      destinationLabelOverride: "Custom Destination Label",
      raw: {
        slots: [
          {
            experienceType: "day-tour",
            desiredCount: 1,
            candidates: [
              {
                productCode: "GOODP1",
                sourceUrl:
                  "https://www.viator.com/tours/Yosemite-National-Park/Tour/d5265-GOODP1",
                title: "Yosemite Day Tour",
                experienceType: "day-tour",
                priceFrom: 149,
              },
            ],
          },
        ],
      },
    });

    expect(config.destinationLabel).toBe("Custom Destination Label");
    expect(config.destinationCitySlug).toBe("yosemite-national-park");
    expect(config.viatorDestinationSlug).toBe("Yosemite-National-Park");
  });

  it("derives helper values from config path slugs", () => {
    expect(
      extractProductSelectionSlugFromConfigPath(
        "scripts/yellowstone-national-park-product-selection.json"
      )
    ).toBe("yellowstone-national-park");
    expect(
      extractProductSelectionSlugFromConfigPath(
        "scripts/zion-product-selection.json"
      )
    ).toBe("zion");
    expect(
      extractProductSelectionSlugFromConfigPath(
        "scripts/example-national-park.product-selection.json"
      )
    ).toBe("example-national-park");
    expect(slugToDestinationLabel("yellowstone-national-park")).toBe(
      "Yellowstone National Park"
    );
  });
});
