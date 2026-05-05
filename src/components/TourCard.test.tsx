import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { Tour } from "../data/tours.types";
import TourCard from "./TourCard";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const buildTour = (overrides: Partial<Tour> = {}): Tour => ({
  id: "test-tour",
  slug: "test-tour",
  title: "Test Tour",
  shortDescription: "A short test tour description.",
  destination: {
    state: "Arizona",
    stateSlug: "arizona",
    city: "Sedona",
    citySlug: "sedona",
  },
  heroImage: "/hero.jpg",
  badges: {
    rating: 4.8,
    reviewCount: 216,
  },
  activitySlugs: ["hiking"],
  bookingProvider: "viator",
  bookingUrl: "https://example.com/book",
  longDescription: "A longer test tour description.",
  ...overrides,
});

describe("TourCard rating display", () => {
  it("hides ratings and reviews for non-Engine6 tour cards", () => {
    const html = renderToStaticMarkup(
      <TourCard tour={buildTour({ engine: "engine4" })} href="/test-tour" />
    );

    expect(html).toContain("Test Tour");
    expect(html).not.toContain("★");
    expect(html).not.toContain("4.8");
    expect(html).not.toContain("216");
    expect(html).not.toContain("reviews");
  });

  it("keeps ratings and reviews for Engine6 tour cards", () => {
    const html = renderToStaticMarkup(
      <TourCard tour={buildTour({ engine: "engine6" })} href="/test-tour" />
    );

    expect(html).toContain("★ 4.8 (216 reviews)");
  });
});
