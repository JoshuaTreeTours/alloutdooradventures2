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

    await expect(getEngine5ViatorTourData("163873P16")).rejects.toThrow(
      "Engine5 Viator API unavailable"
    );
  });

  it("maps content from exact product API and returns source trace", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        product: {
          productCode: "163873P16",
          title: "East Zion Top of the World Jeep Tour",
          shortDescription: "Guided East Zion backcountry jeep tour.",
          productUrl:
            "https://www.viator.com/tours/Utah/East-Zion-Top-of-the-World-Jeep-Tour/d785-163873P16",
          rating: 4.7,
          reviewCount: 40,
          meetingPoint: "500 E State St, Orderville, UT, USA",
          bookingOptions: [
            { price: { amount: 0 } },
            { price: { amount: 159 } },
          ],
          media: {
            images: [
              {
                isCover: true,
                variants: {
                  FULL: {
                    url: "https://dynamic-media.tacdn.com/media/photo-o/cover-wide.jpg",
                    width: 1600,
                    height: 900,
                  },
                },
              },
            ],
          },
        },
        diagnostics: {
          hasViatorApiKey: true,
          attemptedLiveFetch: true,
          upstreamStatus: 200,
          upstreamOk: true,
        },
      }),
    } as Response);

    const result = await getEngine5ViatorTourData("163873P16");
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/engine5/viator-product?productCode=163873P16"
    );
    expect(result.title).toContain("East Zion");
    expect(result.bookingUrl).toContain("163873P16");
    expect(result.canonicalHeroUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/cover-wide.jpg"
    );
    expect(result.fromPrice).toBe("159");
    expect(result.meetingPoint).toContain("Orderville");
    expect(result.sourceTrace).toEqual(
      expect.objectContaining({
        titleFieldPath: "product.title",
        heroImageFieldPath: "product.media.images[0].variants.FULL.url",
        priceFieldPath: "product.bookingOptions[1].price.amount",
        ratingFieldPath: "product.rating",
        reviewCountFieldPath: "product.reviewCount",
        meetingPointFieldPath: "product.meetingPoint",
        routeOwnershipFieldPath: "src/engine5/viator/record.ts#destination",
      })
    );
    expect(result.sourceTrace?.runtimeDiagnostics).toEqual(
      expect.objectContaining({
        hasViatorApiKey: true,
        attemptedLiveFetch: true,
        upstreamStatus: 200,
        upstreamOk: true,
        commercialPriceFieldPath: "product.bookingOptions[1].price.amount",
      })
    );
  });

  it("rejects incomplete API payload instead of using generic fallback image", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        product: {
          productCode: "163873P16",
          title: "East Zion Top of the World Jeep Tour",
          shortDescription: "Guided East Zion backcountry jeep tour.",
          productUrl:
            "https://www.viator.com/tours/Utah/East-Zion-Top-of-the-World-Jeep-Tour/d785-163873P16",
          images: [],
        },
      }),
    } as Response);

    await expect(getEngine5ViatorTourData("163873P16")).rejects.toThrow(
      "payload incomplete"
    );
  });
});
