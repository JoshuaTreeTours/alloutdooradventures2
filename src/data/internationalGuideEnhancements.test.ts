import { describe, expect, it } from "vitest";

import type { GuideContent } from "./guideData";
import {
  enhanceInternationalGuide,
  INTERNATIONAL_PARAGON_GUIDE_KEYS,
} from "./internationalGuideEnhancements";

const buildGuide = (name: string): GuideContent => ({
  type: "city",
  name,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  parentName: "Test Country",
  parentSlug: "test-country",
  regionType: "country",
  intro: "Generic city introduction.",
  breadcrumbs: [],
  itineraries: [],
  bestTimeToVisit: "Generic seasonal advice.",
  whatToPack: "Generic packing advice.",
  featuredTours: [],
  thingsToDoSections: [],
  topThingsToDo: [
    {
      title: "Generic attraction",
      description: "A generic checklist item for visitors.",
    },
  ],
});

describe("international paragon guide enhancements", () => {
  it("rebuilds a flagship international guide around factual POIs", () => {
    const enhanced = enhanceInternationalGuide(
      "greece",
      "athens",
      buildGuide("Athens"),
    );

    expect(enhanced.intro).toContain("Acropolis");
    expect(enhanced.topThingsToDo?.length).toBeGreaterThanOrEqual(6);
    expect(enhanced.topThingsToDo?.map(item => item.title)).toContain(
      "Acropolis and Parthenon",
    );
    expect(enhanced.topThingsToDo?.map(item => item.title)).toContain(
      "Ancient Agora",
    );
    expect(JSON.stringify(enhanced).toLowerCase()).not.toContain(
      "generic checklist item",
    );
  });

  it("leaves unprofiled international guides unchanged", () => {
    const original = buildGuide("Example City");
    const enhanced = enhanceInternationalGuide(
      "example-country",
      "example-city",
      original,
    );

    expect(enhanced).toBe(original);
  });

  it("covers the first flagship cohort with a substantial paragon set", () => {
    expect(INTERNATIONAL_PARAGON_GUIDE_KEYS.length).toBeGreaterThanOrEqual(20);
    expect(INTERNATIONAL_PARAGON_GUIDE_KEYS).toContain("france/paris");
    expect(INTERNATIONAL_PARAGON_GUIDE_KEYS).toContain("united-kingdom/london");
    expect(INTERNATIONAL_PARAGON_GUIDE_KEYS).toContain("italy/rome");
    expect(INTERNATIONAL_PARAGON_GUIDE_KEYS).toContain("germany/munich");
    expect(INTERNATIONAL_PARAGON_GUIDE_KEYS).toContain("iceland/reykjavik");
  });
});
