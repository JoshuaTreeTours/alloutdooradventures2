import { describe, expect, it } from "vitest";

import type { GuideContent } from "./guideData";
import {
  enhanceInternationalGuidePhase3,
  getInternationalPhase3ProfileKey,
  INTERNATIONAL_PARAGON_PHASE3_GUIDE_KEYS,
  INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS,
} from "./internationalGuidePhase3";
import { INTERNATIONAL_PARAGON_PHASE2_GUIDE_KEYS } from "./internationalGuidePhase2";

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

const expectParagonPoiQuality = (description: string) => {
  expect(countSentences(description)).toBeGreaterThanOrEqual(4);
  expect(description.length).toBeGreaterThanOrEqual(340);
  expect(description.toLowerCase()).not.toContain("generic checklist item");
  expect(description.toLowerCase()).not.toContain("quick way to add variety");
  expect(description.toLowerCase()).not.toContain("easy change of scenery");
  expect(description.toLowerCase()).not.toContain(
    "recognized destination connected to tours",
  );
};

describe("international guide Phase 3", () => {
  it("adds the complete audited Phase 3 cohort", () => {
    expect(INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS).toHaveLength(68);
    expect(INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS).toContain(
      "australia/port-douglas",
    );
    expect(INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS).toContain("australia/cairns");
    expect(INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS).toContain(
      "australia/melbourne",
    );
    expect(INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS).toContain("thailand/bangkok");
    expect(INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS).toContain(
      "singapore/singapore",
    );
    expect(INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS).toContain("indonesia/bali");
    expect(INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS).toContain("canada/banff");
    expect(INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS).toContain("canada/vancouver");
    expect(INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS).toContain("germany/hamburg");
    expect(INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS).toContain("italy/manarola");
    expect(INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS).toContain("norway/jostedal");
    expect(INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS).toContain("spain/granada");
    expect(INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS).toContain(
      "united-kingdom/glasgow",
    );
    expect(INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS).toContain(
      "mexico/mexico-city",
    );
    expect(INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS).toContain(
      "mexico/puerto-vallarta",
    );
    expect(INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS).toContain(
      "mexico/cabo-san-lucas",
    );
    expect(INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS).toContain("peru/cusco");
    expect(INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS).toContain("peru/lima");
    expect(INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS).toContain(
      "brazil/rio-de-janeiro",
    );
  });

  it("retains every Phase 2 paragon under Phase 3 governance", () => {
    for (const key of INTERNATIONAL_PARAGON_PHASE2_GUIDE_KEYS) {
      expect(INTERNATIONAL_PARAGON_PHASE3_GUIDE_KEYS).toContain(key);
    }
  });

  it("canonicalizes the legacy Mexico City guide slug into the new profile", () => {
    expect(
      getInternationalPhase3ProfileKey("mexico", "ciudad-de-mexico"),
    ).toBe("mexico/mexico-city");

    const guide = enhanceInternationalGuidePhase3(
      "mexico",
      "ciudad-de-mexico",
      baseGuide("Mexico City"),
    );

    expect(guide.intro).toContain("Basin of Mexico");
    expect(guide.topThingsToDo?.some(poi => poi.title === "Templo Mayor")).toBe(
      true,
    );
  });

  it("enforces six unique factual POIs and Paragon narrative depth everywhere", () => {
    for (const key of INTERNATIONAL_PHASE3_ONLY_GUIDE_KEYS) {
      const [countrySlug, citySlug] = key.split("/");
      const cityName = titleCaseSlug(citySlug);
      const guide = enhanceInternationalGuidePhase3(
        countrySlug,
        citySlug,
        baseGuide(cityName),
      );

      expect(guide.intro, `${key} should replace the base introduction`).not.toBe(
        "Base intro.",
      );
      expect(countSentences(guide.intro)).toBeGreaterThanOrEqual(2);
      expect(
        guide.topThingsToDo?.length,
        `${key} should have at least six asserted POIs`,
      ).toBeGreaterThanOrEqual(6);
      expect(guide.thingsToDoSections).toHaveLength(2);
      expect(guide.bestTimeToVisit).not.toBe("Base season.");
      expect(guide.whatToPack).not.toBe("Base packing.");

      const titles = new Set<string>();
      for (const poi of guide.topThingsToDo ?? []) {
        expectParagonPoiQuality(poi.description);
        const normalized = poi.title.toLowerCase();
        expect(titles.has(normalized), `${key}: duplicate ${poi.title}`).toBe(
          false,
        );
        titles.add(normalized);
      }
    }
  });

  it("leaves an unrelated, unprofiled international guide alone", () => {
    const base = baseGuide("Tokyo");
    const result = enhanceInternationalGuidePhase3("japan", "tokyo", base);

    expect(result).toEqual(base);
  });
});