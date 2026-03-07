import { describe, expect, it } from "vitest";

import {
  resolveViatorPrimaryImage,
  resolveViatorPrimaryImageWithProvenance,
} from "./resolveViatorPrimaryImage";

describe("resolveViatorPrimaryImage", () => {
  it("uses API image variants first", () => {
    const image = resolveViatorPrimaryImage({
      images: [
        {
          variants: {
            large: {
              url: "https://dynamic-media.tacdn.com/media/photo-o/2f/39/2a/61/caption.jpg?w=1100&h=800&s=1",
            },
          },
          url: "https://dynamic-media.tacdn.com/media/photo-o/xx/yy/zz/11/fallback.jpg",
        },
      ],
      sourceHtml:
        '<img src="https://dynamic-media.tacdn.com/media/photo-o/ab/cd/ef/01/source.jpg">',
      fallbackImage:
        "https://dynamic-media.tacdn.com/media/photo-o/f0/00/00/01/fallback.jpg",
    });

    expect(image).toContain("2f/39/2a/61/caption.jpg");
  });

  it("extracts TACDN URL from source HTML when API image is missing", () => {
    const image = resolveViatorPrimaryImage({
      images: [],
      sourceHtml:
        '<script>window.__STATE__={"hero":"https://dynamic-media.tacdn.com/media/photo-o/31/2b/44/8a/caption.jpg?w=1100&h=800&s=1"}</script>',
    });

    expect(image).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/31/2b/44/8a/caption.jpg?w=1100&h=800&s=1"
    );
  });

  it("uses approved fallback image only when API and TACDN source are unavailable", () => {
    const result = resolveViatorPrimaryImageWithProvenance({
      images: [{ variants: { large: { url: "   " } } }],
      sourceHtml: "<html><body>No tacdn image here</body></html>",
      fallbackImage:
        "https://dynamic-media.tacdn.com/media/photo-o/11/99/80/3f/private-guided-rock.jpg?w=1100&h=800&s=1",
    });

    expect(result.primaryImage).toContain(
      "11/99/80/3f/private-guided-rock.jpg"
    );
    expect(result.fallbackUsed).toBe(true);
    expect(result.apiImageFound).toBe(false);
    expect(result.tacdnFound).toBe(false);
  });

  it("blocks fallback when valid API media exists", () => {
    const result = resolveViatorPrimaryImageWithProvenance({
      images: [
        {
          variants: {
            large: {
              url: "https://dynamic-media.tacdn.com/media/photo-o/aa/bb/cc/dd/api.jpg?w=1100&h=800&s=1",
            },
          },
        },
      ],
      fallbackImage:
        "https://dynamic-media.tacdn.com/media/photo-o/ff/ff/ff/ff/fallback.jpg?w=1100&h=800&s=1",
    });

    expect(result.primaryImage).toContain("aa/bb/cc/dd/api.jpg");
    expect(result.fallbackUsed).toBe(false);
    expect(result.apiImageFound).toBe(true);
  });
});
