import { describe, expect, it } from "vitest";

import { fareHarborMigratedProducts } from "./fareharborCityBatches";
import {
  fareHarborAggregateRatingSchema,
  fareHarborRating,
  formatFareHarborRating,
} from "./fareharborPresentation";

const sectionLabelAtStart =
  /^(?:Duration|Overview|Details|Highlights)\b|^About\s+(?!(?:\d|one|two|three|four|five|six|seven|eight|nine|ten)\b)/;

describe("FareHarbor item integrity", () => {
  it("does not leave scraped section labels at the start of prose", () => {
    for (const product of fareHarborMigratedProducts) {
      const blocks = [
        ...product.paragraphs,
        ...product.highlights,
        product.schemaDescription,
      ];
      for (const block of blocks) {
        expect(block, product.itemId).not.toMatch(/\bDuration\s+About\b/);
        expect(block, product.itemId).not.toMatch(sectionLabelAtStart);
      }
    }
  });

  it("does not give one item another item's gallery or rating", () => {
    const galleryOwner = new Map<string, string>();
    for (const product of fareHarborMigratedProducts) {
      if (product.exceptionStatus !== "OK") {
        continue;
      }
      for (const url of product.galleryImages) {
        const previous = galleryOwner.get(url);
        expect(previous, `${url} shared by ${previous} and ${product.itemId}`).toBeUndefined();
        galleryOwner.set(url, product.itemId);
      }
      if (!product.aggregateRating) {
        continue;
      }
      expect(product.ratingProvenance, product.itemId).toContain(
        `/companies/${product.company}/items/${product.itemId}/ratings/`
      );
      const rating = fareHarborRating(product);
      expect(rating, product.itemId).toEqual(product.aggregateRating);
      const schema = fareHarborAggregateRatingSchema(product);
      expect(schema?.ratingValue, product.itemId).toBe(rating?.ratingValue);
      expect(schema?.reviewCount, product.itemId).toBe(rating?.reviewCount);
      expect(schema?.author.name, product.itemId).toBe(rating?.provider);
      expect(formatFareHarborRating(rating!), product.itemId).toContain(
        `(${rating!.reviewCount.toLocaleString("en-US")} reviews)`
      );
    }
    for (const product of fareHarborMigratedProducts) {
      const image = product.productImage;
      if (!image) {
        continue;
      }
      const owner = galleryOwner.get(image);
      expect(owner === undefined || owner === product.itemId, product.itemId).toBe(true);
    }
  });
});
