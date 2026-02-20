import { afterEach, describe, expect, it, vi } from "vitest";
import {
  extractLandmarkNameFromTitle,
  getLandmarkImage,
} from "./getLandmarkImage";

afterEach(() => {
  vi.unstubAllGlobals();
});

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

    const image = await getLandmarkImage(
      `Low Confidence Landmark ${Date.now()}`,
      "Nowhere"
    );
    expect(image).toBeNull();
  });

  it("falls back to wikipedia summary image when commons confidence is low", async () => {
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
                    title: "File:Random_Landscape.jpg",
                    imageinfo: [{ url: "https://example.com/bad.jpg" }],
                    categories: [{ title: "Category:Landscape photographs" }],
                  },
                },
              },
            }),
          } as Response;
        }

        if (url.includes("en.wikipedia.org/w/api.php")) {
          return {
            ok: true,
            json: async () => ({
              query: {
                search: [{ title: "French Quarter" }],
              },
            }),
          } as Response;
        }

        if (url.includes("/page/summary/")) {
          return {
            ok: true,
            json: async () => ({
              title: "French Quarter",
              description: "Historic district in New Orleans Test City",
              thumbnail: {
                source: "https://upload.wikimedia.org/french-quarter.jpg",
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

    const image = await getLandmarkImage(
      "French Quarter",
      "New Orleans Test City"
    );

    expect(image).toContain("upload.wikimedia.org");
  });
});
