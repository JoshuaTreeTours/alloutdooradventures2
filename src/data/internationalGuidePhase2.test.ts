import { describe, expect, it } from "vitest";

import type { GuideContent } from "./guideData";
import {
  deepenInternationalPoiNarrative,
  enhanceInternationalGuidePhase2,
  INTERNATIONAL_PARAGON_PHASE2_GUIDE_KEYS,
} from "./internationalGuidePhase2";

const titleCaseSlug = (value: string) =>
  value
    .split("-")
    .map(part => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
    .join(" ");

const baseGuide = (name: string): GuideContent => ({
  type: "city",
  name,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  parentName: "Test Country",
  parentSlug: "test-country",
  regionType: "country",
  intro: "Base intro.",
  breadcrumbs: [],
  itineraries: [],
  bestTimeToVisit: "Base season.",
  whatToPack: "Base packing.",
  featuredTours: [],
  topThingsToDo: [],
  thingsToDoSections: [],
});

const countSentences = (value: string) =>
  (value.match(/[.!?](?:\s|$)/g) ?? []).length;

const expectPhase2PoiQuality = (description: string) => {
  expect(countSentences(description)).toBeGreaterThanOrEqual(4);
  expect(description.length).toBeGreaterThanOrEqual(340);
  expect(description.toLowerCase()).not.toContain("generic checklist item");
  expect(description.toLowerCase()).not.toContain("quick way to add variety");
  expect(description.toLowerCase()).not.toContain("easy change of scenery");
};

describe("international guide Phase 2", () => {
  it("deepens short POI copy into a four-sentence guide narrative", () => {
    const description = deepenInternationalPoiNarrative(
      "Berlin",
      "Brandenburg Gate",
      "Brandenburg Gate is a neoclassical monument in central Berlin. It stands at Pariser Platz near Tiergarten. The gate became an enduring symbol of German reunification.",
    );

    expectPhase2PoiQuality(description);
    expect(description).toContain("Brandenburg Gate");
  });

  it("applies Phase 1 factual POIs and then Phase 2 narrative depth", () => {
    const berlin = enhanceInternationalGuidePhase2(
      "germany",
      "berlin",
      baseGuide("Berlin"),
    );

    expect(berlin.topThingsToDo?.length).toBeGreaterThanOrEqual(6);
    for (const poi of berlin.topThingsToDo ?? []) {
      expectPhase2PoiQuality(poi.description);
    }
  });

  it("keeps the same flagship cohort under Phase 2 governance", () => {
    expect(INTERNATIONAL_PARAGON_PHASE2_GUIDE_KEYS).toContain("france/paris");
    expect(INTERNATIONAL_PARAGON_PHASE2_GUIDE_KEYS).toContain("germany/berlin");
    expect(INTERNATIONAL_PARAGON_PHASE2_GUIDE_KEYS).toContain("germany/munich");
    expect(INTERNATIONAL_PARAGON_PHASE2_GUIDE_KEYS.length).toBeGreaterThanOrEqual(20);
  });

  it("validates substantive POI depth across every Phase 2 profile", () => {
    for (const key of INTERNATIONAL_PARAGON_PHASE2_GUIDE_KEYS) {
      const [countrySlug, citySlug] = key.split("/");
      const cityName = titleCaseSlug(citySlug);
      const guide = enhanceInternationalGuidePhase2(
        countrySlug,
        citySlug,
        baseGuide(cityName),
      );

      expect(
        guide.topThingsToDo?.length,
        `${key} should keep at least six factual POIs`,
      ).toBeGreaterThanOrEqual(6);

      const titles = new Set<string>();
      for (const poi of guide.topThingsToDo ?? []) {
        expectPhase2PoiQuality(poi.description);
        expect(titles.has(poi.title.toLowerCase()), `${key}: ${poi.title}`).toBe(
          false,
        );
        titles.add(poi.title.toLowerCase());
      }
    }
  });
});
