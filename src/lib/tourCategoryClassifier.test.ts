import { describe, expect, it } from "vitest";
import { classifyTourCategories } from "./tourCategoryClassifier";

const slugsFor = (input: Parameters<typeof classifyTourCategories>[0]) =>
  classifyTourCategories(input).matchedCategorySlugs;

describe("classifyTourCategories", () => {
  it("classifies Jet Ski as Water Sports", () => {
    expect(slugsFor({ title: "Jet Ski Adventure" })).toEqual(["water-sports"]);
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
