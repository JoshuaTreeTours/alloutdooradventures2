import { describe, expect, it } from "vitest";
import { buildLegacyTourRouteSeo } from "./legacyRouteSeo";
import { buildTourMeta } from "./tourMeta";
import { applyRouteSeo } from "./fallbackSeoEmitter";

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
            '<div data-state="{&quot;image_url&quot;:&quot;https:\\/\\/cdn.filestackcontent.com\\/aZUPC7t8QGa8BCbOn48Y&quot;}"><img data-flickity-lazyload="https://cdn.filestackcontent.com/aZUPC7t8QGa8BCbOn48Y" /></div>',
        } as any,
      ],
    });

    expect(seo?.image).toBe("https://cdn.filestackcontent.com/aZUPC7t8QGa8BCbOn48Y");

    const html = applyRouteSeo(
      '<!doctype html><html><head><title>Default</title><meta name="description" content="d" /><meta property="og:title" content="d" /><meta property="og:description" content="d" /><meta property="og:url" content="d" /><meta property="og:image" content="/hero.jpg" /><meta name="twitter:title" content="d" /><meta name="twitter:description" content="d" /><meta name="twitter:image" content="/hero.jpg" /><link rel="canonical" href="https://example.com" /></head><body></body></html>',
      seo as any
    );

    expect(html).toContain('property="og:image" content="https://cdn.filestackcontent.com/aZUPC7t8QGa8BCbOn48Y"');
    expect(html).toContain('name="twitter:image" content="https://cdn.filestackcontent.com/aZUPC7t8QGa8BCbOn48Y"');
    expect(html).toContain('"image":"https://cdn.filestackcontent.com/aZUPC7t8QGa8BCbOn48Y"');
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

  it("uses card/feed image as canonical source across both legacy route families", () => {
    const tours = [
      {
        slug: "coastal-cruise-azure-seas-4241",
        title: "Coastal Cruise Azure Seas",
        destination: { stateSlug: "california", citySlug: "santa-barbara", city: "Santa Barbara", state: "California" },
        heroImage: "/hero.jpg",
        primaryImageUrl: "https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS",
        galleryImages: ["https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS"],
      },
    ] as any[];
    const destinationSeo = buildLegacyTourRouteSeo({
      pathname: "/destinations/california/santa-barbara/tours/coastal-cruise-azure-seas-4241",
      site: "https://www.alloutdooradventures.com",
      buildTourMetaFn: buildTourMeta,
      tours,
    });
    const oldSeo = buildLegacyTourRouteSeo({
      pathname: "/tours/california/santa-barbara/coastal-cruise-azure-seas-4241",
      site: "https://www.alloutdooradventures.com",
      buildTourMetaFn: buildTourMeta,
      tours,
    });

    expect(destinationSeo?.image).toBe("https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS");
    expect(oldSeo?.image).toBe("https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS");

    const html = applyRouteSeo(
      '<!doctype html><html><head><title>Default</title><meta name="description" content="d" /><meta property="og:title" content="d" /><meta property="og:description" content="d" /><meta property="og:url" content="d" /><meta property="og:image" content="/hero.jpg" /><meta name="twitter:title" content="d" /><meta name="twitter:description" content="d" /><meta name="twitter:image" content="/hero.jpg" /><link rel="canonical" href="https://example.com" /></head><body></body></html>',
      destinationSeo as any
    );
    expect(html).toContain('property="og:image" content="https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS"');
    expect(html).toContain('name="twitter:image" content="https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS"');
    expect(html).toContain('"image":"https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS"');
  });
});
