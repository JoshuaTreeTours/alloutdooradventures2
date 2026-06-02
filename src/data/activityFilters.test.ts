import { describe, expect, it } from "vitest";
import { matchesCategoryPageActivity } from "./activityFilters";
import type { Tour } from "./tours.types";

const makeTour = (overrides: Partial<Tour>): Tour => ({
  id: "test-tour",
  slug: "test-tour",
  title: "Test Tour",
  categories: [],
  destination: {
    state: "California",
    stateSlug: "california",
    city: "San Francisco",
    citySlug: "san-francisco",
  },
  heroImage: "https://example.com/image.jpg",
  badges: {},
  activitySlugs: [],
  bookingProvider: "viator",
  bookingUrl: "https://example.com/book",
  longDescription: "Test tour.",
  ...overrides,
});

describe("matchesCategoryPageActivity", () => {
  it("keeps pure cycling products off hiking category pages", () => {
    const bikeTour = makeTour({
      title: "Golden Gate Bridge Electric Bike Tour",
      primaryCategory: "cycling",
      categories: ["cycling", "hiking"],
      activitySlugs: ["cycling", "hiking"],
    });

    expect(matchesCategoryPageActivity(bikeTour, "hiking")).toBe(false);
  });

  it("allows bike-and-hike products when hiking is the primary category", () => {
    const bikeAndHikeTour = makeTour({
      title: "Palm Springs Indian Canyons Bike and Hike",
      primaryCategory: "hiking-tour",
      categories: ["hiking-tour", "bike-tour"],
      activitySlugs: ["cycling", "bike-tours", "hiking"],
    });

    expect(matchesCategoryPageActivity(bikeAndHikeTour, "hiking")).toBe(true);
  });

  it("allows walking experiences on hiking category pages", () => {
    const walkingTour = makeTour({
      title: "Historic Walking Tour",
      primaryCategory: "walking-tour",
      categories: ["walking-tour"],
      activitySlugs: ["adventure"],
    });

    expect(matchesCategoryPageActivity(walkingTour, "hiking")).toBe(true);
  });
});
