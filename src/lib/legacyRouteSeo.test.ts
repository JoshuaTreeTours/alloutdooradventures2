import { describe, expect, it } from "vitest";
import { buildLegacyTourRouteSeo } from "./legacyRouteSeo";
import { buildTourMeta } from "./tourMeta";

const pathname =
  "/destinations/arizona/flagstaff/tours/grand-canyon-signature-tour-south-rim-with-hummer-ground-tour-f-pjx-164131";

describe("buildLegacyTourRouteSeo", () => {
  it("uses buildTourMeta output for legacy destination detail routes", () => {
    const seo = buildLegacyTourRouteSeo({
      pathname,
      site: "https://www.alloutdooradventures.com",
      buildTourMetaFn: buildTourMeta,
      tours: [
        {
          slug: "grand-canyon-signature-tour-south-rim-with-hummer-ground-tour-f-pjx-164131",
          title:
            "Destinations / Arizona / Flagstaff / Tours / Grand Canyon Signature Tour South Rim With Hummer Ground Tour F Pjx 164131",
          destination: { stateSlug: "arizona", citySlug: "flagstaff", city: "Flagstaff", state: "Arizona" },
          heroImage: "https://cdn.example.com/grand-canyon.jpg",
        } as any,
      ],
    });

    expect(seo?.title).toBe(
      "Grand Canyon South Rim Hummer Ground Tour | Flagstaff, Arizona | All Outdoor Adventures"
    );
    expect(seo?.title).not.toContain("Destinations / Arizona / Flagstaff / Tours");
    expect(seo?.description).toContain("Flagstaff, Arizona");
    expect(seo?.image).toBe("https://cdn.example.com/grand-canyon.jpg");
  });
});
