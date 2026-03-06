import { describe, expect, it } from "vitest";

import { resolveViatorPrimaryImage } from "./resolveViatorPrimaryImage";

describe("resolveViatorPrimaryImage", () => {
  it("prefers TACDN caption/large variants before generic URLs", () => {
    const image = resolveViatorPrimaryImage({
      images: [
        {
          url: "https://dynamic-media.tacdn.com/media/photo-o/aa/bb/cc/dd/original.jpg",
          variants: [
            {
              name: "large",
              url: "https://dynamic-media.tacdn.com/media/photo-o/2f/39/2a/61/caption.jpg?w=1100&h=800&s=1",
            },
          ],
        },
      ],
    });

    expect(image).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/2f/39/2a/61/caption.jpg?w=1100&h=800&s=1"
    );
  });

  it("falls back to first valid TACDN URL when no preferred variant exists", () => {
    const image = resolveViatorPrimaryImage({
      media: {
        images: [
          {
            url: "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/73/42/6d.jpg",
          },
        ],
      },
    });

    expect(image).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/73/42/6d.jpg"
    );
  });

  it("falls back to viator-hosted image when TACDN is unavailable", () => {
    const image = resolveViatorPrimaryImage({
      product: {
        heroImages: [
          "https://cache-graphics.viator.com/graphicslib/page-images/sample.jpg",
        ],
      },
    });

    expect(image).toBe(
      "https://cache-graphics.viator.com/graphicslib/page-images/sample.jpg"
    );
  });
});
