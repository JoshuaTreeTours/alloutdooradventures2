import { describe, expect, it } from "vitest";

import type { Tour } from "../data/tours.types";
import { isRentalTour } from "./isRentalTour";

const baseTour: Tour = {
  id: "t1",
  slug: "demo-tour",
  title: "Demo Tour",
  destination: {
    state: "Montana",
    stateSlug: "montana",
    city: "Bozeman",
    citySlug: "bozeman",
  },
  heroImage: "/hero.jpg",
  badges: {},
  activitySlugs: ["adventure"],
  bookingProvider: "fareharbor",
  bookingUrl: "https://example.com",
  longDescription: "Demo",
};

describe("isRentalTour", () => {
  it("returns true when type is rental", () => {
    expect(
      isRentalTour({
        ...baseTour,
        type: "rental",
      })
    ).toBe(true);
  });

  it("returns true for rental category/activity", () => {
    expect(
      isRentalTour({
        ...baseTour,
        primaryCategory: "rentals",
      })
    ).toBe(true);

    expect(
      isRentalTour({
        ...baseTour,
        categories: ["rentals"],
      })
    ).toBe(true);
  });

  it("returns true when title indicates rental", () => {
    expect(
      isRentalTour({
        ...baseTour,
        title: "Half Day Kayak Rental",
      })
    ).toBe(true);
  });

  it("returns false for non-rental tours", () => {
    expect(isRentalTour(baseTour)).toBe(false);
  });
});
