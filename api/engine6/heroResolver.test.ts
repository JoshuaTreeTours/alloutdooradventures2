import { describe, expect, it } from "vitest";

import {
  ENGINE6_APPROVED_PLACEHOLDER_IMAGE,
  resolveProductScopedHero,
} from "./heroResolver";

describe("engine6 hero resolver", () => {
  it("accepts the current product primary API image before any placeholder", () => {
    const resolved = resolveProductScopedHero({
      currentProductCode: "63657P1",
      currentSourceProductUrl:
        "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
      candidates: [
        {
          url: "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/56/92/6e.jpg",
          sourceType: "api-primary",
          candidateProductCode: "63657P1",
          candidateSourceProductUrl:
            "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
        },
        {
          url: ENGINE6_APPROVED_PLACEHOLDER_IMAGE,
          sourceType: "approved-placeholder",
        },
      ],
    });

    expect(resolved.heroUrl).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/56/92/6e.jpg"
    );
    expect(resolved.heroSourceType).toBe("api-primary");
    expect(resolved.fallbackTriggered).toBe(false);
  });

  it("rejects foreign and static hero candidates explicitly", () => {
    const resolved = resolveProductScopedHero({
      currentProductCode: "63657P1",
      currentSourceProductUrl:
        "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
      candidates: [
        {
          url: "https://cdn.example.com/foreign-sibling-tour.jpg",
          sourceType: "api-primary",
          candidateProductCode: "OTHER123",
          candidateSourceProductUrl:
            "https://www.viator.com/tours/Other-City/Other-Tour/d999-OTHER123",
        },
        {
          url: "https://www.alloutdooradventures.com/hero.jpg",
          sourceType: "api-gallery",
          candidateProductCode: "63657P1",
          candidateSourceProductUrl:
            "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
        },
      ],
    });

    expect(resolved.heroUrl).toBe(ENGINE6_APPROVED_PLACEHOLDER_IMAGE);
    expect(resolved.heroSourceType).toBe("approved-placeholder");
    expect(resolved.fallbackTriggered).toBe(true);
    expect(resolved.rejectedForeignCandidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: "https://cdn.example.com/foreign-sibling-tour.jpg",
          reason: "foreign-product-code",
        }),
        expect.objectContaining({
          url: "https://www.alloutdooradventures.com/hero.jpg",
          reason: "static-hero-disallowed",
        }),
      ])
    );
  });
});
