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

  it("maps content from exact product API and picks cover landscape hero", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        product: {
          productCode: "132218P209",
          title: "BEST Yosemite National Park and Kings Canyon National Park 2-Day Tour from LA",
          shortDescription: "Two-day guided trip from Los Angeles.",
          productUrl:
            "https://www.viator.com/tours/Los-Angeles/BEST-Yosemite-National-Park-and-Kings-Canyon-National-Park-2-Day-Tour-from-LA/d645-132218P209",
          duration: "2 days",
          startTime: "6:00 AM",
          rating: 4.7,
          reviewCount: 40,
          meetingPoint: "Los Angeles pickup points",
          cancellationPolicy: "Free cancellation up to 24 hours before start",
          inclusions: ["Transport"],
          exclusions: ["Meals"],
          additionalInfo: ["Bring ID"],
          itinerary: [
            { title: "Yosemite Valley", description: "Scenic stops" },
          ],
          images: [
            {
              isCover: true,
              variants: [
                {
                  url: "https://dynamic-media.tacdn.com/media/photo-o/cover-wide.jpg",
                  width: 1600,
                  height: 900,
                },
                {
                  url: "https://dynamic-media.tacdn.com/media/photo-o/cover-small.jpg",
                  width: 800,
                  height: 600,
                },
              ],
            },
            {
              isCover: false,
              variants: [
                {
                  url: "https://dynamic-media.tacdn.com/media/photo-o/alt.jpg",
                  width: 2000,
                  height: 1200,
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
    expect(result.bookingUrl).toContain("132218P209");
    expect(result.canonicalHeroUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/cover-wide.jpg"
    );
    expect(result.heroSelectionSource).toBe("api-images-payload");
    expect(result.heroSelectionSize).toEqual({ width: 1600, height: 900 });
    expect(result.heroSelectionDiagnostics.candidateUrls).toContain(
      "https://dynamic-media.tacdn.com/media/photo-o/cover-wide.jpg"
    );
    expect(result.provenance.descriptionSource).toBe("api");
  });

  it("rejects incomplete API payload instead of using generic fallback image", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        product: {
          productCode: "132218P209",
          title: "Yosemite and Kings Canyon 2-Day Tour from LA",
          shortDescription: "Two-day guided trip",
          productUrl: "https://www.viator.com/tours/Los-Angeles/example/d645-132218P209",
          images: [],
        },
      }),
    } as Response);

    await expect(getEngine5ViatorTourData("132218P209")).rejects.toThrow(
      "payload incomplete"
    );
  });

  it("keeps zipline progenitor hero/rating/review behavior via shared extractors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        product: {
          productCode: "421920P2",
          title: "Epic Zipline Tour Over The Santa Ynez Valley",
          shortDescription: "Guided zipline aerial adventure over Santa Ynez.",
          productUrl:
            "https://www.viator.com/tours/Santa-Barbara/Epic-Zipline-Tour-Over-The-Santa-Ynez-Valley/d4372-421920P2",
          reviews: {
            averageRating: "4.9 out of 5",
            count: "2,710",
          },
          media: {
            images: [
              {
                isCover: true,
                variants: {
                  FULL: {
                    url: "https://dynamic-media.tacdn.com/media/photo-o/zipline-full.jpg",
                    width: 1600,
                    height: 900,
                  },
                },
              },
            ],
          },
        },
      }),
    } as Response);

    const result = await getEngine5ViatorTourData("421920P2");

    expect(result.canonicalHeroUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/zipline-full.jpg"
    );
    expect(result.heroSelectionSize).toEqual({ width: 1600, height: 900 });
    expect(result.rating).toBe(4.9);
    expect(result.reviewCount).toBe(2710);
  });

});
