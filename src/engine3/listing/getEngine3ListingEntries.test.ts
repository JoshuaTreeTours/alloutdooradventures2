import { describe, expect, it } from "vitest";

import { getEngine3ListingEntries } from "./getEngine3ListingEntries";

const LOCKED =
  "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1";

describe("getEngine3ListingEntries", () => {
  it("includes 6740JTREE for Palm Springs with canonical slug and locked image", () => {
    const entries = getEngine3ListingEntries("california", "palm-springs");

    const target = entries.find(
      entry =>
        entry.tour.title === "Joshua Tree Hummer Adventure from Palm Desert"
    );

    expect(target).toBeTruthy();
    expect(target?.href).toBe(
      "/destinations/california/palm-springs/tours/joshua-tree-hummer-adventure-from-palm-desert-6740jtree"
    );
    expect(target?.tour.bookingUrl).toBe(
      "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Hummer-Adventure-from-Palm-Desert/d648-6740JTREE"
    );
    expect(target?.tour.heroImage).toBe(LOCKED);
  });
});
