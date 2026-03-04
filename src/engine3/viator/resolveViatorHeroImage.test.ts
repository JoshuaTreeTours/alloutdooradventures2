import { describe, expect, it } from "vitest";

import {
  isApprovedViatorDynamicCaptionUrl,
  isApprovedViatorStableImageUrl,
  resolveViatorHeroImage,
} from "./resolveViatorHeroImage";

describe("resolveViatorHeroImage validators", () => {
  it("approves stable Viator media URLs and rejects dynamic-media in stable validator", () => {
    expect(
      isApprovedViatorStableImageUrl(
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/38/e2/6e.jpg"
      )
    ).toBe(true);
    expect(
      isApprovedViatorStableImageUrl(
        "https://media.tacdn.com/media/photo-w/11/22/33/44/not-caption.jpg"
      )
    ).toBe(true);
    expect(
      isApprovedViatorStableImageUrl(
        "https://media.tacdn.com/media/photo-o/11/22/33/44/caption.jpg"
      )
    ).toBe(false);
    expect(
      isApprovedViatorStableImageUrl(
        "https://dynamic-media.tacdn.com/media/photo-o/2f/38/8e/aa/caption.jpg?w=1100&h=800&s=1"
      )
    ).toBe(false);
  });

  it("approves only dynamic-media photo-o caption URLs in dynamic validator", () => {
    expect(
      isApprovedViatorDynamicCaptionUrl(
        "https://dynamic-media.tacdn.com/media/photo-o/2f/38/8e/aa/caption.jpg?w=1100&h=800&s=1"
      )
    ).toBe(true);
    expect(
      isApprovedViatorDynamicCaptionUrl(
        "https://dynamic-media.tacdn.com/media/photo-o/2f/38/8e/aa/other.jpg?w=1100"
      )
    ).toBe(false);
    expect(
      isApprovedViatorDynamicCaptionUrl(
        "https://media.tacdn.com/media/photo-o/2f/38/8e/aa/caption.jpg?w=1100"
      )
    ).toBe(false);
  });
});

describe("resolveViatorHeroImage", () => {
  it("prefers stable gallery images before dynamic caption images", () => {
    const hero = resolveViatorHeroImage({
      imageGallery: [
        "https://dynamic-media.tacdn.com/media/photo-o/2f/38/8e/aa/caption.jpg?w=1100&h=800&s=1",
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/38/e2/6e.jpg",
      ],
    });

    expect(hero).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/38/e2/6e.jpg"
    );
  });

  it("uses dynamic caption as last resort when it is the only viable Viator image (3351P15)", () => {
    const hero = resolveViatorHeroImage({
      productCode: "3351P15",
      primaryImageUrl: "",
      imageGallery: [
        "https://dynamic-media.tacdn.com/media/photo-o/2f/38/8e/aa/caption.jpg?w=1100&h=800&s=1",
      ],
    });

    expect(hero).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/8e/aa/caption.jpg?w=1100&h=800&s=1"
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
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/38/e2/6e.jpg",
      ],
    });
    const sanAndreas = resolveViatorHeroImage({
      productCode: "2335P1",
      imageGallery: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/38/e2/6e.jpg",
      ],
    });

    expect(jtree).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1"
    );
    expect(sanAndreas).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/38/e2/6e.jpg"
    );
  });
});
