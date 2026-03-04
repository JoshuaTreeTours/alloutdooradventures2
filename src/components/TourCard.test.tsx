import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { Tour } from "../data/tours.types";
import TourCard from "./TourCard";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const baseTour: Tour = {
  id: "engine3-2335P1",
  engine: "engine3",
  productCode: "2335P1",
  slug: "san-andreas-fault-jeep-tour-from-palm-springs-2335p1",
  title: "San Andreas Fault Jeep Tour from Palm Springs",
  destination: {
    state: "California",
    stateSlug: "california",
    country: "United States",
    city: "Palm Springs",
    citySlug: "palm-springs",
  },
  heroImage: "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg",
  badges: {},
  activitySlugs: ["adventure"],
  bookingProvider: "viator",
  bookingUrl: "https://www.viator.com/tours/example",
  longDescription: "long",
};

describe("TourCard", () => {
  it("renders viator cards with tour.heroImage", () => {
    const html = renderToStaticMarkup(<TourCard tour={baseTour} />);

    expect(html).toContain(`src="${baseTour.heroImage}"`);
    expect(html).not.toContain("Viator experience image unavailable");
  });

  it("renders viator placeholder and never uses default hero fallback", () => {
    const html = renderToStaticMarkup(
      <TourCard
        tour={{
          ...baseTour,
          heroImage: "",
          primaryImageUrl: "/images/canoe-hero.jpg",
        }}
      />
    );

    expect(html).toContain("Viator experience image unavailable");
    expect(html).not.toContain('src="/hero.jpg"');
    expect(html).not.toContain("/images/canoe-hero.jpg");
  });
});
