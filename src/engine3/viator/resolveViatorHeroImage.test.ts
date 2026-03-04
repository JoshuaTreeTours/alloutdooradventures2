import { describe, expect, it } from "vitest";

import { resolveViatorHeroImage } from "./resolveViatorHeroImage";

describe("resolveViatorHeroImage", () => {
  it("allows dynamic-media caption image URLs and normalizes query params", () => {
    const hero = resolveViatorHeroImage({
      imageGallery: [
        "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
      ],
    });

    expect(hero).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg"
    );
  });

  it("uses first valid gallery image when primary is missing", () => {
    const hero = resolveViatorHeroImage({
      imageGallery: [
        "https://example.com/image.jpg",
        "https://media.tacdn.com/media/photo-o/22/11/10/0f/caption.jpg?abc=1",
      ],
    });

    expect(hero).toBe(
      "https://media.tacdn.com/media/photo-o/22/11/10/0f/caption.jpg"
    );
  });

  it("returns null when viator sources are missing or invalid", () => {
    const hero = resolveViatorHeroImage({
      primaryImageUrl: "https://example.com/nope.jpg",
      imageGallery: ["not-a-url"],
    });

    expect(hero).toBeNull();
  });

  it("keeps per-tour override isolated", () => {
    const jtree = resolveViatorHeroImage({
      productCode: "6740JTREE",
      imageGallery: [
        "https://media.tacdn.com/media/photo-o/22/11/10/0f/caption.jpg?abc=1",
      ],
    });
    const sanAndreas = resolveViatorHeroImage({
      productCode: "2335P1",
      imageGallery: [
        "https://media.tacdn.com/media/photo-o/22/11/10/0f/caption.jpg?abc=1",
      ],
    });

    expect(jtree).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg"
    );
    expect(sanAndreas).toBe(
      "https://media.tacdn.com/media/photo-o/22/11/10/0f/caption.jpg"
    );
  });
});
