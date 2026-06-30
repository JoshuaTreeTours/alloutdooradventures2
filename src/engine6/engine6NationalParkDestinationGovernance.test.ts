import { describe, expect, it } from "vitest";

import {
  inferEngine6NationalParkExperienceProfile,
  isPrimaryNationalParkHikingProduct,
} from "./engine6NationalParkDestinationGovernance";

describe("Engine6 national park destination governance", () => {
  it("classifies mixed iconics/wildlife private tours as park tours rather than hikes", () => {
    expect(
      isPrimaryNationalParkHikingProduct({
        title:
          "Private Yellowstone Tour: ICONIC Sites, Wildlife, Family Friendly Hikes + lunch",
        categoryLabel: "Wildlife",
      })
    ).toBe(false);
  });

  it("maps product types to nuanced national park profiles", () => {
    expect(
      inferEngine6NationalParkExperienceProfile({
        title: "Private Tour of Yellowstone Lower Loop",
        categoryLabel: "Sightseeing & City Tours",
        overviewText: "Old Faithful and Grand Prismatic Spring",
        itineraryTitles: ["Old Faithful", "Grand Prismatic Spring"],
      })
    ).toBe("lower-loop-scenic");

    expect(
      inferEngine6NationalParkExperienceProfile({
        title: "Private Yellowstone Wolf Watching & Wildlife Safari + lunch",
        categoryLabel: "Wildlife",
        overviewText: "Lamar Valley wolf watching",
        itineraryTitles: ["Lamar Valley", "Hayden Valley"],
      })
    ).toBe("wildlife-safari");

    expect(
      inferEngine6NationalParkExperienceProfile({
        title: "6-Mile Geyser Hiking Tour in Yellowstone with Lunch",
        categoryLabel: "Hiking",
        overviewText: "Upper Geyser Basin boardwalk and trails",
        itineraryTitles: ["Upper Geyser Basin", "Old Faithful"],
      })
    ).toBe("geothermal-sightseeing");

    expect(
      inferEngine6NationalParkExperienceProfile({
        title: "Private, Bespoke Yellowstone Summer Wildlife Photo Safaris",
        categoryLabel: "Wildlife",
        overviewText: "Professional photographer guide",
        itineraryTitles: ["Lamar Valley", "Hayden Valley"],
      })
    ).toBe("photo-safari");
  });
});
