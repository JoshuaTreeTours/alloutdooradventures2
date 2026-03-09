import { afterEach, describe, expect, it, vi } from "vitest";

import { getEngine5ViatorTourData } from "./getEngine5ViatorTourData";

describe("getEngine5ViatorTourData", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fails loudly when server API endpoint fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "VIATOR_API_KEY is not configured",
    } as Response);

    await expect(getEngine5ViatorTourData("132218P209")).rejects.toThrow(
      "Engine5 Viator API unavailable"
    );
  });

  it("maps text and media strictly from API payload", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        product: {
          productCode: "132218P209",
          title: "Yosemite and Kings Canyon 2-Day Tour from LA",
          shortDescription: "Two-day guided trip from Los Angeles.",
          productUrl:
            "https://www.viator.com/tours/Los-Angeles/example/d645-132218P209",
          duration: "2 days",
          rating: 4.7,
          reviewCount: 40,
          meetingPoint: "Los Angeles pickup points",
          inclusions: ["Transport"],
          exclusions: ["Meals"],
          additionalInfo: ["Bring ID"],
          itinerary: [
            { title: "Yosemite Valley", description: "Scenic stops" },
          ],
          images: [
            {
              variants: [
                {
                  url: "https://dynamic-media.tacdn.com/media/photo-o/11/22/caption.jpg",
                },
              ],
            },
          ],
        },
      }),
    } as Response);

    const result = await getEngine5ViatorTourData("132218P209");
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/engine5/viator-product?productCode=132218P209"
    );
    expect(result.title).toContain("Yosemite");
    expect(result.description).toContain("Two-day");
    expect(result.primaryImageUrl).toContain("dynamic-media.tacdn.com");
    expect(result.galleryImages[0]).toBe(result.primaryImageUrl);
    expect(result.provenance.heroImageSource).toBe("api");
    expect(result.provenance.descriptionSource).toBe("api");
  });

  it("rejects incomplete API payload instead of fake success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        product: {
          productCode: "132218P209",
          title: "Yosemite and Kings Canyon 2-Day Tour from LA",
        },
      }),
    } as Response);

    await expect(getEngine5ViatorTourData("132218P209")).rejects.toThrow(
      "payload incomplete"
    );
  });
});
