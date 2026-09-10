import { describe, expect, it } from "vitest";

import type { GuideContent } from "./guideData";
import {
  deepenInternationalPoiNarrative,
  enhanceInternationalGuidePhase2,
  INTERNATIONAL_PARAGON_PHASE2_GUIDE_KEYS,
} from "./internationalGuidePhase2";

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

describe("international guide Phase 2", () => {
  it("deepens short POI copy into a four-sentence guide narrative", () => {
    const description = deepenInternationalPoiNarrative(
      "Berlin",
      "Brandenburg Gate",
      "Brandenburg Gate is a neoclassical monument in central Berlin. It stands at Pariser Platz near Tiergarten. The gate became an enduring symbol of German reunification.",
    );

    expect(countSentences(description)).toBeGreaterThanOrEqual(4);
    expect(description.length).toBeGreaterThanOrEqual(340);
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
      expect(countSentences(poi.description)).toBeGreaterThanOrEqual(4);
      expect(poi.description.length).toBeGreaterThanOrEqual(340);
      expect(poi.description.toLowerCase()).not.toContain("generic checklist item");
      expect(poi.description.toLowerCase()).not.toContain("quick way to add variety");
    }
  });

  it("keeps the same flagship cohort under Phase 2 governance", () => {
    expect(INTERNATIONAL_PARAGON_PHASE2_GUIDE_KEYS).toContain("france/paris");
    expect(INTERNATIONAL_PARAGON_PHASE2_GUIDE_KEYS).toContain("germany/berlin");
    expect(INTERNATIONAL_PARAGON_PHASE2_GUIDE_KEYS).toContain("germany/munich");
    expect(INTERNATIONAL_PARAGON_PHASE2_GUIDE_KEYS.length).toBeGreaterThanOrEqual(20);
  });
});
