import { describe, expect, it } from "vitest";

import { extractGalleryImagesFromItemJson } from "./extractGalleryImagesFromItemJson";

describe("extractGalleryImagesFromItemJson", () => {
  it("keeps https urls in order and dedupes", () => {
    const images = extractGalleryImagesFromItemJson({
      images: [
        { large: "http://cdn.example.com/a.jpg" },
        { full: "https://cdn.example.com/b.jpg" },
        { url: "https://cdn.example.com/b.jpg" },
        { thumb: "" },
      ],
    });

    expect(images).toEqual([
      "https://cdn.example.com/a.jpg",
      "https://cdn.example.com/b.jpg",
    ]);
  });

  it("falls back to gallery when images is absent", () => {
    const images = extractGalleryImagesFromItemJson({
      gallery: [{ secure_url: "https://cdn.example.com/c.jpg" }],
    });

    expect(images).toEqual(["https://cdn.example.com/c.jpg"]);
  });
});
