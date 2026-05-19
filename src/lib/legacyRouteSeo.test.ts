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

  it("uses route-specific image for Santa Barbara legacy route and never falls back to /hero.jpg", () => {
    const seo = buildLegacyTourRouteSeo({
      pathname:
        "/destinations/california/santa-barbara/tours/coastal-cruise-and-sunset-tour-620777",
      site: "https://www.alloutdooradventures.com",
      buildTourMetaFn: buildTourMeta,
      tours: [
        {
          slug: "coastal-cruise-and-sunset-tour-620777",
          title: "Coastal Cruise & Sunset Tour",
          destination: { stateSlug: "california", citySlug: "santa-barbara", city: "Santa Barbara", state: "California" },
          heroImage: "/hero.jpg",
          galleryImages: ["https://cdn.filestackcontent.com/aZUPC7t8QGa8BCbOn48Y"],
          fareHarborHtml:
            '<div class="slide" style="background-image:url(https://cdn.filestackcontent.com/aZUPC7t8QGa8BCbOn48Y)"></div>',
        } as any,
      ],
    });

    expect(seo?.image).toBe("https://cdn.filestackcontent.com/aZUPC7t8QGa8BCbOn48Y");
  });

  it("extracts first visible image from legacy markup variants", () => {
    const seo = buildLegacyTourRouteSeo({
      pathname,
      site: "https://www.alloutdooradventures.com",
      buildTourMetaFn: buildTourMeta,
      tours: [
        {
          slug: "grand-canyon-signature-tour-south-rim-with-hummer-ground-tour-f-pjx-164131",
          title: "Grand Canyon Signature Tour",
          destination: { stateSlug: "arizona", citySlug: "flagstaff", city: "Flagstaff", state: "Arizona" },
          heroImage: "/hero.jpg",
          embedHtml:
            '<img data-src="https://cdn.filestackcontent.com/LvqjIQRrSo63cY2G0z9X" alt="hero" />',
        } as any,
      ],
    });

    expect(seo?.image).toBe("https://cdn.filestackcontent.com/LvqjIQRrSo63cY2G0z9X");
  });
});
