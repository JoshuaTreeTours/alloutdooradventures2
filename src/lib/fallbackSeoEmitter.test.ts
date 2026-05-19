import { describe, expect, it } from "vitest";
import {
  applyRouteSeo,
  buildLegacyTourRouteFallbackSeo,
  isLegacyTourDetailPath,
} from "./fallbackSeoEmitter";

const TEMPLATE = `<!doctype html><html><head><title>Default</title><meta name="description" content="d" /><meta property="og:title" content="d" /><meta property="og:description" content="d" /><meta property="og:url" content="d" /><meta property="og:image" content="/hero.jpg" /><meta name="twitter:title" content="d" /><meta name="twitter:description" content="d" /><meta name="twitter:image" content="/hero.jpg" /><link rel="canonical" href="https://example.com" /></head><body></body></html>`;

describe("fallbackSeoEmitter", () => {
  it("identifies legacy tour detail paths", () => {
    expect(
      isLegacyTourDetailPath(
        "/destinations/arizona/flagstaff/tours/grand-canyon-signature-tour-south-rim-with-hummer-ground-tour-f-pjx-164131"
      )
    ).toBe(true);
  });

  it("writes normalized meta and keeps image fields for valid legacy tours", () => {
    const html = applyRouteSeo(TEMPLATE, {
      title:
        "Grand Canyon South Rim Hummer Ground Tour | Flagstaff, Arizona | All Outdoor Adventures",
      description:
        "Experience the Grand Canyon South Rim with a guided Hummer ground tour from Flagstaff, Arizona. Explore scenic canyon viewpoints, desert landscapes, and one of America’s most iconic natural wonders with All Outdoor Adventures.",
      url:
        "https://www.alloutdooradventures.com/destinations/arizona/flagstaff/tours/grand-canyon-signature-tour-south-rim-with-hummer-ground-tour-f-pjx-164131",
      image: "https://cdn.filestackcontent.com/LvqjIQRrSo63cY2G0z9X",
    });

    expect(html).not.toContain("Destinations / Arizona / Flagstaff / Tours");
    expect(html).toContain("Grand Canyon South Rim Hummer Ground Tour | Flagstaff, Arizona | All Outdoor Adventures");
    expect(html).toContain('property="og:image" content="https://cdn.filestackcontent.com/LvqjIQRrSo63cY2G0z9X"');
    expect(html).toContain('name="twitter:image" content="https://cdn.filestackcontent.com/LvqjIQRrSo63cY2G0z9X"');
    expect(html).toContain('"image":"https://cdn.filestackcontent.com/LvqjIQRrSo63cY2G0z9X"');
  });

  it("builds non-home fallback SEO for unresolved Alaska tour routes", () => {
    const harding = buildLegacyTourRouteFallbackSeo({
      pathname:
        "/destinations/alaska/seward/tours/harding-icefield-trail-hike-seward-68222",
      site: "https://www.alloutdooradventures.com",
    });
    const kachemak = buildLegacyTourRouteFallbackSeo({
      pathname:
        "/destinations/alaska/homer/tours/kachemak-bay-state-park-wilderness-hiking-17390",
      site: "https://www.alloutdooradventures.com",
    });

    expect(harding?.title.toLowerCase()).not.toContain("outdoor tours, activities");
    expect(kachemak?.title.toLowerCase()).not.toContain("outdoor tours, activities");
    expect(harding?.url).toBe(
      "https://www.alloutdooradventures.com/destinations/alaska/seward/tours/harding-icefield-trail-hike-seward-68222"
    );
    expect(kachemak?.url).toBe(
      "https://www.alloutdooradventures.com/destinations/alaska/homer/tours/kachemak-bay-state-park-wilderness-hiking-17390"
    );
  });
});
