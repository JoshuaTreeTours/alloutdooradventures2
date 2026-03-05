import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { Tour } from "../data/tours.types";
import TourCard from "./TourCard";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const baseEngine4Tour: Tour = {
  id: "engine4-172188P151",
  engine: "engine4",
  productCode: "172188P151",
  slug: "private-professional-photoshoot-in-aspen-172188p151",
  title: "Private Professional Photoshoot in Aspen",
  destination: {
    city: "Aspen",
    state: "Colorado",
    stateSlug: "colorado",
    country: "United States",
    citySlug: "aspen",
  },
  categories: ["hiking"],
  primaryCategory: "hiking",
  activitySlugs: ["hiking"],
  shortDescription: "Private photo session in Aspen",
  longDescription: "Long description",
  heroImage:
    "https://dynamic-media.tacdn.com/media/photo-o/1a/f1/9d/df/caption.jpg?w=1200&h=800&s=1",
  primaryImageUrl: undefined,
  galleryImages: [],
  bookingProvider: "viator",
  bookingUrl:
    "https://www.viator.com/tours/Aspen/Private-Professional-photoshoot-in-Aspen/d26395-172188P151?pid=P00290915&mcid=42383&medium=link",
  badges: {},
  currency: "USD",
};

describe("TourCard Engine4 hero handling", () => {
  it("uses tour.heroImage for Engine4 cards", () => {
    const html = renderToStaticMarkup(<TourCard tour={baseEngine4Tour} />);

    expect(html).toContain(
      "https://dynamic-media.tacdn.com/media/photo-o/1a/f1/9d/df/caption.jpg?w=1200&amp;h=800&amp;s=1"
    );
    expect(html).not.toContain("/hero.jpg");
  });

  it("uses inline SVG placeholder instead of scenic fallback when Engine4 hero is missing", () => {
    const html = renderToStaticMarkup(
      <TourCard tour={{ ...baseEngine4Tour, heroImage: undefined }} />
    );

    expect(html).toContain("data:image/svg+xml;utf8,");
    expect(html).toContain("Tour%20image%20unavailable");
    expect(html).not.toContain("/hero.jpg");
  });
});
