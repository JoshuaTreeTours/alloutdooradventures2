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


  it("recovers tour-specific image from listing/card/schema fields before markup fallback", () => {
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
          cardImage: "https://cdn.filestackcontent.com/card-specific-image",
          listingImage: "https://cdn.filestackcontent.com/listing-specific-image",
          schemaImage: "https://cdn.filestackcontent.com/schema-specific-image",
        } as any,
      ],
    });

    expect(seo?.image).toBe("https://cdn.filestackcontent.com/card-specific-image");
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

  it("resolves legacy /tours/{state}/{city}/{slug} routes by product id when slug text drifts", () => {
    const routePath =
      "/tours/wyoming/jackson/the-lewis-and-clark-explorer-pack-trip-5-days-4-nights-456492";
    const image = "https://cdn.filestackcontent.com/RlWQ7xV7TuEstvgXiUaN";
    const seo = buildLegacyTourRouteSeo({
      pathname: routePath,
      site: "https://www.alloutdooradventures.com",
      buildTourMetaFn: buildTourMeta,
      tours: [
        {
          id: "456492",
          slug: "lewis-clark-explorer-pack-trip-456492",
          title: "The Lewis & Clark Explorer Pack Trip",
          destination: {
            stateSlug: "wyoming",
            citySlug: "jackson",
            city: "Jackson",
            state: "Wyoming",
          },
          heroImage: image,
        } as any,
      ],
    });

    expect(seo?.url).toBe(`https://www.alloutdooradventures.com${routePath}`);
    expect(seo?.title.toLowerCase()).toContain("lewis");
    expect(seo?.description.toLowerCase()).toContain("jackson");
    expect(seo?.image).toBe(image);

    const html = applyRouteSeo(
      '<!doctype html><html><head><title>Default</title><meta name="description" content="d" /><meta property="og:title" content="d" /><meta property="og:description" content="d" /><meta property="og:url" content="d" /><meta name="twitter:title" content="d" /><meta name="twitter:description" content="d" /><link rel="canonical" href="https://example.com" /></head><body></body></html>',
      seo as any
    );

    expect(html).toContain('property="og:image" content="https://cdn.filestackcontent.com/RlWQ7xV7TuEstvgXiUaN"');
    expect(html).toContain('name="twitter:image" content="https://cdn.filestackcontent.com/RlWQ7xV7TuEstvgXiUaN"');
    expect(html).toContain('"image":"https://cdn.filestackcontent.com/RlWQ7xV7TuEstvgXiUaN"');
    expect(html).toContain(`rel="canonical" href="https://www.alloutdooradventures.com${routePath}"`);
  });

  it("recovers unresolved fossil destination route by product id with city/state fallback", () => {
    const routePath =
      "/destinations/alaska/anchorage/tours/anchors-and-rappelling-101-women-s-climbing-clinic-547955";
    const image = "https://cdn.filestackcontent.com/anchorage-climbing-547955";

    const seo = buildLegacyTourRouteSeo({
      pathname: routePath,
      site: "https://www.alloutdooradventures.com",
      buildTourMetaFn: buildTourMeta,
      tours: [
        {
          id: "547955",
          slug: "women-s-climbing-clinic-547955",
          title: "Women’s Climbing Clinic",
          destination: {
            stateSlug: "ak",
            citySlug: "anchorage-ak",
            state: "Alaska",
            city: "Anchorage",
          },
          heroImage: image,
        } as any,
      ],
    });

    expect(seo?.url).toBe(`https://www.alloutdooradventures.com${routePath}`);
    expect(seo?.title.toLowerCase()).toContain("anchorage");
    expect(seo?.description.toLowerCase()).toContain("alaska");
    expect(seo?.image).toBe(image);

    const html = applyRouteSeo(
      '<!doctype html><html><head><title>Default</title><meta name="description" content="d" /><meta property="og:title" content="d" /><meta property="og:description" content="d" /><meta property="og:url" content="d" /><meta property="og:image" content="https://www.alloutdooradventures.com/hero.jpg" /><meta name="twitter:title" content="d" /><meta name="twitter:description" content="d" /><meta name="twitter:image" content="https://www.alloutdooradventures.com/hero.jpg" /><link rel="canonical" href="https://www.alloutdooradventures.com/" /></head><body></body></html>',
      seo as any
    );

    expect(html).toContain(`rel="canonical" href="https://www.alloutdooradventures.com${routePath}"`);
    expect(html).toContain(`property="og:url" content="https://www.alloutdooradventures.com${routePath}"`);
    expect(html).toContain(`property="og:image" content="${image}"`);
    expect(html).toContain(`name="twitter:image" content="${image}"`);
    expect(html).toContain(`"image":"${image}"`);
    expect(html).not.toContain(`rel="canonical" href="https://www.alloutdooradventures.com/"`);
    expect(html).not.toContain("/hero.jpg");
  });

  it("resolves Santa Barbara legacy route under /destinations/united-states/... and uses visible solo image", () => {
    const routePath =
      "/destinations/united-states/california/santa-barbara/tours/full-day-island-cruise-620790";
    const image = "https://cdn.filestackcontent.com/santa-barbara-island-620790";

    const seo = buildLegacyTourRouteSeo({
      pathname: routePath,
      site: "https://www.alloutdooradventures.com",
      buildTourMetaFn: buildTourMeta,
      tours: [
        {
          id: "620790",
          slug: "full-day-island-cruise-620790",
          title: "Full-Day Island Cruise",
          destination: { stateSlug: "california", citySlug: "santa-barbara", city: "Santa Barbara", state: "California" },
          heroImage: "/hero.jpg",
          fareHarborHtml: `<section><img src="${image}" /></section>`,
        } as any,
      ],
    });

    expect(seo?.url).toBe(`https://www.alloutdooradventures.com${routePath}`);
    expect(seo?.image).toBe(image);
  });

  it("emits matching og/twitter/json-ld image for Santa Barbara legacy route shapes when visible image exists", () => {
    const cases = [
      "/destinations/california/santa-barbara/tours/coastal-cruise-azure-seas-4241",
      "/destinations/california/santa-barbara/tours/lourinh-wine-tasting-tour---3-wines-611821",
      "/destinations/california/santa-barbara/tours/full-day-island-cruise-620790",
      "/destinations/california/santa-barbara/tours/santa-barbara-harbor-and-waterfront-tour-449817",
      "/destinations/united-states/california/santa-barbara/tours/full-day-island-cruise-620790",
      "/tours/california/santa-barbara/santa-barbara-harbor-and-waterfront-tour-449817",
    ];

    for (const routePath of cases) {
      const id = /-(\d+)$/i.exec(routePath)?.[1] ?? "4241";
      const image = `https://cdn.filestackcontent.com/santa-barbara-visible-${id}`;
      const slug = routePath.split("/").filter(Boolean).at(-1) as string;

      const seo = buildLegacyTourRouteSeo({
        pathname: routePath,
        site: "https://www.alloutdooradventures.com",
        buildTourMetaFn: buildTourMeta,
        tours: [
          {
            id,
            slug,
            title: `Santa Barbara Tour ${id}`,
            destination: { stateSlug: "california", citySlug: "santa-barbara", city: "Santa Barbara", state: "California" },
            heroImage: "/hero.jpg",
            fareHarborData: { product: { image_url: image } },
          } as any,
        ],
      });

      expect(seo?.image).toBe(image);

      const html = applyRouteSeo(
        '<!doctype html><html><head><title>Default</title><meta name="description" content="d" /><meta property="og:title" content="d" /><meta property="og:description" content="d" /><meta property="og:url" content="d" /><meta property="og:image" content="/hero.jpg" /><meta name="twitter:title" content="d" /><meta name="twitter:description" content="d" /><meta name="twitter:image" content="/hero.jpg" /><link rel="canonical" href="https://example.com" /></head><body></body></html>',
        seo as any
      );

      expect(html).toContain(`property="og:image" content="${image}"`);
      expect(html).toContain(`name="twitter:image" content="${image}"`);
      expect(html).toContain(`"image":"${image}"`);
      expect(html).not.toContain('/hero.jpg');
    }
  });


});
