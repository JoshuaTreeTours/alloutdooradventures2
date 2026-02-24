import { describe, expect, it } from "vitest";

import {
  extractFareHarborGalleryImages,
  selectSecondaryImage,
} from "./extractFareHarborImages";

describe("extractFareHarborGalleryImages", () => {
  it("keeps https urls in input order and dedupes", () => {
    const urls = extractFareHarborGalleryImages({
      imageUrls: [
        "https://cdn.filestackcontent.com/hero",
        "https://cdn.filestackcontent.com/hero",
      ],
      images: [{ url: "https://cdn.filestackcontent.com/second" }],
      gallery: [{ src: "http://cdn.filestackcontent.com/insecure" }],
    });

    expect(urls).toEqual([
      "https://cdn.filestackcontent.com/hero",
      "https://cdn.filestackcontent.com/second",
    ]);
  });
});

describe("selectSecondaryImage", () => {
  it("returns first non-hero image", () => {
    expect(
      selectSecondaryImage("https://cdn.filestackcontent.com/hero", [
        "https://cdn.filestackcontent.com/hero",
        "https://cdn.filestackcontent.com/second",
      ])
    ).toBe("https://cdn.filestackcontent.com/second");
  });

  it("returns null when only hero is present", () => {
    expect(
      selectSecondaryImage("https://cdn.filestackcontent.com/hero", [
        "https://cdn.filestackcontent.com/hero",
      ])
    ).toBeNull();
  });
});
