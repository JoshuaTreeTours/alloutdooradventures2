import { describe, expect, it, vi } from "vitest";
import {
  extractLandmarkNameFromTitle,
  getLandmarkImage,
} from "./getLandmarkImage";

describe("extractLandmarkNameFromTitle", () => {
  it("strips common action prefixes", () => {
    expect(extractLandmarkNameFromTitle("Explore French Quarter")).toBe(
      "French Quarter"
    );
    expect(
      extractLandmarkNameFromTitle("Visit Jackson Square in New Orleans")
    ).toBe("Jackson Square");
  });
});

describe("getLandmarkImage", () => {
  it("returns null for low-confidence generic commons matches", async () => {
    const key = `Low Confidence Landmark ${Date.now()}`;

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("commons.wikimedia.org")) {
          return {
            ok: true,
            json: async () => ({
              query: {
                pages: {
                  1: {
                    title: "File:IMG_1234.jpg",
                    imageinfo: [{ url: "https://example.com/generic.jpg" }],
                    categories: [{ title: "Category:Landscape photographs" }],
                  },
                },
              },
            }),
          } as Response;
        }

        return {
          ok: false,
          json: async () => ({}),
        } as Response;
      })
    );

    const image = await getLandmarkImage(key, "Nowhere");
    expect(image).toBeNull();
  });
});
