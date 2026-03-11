import { describe, expect, it } from "vitest";

import { resolveEngine3ViatorHero } from "./resolveEngine3ViatorHero";

describe("resolveEngine3ViatorHero", () => {
  it("keeps explicit override precedence when render-safe", () => {
    const hero = resolveEngine3ViatorHero({
      bookingProvider: "viator",
      tourId: "abc123",
      heroImageOverrideUrl:
        "https://dynamic-media.tacdn.com/media/photo-o/31/bd/72/79/caption.jpg",
      primaryImageUrl:
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/34/56/78.jpg",
    });

    expect(hero).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/31/bd/72/79/caption.jpg"
    );
  });

  it("rejects malformed or tracker-style candidates", () => {
    expect(
      resolveEngine3ViatorHero({
        bookingProvider: "viator",
        tourId: "bad-1",
        heroImageOverrideUrl: "not-a-url",
        primaryImageUrl: "https://media.tacdn.com/tracker/pixel.jpg?w=1&h=1",
      })
    ).toBeUndefined();
  });
});
