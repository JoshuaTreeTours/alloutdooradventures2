import { describe, expect, it } from "vitest";

import phoenixGuide from "../../data/guides/us/arizona/phoenix.json";
import scottsdaleGuide from "../../data/guides/us/arizona/scottsdale.json";
import type { GuidePageData } from "../loadGuide";
import {
  GENERIC_OUTDOOR_GUIDE_HERO_IMAGE,
  isValidGuideHeroImage,
  resolveGuideHeroImage,
} from "./resolveGuideHeroImage";

const asGuide = (guide: unknown) => guide as GuidePageData;

describe("resolveGuideHeroImage", () => {
  it("keeps existing valid dedicated guide hero images unchanged", () => {
    const guide = {
      ...asGuide(scottsdaleGuide),
      hero: {
        ...asGuide(scottsdaleGuide).hero,
        image: "https://cdn.filestackcontent.com/existingGuideHero",
        alt: "Existing Scottsdale guide hero",
      },
    };

    const resolved = resolveGuideHeroImage(guide);

    expect(resolved).toMatchObject({
      image: "https://cdn.filestackcontent.com/existingGuideHero",
      alt: "Existing Scottsdale guide hero",
      source: "dedicated",
    });
  });

  it("falls back from a missing guide hero to the best matching city tour image", () => {
    const resolved = resolveGuideHeroImage(asGuide(scottsdaleGuide));

    expect(resolved.source).toBe("city-tour");
    expect(resolved.image).toBe(
      "https://cdn.filestackcontent.com/yUjN0YS16yfEMZout3xA"
    );
    expect(resolved.alt).toContain("Scottsdale");
    expect(resolved.alt).toContain("Scottsdale Parks ebike");
    expect(isValidGuideHeroImage(resolved.image)).toBe(true);
  });

  it("falls back from Phoenix's missing guide hero without rendering a broken hero state", () => {
    const resolved = resolveGuideHeroImage(asGuide(phoenixGuide));

    expect(resolved.image).toBe("/images/arizona/arizona-hero.jpg");
    expect(resolved.source).toBe("state");
    expect(resolved.alt).toContain("Arizona");
    expect(resolved.image).not.toBe("");
    expect(resolved.image).not.toBe(GENERIC_OUTDOOR_GUIDE_HERO_IMAGE);
  });

  it("rejects empty, home, missing local, placeholder, and example image values", () => {
    expect(isValidGuideHeroImage("")).toBe(false);
    expect(isValidGuideHeroImage("/hero.jpg")).toBe(false);
    expect(isValidGuideHeroImage("/logo.svg")).toBe(false);
    expect(
      isValidGuideHeroImage("/images/arizona/cities/phoenix-missing.jpg")
    ).toBe(false);
    expect(
      isValidGuideHeroImage("https://cdn.example.com/placeholder.jpg")
    ).toBe(false);
  });
});
