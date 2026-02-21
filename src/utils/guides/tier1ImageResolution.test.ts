import { describe, expect, it } from "vitest";
import { getToursByCity } from "../../data/tours";
import { selectCityHeroFromTours } from "./selectCityHeroFromTours";

describe("tier1 image resolution", () => {
  it("keeps non-empty hero and card-style images for a known tier1 city", () => {
    const hero = selectCityHeroFromTours(
      "california",
      "los-angeles",
      "Los Angeles",
      "California"
    );

    const cityTours = getToursByCity("california", "los-angeles");
    const cardImage = cityTours.find(tour => tour.heroImage?.trim())?.heroImage;

    expect(hero?.imageUrl?.trim().length).toBeGreaterThan(0);
    expect(cardImage?.trim().length).toBeGreaterThan(0);
  });
});
