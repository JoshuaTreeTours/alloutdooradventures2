import { describe, expect, it } from "vitest";
import { buildTourMeta } from "./tourMeta";

describe("buildTourMeta", () => {
  it("normalizes legacy breadcrumb-style titles into readable SEO titles", () => {
    const meta = buildTourMeta(
      {
        slug: "grand-canyon-signature-tour-south-rim-with-hummer-ground-tour-f-pjx-164131",
        title:
          "Destinations / Arizona / Flagstaff / Tours / Grand Canyon Signature Tour South Rim With Hummer Ground Tour F Pjx 164131",
        destination: { city: "Flagstaff", state: "Arizona" },
        shortDescription: "South Rim Hummer tour with scenic viewpoints.",
      } as any,
      "/destinations/arizona/flagstaff/tours/grand-canyon-signature-tour-south-rim-with-hummer-ground-tour-f-pjx-164131"
    );

    expect(meta.title).toBe(
      "Grand Canyon South Rim Hummer Ground Tour | Flagstaff, Arizona | All Outdoor Adventures"
    );
    expect(meta.description).toBe(
      "Experience the Grand Canyon South Rim with a guided Hummer ground tour from Flagstaff, Arizona. Explore scenic canyon viewpoints, desert landscapes, and one of America’s most iconic natural wonders with All Outdoor Adventures."
    );
    expect(meta.ogTitle).toBe(meta.title);
    expect(meta.twitterTitle).toBe(meta.title);
  });

  it("keeps metadata aligned and descriptive for legacy tours", () => {
    const meta = buildTourMeta(
      {
        title: "Canyon Sunset Jeep Adventure 447234P3",
        destination: { city: "Flagstaff", state: "Arizona" },
      },
      "/tours/canyon-sunset-jeep-adventure-447234p3"
    );

    expect(meta.description).toContain("Flagstaff, Arizona");
    expect(meta.ogDescription).toBe(meta.description);
    expect(meta.twitterDescription).toBe(meta.description);
    expect(meta.description).not.toContain("Explore Destinations");
    expect(meta.description).not.toContain("guided outdoor experience based in");
    expect(meta.description).not.toContain(
      "Discover outdoor tours, activities, travel guides"
    );
  });

  it("builds cleaner international legacy titles and richer descriptions", () => {
    const meta = buildTourMeta(
      {
        title: "Rome Twilight Food Walk 998877",
        destination: {
          city: "Rome",
          state: "Italy",
          country: "Italy",
        },
        primaryCategory: "Food Tour",
        badges: { duration: "3 hours" },
        operator: "Evening Walks Co.",
        shortDescription: "Taste Roman classics while exploring historic neighborhoods.",
      } as any,
      "/destinations/italy/rome/tours/rome-twilight-food-walk-998877"
    );

    expect(meta.title).toBe("Rome Twilight Food Walk | Rome, Italy | All Outdoor Adventures");
    expect(meta.description).toMatch(
      /^(Explore|Experience|Join|Enjoy) Rome Twilight Food Walk in Rome, Italy/
    );
    expect(meta.description.length).toBeLessThanOrEqual(155);
    expect(meta.description).toContain("3 hours");
    expect(meta.description).toContain("Evening Walks Co.");
  });

  it("avoids breadcrumb-style regressions in title formatting", () => {
    const meta = buildTourMeta(
      {
        title:
          "Destinations / Wyoming / Pinedale / Tours / 3 Day Yellowstone Tour 881188",
        destination: { city: "Pinedale", state: "Wyoming" },
      },
      "/destinations/wyoming/pinedale/tours/3-day-yellowstone-tour-881188"
    );

    expect(meta.title).toBe(
      "3 Day Yellowstone Tour | Pinedale, Wyoming | All Outdoor Adventures"
    );
    expect(meta.title).not.toContain("Destinations /");
  });

  it("uses varied destination-aware phrasing across legacy tours", () => {
    const a = buildTourMeta(
      {
        id: "a",
        slug: "private-fishing-charter-1001",
        title: "Private Fishing Charter 1001",
        destination: { city: "New London", state: "Connecticut" },
        shortDescription: "Cruise local waters with a captain-led trip.",
      },
      "/destinations/connecticut/new-london/tours/private-fishing-charter-1001"
    );
    const b = buildTourMeta(
      {
        id: "bbbb",
        slug: "mountain-bike-coaching-2002",
        title: "Mountain Bike Coaching 2002",
        destination: { city: "Bethel", state: "Maine" },
        shortDescription: "Build trail skills and confidence on guided runs.",
      },
      "/destinations/maine/bethel/tours/mountain-bike-coaching-2002"
    );

    expect(a.description).not.toBe(b.description);
    expect(a.description).toContain("New London, Connecticut");
    expect(b.description).toContain("Bethel, Maine");
  });

  it("keeps engine6 routes excluded from international legacy behavior", () => {
    const meta = buildTourMeta(
      {
        engine: "engine6",
        title: "Rome Twilight Food Walk 998877",
        destination: { city: "Rome", state: "Italy", country: "Italy" },
        shortDescription: "Taste Roman classics while exploring historic neighborhoods.",
      },
      "/destinations/italy/rome/tours/rome-twilight-food-walk-998877"
    );

    expect(meta.title).toBe("Rome Twilight Food Walk | Rome, Italy | All Outdoor Adventures");
    expect(meta.description).toContain("Explore Rome Twilight Food Walk in Rome, Italy.");
    expect(meta.description).not.toContain("guided outdoor experience");
  });
});
