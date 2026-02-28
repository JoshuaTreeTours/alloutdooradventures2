import { describe, expect, it } from "vitest";

import { isAllowedImageUrl, normalizeImageUrl } from "./isAllowedImageUrl";

describe("isAllowedImageUrl", () => {
  it("allows webp and gif image URLs", () => {
    expect(
      isAllowedImageUrl("https://cache.vtrcdn.com/orion/images/tours/hero.webp")
    ).toBe(true);
    expect(isAllowedImageUrl("https://cdn.example.com/tour/hero.gif")).toBe(
      true
    );
  });

  it("normalizes protocol-relative URLs", () => {
    expect(normalizeImageUrl("//cache.vtrcdn.com/path/to/image.webp")).toBe(
      "https://cache.vtrcdn.com/path/to/image.webp"
    );
  });
});
