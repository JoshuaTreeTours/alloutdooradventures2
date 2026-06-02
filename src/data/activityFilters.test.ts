import { describe, expect, it } from "vitest";
import {
  matchesCategoryPageActivity,
  withCategoryPageActivityBadge,
} from "./activityFilters";
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

  it("allows governed Engine6 hiking-primary bike-and-hike products", () => {
    const bikeAndHikeTour = makeTour({
      engine: "engine6",
      title: "Palm Springs Indian Canyons Bike and Hike",
      primaryCategory: "hiking-tour",
      categories: ["hiking-tour", "bike-tour"],
      activitySlugs: ["cycling", "bike-tours", "hiking"],
      tagPills: ["Hiking Tour"],
    });

    expect(matchesCategoryPageActivity(bikeAndHikeTour, "hiking")).toBe(true);
  });

  it("excludes walking experiences from hiking category pages", () => {
    const walkingTour = makeTour({
      title: "Historic Walking Tour",
      primaryCategory: "walking-tour",
      categories: ["walking-tour"],
      activitySlugs: ["adventure"],
    });

    expect(matchesCategoryPageActivity(walkingTour, "hiking")).toBe(false);
  });

  it("excludes non-hiking products even when bad generated data labels them hiking", () => {
    const boatRental = makeTour({
      title: "17' Boston Whaler",
      primaryCategory: "hiking",
      categories: ["hiking"],
      tags: ["Boat Rental"],
      activitySlugs: ["hiking"],
      tagPills: ["Boat Rental"],
    });

    expect(matchesCategoryPageActivity(boatRental, "hiking")).toBe(false);
  });

  it("allows explicit non-Engine6 hike products without disqualifying activity signals", () => {
    const photographyHike = makeTour({
      title: "Photography Hike",
      primaryCategory: "detours",
      categories: ["detours", "hiking"],
      activitySlugs: ["detours", "hiking"],
    });

    expect(matchesCategoryPageActivity(photographyHike, "hiking")).toBe(true);
  });

  it("adds a visible Hiking badge to strict non-Engine6 hiking matches", () => {
    const photographyHike = makeTour({
      title: "Photography Hike",
      primaryCategory: "detours",
      categories: ["detours", "hiking"],
      activitySlugs: ["detours", "hiking"],
      tagPills: ["Photography Tour"],
    });

    expect(
      withCategoryPageActivityBadge(photographyHike, "hiking").tagPills
    ).toEqual(["Hiking", "Photography Tour"]);
  });
});
