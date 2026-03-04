import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TOUR_FALLBACK_HERO_IMAGE } from "../../utils/hero";
import type { Engine3TourViewModel } from "../types";
import Engine3TourPage from "./Engine3TourPage";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const posterChildTour: Engine3TourViewModel = {
  tourId: "2335P1",
  bookingProvider: "viator",
  title: "San Andreas Fault Jeep Tour from Palm Springs",
  description:
    "Structured content for the San Andreas Fault Jeep Tour from Palm Springs.",
  country: "usa",
  stateSlug: "california",
  city: "Palm Springs",
  citySlug: "palm-springs",
  region: "California",
  canonicalPath:
    "/destinations/california/palm-springs/tours/san-andreas-fault-jeep-tour-from-palm-springs-2335p1",
  bookingUrl: "https://www.viator.com/tours/Palm-Springs/example",
  primaryImageUrl:
    "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
};

describe("Engine3TourPage", () => {
  it("renders unique Engine3 structured data script id and breadcrumb links", () => {
    const html = renderToStaticMarkup(
      <Engine3TourPage tour={posterChildTour} />
    );

    expect(html).toContain('id="structured-data-engine3-viator"');
    expect(html).toContain("/tours");
    expect(html).toContain("/tours?state=california&amp;city=palm-springs");
    expect(html).not.toContain("palm%20springs");
    expect(html).toContain("pid=P00290915");
    expect(html).toContain("mcid=42383");
    expect(html).toContain("medium=link");
  });

  it("renders hero before the Overview section", () => {
    const html = renderToStaticMarkup(
      <Engine3TourPage tour={posterChildTour} />
    );

    const heroIndex = html.indexOf(TOUR_FALLBACK_HERO_IMAGE);
    const overviewIndex = html.indexOf(">Overview<");

    expect(heroIndex).toBeGreaterThan(-1);
    expect(overviewIndex).toBeGreaterThan(-1);
    expect(heroIndex).toBeLessThan(overviewIndex);
  });

  it("hides Overview and Highlights sections when normalized fields are empty", () => {
    const html = renderToStaticMarkup(
      <Engine3TourPage
        tour={{
          ...posterChildTour,
          description: "",
          overview: null,
          highlights: [],
        }}
      />
    );

    expect(html).not.toContain(">Overview<");
    expect(html).not.toContain(">Highlights<");
  });


  it("renders departure note when override conditions are met", () => {
    const html = renderToStaticMarkup(
      <Engine3TourPage
        tour={{
          ...posterChildTour,
          departureNote: "Departs daily from Palm Springs Art Museum at 8:30 a.m.",
        }}
      />
    );

    expect(html).toContain("Departure:");
    expect(html).toContain("8:30 a.m.");
  });

  it("uses Viator fallback hero image when viator hero contract has no image", () => {
    const html = renderToStaticMarkup(
      <Engine3TourPage
        tour={{
          ...posterChildTour,
          primaryImageUrl: undefined,
          heroImageOverrideUrl: undefined,
          content: { images: [] },
        }}
      />
    );

    expect(html).toContain(TOUR_FALLBACK_HERO_IMAGE);
  });

  it("keeps rendering booking CTA when booking URL parsing fails", () => {
    const html = renderToStaticMarkup(
      <Engine3TourPage
        tour={{
          ...posterChildTour,
          bookingUrl: "not-a-valid-url",
        }}
      />
    );

    expect(html).toContain("Book This Tour");
    expect(html).toContain('href="not-a-valid-url"');
  });

  it("renders price and rating only when values are valid", () => {
    const withValidMeta = renderToStaticMarkup(
      <Engine3TourPage
        tour={{
          ...posterChildTour,
          priceFrom: "$175.00",
          priceCurrency: "USD",
          rating: 4.5,
          reviewCount: 117,
          meetingPointText: "Metate Ranch in Indio",
        }}
      />
    );

    expect(withValidMeta).toContain("From $175.00 per person");
    expect(withValidMeta).toContain("4.5");
    expect(withValidMeta).toContain("117 reviews");
    expect(withValidMeta).toContain("Meeting point:");

    const withInvalidMeta = renderToStaticMarkup(
      <Engine3TourPage
        tour={{
          ...posterChildTour,
          priceFrom: "USD 0",
          rating: Number.NaN,
          reviewCount: undefined,
          meetingPointText: undefined,
        }}
      />
    );

    expect(withInvalidMeta).not.toContain("From USD 0 per person");
    expect(withInvalidMeta).not.toContain("reviews");
    expect(withInvalidMeta).not.toContain("Meeting point:");
  });
});
