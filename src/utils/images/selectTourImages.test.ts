import { describe, expect, it } from "vitest";

import { selectTourImages } from "./selectTourImages";

describe("selectTourImages", () => {
  it("uses fallback hero when no derived images are available", () => {
    expect(
      selectTourImages({
        derivedImages: [],
        fallbackHeroUrl: "https://cdn.filestackcontent.com/FALLBACKHANDLE000",
      })
    ).toEqual({
      heroImage: "https://cdn.filestackcontent.com/FALLBACKHANDLE000",
      galleryImages: [],
      allImagesForSchema: [
        "https://cdn.filestackcontent.com/FALLBACKHANDLE000",
      ],
    });
  });

  it("selects the first derived image as hero when one exists", () => {
    const selected = selectTourImages({
      derivedImages: ["https://cdn.filestackcontent.com/HEROIMAGEHANDLE01"],
      fallbackHeroUrl: "https://cdn.filestackcontent.com/FALLBACKHANDLE000",
    });

    expect(selected.heroImage).toBe(
      "https://cdn.filestackcontent.com/HEROIMAGEHANDLE01"
    );
    expect(selected.galleryImages).toEqual([]);
  });

  it("caps gallery at two images", () => {
    const selected = selectTourImages({
      derivedImages: [
        "https://cdn.filestackcontent.com/IMGHANDLE00000001",
        "https://cdn.filestackcontent.com/IMGHANDLE00000002",
        "https://cdn.filestackcontent.com/IMGHANDLE00000003",
        "https://cdn.filestackcontent.com/IMGHANDLE00000004",
        "https://cdn.filestackcontent.com/IMGHANDLE00000005",
      ],
      fallbackHeroUrl: "https://cdn.filestackcontent.com/FALLBACKHANDLE000",
    });

    expect(selected.heroImage).toBe(
      "https://cdn.filestackcontent.com/IMGHANDLE00000001"
    );
    expect(selected.galleryImages).toEqual([
      "https://cdn.filestackcontent.com/IMGHANDLE00000002",
      "https://cdn.filestackcontent.com/IMGHANDLE00000003",
    ]);
    expect(selected.allImagesForSchema).toHaveLength(3);
  });

  it("filters invalid/duplicate/whitespace URLs and drops bare resize token URLs", () => {
    const selected = selectTourImages({
      derivedImages: [
        "  https://cdn.filestackcontent.com/IMGHANDLE00000001  ",
        "https://cdn.filestackcontent.com/resize",
        "https://cdn.filestackcontent.com/IMGHANDLE00000001",
        "",
        "ftp://cdn.filestackcontent.com/IMGHANDLE00000002",
        "https://cdn.filestackcontent.com/IMGHANDLE00000002",
      ],
      fallbackHeroUrl: "https://cdn.filestackcontent.com/FALLBACKHANDLE000",
    });

    expect(selected).toEqual({
      heroImage: "https://cdn.filestackcontent.com/IMGHANDLE00000001",
      galleryImages: ["https://cdn.filestackcontent.com/IMGHANDLE00000002"],
      allImagesForSchema: [
        "https://cdn.filestackcontent.com/IMGHANDLE00000001",
        "https://cdn.filestackcontent.com/IMGHANDLE00000002",
      ],
    });
  });
});
