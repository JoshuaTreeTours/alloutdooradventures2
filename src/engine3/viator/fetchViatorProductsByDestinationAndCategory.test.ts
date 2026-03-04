import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchViatorProductsByDestinationAndCategory } from "./fetchViatorProductsByDestinationAndCategory";

describe("fetchViatorProductsByDestinationAndCategory", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("filters and sorts products by rating/reviews and canonical URL", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        products: [
          {
            productCode: "GOOD2",
            productUrl:
              "https://www.viator.com/tours/Santa-Barbara/Wine/d4372-GOOD2",
            rating: { combinedAverageRating: 4.9 },
            reviews: { totalReviews: 500 },
          },
          {
            productCode: "LOWREVIEWS",
            productUrl:
              "https://www.viator.com/tours/Santa-Barbara/Wine/d4372-LOWREVIEWS",
            rating: { combinedAverageRating: 4.9 },
            reviews: { totalReviews: 8 },
          },
          {
            productCode: "NONCANONICAL",
            productUrl: "https://www.viator.com/tours/Santa-Barbara/Wine",
            rating: { combinedAverageRating: 5.0 },
            reviews: { totalReviews: 900 },
          },
          {
            productCode: "GOOD1",
            productUrl:
              "https://www.viator.com/tours/Santa-Barbara/Wine/d4372-GOOD1",
            rating: { combinedAverageRating: 4.7 },
            reviews: { totalReviews: 250 },
          },
        ],
      }),
    } as Response);

    const results = await fetchViatorProductsByDestinationAndCategory({
      destinationId: "4372",
      category: "wine-tours",
      apiKey: "test",
      minRating: 4.5,
      minReviews: 25,
      limitPerCategory: 10,
    });

    expect(results.map(item => item.productCode)).toEqual(["GOOD2", "GOOD1"]);
    expect(results[0]?.canonicalViatorTourUrl).toContain("/d4372-GOOD2");
  });
});
