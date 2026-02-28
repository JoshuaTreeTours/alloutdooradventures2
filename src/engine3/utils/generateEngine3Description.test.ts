import { describe, expect, it } from "vitest";

import { generateEngine3Description } from "./generateEngine3Description";

describe("generateEngine3Description", () => {
  it("returns an authoritative paragraph between 100 and 120 words", () => {
    const description = generateEngine3Description({
      title: "Joshua Tree Hummer Adventure from Palm Desert",
      duration: "3 hours",
      highlights: [
        "open-air Hummer travel through desert washes",
        "Joshua Tree National Park overlooks",
        "guide commentary on geology and desert ecology",
      ],
      shortInclusions: ["professional guide", "bottled water"],
      meetingPoint: "Palm Desert departure details shown after booking",
      city: "Palm Springs",
      region: "California",
    });

    const wordCount = description.split(/\s+/).filter(Boolean).length;
    expect(wordCount).toBeGreaterThanOrEqual(100);
    expect(wordCount).toBeLessThanOrEqual(120);
    expect(description.toLowerCase()).not.toContain("viator");
    expect(description.toLowerCase()).not.toContain("tripadvisor");
    expect(description.toLowerCase()).not.toContain("booking page");
    expect(description.toLowerCase()).not.toContain("confirmation");
    expect(description.toLowerCase()).not.toContain("checkout");
  });
});
