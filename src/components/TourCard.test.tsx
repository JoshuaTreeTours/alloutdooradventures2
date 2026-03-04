(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import TourCard from "./TourCard";
import type { Tour } from "../data/tours.types";

const baseTour: Tour = {
  id: "engine3-2335P1",
  engine: "engine3",
  productCode: "2335P1",
  slug: "san-andreas-fault-jeep-tour-from-palm-springs-2335p1",
  title: "San Andreas Fault Jeep Tour",
  destination: {
    country: "United States",
    state: "California",
    stateSlug: "california",
    city: "Palm Springs",
    citySlug: "palm-springs",
  },
  heroImage:
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/21/21/21/21.jpg",
  primaryImageUrl:
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/31/31/31/31.jpg",
  badges: {},
  activitySlugs: ["adventure"],
  bookingProvider: "viator",
  bookingUrl: "https://www.viator.com/tours/example",
  longDescription: "desc",
};

describe("TourCard", () => {
  it("uses tour.heroImage before primaryImageUrl for viator cards", () => {
    const html = renderToStaticMarkup(<TourCard tour={baseTour} />);

    expect(html).toContain(`src="${baseTour.heroImage}"`);
    expect(html).not.toContain(`src="${baseTour.primaryImageUrl}"`);
  });
});
