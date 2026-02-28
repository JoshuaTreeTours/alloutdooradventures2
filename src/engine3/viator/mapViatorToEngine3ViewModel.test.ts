import { describe, expect, it } from "vitest";

import type { Engine2Tour } from "../../engine2/data/loadEngine2";
import { generateAuthoritativeDescription } from "../utils/generateAuthoritativeDescription";
import { mapViatorToEngine3ViewModel } from "./mapViatorToEngine3ViewModel";
import { ENGINE3_VIATOR_OVERRIDES } from "./engine3ViatorOverrides";

const baseTour: Engine2Tour = {
  id: "6740JTREE",
  engine: "engine3",
  bookingProvider: "viator",
  bookingUrl: "https://www.viator.com/tours/example",
  sourceCitySlug: "palm-springs",
  slug: "joshua-tree-hummer-adventure-from-palm-desert-6740jtree",
  name: "Joshua Tree Hummer Adventure from Palm Desert",
  provider: {
    name: "Desert Adventures",
    shortName: "desert-adventures",
  },
  geo: {
    country: "United States",
    region: "California",
    city: "Palm Springs",
    lat: null,
    lng: null,
  },
  seo: {
    title: "Joshua Tree Hummer Adventure",
    description: "",
    canonicalPath:
      "/destinations/california/palm-springs/tours/joshua-tree-hummer-adventure-from-palm-desert-6740jtree",
    ogImage: "",
  },
  content: {
    experienceText: "",
    highlights: ["Scenic desert views"],
    duration: "3 hours",
  },
  images: {
    hero: null,
    gallery: [],
  },
  booking: {
    bookingUrl: "https://www.viator.com/tours/example",
  },
};

describe("generateAuthoritativeDescription", () => {
  it("generates a deterministic description from source highlights within target range", () => {
    const description = generateAuthoritativeDescription({
      title: "Joshua Tree Hummer Adventure from Palm Desert",
      city: "Palm Springs",
      state: "California",
      country: "United States",
      durationText: "3 hours",
      highlights: [
        "Travel through desert washes and canyons",
        "See landmarks in Joshua Tree National Park",
        "Learn local geology and natural history",
        "Ride in an open-air Hummer vehicle",
      ],
      inclusions: ["Guide", "Bottled water"],
      meetingPointText: "Palm Desert meeting location",
      operatorName: "Desert Adventures",
    });

    const words = description.split(/\s+/).filter(Boolean).length;
    expect(description.length).toBeGreaterThan(0);
    expect(words).toBeGreaterThanOrEqual(90);
    expect(words).toBeLessThanOrEqual(130);
  });

  it("returns a safe factual sentence when source fields are sparse", () => {
    const viewModel = mapViatorToEngine3ViewModel(baseTour, {
      sourceUrl: "https://www.viator.com/tours/example",
      productCode: "6740JTREE",
      title: "Joshua Tree Hummer Adventure from Palm Desert",
      duration: "3 hours",
    });

    expect(viewModel.description).toContain(
      "Joshua Tree Hummer Adventure from Palm Desert"
    );
    expect(viewModel.description).toContain("Palm Springs");
    expect(viewModel.description).toContain("3 hours");
  });
});

// This validates the override path by mutating the shared map for the test lifecycle.
describe("mapViatorToEngine3ViewModel", () => {
  it("uses override description when present for product code", () => {
    ENGINE3_VIATOR_OVERRIDES["6740JTREE"] = {
      description: "Poster child override description.",
    };

    const viewModel = mapViatorToEngine3ViewModel(baseTour, {
      sourceUrl: "https://www.viator.com/tours/example",
      productCode: "6740JTREE",
      title: "Joshua Tree Hummer Adventure from Palm Desert",
      description: "Trusted description from Viator payload.",
      duration: "3 hours",
    });

    expect(viewModel.description).toBe("Poster child override description.");
    delete ENGINE3_VIATOR_OVERRIDES["6740JTREE"];
  });

  it("uses source description from Viator payload when provided", () => {
    const viewModel = mapViatorToEngine3ViewModel(baseTour, {
      sourceUrl: "https://www.viator.com/tours/example",
      productCode: "6740JTREE",
      title: "Joshua Tree Hummer Adventure from Palm Desert",
      description: "Trusted description from Viator payload.",
      duration: "3 hours",
    });

    expect(viewModel.description).toBe(
      "Trusted description from Viator payload."
    );
  });
});
