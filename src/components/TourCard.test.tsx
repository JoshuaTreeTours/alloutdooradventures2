import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { Tour } from "../data/tours.types";
import { ENGINE3_VIATOR_FALLBACK_HERO_IMAGE } from "../utils/hero";
import TourCard from "./TourCard";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const baseTour: Tour = {
  id: "engine3-6740P7",
  engine: "engine3",
  productCode: "6740P7",
  slug: "joshua-tree-national-park-scenic-tour-6740p7",
  title: "Joshua Tree National Park Scenic Tour",
  destination: {
    state: "California",
    stateSlug: "california",
    city: "Palm Springs",
    citySlug: "palm-springs",
  },
  heroImage: "",
  badges: {},
  activitySlugs: ["adventure"],
  bookingProvider: "viator",
  bookingUrl: "https://www.viator.com/tours/Palm-Springs/example",
  longDescription: "",
};

describe("TourCard", () => {
  it("uses Engine3 Viator fallback image when candidate is known-bad dynamic caption", () => {
    const html = renderToStaticMarkup(
      <TourCard
        tour={{
          ...baseTour,
          primaryImageUrl:
            "https://dynamic-media.tacdn.com/media/photo-o/12/34/56/caption.jpg",
          heroImage:
            "https://dynamic-media.tacdn.com/media/photo-o/98/76/54/caption.jpg",
        }}
      />,
    );

    expect(html).toContain(ENGINE3_VIATOR_FALLBACK_HERO_IMAGE);
    expect(html).not.toContain("/12/34/56/caption.jpg");
  });
});
