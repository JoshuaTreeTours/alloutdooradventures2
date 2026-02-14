import { describe, expect, it } from "vitest";

import type { Tour } from "../../data/tours.types";
import { getTourPriceRange } from "./priceRange";

const baseTour: Tour = {
  id: "tour-1",
  slug: "tour-1",
  title: "Scenic Adventure",
  destination: {
    state: "California",
    stateSlug: "california",
    city: "San Diego",
    citySlug: "san-diego",
    country: "United States",
  },
  heroImage: "https://example.com/hero.jpg",
  badges: {},
  activitySlugs: ["hiking"],
  bookingProvider: "viator",
  bookingUrl: "https://example.com/book",
  longDescription: "desc",
};

describe("getTourPriceRange", () => {
  it("returns default band when no pricing cues are present", () => {
    expect(getTourPriceRange(baseTour)).toBe("$$–$$$");
  });

  it("returns premium band for private/luxury keywords", () => {
    expect(
      getTourPriceRange({ ...baseTour, title: "Private Luxury Jeep Tour" })
    ).toBe("$$$–$$$$");
  });

  it("returns budget band for walking/short keywords", () => {
    expect(
      getTourPriceRange({
        ...baseTour,
        title: "Old Town Walking Tour",
        badges: { duration: "Short" },
      })
    ).toBe("$–$$");
  });
});
