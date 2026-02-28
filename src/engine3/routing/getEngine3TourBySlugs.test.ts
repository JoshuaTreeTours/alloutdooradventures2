import { describe, expect, it } from "vitest";

import { getEngine3TourBySlugs } from "./getEngine3TourBySlugs";

const LOCKED_HERO_URL =
  "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1";

describe("getEngine3TourBySlugs", () => {
  it("returns Engine3 6740JTREE with hero image equal to locked primary image", () => {
    const tour = getEngine3TourBySlugs(
      "california",
      "palm-springs",
      "joshua-tree-hummer-adventure-from-palm-desert-6740jtree"
    );

    expect(tour?.id).toBe("6740JTREE");
    expect(tour?.images.hero).toBe(LOCKED_HERO_URL);
    expect(tour?.seo.ogImage).toBe(LOCKED_HERO_URL);
  });

  it("ensures 2335P1 has non-empty hero and a secondary gallery fallback", () => {
    const tour = getEngine3TourBySlugs(
      "california",
      "palm-springs",
      "san-andreas-fault-jeep-tour-from-palm-springs-2335p1"
    );

    expect(tour?.id).toBe("2335P1");
    expect(tour?.images.hero).toBeTruthy();
    expect(tour?.images.gallery?.length).toBeGreaterThanOrEqual(1);
  });

});
