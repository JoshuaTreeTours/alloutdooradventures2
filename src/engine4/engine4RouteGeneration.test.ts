import { describe, expect, it } from "vitest";

import { buildEngine2Seo } from "../engine2/seo/buildEngine2Seo";
import { SITE_URL } from "../utils/seo";
import { getAllEngine4ListingEntries } from "./listing/getEngine4ListingEntries";
import { getEngine4TourBySlugs } from "./routing";

const splitEngine4DestinationTourPath = (href: string) => {
  const match = /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/.exec(href);

  if (!match) {
    throw new Error(`Unexpected Engine4 tour path: ${href}`);
  }

  return {
    stateSlug: match[1],
    citySlug: match[2],
    tourSlug: match[3],
  };
};

describe("Engine4 public route generation", () => {
  it("exposes every public Engine4 listing URL for sitemap and prerender generation", () => {
    const entries = getAllEngine4ListingEntries();

    expect(entries).toHaveLength(17);
    expect(entries.map(entry => entry.href)).toContain(
      "/destinations/california/los-angeles/tours/yosemite-and-kings-canyon-national-park-2-day-tour-from-la-132218p209"
    );

    for (const entry of entries) {
      expect(entry.href).toMatch(
        /^\/destinations\/[^/]+\/[^/]+\/tours\/[^/]+$/
      );
      expect(entry.tour.engine).toBe("engine4");
      expect(entry.tour.title).toBeTruthy();
      expect(entry.tour.longDescription).toBeTruthy();
      expect(entry.tour.heroImage).toBeTruthy();
      expect(entry.tour.heroImage).not.toContain("/hero.jpg");

      const { stateSlug, citySlug, tourSlug } = splitEngine4DestinationTourPath(
        entry.href
      );
      const routedTour = getEngine4TourBySlugs(stateSlug, citySlug, tourSlug);
      expect(routedTour?.seo.canonicalPath).toBe(entry.href);
    }
  });

  it("builds route-specific metadata for the Los Angeles Yosemite Engine4 tour", () => {
    const tour = getEngine4TourBySlugs(
      "california",
      "los-angeles",
      "yosemite-and-kings-canyon-national-park-2-day-tour-from-la-132218p209"
    );

    expect(tour).toBeTruthy();

    const seo = buildEngine2Seo(tour!);

    expect(seo.title).toBe(tour!.name);
    expect(seo.description).toContain("Yosemite");
    expect(seo.canonical).toBe(`${SITE_URL}${tour!.seo.canonicalPath}`);
    expect(seo.og.url).toBe(seo.canonical);
    expect(seo.og.image).toBeTruthy();
    expect(seo.og.image).not.toContain("/hero.jpg");
    expect(seo.twitter.image).toBe(seo.og.image);
  });
});
