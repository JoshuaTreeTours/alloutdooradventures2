import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyRouteSeo } from "./fallbackSeoEmitter";
import { buildLegacyTourRouteSeo } from "./legacyRouteSeo";
import { buildBookingMeta, buildTourMeta } from "./tourMeta";

const sampleTour = {
  slug: "sample-kayak-tour-12345",
  title: "Sample Kayak Tour",
  destination: {
    stateSlug: "oregon",
    citySlug: "bend",
    city: "Bend",
    state: "Oregon",
  },
  heroImage: "https://cdn.example.com/sample.jpg",
} as any;

const bookingPath =
  "/destinations/oregon/bend/tours/sample-kayak-tour-12345/book";
const detailPath = bookingPath.replace(/\/book$/, "");

describe("legacy /book SEO controls", () => {
  it("returns noindex,nofollow robots metadata for legacy /book routes", () => {
    const seo = buildLegacyTourRouteSeo({
      pathname: bookingPath,
      site: "https://www.alloutdooradventures.com",
      tours: [sampleTour],
      buildTourMetaFn: buildTourMeta,
      buildBookingMetaFn: buildBookingMeta,
    });

    expect(seo?.url).toBe(`https://www.alloutdooradventures.com${bookingPath}`);
    expect(seo?.robots).toBe("noindex, nofollow");
    expect(seo?.googlebot).toBe("noindex, nofollow");
  });

  it("does not apply noindex,nofollow to matching legacy detail routes", () => {
    const seo = buildLegacyTourRouteSeo({
      pathname: detailPath,
      site: "https://www.alloutdooradventures.com",
      tours: [sampleTour],
      buildTourMetaFn: buildTourMeta,
      buildBookingMetaFn: buildBookingMeta,
    });

    expect(seo?.url).toBe(`https://www.alloutdooradventures.com${detailPath}`);
    expect(seo?.robots).toBe("index,follow,max-image-preview:large");
    expect(seo?.googlebot).toBe("index,follow,max-image-preview:large");
  });

  it("emits robots and googlebot noindex,nofollow tags into prerendered fallback HTML", () => {
    const html = applyRouteSeo(
      '<!doctype html><html><head><title>Default</title><meta name="description" content="d" /><meta name="robots" content="index,follow,max-image-preview:large" /><meta name="googlebot" content="index,follow,max-image-preview:large" /><link rel="canonical" href="https://example.com" /></head><body></body></html>',
      {
        title: "Sample Kayak Tour",
        description: "Book Sample Kayak Tour in Bend, Oregon.",
        url: `https://www.alloutdooradventures.com${bookingPath}`,
        robots: "noindex, nofollow",
        googlebot: "noindex, nofollow",
      }
    );

    expect(html).toContain(
      '<meta name="robots" content="noindex, nofollow" />'
    );
    expect(html).toContain(
      '<meta name="googlebot" content="noindex, nofollow" />'
    );
  });

  it("keeps generated sitemaps configured to reject /book URL emissions", () => {
    const script = readFileSync("scripts/generate-sitemap.mjs", "utf8");

    expect(script).toContain("bookingMatches");
    expect(script).toContain("/\\/book\\/?$/i.test(normalized)");
  });

  it("marks visible legacy product /book CTA links as nofollow", () => {
    const detailSources = [
      "src/pages/destinations/states/tours/CityTourDetailRoute.tsx",
      "src/pages/tours/FlagstaffTourDetailRoute.tsx",
      "src/pages/tours/TourDetail.tsx",
    ].map(path => readFileSync(path, "utf8"));

    for (const source of detailSources) {
      const bookingLinkCount = (
        source.match(/<Link href=\{bookingUrl\}>/g) ?? []
      ).length;
      const nofollowBookingLinkCount = (
        source.match(/<Link href=\{bookingUrl\}>\s*<a\s+rel="nofollow"/g) ?? []
      ).length;

      expect(nofollowBookingLinkCount).toBe(bookingLinkCount);
      expect(bookingLinkCount).toBeGreaterThan(0);
    }
  });
});
