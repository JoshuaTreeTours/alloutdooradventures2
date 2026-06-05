import { describe, expect, it } from "vitest";
import { classifyTourCategories } from "./tourCategoryClassifier";

const slugsFor = (input: Parameters<typeof classifyTourCategories>[0]) =>
  classifyTourCategories(input).matchedCategorySlugs;

describe("classifyTourCategories", () => {
  it("classifies Jet Ski as Water Sports", () => {
    expect(slugsFor({ title: "Jet Ski Adventure" })).toEqual(["water-sports"]);
  });

  it("classifies snorkeling and underwater fish viewing as Water Sports, not Fishing", () => {
    [
      "Snorkeling with tropical fish",
      "Guided reef snorkeling",
      "Swim among colorful fish",
      "Snorkel tour",
      "Coral reef snorkeling",
      "Underwater viewing",
    ].forEach(title => {
      const slugs = slugsFor({ title, categories: ["Fishing"] });

      expect(slugs[0]).toBe("water-sports");
      expect(slugs).toContain("water-sports");
      expect(slugs).not.toContain("fishing");
    });
  });

  it("classifies Dolphin Jet Ski as Water Sports and Wildlife", () => {
    expect(slugsFor({ title: "Dolphin Jet Ski Safari" })).toEqual([
      "water-sports",
      "wildlife",
    ]);
  });

  it("classifies an e-bike wine tour as Cycling and Food & Wine", () => {
    expect(slugsFor({ title: "E-bike wine tour through vineyards" })).toEqual([
      "cycling",
      "food-wine",
    ]);
  });

  it("classifies a helicopter wildlife tour as Air Tours and Wildlife", () => {
    expect(slugsFor({ title: "Helicopter wildlife tour" })).toEqual([
      "air-tours",
      "wildlife",
    ]);
  });

  it("classifies a Jeep tour as Jeep & Off-Road", () => {
    expect(slugsFor({ title: "Jeep tour through red rock canyons" })).toEqual([
      "jeep-off-road",
    ]);
  });

  it("classifies a stargazing tour as Stargazing", () => {
    expect(slugsFor({ title: "Night sky stargazing tour" })).toEqual([
      "stargazing",
    ]);
  });

  it("classifies fishing inventory as Fishing before broader activities", () => {
    [
      "Private fishing charter",
      "Deep sea fishing adventure",
      "Deep sea fishing charter",
      "Sportfishing trip",
      "Fly fishing excursion",
      "Fly fishing guided hike",
      "Reef fishing sightseeing tour",
      "Angling boat tour",
      "Lake fishing excursion",
      "River fishing city highlights tour",
    ].forEach(title => {
      const slugs = slugsFor({ title });

      expect(slugs[0]).toBe("fishing");
      expect(slugs).toContain("fishing");
    });
  });

  it("does not classify non-fishing boat cruises or food walks as Fishing", () => {
    expect(slugsFor({ title: "Private harbor boat cruise" })).not.toContain(
      "fishing"
    );
    expect(
      slugsFor({ title: "Pizza, pasta and piazzas", categories: ["Fishing"] })
    ).not.toContain("fishing");
  });

  it("classifies urban walking experiences as Walking Tours instead of Hiking", () => {
    [
      "Historic city walking tour",
      "Ghost walk",
      "Architecture walking tour",
      "Neighborhood walking tour",
      "Street art walking tour",
      "Cultural walking tour",
      "Urban exploration walk",
    ].forEach(title => {
      const slugs = slugsFor({ title });

      expect(slugs).toContain("walking-tours");
      expect(slugs).not.toContain("hiking");
    });
  });

  it("keeps food walking tours in Food & Wine when food is primary", () => {
    expect(
      slugsFor({ title: "Food walking tour with pizza and gelato" })
    ).toEqual(["food-wine"]);
  });

  it("keeps true hiking and trail inventory in Hiking instead of Walking Tours", () => {
    [
      "National park guided hike",
      "Canyon trail trekking tour",
      "Mountain hiking trail adventure",
    ].forEach(title => {
      const slugs = slugsFor({ title });

      expect(slugs).toContain("hiking");
      expect(slugs).not.toContain("walking-tours");
    });
  });

  it("keeps bus sightseeing tours in Sightseeing & City Tours", () => {
    expect(slugsFor({ title: "Bus sightseeing tour" })).toEqual([
      "sightseeing-city-tours",
    ]);
  });

  it("classifies a generic city bus tour as Sightseeing & City Tours", () => {
    expect(slugsFor({ title: "Generic city bus tour" })).toEqual([
      "sightseeing-city-tours",
    ]);
  });

  it("keeps generic Sightseeing after more specific category matches", () => {
    expect(slugsFor({ title: "City highlights tour by bike" })).toEqual([
      "cycling",
      "sightseeing-city-tours",
    ]);
  });

  it("does not infer activities from Santa Barbara trolley route location names", () => {
    expect(
      slugsFor({
        title: "Santa Barbara Trolley Tour",
        overview:
          "See Santa Barbara highlights by trolley with local narration.",
        itinerary: [
          { title: "Stearns Wharf" },
          { title: "Andrée Clark Bird Refuge" },
          { title: "East Beach waterfront" },
        ],
      })
    ).toEqual(["sightseeing-city-tours"]);
  });

  it("uses Jeep & Off-Road as primary when off-road and trail language both appear", () => {
    expect(
      slugsFor({
        title: "Off Road Las Vegas Tour",
        overview:
          "Ride a 4x4 off-road route near Las Vegas with desert trail scenery.",
      })
    ).toEqual(["jeep-off-road"]);
  });
});
