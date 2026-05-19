import { describe, expect, it } from "vitest";
import {
  auditLegacyTourRouteImages,
  buildLegacyTourRouteSeo,
  debugLegacyTourRouteImageCandidates,
} from "./legacyRouteSeo";
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

  it("extracts Santa Barbara legacy image from escaped JSON and preserves first visible product-page candidate", () => {
    const tour = {
      slug: "coastal-adventure-449804",
      title: "Coastal Adventure",
      destination: {
        stateSlug: "california",
        citySlug: "santa-barbara",
        city: "Santa Barbara",
        state: "California",
      },
      heroImage: "/hero.jpg",
      fareHarborHtml:
        '<section><img src="/hero.jpg" /><div data-state="{&quot;image_url&quot;:&quot;https:\\/\\/cdn.filestackcontent.com\\/SB_ESCAPED_IMAGE&quot;,&quot;gallery&quot;:[{&quot;url&quot;:&quot;https:\\/\\/cdn.filestackcontent.com\\/SB_SECONDARY_IMAGE&quot;}]}" style="background-image:url(https://cdn.filestackcontent.com/SB_BACKGROUND_IMAGE)"></div></section>',
    } as any;

    const seo = buildLegacyTourRouteSeo({
      pathname:
        "/destinations/california/santa-barbara/tours/coastal-adventure-449804",
      site: "https://www.alloutdooradventures.com",
      buildTourMetaFn: buildTourMeta,
      tours: [tour],
    });

    const candidates = debugLegacyTourRouteImageCandidates(tour);

    expect(candidates.map(c => c.type)).toContain("img[src]");
    expect(candidates.map(c => c.type)).toContain("json-blobs");
    expect(candidates.map(c => c.type)).toContain("background-image");
    expect(candidates.map(c => c.type)).toContain("filestack");
    expect(seo?.image).toBe("https://cdn.filestackcontent.com/SB_ESCAPED_IMAGE");
  });

  it("applies targeted repair for coastal-cruise-azure-seas-4241 and normalizes hero/gallery/image fields", () => {
    const tour = {
      slug: "coastal-cruise-azure-seas-4241",
      title: "Coastal Cruise Azure Seas",
      destination: { stateSlug: "california", citySlug: "santa-barbara", city: "Santa Barbara", state: "California" },
      heroImage: "/hero.jpg",
      galleryImages: ["/hero.jpg"],
    } as any;

    const seo = buildLegacyTourRouteSeo({
      pathname: "/destinations/california/santa-barbara/tours/coastal-cruise-azure-seas-4241",
      site: "https://www.alloutdooradventures.com",
      buildTourMetaFn: buildTourMeta,
      tours: [tour],
    });

    expect(seo?.image).toBe("https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS");
    expect(tour.heroImage).toBe("https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS");
    expect(tour.image).toBe("https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS");
    expect(tour.galleryImages).toContain("https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS");
  });

  it("audits legacy routes for missing image and structured-image-only edge cases", () => {
    const tours = [
      {
        slug: "coastal-cruise-and-sunset-tour-620777",
        destination: { stateSlug: "california", citySlug: "santa-barbara" },
        heroImage: "/hero.jpg",

    const html = applyRouteSeo(
      '<!doctype html><html><head><title>Default</title><meta name="description" content="d" /><meta property="og:title" content="d" /><meta property="og:description" content="d" /><meta property="og:url" content="d" /><meta property="og:image" content="/hero.jpg" /><meta name="twitter:title" content="d" /><meta name="twitter:description" content="d" /><meta name="twitter:image" content="/hero.jpg" /><link rel="canonical" href="https://example.com" /></head><body></body></html>',
      seo as any
    );
    expect(html).toContain('property="og:image" content="https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS"');
    expect(html).toContain('name="twitter:image" content="https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS"');
    expect(html).toContain('"image":"https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS"');
    expect(html).not.toContain('/hero.jpg');
        fareHarborHtml:
          '<div data-state="{&quot;image_url&quot;:&quot;https:\\/\\/cdn.filestackcontent.com\\/aZUPC7t8QGa8BCbOn48Y&quot;}"></div>',
  it("traces azure seas image parity from normalized tour feed to SEO object to emitted HTML", () => {
    const tour = {
      slug: "coastal-cruise-azure-seas-4241",
      title: "Coastal Cruise Azure Seas",
      destination: { stateSlug: "california", citySlug: "santa-barbara", city: "Santa Barbara", state: "California" },
      heroImage: "/hero.jpg",
    } as any;

    const seo = buildLegacyTourRouteSeo({
      pathname: "/destinations/california/santa-barbara/tours/coastal-cruise-azure-seas-4241",
      site: "https://www.alloutdooradventures.com",
      buildTourMetaFn: buildTourMeta,
      tours: [tour],
    });

    // normalized feed object assertions
    expect(tour.heroImage).toBe("https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS");
    expect(tour.image).toBe("https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS");
    expect(tour.galleryImages).toEqual([
      "https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS",
    ]);

    // SEO object assertion
    expect(seo).toMatchObject({
      image: "https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS",
    });

    // final HTML assertions
    const html = applyRouteSeo(
      '<!doctype html><html><head><title>Default</title><meta name="description" content="d" /><meta property="og:title" content="d" /><meta property="og:description" content="d" /><meta property="og:url" content="d" /><meta property="og:image" content="/hero.jpg" /><meta name="twitter:title" content="d" /><meta name="twitter:description" content="d" /><meta name="twitter:image" content="/hero.jpg" /><link rel="canonical" href="https://example.com" /></head><body></body></html>',
      seo as any
    );
    expect(html).toContain('property="og:image" content="https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS"');
    expect(html).toContain('name="twitter:image" content="https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS"');
    expect(html).toContain('"image":"https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS"');
    expect(html).not.toContain('/hero.jpg');
  });

      },
      {
        slug: "grand-canyon-signature-tour-south-rim-with-hummer-ground-tour-f-pjx-164131",
        destination: { stateSlug: "arizona", citySlug: "flagstaff" },
        heroImage: "https://cdn.example.com/grand-canyon.jpg",
      },
      {
        slug: "joshua-tree-hike-climb-10001",
        destination: { stateSlug: "california", citySlug: "joshua-tree" },
        heroImage: "https://cdn.example.com/joshua-tree.jpg",
      },
      {
        slug: "san-francisco-sunset-tour-10002",
        destination: { stateSlug: "california", citySlug: "san-francisco" },
        heroImage: "https://cdn.example.com/sf-sunset.jpg",
      },
    ] as any;

    const report = auditLegacyTourRouteImages(tours);
    const sb = report.find(r => r.slug === "coastal-cruise-and-sunset-tour-620777");
    const gc = report.find(r => r.slug.includes("grand-canyon"));

    expect(sb?.missingResolvedImage).toBe(false);
    expect(sb?.jsonMissingImageFields).toBe(true);
    expect(sb?.candidateTypes).toContain("json-blobs");
    expect(gc?.missingResolvedImage).toBe(false);
  });
});
