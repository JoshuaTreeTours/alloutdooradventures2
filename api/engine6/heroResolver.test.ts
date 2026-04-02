import { describe, expect, it } from "vitest";

import { resolveProductScopedHero } from "./heroResolver";

const currentProductCode = "P100";
const currentSourceProductUrl = "https://www.viator.com/tours/City/Tour/d1-P100";

describe("engine6 hero resolver constitution", () => {
  it("accepts same-product dynamic-media.tacdn.com caption variant", () => {
    const resolved = resolveProductScopedHero({
      currentProductCode: "3587ISLQUESS",
      currentSourceProductUrl:
        "https://www.viator.com/tours/Miami/Millionaires-Row-Cruise/d662-3587ISLQUESS?pid=P00290915&mcid=42383&medium=link",
      candidates: [
        {
          url: "https://dynamic-media.tacdn.com/media/photo-o/2f/d8/33/d9/caption.jpg?w=700&h=500&s=1",
          sourceType: "api-primary",
          sourceProductCode: "3587ISLQUESS",
          sourceProductUrl:
            "https://www.viator.com/tours/Miami/Millionaires-Row-Cruise/d662-3587ISLQUESS?pid=P00290915&mcid=42383&medium=link",
          sourceFieldPath: "product.media.images[0].variants.CAPTION.url",
          isLive: true,
        },
      ],
    });

    expect(resolved.heroUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/2f/d8/33/d9/caption.jpg?w=700&h=500&s=1"
    );
    expect(resolved.heroQualityClassification).toBe("caption");
  });

  it("same-product live caption beats same-product live full", () => {
    const resolved = resolveProductScopedHero({
      currentProductCode,
      currentSourceProductUrl,
      candidates: [
        {
          url: "https://dynamic-media.tacdn.com/media/photo-o/a/b/c/full.jpg",
          sourceType: "api-primary",
          sourceProductCode: currentProductCode,
          sourceProductUrl: currentSourceProductUrl,
          sourceFieldPath: "product.media.images[0].variants.FULL.url",
          isLive: true,
        },
        {
          url: "https://dynamic-media.tacdn.com/media/photo-o/a/b/c/caption.jpg",
          sourceType: "api-gallery",
          sourceProductCode: currentProductCode,
          sourceProductUrl: currentSourceProductUrl,
          sourceFieldPath: "product.media.images[0].variants.CAPTION.url",
          isLive: true,
        },
      ],
    });

    expect(resolved.heroQualityClassification).toBe("caption");
    expect(resolved.heroUrl).toContain("/caption.jpg");
  });

  it("same-product live full beats same-product live splice", () => {
    const resolved = resolveProductScopedHero({
      currentProductCode,
      currentSourceProductUrl,
      candidates: [
        {
          url: "https://media.tacdn.com/media/attractions-splice-spp-720x480/aa/bb/cc/dd.jpg",
          sourceType: "api-primary",
          sourceProductCode: currentProductCode,
          sourceProductUrl: currentSourceProductUrl,
          sourceFieldPath: "product.media.images[0].variants.FULL.url",
          isLive: true,
        },
        {
          url: "https://dynamic-media.tacdn.com/media/photo-o/aa/bb/cc/full.jpg",
          sourceType: "api-gallery",
          sourceProductCode: currentProductCode,
          sourceProductUrl: currentSourceProductUrl,
          sourceFieldPath: "product.media.images[1].variants.FULL.url",
          isLive: true,
        },
      ],
    });

    expect(resolved.heroQualityClassification).toBe("product-media");
    expect(resolved.heroUrl).toContain("/photo-o/");
  });

  it("foreign caption cannot override same-product candidate", () => {
    const resolved = resolveProductScopedHero({
      currentProductCode,
      currentSourceProductUrl,
      candidates: [
        {
          url: "https://dynamic-media.tacdn.com/media/photo-o/ff/ee/dd/caption.jpg",
          sourceType: "api-gallery",
          sourceProductCode: "P999",
          sourceProductUrl: "https://www.viator.com/tours/Elsewhere/Else/d1-P999",
          sourceFieldPath: "product.media.images[0].variants.CAPTION.url",
          isLive: true,
        },
        {
          url: "https://dynamic-media.tacdn.com/media/photo-o/aa/bb/cc/full.jpg",
          sourceType: "api-primary",
          sourceProductCode: currentProductCode,
          sourceProductUrl: currentSourceProductUrl,
          sourceFieldPath: "product.media.images[1].variants.FULL.url",
          isLive: true,
        },
      ],
    });

    expect(resolved.heroUrl).toContain("/aa/bb/cc/full.jpg");
    expect(resolved.rejectedForeignCandidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ reason: "foreign-product-code" }),
      ])
    );
  });

  it("rejects dead same-product images and fails when no live candidates remain", () => {
    const resolved = resolveProductScopedHero({
      currentProductCode,
      currentSourceProductUrl,
      candidates: [
        {
          url: "https://dynamic-media.tacdn.com/media/photo-o/aa/bb/cc/dead.jpg",
          sourceType: "api-primary",
          sourceProductCode: currentProductCode,
          sourceProductUrl: currentSourceProductUrl,
          sourceFieldPath: "product.media.images[0].variants.FULL.url",
          isLive: false,
        },
      ],
    });

    expect(resolved.heroUrl).toBeNull();
    expect(resolved.fallbackTriggered).toBe(true);
    expect(resolved.rejectedForeignCandidates).toEqual(
      expect.arrayContaining([expect.objectContaining({ reason: "not-live" })])
    );
  });
});
