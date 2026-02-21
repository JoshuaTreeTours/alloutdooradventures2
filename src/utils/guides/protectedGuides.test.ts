import { describe, expect, it } from "vitest";
import { isProtectedGuide } from "./protectedGuides";

describe("protectedGuides", () => {
  it("protects tier1 guides", () => {
    expect(
      isProtectedGuide({
        tier: "tier1",
        slug: "us/california/los-angeles",
      })
    ).toBe(true);
  });

  it("protects image-embed guides", () => {
    expect(
      isProtectedGuide({
        tier: "tier2",
        slug: "us/test/city",
        hero: { image: "https://cdn.example.com/hero.jpg" },
        thingsToDo: [],
      })
    ).toBe(true);
  });

  it("does not protect plain tier2 guide without top slug", () => {
    expect(
      isProtectedGuide({
        tier: "tier2",
        slug: "us/montana/bozeman",
        hero: { image: "" },
        thingsToDo: [{ title: "A", description: "B" }],
      })
    ).toBe(false);
  });
});
