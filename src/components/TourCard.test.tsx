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

describe("TourCard category badge display", () => {
  const renderBadgeTour = (
    primaryDisplayCategory: string,
    title = "Test Tour"
  ) =>
    renderToStaticMarkup(
      <TourCard
        tour={buildTour({
          title,
          shortDescription: "",
          longDescription: "",
          primaryCategory: "legacy-category",
          primaryDisplayCategory,
          tagPills: ["Old Badge"],
        })}
        href="/test-tour"
      />
    );

  it("uses primaryDisplayCategory for an e-bike wine tour card badge", () => {
    const html = renderBadgeTour("Cycling", "E-bike wine tour");

    expect(html).toContain("Cycling");
    expect(html).not.toContain("Old Badge");
  });

  it("uses primaryDisplayCategory for a Jet Ski tour card badge", () => {
    expect(renderBadgeTour("Water Sports", "Jet Ski tour")).toContain(
      "Water Sports"
    );
  });

  it("uses primaryDisplayCategory for a trolley tour card badge", () => {
    expect(
      renderBadgeTour("Sightseeing & City Tours", "Trolley tour")
    ).toContain("Sightseeing &amp; City Tours");
  });

  it("uses primaryDisplayCategory for a Jeep/off-road tour card badge", () => {
    expect(renderBadgeTour("Jeep & Off-Road", "Jeep tour")).toContain(
      "Jeep &amp; Off-Road"
    );
  });

  it("uses primaryDisplayCategory for a stargazing tour card badge", () => {
    expect(renderBadgeTour("Stargazing", "Stargazing tour")).toContain(
      "Stargazing"
    );
  });

  it("falls back to existing tagPills when no primaryDisplayCategory is present", () => {
    const html = renderToStaticMarkup(
      <TourCard
        tour={buildTour({
          shortDescription: "",
          longDescription: "",
          tagPills: ["Existing Badge"],
        })}
        href="/test-tour"
      />
    );

    expect(html).toContain("Existing Badge");
  });
});
