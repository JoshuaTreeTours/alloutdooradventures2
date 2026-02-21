import { describe, expect, it } from "vitest";
import {
  MIN_LANDMARK_IMAGES,
  isImageEmbedGuide,
} from "./isImageEmbedGuide";

describe("isImageEmbedGuide", () => {
  it("returns true when guide has multiple landmark images", () => {
    const guide = {
      title: "Small City",
      country: "United States",
      state: "Oregon",
      city: "Smallville",
      slug: "guides/us/oregon/smallville",
      hero: { image: "", alt: "", headline: "", subheadline: "" },
      overview: ["Overview"],
      highlights: [],
      bestTimeToVisit: { title: "", bullets: [] },
      travelTips: [],
      tours: { stateSlug: "oregon", citySlug: "smallville" },
      seoLinks: {},
      thingsToDo: Array.from({ length: MIN_LANDMARK_IMAGES }, (_, i) => ({
        title: `Place ${i}`,
        description: "Description",
        imageUrl: `https://cdn.example.com/${i}.jpg`,
      })),
    };

    expect(isImageEmbedGuide(guide)).toBe(true);
  });

  it("returns false when image fields are absent", () => {
    const guide = {
      title: "No Image City",
      country: "United States",
      state: "Oregon",
      city: "Drytown",
      slug: "guides/us/oregon/drytown",
      hero: { image: "", alt: "", headline: "", subheadline: "" },
      overview: ["Overview"],
      highlights: [],
      bestTimeToVisit: { title: "", bullets: [] },
      travelTips: [],
      tours: { stateSlug: "oregon", citySlug: "drytown" },
      seoLinks: {},
      thingsToDo: [{ title: "Park", description: "Description" }],
    };

    expect(isImageEmbedGuide(guide)).toBe(false);
  });
});
