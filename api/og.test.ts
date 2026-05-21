import { describe, expect, it } from "vitest";
import { getStaticOgMeta } from "./og";

const ORIGIN = "https://www.alloutdooradventures.com";

describe("legacy wrapper SEO scoped repairs", () => {
  it("uses route-specific image/meta for Santa Barbara slug", () => {
    const meta = getStaticOgMeta(
      "/destinations/california/santa-barbara/tours/coastal-cruise-azure-seas-4241",
      ORIGIN
    );
    expect(meta).not.toBeNull();
    expect(meta?.image).toBeTruthy();
    expect(meta?.image).not.toContain("/hero.jpg");
    expect(meta?.canonical).toBe(
      `${ORIGIN}/destinations/california/santa-barbara/tours/coastal-cruise-azure-seas-4241`
    );
    expect(meta?.title).toContain("Santa Barbara");
  });

  it("normalizes united-states legacy path canonical to state/city canonical", () => {
    const meta = getStaticOgMeta(
      "/destinations/united-states/oregon/portland/tours/half-day-gorge-waterfalls-tour-5235",
      ORIGIN
    );
    expect(meta).not.toBeNull();
    expect(meta?.canonical).toBe(
      `${ORIGIN}/destinations/oregon/portland/tours/half-day-gorge-waterfalls-tour-5235`
    );
    expect(meta?.image).toBeTruthy();
    expect(meta?.image).not.toContain("/hero.jpg");
  });

  it("supports legacy /tours/state/city/slug routes and yields specific canonical/image", () => {
    const meta = getStaticOgMeta(
      "/tours/arizona/flagstaff/grand-canyon-skywalk-adventure-tour-west-rim-f-adv-164139",
      ORIGIN
    );
    expect(meta).not.toBeNull();
    expect(meta?.canonical).toBe(
      `${ORIGIN}/destinations/arizona/flagstaff/tours/grand-canyon-skywalk-adventure-tour-west-rim-f-adv-164139`
    );
    expect(meta?.image).toBeTruthy();
    expect(meta?.title).toContain("Flagstaff");
  });

  it("covers additional scoped regression examples", () => {
    const examples = [
      "/destinations/california/santa-barbara/tours/full-day-island-cruise-620790",
      "/destinations/california/santa-barbara/tours/santa-barbara-harbor-and-waterfront-tour-449817",
      "/destinations/oregon/portland/tours/mt-hood-winter-wonderland-snowshoe-adventure-685976",
    ];

    for (const path of examples) {
      const meta = getStaticOgMeta(path, ORIGIN);
      expect(meta).not.toBeNull();
      expect(meta?.image).toBeTruthy();
      expect(meta?.image).not.toContain("/hero.jpg");
      expect(meta?.canonical).toContain("/destinations/");
    }
  });
});
