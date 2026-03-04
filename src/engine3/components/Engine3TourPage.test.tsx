import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { Engine3TourViewModel } from "../types";
import Engine3TourPage from "./Engine3TourPage";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const heroImage =
  "https://dynamic-media.tacdn.com/media/photo-o/2f/38/8e/aa/caption.jpg?w=1100&h=800&s=1";

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
  heroImage,
  primaryImageUrl: heroImage,
  heroImageUrl: heroImage,
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

  it("uses the same hero image on page and JSON-LD graph payload", () => {
    const html = renderToStaticMarkup(
      <Engine3TourPage tour={posterChildTour} />
    );

    expect(html).toContain("caption.jpg?w=1100&amp;h=800&amp;s=1");
    expect(html).toContain(`\"image\":\"${heroImage}\"`);
  });

  it("renders hero before the Overview section", () => {
    const html = renderToStaticMarkup(
      <Engine3TourPage tour={posterChildTour} />
    );

    const heroIndex = html.indexOf(heroImage);
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

  it("renders placeholder instead of default hero when viator heroImage is missing", () => {
    const html = renderToStaticMarkup(
      <Engine3TourPage
        tour={{
          ...posterChildTour,
          heroImage: undefined,
          primaryImageUrl: undefined,
          heroImageUrl: undefined,
        }}
      />
    );

    expect(html).toContain("Viator experience image unavailable");
    expect(html).not.toContain('src="/hero.jpg"');
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
});
