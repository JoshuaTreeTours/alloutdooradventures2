import { describe, expect, it } from "vitest";

import { getSecondGalleryImageUrl } from "./getSecondGalleryImageUrl";

describe("getSecondGalleryImageUrl", () => {
  it("returns first unique https image that differs from hero", () => {
    expect(
      getSecondGalleryImageUrl(
        {
          imageUrls: [
            "https://cdn.filestackcontent.com/hero",
            "https://cdn.filestackcontent.com/second",
          ],
        },
        "https://cdn.filestackcontent.com/hero"
      )
    ).toBe("https://cdn.filestackcontent.com/second");
  });

  it("returns null when all gallery images match hero or are invalid", () => {
    expect(
      getSecondGalleryImageUrl(
        {
          imageUrls: [
            "https://cdn.filestackcontent.com/hero",
            "http://cdn.filestackcontent.com/other",
          ],
        },
        "https://cdn.filestackcontent.com/hero"
      )
    ).toBeNull();
  });
});
