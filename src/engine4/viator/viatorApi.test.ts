import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../api/viator/client", () => ({
  fetchViator: vi.fn(),
}));

import { fetchViator } from "../../../api/viator/client";
import { getEngine4ViatorTourData } from "./viatorApi";

const mockedFetchViator = vi.mocked(fetchViator);

describe("getEngine4ViatorTourData", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.VIATOR_API_KEY = "test-key";
  });

  it("uses Viator API as primary source for product 91873P1", async () => {
    mockedFetchViator.mockResolvedValue({
      product: {
        productCode: "91873P1",
        title:
          "4-Hour Private Guided Rock Climbing Trip in Joshua Tree National Park",
        productUrl:
          "https://www.viator.com/tours/Palm-Springs/4-Hour-Private-Guided-Rock-Climbing-Trip-in-Joshua-Tree-National-Park/d648-91873P1",
        priceFrom: "239.00",
        currencyCode: "USD",
        rating: 4.8,
        reviewCount: 33,
        duration: "4 hours",
        startTime: "8:30 AM",
        meetingPoint: "Joshua Tree National Park, California, USA",
        cancellationPolicy: "Free cancellation up to 24 hours in advance.",
        inclusions: ["Professional guide", "Climbing equipment"],
        exclusions: ["Gratuities"],
        additionalInfo: ["Wear closed-toe shoes"],
        images: [
          {
            variants: [
              {
                url: "https://dynamic-media.tacdn.com/media/photo-o/11/99/80/55/api-jt-climb.jpg?w=1100&h=800&s=1",
                width: 1100,
                height: 800,
              },
            ],
          },
        ],
      },
    } as never);

    const tour = await getEngine4ViatorTourData("91873P1");

    expect(mockedFetchViator).toHaveBeenCalledWith(
      "test-key",
      "/products/91873P1",
      { method: "GET" }
    );

    expect(tour?.productCode).toBe("91873P1");
    expect(tour?.fromPrice).toBe("239.00");
    expect(tour?.rating).toBe(4.8);
    expect(tour?.reviewCount).toBe(33);
    expect(tour?.duration).toBe("4 hours");
    expect(tour?.meetingPoint).toBe("Joshua Tree National Park, California, USA");
    expect(tour?.primaryImageUrl).toContain("api-jt-climb.jpg");
    expect(tour?.inclusions).toEqual(["Professional guide", "Climbing equipment"]);
    expect(tour?.exclusions).toEqual(["Gratuities"]);
  });

  it("retains API values when fallback has different stale values", async () => {
    mockedFetchViator.mockResolvedValue({
      product: {
        productCode: "91873P1",
        title:
          "4-Hour Private Guided Rock Climbing Trip in Joshua Tree National Park",
        productUrl:
          "https://www.viator.com/tours/Palm-Springs/4-Hour-Private-Guided-Rock-Climbing-Trip-in-Joshua-Tree-National-Park/d648-91873P1",
        fromPrice: "255.00",
        currencyCode: "USD",
        rating: 4.7,
        reviewCount: 35,
      },
    } as never);

    const tour = await getEngine4ViatorTourData("91873P1");

    expect(tour?.fromPrice).toBe("255.00");
    expect(tour?.rating).toBe(4.7);
    expect(tour?.reviewCount).toBe(35);
  });
});
