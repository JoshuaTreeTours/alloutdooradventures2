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

  it("keeps metadata aligned and descriptive", () => {
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

    expect(meta.title).toBe("Rome Twilight Food Walk | Rome, Italy Tour");
    expect(meta.description).toContain("Discover Rome Twilight Food Walk in Rome, Italy");
    expect(meta.description.length).toBeLessThanOrEqual(160);
    expect(meta.description).toContain("3 hours");
    expect(meta.description).toContain("Evening Walks Co.");
  });
});
