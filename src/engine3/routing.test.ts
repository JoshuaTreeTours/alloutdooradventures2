import { describe, expect, it } from "vitest";

import { getEngine3TourBySlugs, resolveEngine3Route } from "./routing";

const LOCKED_HERO_URL =
  "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1";

describe("getEngine3TourBySlugs", () => {
  it("resolves Engine3 routing exports for SSR", () => {
    expect(typeof resolveEngine3Route).toBe("function");
  });

  it("returns Engine3 6740JTREE with hero image equal to locked primary image", () => {
    const tour = getEngine3TourBySlugs(
      "california",
      "palm-springs",
      "joshua-tree-hummer-adventure-from-palm-desert-6740jtree"
    );

    expect(tour?.id).toBe("6740JTREE");
    expect(tour?.images.hero).toBe(LOCKED_HERO_URL);
    expect(tour?.seo.ogImage).toBe(LOCKED_HERO_URL);
    expect(tour?.bookingUrl).toContain("pid=P00290915");
    expect(tour?.bookingUrl).toContain("mcid=42383");
    expect(tour?.bookingUrl).toContain("medium=link");
  });


  it("resolves 6740P7 by product-code slug and preserves API hero + affiliate URL", () => {
    const tour = getEngine3TourBySlugs(
      "california",
      "palm-springs",
      "joshua-tree-national-park-scenic-tour-6740p7"
    );

    expect(tour?.id).toBe("6740P7");
    expect(tour?.name).toBe("Joshua Tree National Park Scenic Tour");
    expect(tour?.images.hero).toBeTruthy();
    expect(tour?.seo.ogImage).toBe(tour?.images.hero);
    expect(tour?.bookingUrl).toContain("/d648-6740P7");
    expect(tour?.bookingUrl).toContain("pid=P00290915");
    expect(tour?.bookingUrl).toContain("mcid=42383");
    expect(tour?.bookingUrl).toContain("medium=link");
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

  it("returns 3351P15 with a non-empty hero image", () => {
    const tour = getEngine3TourBySlugs(
      "california",
      "palm-springs",
      "palm-springs-indian-canyons-bike-and-hike-3351p15"
    );

    expect(tour?.id).toBe("3351P15");
    expect(tour?.images.hero).toBeTruthy();
    expect(tour?.images.gallery?.length).toBeGreaterThanOrEqual(1);
  });
});
