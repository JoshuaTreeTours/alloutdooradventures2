import { describe, expect, it } from "vitest";
import { isTopGuide } from "./isTopGuide";

describe("isTopGuide", () => {
  it("returns true for tier1 guides", () => {
    expect(isTopGuide({ tier: "tier1", slug: "guides/us/california/los-angeles" })).toBe(true);
  });

  it("returns true for image-heavy guides", () => {
    expect(
      isTopGuide({
        tier: "tier2",
        slug: "guides/us/hawaii/hilo",
        hero: { image: "https://cdn.example.com/hilo.jpg", alt: "", headline: "", subheadline: "" },
        thingsToDo: [],
      })
    ).toBe(true);
  });

  it("returns false for non-top non-image tier2 guides", () => {
    expect(
      isTopGuide({
        tier: "tier2",
        slug: "guides/us/oregon/salem",
        hero: { image: "", alt: "", headline: "", subheadline: "" },
        thingsToDo: [{ title: "Riverfront", description: "Desc" }],
      })
    ).toBe(false);
  });
});
