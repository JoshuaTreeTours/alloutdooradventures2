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
    const rating = extractViatorRating({
      product: { reviewSummary: { averageRating: "4.9 out of 5" } },
    });
    const reviewCount = extractViatorReviewCount({
      product: { reviews: { totalReviews: "2,345" } },
    });

    expect(rating).toEqual({
      value: 4.9,
      fieldPath: "product.reviewSummary.averageRating",
    });
    expect(reviewCount).toEqual({
      value: 2345,
      fieldPath: "product.reviews.totalReviews",
    });
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

  it("extracts hero from media.images variant path priority", () => {
    const images = extractViatorImages({
      product: {
        media: {
          images: [
            {
              variants: {
                LARGE: { url: "https://example.com/large.jpg" },
                FULL: { url: "https://example.com/full.jpg" },
              },
              url: "https://example.com/direct.jpg",
            },
          ],
        },
      },
    });

    expect(images?.fieldPath).toBe("product.media.images[0].variants.FULL.url");
    expect(images?.value[0]?.variants[0]?.url).toBe("https://example.com/full.jpg");
    expect(images?.value[0]?.variants[1]?.url).toBe("https://example.com/large.jpg");
  });

  it("falls back to product.images[0].url when media variants are absent", () => {
    const images = extractViatorImages({
      product: {
        images: [{ url: "https://example.com/fallback.jpg" }],
      },
    });

    expect(images?.fieldPath).toBe("product.images[0].url");
    expect(images?.value[0]?.variants[0]?.url).toBe(
      "https://example.com/fallback.jpg"
    );
  });

  it("normalizes faqs from qAndA shape", () => {
    const faqs = extractViatorFaqs({ product: { qAndA: { items: [{ q: "Q?", a: "A." }] } } });
    expect(faqs?.value).toEqual([{ question: "Q?", answer: "A." }]);
  });
});
