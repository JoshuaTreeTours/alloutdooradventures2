import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { Engine3TourViewModel } from "../types";
import Engine3TourPage from "./Engine3TourPage";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const posterChildTour: Engine3TourViewModel = {
  tourId: "2335P1",
  title: "San Andreas Fault Jeep Tour from Palm Springs",
  description:
    "Structured content for the San Andreas Fault Jeep Tour from Palm Springs.",
  country: "usa",
  city: "palm-springs",
  region: "california",
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
    expect(html).toContain("/destinations");
    expect(html).toContain("/destinations/california");
    expect(html).toContain("/destinations/california/palm-springs");
  });

  it("renders hero before the Overview section", () => {
    const html = renderToStaticMarkup(
      <Engine3TourPage tour={posterChildTour} />
    );

    const heroIndex = html.indexOf(posterChildTour.primaryImageUrl as string);
    const overviewIndex = html.indexOf(">Overview<");

    expect(heroIndex).toBeGreaterThan(-1);
    expect(overviewIndex).toBeGreaterThan(-1);
    expect(heroIndex).toBeLessThan(overviewIndex);
  });

  it("always renders hero image even when primaryImageUrl is missing", () => {
    const html = renderToStaticMarkup(
      <Engine3TourPage
        tour={{
          ...posterChildTour,
          primaryImageUrl: undefined,
          heroImageOverrideUrl: undefined,
        }}
      />
    );

    expect(html).toContain('src="/hero.jpg"');
  });
});
