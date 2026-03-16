import { describe, expect, it } from "vitest";

import {
  extractViatorFaqs,
  extractViatorImages,
  extractViatorItinerary,
  extractViatorPrice,
  extractViatorRating,
  extractViatorReviewCount,
} from "./extractors";

describe("engine5 viator shared extractors", () => {
  it("extracts nested numeric pricing.summary.fromPrice", () => {
    const result = extractViatorPrice({ product: { pricing: { summary: { fromPrice: 139 } } } });
    expect(result).toEqual(
      expect.objectContaining({ amount: 139, fieldPath: "product.pricing.summary.fromPrice" })
    );
  });

  it("extracts formatted string pricing summary price", () => {
    const result = extractViatorPrice({ product: { pricing: { summary: { fromPriceFormatted: "$149.00" } } } });
    expect(result).toEqual(
      expect.objectContaining({ amount: 149, formattedPrice: "$149.00", fieldPath: "product.pricing.summary.fromPriceFormatted" })
    );
  });

  it("extracts bookingOptions price path", () => {
    const result = extractViatorPrice({ product: { bookingOptions: [{ price: { amount: 155 } }] } });
    expect(result?.amount).toBe(155);
    expect(result?.fieldPath).toBe("product.bookingOptions[0].price.amount");
  });

  it("extracts seasonal pricing path", () => {
    const result = extractViatorPrice({
      product: {
        bookableItems: [
          {
            seasonalPricingRecords: [
              { pricingDetails: [{ price: { original: { recommendedRetailPrice: 177 } } }] },
            ],
          },
        ],
      },
    });
    expect(result?.amount).toBe(177);
    expect(result?.fieldPath).toBe(
      "product.bookableItems[0].seasonalPricingRecords[0].pricingDetails[0].price.original.recommendedRetailPrice"
    );
  });

  it("rejects zero values and picks first non-zero path", () => {
    const result = extractViatorPrice({
      product: {
        pricing: { summary: { fromPrice: 0 } },
        fromPrice: "$0.00",
        bookableItems: [{ pricingSummary: { fromPrice: 199 } }],
      },
    });
    expect(result?.amount).toBe(199);
    expect(result?.fieldPath).toBe("product.bookableItems[0].pricingSummary.fromPrice");
  });

  it("covers rating and review count path variants", () => {
    const rating = extractViatorRating({ product: { reviews: { combinedAverageRating: 4.8 } } });
    const reviewCount = extractViatorReviewCount({ product: { reviewSummary: { totalReviews: 321 } } });

    expect(rating).toEqual({ value: 4.8, fieldPath: "product.reviews.combinedAverageRating" });
    expect(reviewCount).toEqual({ value: 321, fieldPath: "product.reviewSummary.totalReviews" });
  });

  it("normalizes itinerary from whatToExpect shape", () => {
    const itinerary = extractViatorItinerary({
      product: {
        whatToExpect: {
          items: [{ name: "Stop 1", summary: "Scenic stop", durationText: "30 minutes" }],
        },
      },
    });

    expect(itinerary?.fieldPath).toBe("product.whatToExpect.items");
    expect(itinerary?.value).toEqual([
      { title: "Stop 1", description: "Scenic stop", duration: "30 minutes" },
    ]);
  });

  it("normalizes images and prefers cover ordering", () => {
    const images = extractViatorImages({
      product: {
        images: [
          { url: "https://example.com/2.jpg", isCover: false },
          {
            url: "https://example.com/1.jpg",
            isCover: true,
            variants: [{ url: "https://example.com/1-large.jpg", width: 1200, height: 800 }],
          },
        ],
      },
    });

    expect(images?.value[0]?.isCover).toBe(true);
    expect(images?.value[0]?.variants[0]?.url).toBe("https://example.com/1-large.jpg");
  });

  it("normalizes faqs from qAndA shape", () => {
    const faqs = extractViatorFaqs({ product: { qAndA: { items: [{ q: "Q?", a: "A." }] } } });
    expect(faqs?.value).toEqual([{ question: "Q?", answer: "A." }]);
  });
});
