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

    await expect(getEngine5ViatorTourData("11069P1")).rejects.toThrow(
      "Engine5 Viator API unavailable"
    );
  });

  it("maps content from exact product API and picks cover landscape hero", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        product: {
          productCode: "11069P1",
          title: "Private Tour: Hawaii Volcanoes National Park Eco Tour",
          shortDescription:
            "Explore Volcanoes National Park with a naturalist guide.",
          productUrl:
            "https://www.viator.com/tours/Big-Island-of-Hawaii/Private-Tour-Hawaii-Volcanoes-National-Park-Eco-Tour/d669-11069P1",
          duration: "10 hours",
          startTime: "7:00 AM",
          rating: 5,
          reviewCount: 44,
          meetingPoint: "Hilo hotel pickup",
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

    const result = await getEngine5ViatorTourData("11069P1");
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/engine5/viator-product?productCode=11069P1"
    );
    expect(result.title).toContain("Hawaii Volcanoes");
    expect(result.bookingUrl).toContain("11069P1");
    expect(result.canonicalHeroUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/cover-wide.jpg"
    );
    expect(result.heroSelectionSource).toBe("api-images-payload");
    expect(result.heroSelectionSize).toEqual({ width: 1600, height: 900 });
    expect(result.heroSelectionDiagnostics.candidateUrls).toContain(
      "https://dynamic-media.tacdn.com/media/photo-o/cover-wide.jpg"
    );
    expect(result.heroSelectionDiagnostics.overrideUsed).toBe(false);
    expect(result.provenance.descriptionSource).toBe("api");
  });

  it("rejects incomplete API payload instead of using generic fallback image", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        product: {
          productCode: "11069P1",
          title: "Private Tour: Hawaii Volcanoes National Park Eco Tour",
          shortDescription: "Volcanoes eco tour",
          productUrl:
            "https://www.viator.com/tours/Big-Island-of-Hawaii/example/d669-11069P1",
          images: [],
        },
      }),
    } as Response);

    await expect(getEngine5ViatorTourData("11069P1")).rejects.toThrow(
      "payload incomplete"
    );
  });
});
