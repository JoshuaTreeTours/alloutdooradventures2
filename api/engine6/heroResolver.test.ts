import { describe, expect, it } from "vitest";

import { resolveProductScopedHero } from "./heroResolver";

describe("engine6 hero resolver", () => {
  it("accepts the first valid TACDN image for the current product", () => {
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
      ],
    });

    expect(resolved.heroUrl).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/56/92/6e.jpg"
    );
    expect(resolved.heroSourceType).toBe("api-primary");
    expect(resolved.fallbackTriggered).toBe(false);
  });

  it("rejects foreign and static hero candidates explicitly and fails closed", () => {
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

    expect(resolved.heroUrl).toBeNull();
    expect(resolved.heroSourceType).toBeNull();
    expect(resolved.fallbackTriggered).toBe(true);
    expect(resolved.rejectedForeignCandidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: "https://cdn.example.com/foreign-sibling-tour.jpg",
          reason: "unverified-product-scope",
        }),
        expect.objectContaining({
          url: "https://www.alloutdooradventures.com/hero.jpg",
          reason: "static-hero-disallowed",
        }),
      ])
    );
  });

  it("uses deterministic first-valid ordering without rotation", () => {
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
          width: 1200,
          height: 900,
        },
        {
          url: "https://dynamic-media.tacdn.com/media/photo-o/12/34/56/78.jpg",
          sourceType: "api-gallery",
          candidateProductCode: "63657P1",
          candidateSourceProductUrl:
            "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
          width: 640,
          height: 480,
        },
      ],
    });

    expect(resolved.heroUrl).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/56/92/6e.jpg"
    );
    expect(resolved.heroSourceType).toBe("api-primary");
    expect(resolved.fallbackTriggered).toBe(false);
  });
});
