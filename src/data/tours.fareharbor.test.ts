import { describe, expect, it } from "vitest";

import { getTourHeroImage, getTourMetaDescriptionSource } from "./tours";
import type { Tour } from "./tours.types";

const baseTour: Tour = {
  id: "test-tour",
  slug: "test-tour-1",
  title: "Test Tour",
  destination: {
    state: "Arizona",
    stateSlug: "arizona",
    city: "Sedona",
    citySlug: "sedona",
  },
  heroImage: "https://cdn.example.com/fallback.jpg",
  badges: {},
  activitySlugs: ["hiking"],
  bookingProvider: "fareharbor",
  bookingUrl: "https://fareharbor.com/embeds/book/example/items/1/",
  longDescription: "Long description",
};

describe("FareHarbor content hard-lock helpers", () => {
  it("prefers fareharbor hero image when source is locked", () => {
    const hero = getTourHeroImage({
      ...baseTour,
      heroImageUrl: "https://cdn.filestackcontent.com/hero-lock",
      heroImageSource: "fareharbor_media",
    });

    expect(hero).toBe("https://cdn.filestackcontent.com/hero-lock");
  });

  it("returns fareharbor source description when marked", () => {
    const description = getTourMetaDescriptionSource({
      ...baseTour,
      sourceDescription: "From FareHarbor payload",
      sourceDescriptionSource: "fareharbor",
    });

    expect(description).toBe("From FareHarbor payload");
  });
});
