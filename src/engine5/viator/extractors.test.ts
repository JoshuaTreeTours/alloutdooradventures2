import { describe, expect, it } from "vitest";

import {
  extractViatorFaqs,
  extractViatorHeroImage,
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

  it("hero: cover-marked media wins over non-cover image", () => {
    const hero = extractViatorHeroImage({
      product: {
        media: {
          images: [
            { isCover: false, variants: { FULL: { url: "https://example.com/non-cover-full.jpg" } } },
            { isCover: true, variants: { FULL: { url: "https://example.com/cover-full.jpg" } } },
          ],
        },
      },
    });

    expect(hero).toEqual(
      expect.objectContaining({
        url: "https://example.com/cover-full.jpg",
        fieldPath: "product.media.images[1].variants.FULL.url",
      })
    );
  });

  it("hero: FULL variant wins over lower-priority variants", () => {
    const hero = extractViatorHeroImage({
      product: {
        media: {
          images: [
            {
              variants: {
                FULL: { url: "https://example.com/full.jpg", width: 1600, height: 900 },
                HIGH_RESOLUTION: { url: "https://example.com/high.jpg" },
                LARGE: { url: "https://example.com/large.jpg" },
              },
            },
          ],
        },
      },
    });

    expect(hero).toEqual(
      expect.objectContaining({
        url: "https://example.com/full.jpg",
        fieldPath: "product.media.images[0].variants.FULL.url",
        width: 1600,
        height: 900,
      })
    );
  });

  it("hero: HIGH_RESOLUTION fallback works", () => {
    const hero = extractViatorHeroImage({
      product: {
        media: {
          images: [{ variants: { HIGH_RESOLUTION: { url: "https://example.com/high.jpg" } } }],
        },
      },
    });

    expect(hero?.url).toBe("https://example.com/high.jpg");
    expect(hero?.fieldPath).toBe("product.media.images[0].variants.HIGH_RESOLUTION.url");
  });

  it("hero: LARGE fallback works", () => {
    const hero = extractViatorHeroImage({
      product: {
        media: {
          images: [{ variants: { LARGE: { url: "https://example.com/large.jpg" } } }],
        },
      },
    });

    expect(hero?.url).toBe("https://example.com/large.jpg");
    expect(hero?.fieldPath).toBe("product.media.images[0].variants.LARGE.url");
  });

  it("hero: plain media.images[0].url fallback works", () => {
    const hero = extractViatorHeroImage({
      product: {
        media: { images: [{ url: "https://example.com/media-direct.jpg" }] },
      },
    });

    expect(hero?.url).toBe("https://example.com/media-direct.jpg");
    expect(hero?.fieldPath).toBe("product.media.images[0].url");
  });

  it("hero: product.images[0].url fallback works", () => {
    const hero = extractViatorHeroImage({
      product: {
        images: [{ url: "https://example.com/root-image.jpg" }],
      },
    });

    expect(hero?.url).toBe("https://example.com/root-image.jpg");
    expect(hero?.fieldPath).toBe("product.images[0].url");
  });

  it("rating: product.rating works", () => {
    const rating = extractViatorRating({ product: { rating: 4.7 } });
    expect(rating).toEqual({ value: 4.7, fieldPath: "product.rating" });
  });

  it("rating: product.averageRating works", () => {
    const rating = extractViatorRating({ product: { averageRating: 4.8 } });
    expect(rating).toEqual({ value: 4.8, fieldPath: "product.averageRating" });
  });

  it("rating: reviewSummary.averageRating works", () => {
    const rating = extractViatorRating({ product: { reviewSummary: { averageRating: 4.9 } } });
    expect(rating).toEqual({ value: 4.9, fieldPath: "product.reviewSummary.averageRating" });
  });

  it("rating: reviews.combinedAverageRating works", () => {
    const rating = extractViatorRating({ product: { reviews: { combinedAverageRating: 4.8 } } });
    expect(rating).toEqual({ value: 4.8, fieldPath: "product.reviews.combinedAverageRating" });
  });

  it('rating: string "4.9 out of 5" normalizes correctly', () => {
    const rating = extractViatorRating({ product: { reviews: { averageRating: "4.9 out of 5" } } });
    expect(rating).toEqual({ value: 4.9, fieldPath: "product.reviews.averageRating" });
  });

  it("reviewCount: product.reviewCount works", () => {
    const reviewCount = extractViatorReviewCount({ product: { reviewCount: 2710 } });
    expect(reviewCount).toEqual({ value: 2710, fieldPath: "product.reviewCount" });
  });

  it("reviewCount: reviewSummary.totalReviews works", () => {
    const reviewCount = extractViatorReviewCount({ product: { reviewSummary: { totalReviews: 321 } } });
    expect(reviewCount).toEqual({ value: 321, fieldPath: "product.reviewSummary.totalReviews" });
  });

  it("reviewCount: reviews.totalReviews works", () => {
    const reviewCount = extractViatorReviewCount({ product: { reviews: { totalReviews: 125 } } });
    expect(reviewCount).toEqual({ value: 125, fieldPath: "product.reviews.totalReviews" });
  });

  it('reviewCount: comma-separated string "2,710" normalizes correctly', () => {
    const reviewCount = extractViatorReviewCount({ product: { reviews: { count: "2,710" } } });
    expect(reviewCount).toEqual({ value: 2710, fieldPath: "product.reviews.count" });
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
