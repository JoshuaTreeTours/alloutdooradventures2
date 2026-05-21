import { describe, expect, it } from "vitest";
import { filterContaminatedRelatedTours } from "./filterContaminatedRelatedTours";
import type { Tour } from "../data/tours.types";

const buildTour = (overrides: Partial<Tour>): Tour => ({
  id: "tour-1",
  slug: "tour-1",
  title: "Safe tour",
  heroImage: "https://example.com/hero.jpg",
  badges: {},
  destination: {
    country: "United States",
    state: "Alaska",
    stateSlug: "alaska",
    city: "Anchorage",
    citySlug: "anchorage",
  },
  activitySlugs: ["adventure"],
  bookingProvider: "fareharbor",
  bookingUrl: "https://fareharbor.com/embeds/book/test/items/700000",
  longDescription: "desc",
  ...overrides,
});

describe("filterContaminatedRelatedTours", () => {
  it("removes known contaminated Africa/Anchorage products from final related tours list", () => {
    const input = [
      buildTour({
        id: "fh-517077",
        bookingUrl: "https://fareharbor.com/embeds/book/test/items/517077",
      }),
      buildTour({
        id: "fh-517088",
        bookingUrl: "https://fareharbor.com/embeds/book/test/items/517088",
      }),
      buildTour({
        id: "fh-517079",
        bookingUrl: "https://fareharbor.com/embeds/book/test/items/517079",
      }),
      buildTour({
        id: "fh-517094",
        bookingUrl: "https://fareharbor.com/embeds/book/test/items/517094",
      }),
      buildTour({
        id: "fh-520051",
        bookingUrl: "https://fareharbor.com/embeds/book/test/items/520051",
      }),
      buildTour({
        id: "safe",
        bookingUrl: "https://fareharbor.com/embeds/book/test/items/777777",
        title: "Knik Glacier Off-Roading and Hiking",
      }),
    ];

    const output = filterContaminatedRelatedTours(input);
    const productIds = output.map(tour => tour.bookingUrl.match(/\/items\/(\d+)/)?.[1]);

    expect(productIds).not.toContain("517077");
    expect(productIds).not.toContain("517088");
    expect(productIds).not.toContain("517079");
    expect(productIds).not.toContain("517094");
    expect(productIds).not.toContain("520051");
    expect(output.map(tour => tour.id)).toContain("safe");
  });

  it("uses title fallback suppression when product id is unavailable", () => {
    const input = [
      buildTour({
        id: "title-only-contaminated",
        bookingProvider: "viator",
        bookingUrl: "https://www.viator.com/tours/X/Y/d1-ZZZ",
        productCode: undefined,
        title: "9 Days Across the Savannah of Tanzania",
      }),
      buildTour({
        id: "safe-title",
        bookingProvider: "viator",
        bookingUrl: "https://www.viator.com/tours/X/Y/d1-SAFE",
        productCode: undefined,
        title: "Anchorage Wildlife Explorer",
      }),
    ];

    const output = filterContaminatedRelatedTours(input);
    expect(output.map(tour => tour.id)).toEqual(["safe-title"]);
  });
});
