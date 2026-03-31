import { describe, expect, it } from "vitest";

import { resolveProductScopedHero } from "./heroResolver";

describe("engine6 hero resolver", () => {
  it("accepts product-scoped API images when they are the only valid candidates", () => {
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
          url: "/images/hiking-hero.jpg",
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

    expect(resolved.heroUrl).toBeNull();
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

  it("accepts product-owned media hosts across Viator/Tripadvisor variants", () => {
    const resolved = resolveProductScopedHero({
      currentProductCode: "36001P1",
      currentSourceProductUrl:
        "https://www.viator.com/tours/San-Francisco/Yosemite-In-A-Day-Tour-from-San-Francisco/d651-36001P1",
      candidates: [
        {
          url: "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/07/31/dd/5f.jpg",
          sourceType: "api-primary",
          candidateProductCode: "36001P1",
          candidateSourceProductUrl:
            "https://www.viator.com/tours/San-Francisco/Yosemite-In-A-Day-Tour-from-San-Francisco/d651-36001P1",
        },
      ],
    });

    expect(resolved.heroUrl).toBe(
      "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/07/31/dd/5f.jpg"
    );
    expect(resolved.heroSourceType).toBe("api-primary");
    expect(resolved.fallbackTriggered).toBe(false);
  });

  it("prioritizes TACDN caption images over other verified candidates", () => {
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
          width: 674,
          height: 446,
        },
        {
          url: "https://media.tacdn.com/media/attractions-content--1x-1/aa/bb/cc/caption.jpg",
          sourceType: "api-gallery",
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
          width: 800,
          height: 600,
        },
      ],
    });

    expect(resolved.heroUrl).toBe(
      "https://media.tacdn.com/media/attractions-content--1x-1/aa/bb/cc/caption.jpg"
    );
    expect(resolved.heroSourceType).toBe("api-gallery");
    expect(resolved.fallbackTriggered).toBe(false);
    expect((resolved.finalCandidate?.width ?? 0) >= 800).toBe(true);
  });

  it("normalizes TACDN media URLs to high-resolution variants where possible", () => {
    const resolved = resolveProductScopedHero({
      currentProductCode: "SUNSET1",
      currentSourceProductUrl:
        "https://www.viator.com/tours/Santa-Barbara/Sunset-Sailing/d4372-SUNSET1",
      candidates: [
        {
          url: "https://dynamic-media.tacdn.com/media/photo-s/1a/2b/3c/4d.jpg?foo=bar",
          sourceType: "api-primary",
          candidateProductCode: "SUNSET1",
          candidateSourceProductUrl:
            "https://www.viator.com/tours/Santa-Barbara/Sunset-Sailing/d4372-SUNSET1",
        },
      ],
    });

    expect(resolved.heroUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/1a/2b/3c/4d.jpg?foo=bar"
    );
  });

  it("rejects untrusted hosts even when the candidate appears product-scoped", () => {
    const resolved = resolveProductScopedHero({
      currentProductCode: "63657P1",
      currentSourceProductUrl:
        "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
      candidates: [
        {
          url: "https://images.example.com/media/product.jpg",
          sourceType: "api-primary",
          candidateProductCode: "63657P1",
          candidateSourceProductUrl:
            "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
        },
      ],
    });

    expect(resolved.heroUrl).toBeNull();
    expect(resolved.fallbackTriggered).toBe(true);
    expect(resolved.rejectedForeignCandidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: "https://images.example.com/media/product.jpg",
          reason: "untrusted-media-host",
        }),
      ])
    );
  });

  it("uses a later valid candidate when earlier product-scoped candidates are rejected", () => {
    const resolved = resolveProductScopedHero({
      currentProductCode: "SUNSET1",
      currentSourceProductUrl:
        "https://www.viator.com/tours/Santa-Barbara/Sunset-Sailing/d4372-SUNSET1",
      candidates: [
        {
          url: "https://images.example.com/broken.jpg",
          sourceType: "api-primary",
          candidateProductCode: "SUNSET1",
          candidateSourceProductUrl:
            "https://www.viator.com/tours/Santa-Barbara/Sunset-Sailing/d4372-SUNSET1",
        },
        {
          url: "https://dynamic-media.tacdn.com/media/photo-o/1a/2b/3c/4d.jpg",
          sourceType: "api-primary",
          candidateProductCode: "SUNSET1",
          candidateSourceProductUrl:
            "https://www.viator.com/tours/Santa-Barbara/Sunset-Sailing/d4372-SUNSET1",
        },
      ],
    });

    expect(resolved.heroUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/1a/2b/3c/4d.jpg"
    );
    expect(resolved.fallbackTriggered).toBe(false);
    expect(resolved.rejectedForeignCandidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: "https://images.example.com/broken.jpg",
          reason: "untrusted-media-host",
        }),
      ])
    );
  });
});
