import { describe, expect, it } from "vitest";
import { extractEngine6Product } from "./viatorExtractors";

describe("extractEngine6Product operatorReviews mapping", () => {
  it("maps operatorReviews rating and totalReviews without dropping to zero", () => {
    const payload = {
      product: {
        productCode: "335698P13",
        title: "Rock Scrambling Adventures in Joshua Tree National Park",
        productUrl:
          "https://www.viator.com/tours/Palm-Springs/Rock-Scrambling-Adventures-in-Joshua-Tree-National-Park/d648-335698P13",
        operatorReviews: {
          combinedAverageRating: 5,
          totalReviews: 86,
        },
      },
    };

    const result = extractEngine6Product(payload as Record<string, unknown>);

    expect(result.extracted.aggregateRating).toBe(5);
    expect(result.extracted.reviewCount).toBe(86);
    expect(result.extracted.reviewCount).toBeGreaterThan(0);
    expect(result.diagnostics.ratingFieldPath).toBe(
      "product.operatorReviews.combinedAverageRating"
    );
    expect(result.diagnostics.reviewCountFieldPath).toBe(
      "product.operatorReviews.totalReviews"
    );
  });

  it("prefers normalized reviews/operatorReviews counts over top-level zero reviewCount", () => {
    const payload = {
      product: {
        productCode: "335698P13",
        reviewCount: 0,
        reviews: { totalReviews: 86, combinedAverageRating: 5 },
        operatorReviews: { totalReviews: 86, combinedAverageRating: 5 },
      },
    };

    const result = extractEngine6Product(payload as Record<string, unknown>);

    expect(result.extracted.reviewCount).toBe(86);
    expect(result.extracted.aggregateRating).toBe(5);
    expect(result.diagnostics.reviewCountFieldPath).toBe(
      "product.reviews.totalReviews"
    );
  });

});
