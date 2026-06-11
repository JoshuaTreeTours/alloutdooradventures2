import { describe, expect, it } from "vitest";

import { selectSecondaryImage } from "./selectSecondaryImage";

describe("selectSecondaryImage", () => {
  it("returns the first non-primary gallery URL", () => {
    expect(
      selectSecondaryImage({
        primaryImageUrl: "https://cdn.example.com/hero.jpg",
        images: [
          "https://cdn.example.com/hero.jpg",
          "https://cdn.example.com/second.jpg",
        ],
        fallbackImageUrl: "https://cdn.example.com/fallback.jpg",
      })
    ).toBe("https://cdn.example.com/second.jpg");
  });

  it("dedupes gallery URLs ignoring query params and picks the next unique URL", () => {
    expect(
      selectSecondaryImage({
        primaryImageUrl: "https://cdn.example.com/hero.jpg?width=800",
        images: [
          "https://cdn.example.com/hero.jpg?width=1200",
          "https://cdn.example.com/hero.jpg?width=640",
          "https://cdn.example.com/next.jpg?fit=crop",
        ],
        fallbackImageUrl: "https://cdn.example.com/fallback.jpg",
      })
    ).toBe("https://cdn.example.com/next.jpg?fit=crop");
  });

  it("returns null when only the primary image exists", () => {
    expect(
      selectSecondaryImage({
        primaryImageUrl: "https://cdn.example.com/hero.jpg",
        images: ["https://cdn.example.com/hero.jpg"],
        fallbackImageUrl: "https://cdn.example.com/fallback.jpg",
      })
    ).toBeNull();
  });

  it("returns null for empty galleries", () => {
    expect(
      selectSecondaryImage({
        primaryImageUrl: "https://cdn.example.com/hero.jpg",
        images: [],
        fallbackImageUrl: "https://cdn.example.com/fallback.jpg",
      })
    ).toBeNull();
  });

  it("returns the first gallery image when primary is missing", () => {
    expect(
      selectSecondaryImage({
        images: [
          "https://cdn.example.com/first.jpg",
          "https://cdn.example.com/second.jpg",
        ],
        fallbackImageUrl: "https://cdn.example.com/fallback.jpg",
      })
    ).toBe("https://cdn.example.com/first.jpg");
  });
});
