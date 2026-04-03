import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";

import {
  extractEngine6HeroCandidatesFromProductPayload,
  resolveHero,
  resolveHeroWithCache,
} from "./heroResolver";

describe("engine6 deterministic hero pipeline", () => {
  it("extracts same-product candidates without fabricating caption variants", () => {
    const payload = {
      product: {
        productCode: "PRODA1",
        productUrl: "https://www.viator.com/tours/City/A/d1-PRODA1",
        media: {
          images: [
            {
              variants: {
                FULL: {
                  url: "https://dynamic-media.tacdn.com/media/photo-o/1a/2b/3c/4d.jpg?w=1200&h=800&s=1",
                  width: 1200,
                  height: 800,
                },
                SPLICE: {
                  url: "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/56/92/6e.jpg",
                  width: 674,
                  height: 446,
                },
              },
            },
          ],
        },
      },
    };

    const candidates = extractEngine6HeroCandidatesFromProductPayload(payload);

    expect(candidates).toHaveLength(2);
    expect(candidates.some(c => c.variantType === "CAPTION")).toBe(false);
    expect(candidates.map(c => c.candidateUrl)).toEqual(
      expect.arrayContaining([
        "https://dynamic-media.tacdn.com/media/photo-o/1a/2b/3c/4d.jpg?w=1200&h=800&s=1",
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/56/92/6e.jpg",
      ])
    );
  });

  it("normalizes trailing contamination but preserves host/path/query identity", () => {
    const payload = {
      product: {
        productCode: "CLEAN1",
        productUrl: "https://www.viator.com/tours/City/Clean/d1-CLEAN1",
        media: {
          images: [
            {
              variants: {
                FULL: {
                  url: " https://dynamic-media.tacdn.com/media/photo-o/aa/bb/cc/dd.jpg?w=1200&h=800&s=1). ",
                  width: 1200,
                  height: 800,
                },
              },
            },
          ],
        },
      },
    };

    const resolved = resolveHero(payload);
    expect(resolved.heroUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/aa/bb/cc/dd.jpg?w=1200&h=800&s=1"
    );
  });

  it("deterministically ranks good caption above splice, and fallback above bad caption", () => {
    const captionWins = resolveHero({
      product: {
        productCode: "RANK1",
        productUrl: "https://www.viator.com/tours/City/Rank/d1-RANK1",
        media: {
          images: [
            {
              variants: {
                CAPTION: {
                  url: "https://dynamic-media.tacdn.com/media/photo-o/30/39/1f/1e/caption.jpg?w=700&h=500&s=1",
                  width: 1400,
                  height: 1000,
                },
                FULL: {
                  url: "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/56/92/6e.jpg",
                  width: 674,
                  height: 446,
                },
              },
            },
          ],
        },
      },
    });

    expect(captionWins.heroQualityClassification).toBe("caption");

    const fallbackWins = resolveHero({
      product: {
        productCode: "RANK2",
        productUrl: "https://www.viator.com/tours/City/Rank/d1-RANK2",
        media: {
          images: [
            {
              variants: {
                CAPTION: {
                  url: "https://images.example.com/caption.jpg",
                },
                FULL: {
                  url: "https://dynamic-media.tacdn.com/media/photo-o/11/22/33/44.jpg?w=1200&h=800&s=1",
                  width: 1200,
                  height: 800,
                },
              },
            },
          ],
        },
      },
    });

    expect(fallbackWins.heroUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/11/22/33/44.jpg?w=1200&h=800&s=1"
    );
    expect(fallbackWins.rejectedForeignCandidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ reason: "untrusted-media-host" }),
      ])
    );
  });

  it("reuses cached resolved hero until payload hash changes", async () => {
    const tempDir = mkdtempSync(path.join(tmpdir(), "engine6-hero-cache-"));
    const cachePath = path.join(tempDir, "resolved-hero-cache.json");

    try {
      const payloadV1 = {
        product: {
          productCode: "CACHE1",
          productUrl: "https://www.viator.com/tours/City/Cache/d1-CACHE1",
          media: {
            images: [
              {
                variants: {
                  FULL: {
                    url: "https://dynamic-media.tacdn.com/media/photo-o/10/20/30/40.jpg?w=1200&h=800&s=1",
                    width: 1200,
                    height: 800,
                  },
                },
              },
            ],
          },
        },
      };

      const first = await resolveHeroWithCache({ productPayload: payloadV1, cachePath });
      expect(first.selectedFromCache).toBe(false);

      const second = await resolveHeroWithCache({ productPayload: payloadV1, cachePath });
      expect(second.selectedFromCache).toBe(true);
      expect(second.heroUrl).toBe(first.heroUrl);

      const payloadV2 = {
        product: {
          ...payloadV1.product,
          media: {
            images: [
              {
                variants: {
                  CAPTION: {
                    url: "https://dynamic-media.tacdn.com/media/photo-o/99/88/77/66/caption.jpg?w=700&h=500&s=1",
                    width: 1400,
                    height: 1000,
                  },
                },
              },
            ],
          },
        },
      };

      const third = await resolveHeroWithCache({ productPayload: payloadV2, cachePath });
      expect(third.selectedFromCache).toBe(false);
      expect(third.heroQualityClassification).toBe("caption");

      const cacheBody = JSON.parse(readFileSync(cachePath, "utf8"));
      expect(cacheBody.CACHE1.resolvedHeroUrl).toBe(third.heroUrl);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
