import { describe, expect, it } from "vitest";

import { resolveProductScopedHero } from "./heroResolver";

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
          fieldPath: "product.media.images[0].variants.FULL.url",
        },
        {
          url: "/images/hiking-hero.jpg",
          sourceType: "none",
        },
      ],
    });

    expect(resolved.heroUrl).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/56/92/6e.jpg"
    );
    expect(resolved.heroSourceType).toBe("api-primary");
    expect(resolved.heroQualityClassification).toBe("splice");
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
          fieldPath: "product.media.images[0].variants.FULL.url",
        },
        {
          url: "https://www.alloutdooradventures.com/hero.jpg",
          sourceType: "api-gallery",
          candidateProductCode: "63657P1",
          candidateSourceProductUrl:
            "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
          fieldPath: "product.media.images[0].variants.FULL.url",
        },
      ],
    });

    expect(resolved.heroUrl).toBeNull();
    expect(resolved.heroSourceType).toBe("none");
    expect(resolved.heroQualityClassification).toBe("none");
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
          fieldPath: "product.media.images[0].variants.FULL.url",
        },
      ],
    });

    expect(resolved.heroUrl).toBe(
      "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/07/31/dd/5f.jpg"
    );
    expect(resolved.heroSourceType).toBe("api-primary");
    expect(resolved.heroQualityClassification).toBe("splice");
    expect(resolved.fallbackTriggered).toBe(false);
  });

  it("applies strict caption precedence for same-product candidates", () => {
    const resolved = resolveProductScopedHero({
      currentProductCode: "63657P1",
      currentSourceProductUrl:
        "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
      candidates: [
        {
          url: "https://dynamic-media.tacdn.com/media/photo-o/12/34/56/78.jpg?w=1800&h=1200&s=1",
          sourceType: "api-gallery",
          candidateProductCode: "63657P1",
          candidateSourceProductUrl:
            "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
          fieldPath: "product.media.images[0].variants.FULL.url",
          width: 1800,
          height: 1200,
        },
        {
          url: "https://dynamic-media.tacdn.com/media/photo-o/12/34/56/caption.jpg?w=700&h=500&s=1",
          sourceType: "api-gallery",
          candidateProductCode: "63657P1",
          candidateSourceProductUrl:
            "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
          fieldPath: "product.media.images[0].variants.CAPTION.url",
          width: 1200,
          height: 900,
        },
      ],
    });

    expect(resolved.heroUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/12/34/56/caption.jpg?w=700&h=500&s=1"
    );
    expect(resolved.heroSourceType).toBe("api-gallery");
    expect(resolved.heroQualityClassification).toBe("caption");
    expect(resolved.captionPrecedenceApplied).toBe(true);
    expect(resolved.candidateFamilyIdentityDeterminable).toBe(true);
    expect(resolved.fallbackTriggered).toBe(false);
  });

  it("allows caption to override splice media under strict precedence", () => {
    const resolved = resolveProductScopedHero({
      currentProductCode: "447234P3",
      currentSourceProductUrl:
        "https://www.viator.com/tours/San-Diego/Joshua-Tree-National-Park-Day-Trip-from-San-Diego/d736-447234P3",
      candidates: [
        {
          url: "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/13/c0/42/c4.jpg",
          sourceType: "api-primary",
          candidateProductCode: "447234P3",
          candidateSourceProductUrl:
            "https://www.viator.com/tours/San-Diego/Joshua-Tree-National-Park-Day-Trip-from-San-Diego/d736-447234P3",
          fieldPath: "product.media.images[0].variants.CAPTION.url",
          width: 720,
          height: 480,
        },
        {
          url: "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/r/32/94/08/b8/caption.jpg",
          sourceType: "api-gallery",
          candidateProductCode: "447234P3",
          candidateSourceProductUrl:
            "https://www.viator.com/tours/San-Diego/Joshua-Tree-National-Park-Day-Trip-from-San-Diego/d736-447234P3",
          fieldPath: "product.media.images[0].variants.FULL.url",
          width: 720,
          height: 480,
        },
      ],
    });

    expect(resolved.heroUrl).toBe(
      "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/r/32/94/08/b8/caption.jpg"
    );
    expect(resolved.heroQualityClassification).toBe("caption");
    expect(resolved.captionPrecedenceApplied).toBe(true);
    expect(resolved.candidateFamilyIdentityDeterminable).toBe(true);
  });

  it("does not synthesize alternate media URLs", () => {
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
          fieldPath: "product.media.images[0].variants.FULL.url",
        },
      ],
    });

    expect(resolved.heroUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-s/1a/2b/3c/4d.jpg?foo=bar"
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
          fieldPath: "product.media.images[0].variants.FULL.url",
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
          fieldPath: "product.media.images[0].variants.FULL.url",
        },
        {
          url: "https://dynamic-media.tacdn.com/media/photo-o/1a/2b/3c/4d.jpg",
          sourceType: "api-primary",
          candidateProductCode: "SUNSET1",
          candidateSourceProductUrl:
            "https://www.viator.com/tours/Santa-Barbara/Sunset-Sailing/d4372-SUNSET1",
          fieldPath: "product.media.images[0].variants.FULL.url",
        },
      ],
    });

    expect(resolved.heroUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/1a/2b/3c/4d.jpg"
    );
    expect(resolved.heroQualityClassification).toBe("product-media");
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

  it("uses same-product non-splice product media when caption is unavailable", () => {
    const resolved = resolveProductScopedHero({
      currentProductCode: "MEDIA1",
      currentSourceProductUrl: "https://www.viator.com/tours/City/Tour/d1-MEDIA1",
      candidates: [
        {
          url: "https://dynamic-media.tacdn.com/media/photo-o/9a/8b/7c/6d.jpg?w=1600&h=1066&s=1",
          sourceType: "api-gallery",
          candidateProductCode: "MEDIA1",
          candidateSourceProductUrl:
            "https://www.viator.com/tours/City/Tour/d1-MEDIA1",
          fieldPath: "product.media.images[0].variants.FULL.url",
          width: 1600,
          height: 1066,
        },
      ],
    });

    expect(resolved.heroUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/9a/8b/7c/6d.jpg?w=1600&h=1066&s=1"
    );
    expect(resolved.heroQualityClassification).toBe("product-media");
    expect(resolved.fallbackTriggered).toBe(false);
  });

  it("uses same-product splice media when no better same-product media exists", () => {
    const resolved = resolveProductScopedHero({
      currentProductCode: "SPLICE1",
      currentSourceProductUrl:
        "https://www.viator.com/tours/City/Splice-Only/d1-SPLICE1",
      candidates: [
        {
          url: "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/56/92/6e.jpg",
          sourceType: "api-primary",
          candidateProductCode: "SPLICE1",
          candidateSourceProductUrl:
            "https://www.viator.com/tours/City/Splice-Only/d1-SPLICE1",
          fieldPath: "product.media.images[0].variants.FULL.url",
          width: 674,
          height: 446,
        },
      ],
    });

    expect(resolved.heroUrl).toContain("/attractions-splice-spp-674x446/");
    expect(resolved.heroQualityClassification).toBe("splice");
    expect(resolved.fallbackTriggered).toBe(false);
  });

  it("rejects malformed URLs and falls back to placeholder classification", () => {
    const resolved = resolveProductScopedHero({
      currentProductCode: "BADURL1",
      currentSourceProductUrl: "https://www.viator.com/tours/City/Bad-Url/d1-BADURL1",
      candidates: [
        {
          url: "not-a-url",
          sourceType: "api-primary",
          candidateProductCode: "BADURL1",
          candidateSourceProductUrl:
            "https://www.viator.com/tours/City/Bad-Url/d1-BADURL1",
          fieldPath: "product.media.images[0].variants.FULL.url",
        },
      ],
    });

    expect(resolved.heroUrl).toBeNull();
    expect(resolved.heroQualityClassification).toBe("none");
    expect(resolved.rejectedForeignCandidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: "not-a-url",
          reason: "invalid-url",
        }),
      ])
    );
  });

  it("rejects candidates missing source field path provenance", () => {
    const resolved = resolveProductScopedHero({
      currentProductCode: "PATH1",
      currentSourceProductUrl: "https://www.viator.com/tours/City/With-Path/d1-PATH1",
      candidates: [
        {
          url: "https://dynamic-media.tacdn.com/media/photo-o/1a/2b/3c/pathless.jpg",
          sourceType: "api-primary",
          sourceProductCode: "PATH1",
          sourceProductUrl: "https://www.viator.com/tours/City/With-Path/d1-PATH1",
        },
      ],
    });

    expect(resolved.heroUrl).toBeNull();
    expect(resolved.rejectedForeignCandidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reason: "missing-source-field-path",
        }),
      ])
    );
  });
});
