import { describe, expect, it } from "vitest";

import { isLegacyAfricaSuppressedFromPublicDiscovery } from "./tours";
import type { Tour } from "./tours.types";

const baseTour: Tour = {
  id: "test-id",
  slug: "test-slug",
  title: "Test Tour",
  destination: {
    country: "United States",
    state: "Alaska",
    stateSlug: "alaska",
    city: "Anchorage",
    citySlug: "anchorage",
  },
  heroImage: "https://example.com/hero.jpg",
  badges: {},
  activitySlugs: ["adventure"],
  bookingProvider: "fareharbor",
  bookingUrl: "https://fareharbor.com/embeds/book/demo/items/123/",
  longDescription: "desc",
};

describe("legacy/non-Engine6 Africa suppression", () => {
  it("suppresses only legacy/engine1/engine2/earlyEngine Kenya-Tanzania-Ethiopia-Madagascar or Africa region tours", () => {
    expect(
      isLegacyAfricaSuppressedFromPublicDiscovery({
        ...baseTour,
        engine: "engine1",
        destination: { ...baseTour.destination, country: "Kenya" },
      })
    ).toBe(true);

    expect(
      isLegacyAfricaSuppressedFromPublicDiscovery({
        ...baseTour,
        engine: "engine2",
        destination: { ...baseTour.destination, country: "Tanzania" },
      })
    ).toBe(true);

    expect(
      isLegacyAfricaSuppressedFromPublicDiscovery({
        ...baseTour,
        destination: { ...baseTour.destination, stateSlug: "africa" },
      })
    ).toBe(true);

    expect(
      isLegacyAfricaSuppressedFromPublicDiscovery({
        ...baseTour,
        engine: "engine6",
        destination: { ...baseTour.destination, country: "Kenya" },
      })
    ).toBe(false);

    expect(
      isLegacyAfricaSuppressedFromPublicDiscovery({
        ...baseTour,
        engine: "engine6",
        destination: { ...baseTour.destination, stateSlug: "africa" },
      })
    ).toBe(false);
  });
});
