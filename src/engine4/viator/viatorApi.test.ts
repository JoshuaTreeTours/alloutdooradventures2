import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchViator } from "../../../api/viator/client";
import { getEngine4ViatorTourData } from "./viatorApi";

vi.mock("../../../api/viator/client", () => ({
  fetchViator: vi.fn(),
}));

const mockedFetchViator = vi.mocked(fetchViator);

describe("getEngine4ViatorTourData", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.VIATOR_API_KEY;
    delete process.env.ENGINE4_VIATOR_STRICT_API;
  });

  it("maps API text and media fields with api provenance", async () => {
    process.env.VIATOR_API_KEY = "test-key";
    mockedFetchViator.mockResolvedValue({
      product: {
        productCode: "379799P1",
        title: "Mulholland Trail Horseback Tour",
        shortDescription: "Ride through Hollywood Hills on horseback.",
        description: "Detailed API overview.",
        duration: "1 hour",
        rating: 4.9,
        reviewCount: 232,
        meetingPoint: "3204 Beachwood Dr, Los Angeles, CA 90068, USA",
        cancellationPolicy: "Non-refundable.",
        inclusions: ["Guide", "Helmet"],
        exclusions: ["Gratuities"],
        additionalInfo: ["Wear closed-toe shoes."],
        itineraryItems: [
          {
            title: "Beachwood Stables",
            description: "Meet your guide.",
            duration: "1 hour",
          },
        ],
        images: [
          {
            isCover: true,
            variants: [
              {
                url: "https://dynamic-media.tacdn.com/media/photo-o/aa/bb/cc/dd/caption.jpg?w=1100&h=800&s=1",
                width: 1100,
                height: 800,
              },
            ],
          },
        ],
      },
    });

    const tour = await getEngine4ViatorTourData("379799P1");
    expect(tour?.title).toBe("Mulholland Trail Horseback Tour");
    expect(tour?.description).toBe("Ride through Hollywood Hills on horseback.");
    expect(tour?.duration).toBe("1 hour");
    expect(tour?.reviewCount).toBe(232);
    expect(tour?.meetingPoint).toContain("Beachwood");
    expect(tour?.itinerary?.[0]?.title).toBe("Beachwood Stables");
    expect(tour?.inclusions).toEqual(["Guide", "Helmet"]);
    expect(tour?.exclusions).toEqual(["Gratuities"]);
    expect(tour?.cancellationPolicy).toBe("Non-refundable.");
    expect(tour?.additionalInfo).toEqual(["Wear closed-toe shoes."]);
    expect(tour?.primaryImageUrl).toContain("dynamic-media.tacdn.com");
    expect(tour?.galleryImages?.[0]).toBe(tour?.primaryImageUrl);
    expect(tour?.provenance).toMatchObject({
      apiFetchAttempted: true,
      apiFetchSucceeded: true,
      fallbackUsed: false,
      heroImageSource: "api",
      descriptionSource: "api.shortDescription",
    });
  });



  it("maps Yosemite/Kings Canyon product text+media from API payload", async () => {
    process.env.VIATOR_API_KEY = "test-key";
    mockedFetchViator.mockResolvedValue({
      product: {
        productCode: "132218P209",
        title: "Yosemite and Kings Canyon 2-Day Tour from LA",
        summary: "Two-day guided trip from Los Angeles.",
        duration: "2 days",
        rating: 4.7,
        reviewCount: 40,
        meetingPoint: "Los Angeles pickup points",
        itinerary: [{ title: "Yosemite Valley", description: "Scenic stops" }],
        inclusions: ["Transport", "Guide"],
        images: [
          {
            isCover: true,
            variants: [
              {
                url: "https://dynamic-media.tacdn.com/media/photo-o/11/22/33/44/caption.jpg?w=1100&h=800&s=1",
                width: 1100,
                height: 800,
              },
            ],
          },
        ],
      },
    });

    const tour = await getEngine4ViatorTourData("132218P209");
    expect(tour?.title).toBe("Yosemite and Kings Canyon 2-Day Tour from LA");
    expect(tour?.description).toBe("Two-day guided trip from Los Angeles.");
    expect(tour?.primaryImageUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/11/22/33/44/caption.jpg?w=1100&h=800&s=1"
    );
    expect(tour?.galleryImages?.[0]).toBe(tour?.primaryImageUrl);
    expect(tour?.provenance?.heroImageSource).toBe("api");
    expect(tour?.provenance?.descriptionSource).toBe("api.summary");
  });
  it("uses fallback with explicit provenance when API fails", async () => {
    process.env.VIATOR_API_KEY = "test-key";
    mockedFetchViator.mockRejectedValue(new Error("network down"));

    const tour = await getEngine4ViatorTourData("379799P1");

    expect(tour).toBeDefined();
    expect(tour?.provenance).toMatchObject({
      apiFetchAttempted: true,
      apiFetchSucceeded: false,
      fallbackUsed: true,
      heroImageSource: "fallback",
      descriptionSource: "fallback",
    });
    expect(tour?.primaryImageUrl).toContain("dynamic-media.tacdn.com");
  });

  it("throws in strict mode instead of silently falling back", async () => {
    process.env.VIATOR_API_KEY = "test-key";
    process.env.ENGINE4_VIATOR_STRICT_API = "true";
    mockedFetchViator.mockRejectedValue(new Error("timeout"));

    await expect(getEngine4ViatorTourData("379799P1")).rejects.toThrow(
      "Engine4 Viator API fetch failed"
    );
  });
});
