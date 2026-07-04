import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getToursByCityUnified } from "../data/tours";
import { ENGINE6_PHILADELPHIA_CANONICAL_CITY_HERO_URL } from "../engine6/displayHero";
import TourCard from "./TourCard";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/destinations/pennsylvania/philadelphia/tours",
};

describe("TourCard Philadelphia listing hero rendering", () => {
  it("uses product-specific card image sources instead of city fallback for governed products", () => {
    const entries = getToursByCityUnified(
      "pennsylvania",
      "philadelphia"
    ).filter(entry => entry.tour.engine === "engine6");

    expect(entries).toHaveLength(22);

    const cardImageSources = entries.map(entry => {
      const html = renderToString(
        <TourCard tour={entry.tour} href={entry.href} />
      );
      const match = html.match(/data-card-image-src="([^"]+)"/);
      expect(match, entry.tour.productCode).toBeTruthy();
      return match![1];
    });

    const cityHeroCount = cardImageSources.filter(
      src => src === ENGINE6_PHILADELPHIA_CANONICAL_CITY_HERO_URL
    ).length;

    expect(cityHeroCount).toBe(1);
    expect(new Set(cardImageSources).size).toBe(22);
  });
});
