import { describe, expect, it } from "vitest";

import type { Tour } from "../data/tours.types";
import {
  buildPalmSpringsTourContent,
  isPalmSpringsTour,
} from "./palmSpringsFareHarborPilot";

const tour: Tour = {
  id: "1",
  slug: "sample",
  title: "Palm Springs Desert Jeep Tour",
  destination: {
    state: "California",
    stateSlug: "california",
    city: "Palm Springs",
    citySlug: "palm-springs",
  },
  heroImage: "/hero.jpg",
  badges: { duration: "3 hours" },
  activitySlugs: ["detours"],
  bookingProvider: "fareharbor",
  bookingUrl: "https://fareharbor.com/embeds/book/red-jeep/items/34897/",
  longDescription: "Explore canyons and viewpoints with a local guide.",
};

describe("palmSpringsFareHarborPilot", () => {
  it("detects Palm Springs tours", () => {
    expect(isPalmSpringsTour(tour)).toBe(true);
  });

  it("builds rewritten content with safe defaults", () => {
    const content = buildPalmSpringsTourContent(tour, "$149", {
      description:
        "Ride through Palm Springs canyons with a local guide and enjoy desert geology stops.",
      meetingLocation: "Downtown Palm Springs",
      pickupDetails: "Hotel pickup is available in select zones.",
      duration: "3 hours",
    });

    expect(content.whatYoullExperience).not.toContain("Book now");
    expect(content.quickFacts.location).toBe("Downtown Palm Springs");
    expect(content.highlights.length).toBeGreaterThan(0);
  });
});
