import { describe, expect, it } from "vitest";

import { getTourBySlugs } from "./data/tours";
import { getFlagstaffTourBySlug } from "./data/flagstaffTours";
import { isExcludedProductCode } from "./data/excludedProductCodes";
import { getEngine2TourBySlug } from "./engine2/data/loadEngine2";
import { getEngine3TourBySlugs } from "./engine3/routing";
import { getEngine4TourBySlugs } from "./engine4/routing";
import { getLegacyFhMigratedTourBySlugs } from "./engine6/legacyFh/registry";
import { getEngine6NativeTourByCanonicalPath } from "./engine6/registry";
import { isRemovedTourSlug } from "./utils/tours/isTourRemoved";
import { buildSitemap } from "../scripts/generate-sitemap.mjs";

const MISSING_ROUTE_FIXTURE_URLS = [
  "/destinations/wyoming/jackson/tours/full-day-tours-650824",
  "/destinations/california/coronado/tours/bike-661652",
  "/destinations/alaska/anchorage/tours/8-day-zanzibar---the-spice-island-mangroves-and-stonetown-517094",
  "/destinations/australia/summerlands/tours/camp-talks-519110",
  "/destinations/colorado/oak-creek/tours/__SEO_CANONICAL__",
  "/destinations/california/los-angeles/tours/warner-bros-studio-tour-hollywood-148509p1",
  "/destinations/colorado/colorado-springs/tours/25-hour-cocktails-and-canaps-walking-tour-148263",
];

const decodePath = (pathname: string) => {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
};

const resolvesToTourTemplate = (pathname: string) => {
  const decoded = decodePath(pathname);
  const canadaMatch = decoded.match(
    /^\/destinations\/world\/canada\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/
  );
  if (canadaMatch) {
    return true;
  }

  const destinationMatch = decoded.match(
    /^\/destinations\/(?:united-states\/)?([^/]+)\/([^/]+)\/tours\/([^/]+)$/
  );
  if (destinationMatch) {
    const [, stateSlug, citySlug, tourSlug] = destinationMatch;
    const routeProductCode = tourSlug.split("-").at(-1)?.toUpperCase() ?? null;

    if (routeProductCode && isExcludedProductCode(routeProductCode)) {
      return false;
    }

    if (isRemovedTourSlug(tourSlug)) {
      return false;
    }

    return Boolean(
      getEngine6NativeTourByCanonicalPath(decoded) ||
      getLegacyFhMigratedTourBySlugs(stateSlug, citySlug, tourSlug) ||
      getTourBySlugs(stateSlug, citySlug, tourSlug) ||
      getEngine2TourBySlug(stateSlug, citySlug, tourSlug) ||
      getEngine3TourBySlugs(stateSlug, citySlug, tourSlug) ||
      getEngine4TourBySlugs(stateSlug, citySlug, tourSlug)
    );
  }

  const flagstaffMatch = decoded.match(/^\/tours\/([^/]+)$/);
  if (flagstaffMatch) {
    return Boolean(getFlagstaffTourBySlug(flagstaffMatch[1]));
  }

  return true;
};

describe("sitemap URL integrity", () => {
  it("does not emit SEO placeholders, placeholder slugs, or soft-404 tour URLs", async () => {
    const sitemap = await buildSitemap();
    const urls = [
      ...sitemap.pages,
      ...sitemap.toursUrls,
      ...sitemap.cityUrls,
      ...sitemap.guideUrls,
      ...sitemap.destinationUrls,
      ...sitemap.categoryUrls,
    ];

    expect(urls).not.toHaveLength(0);
    expect(urls.filter(url => /__SEO_|placeholder/i.test(url))).toEqual([]);
    expect(
      MISSING_ROUTE_FIXTURE_URLS.filter(url => urls.includes(url))
    ).toEqual([]);
    expect(
      [...sitemap.toursUrls].filter(url => !resolvesToTourTemplate(url))
    ).toEqual([]);
  }, 60_000);
  it("includes only non-empty activity discovery pages", async () => {
    const sitemap = await buildSitemap();

    expect(sitemap.categoryUrls.has("/tours/cycling")).toBe(true);
    expect(sitemap.categoryUrls.has("/tours/hiking")).toBe(true);
    expect(sitemap.categoryUrls.has("/tours/paddle-sports")).toBe(true);
    expect(sitemap.categoryUrls.has("/tours/fishing")).toBe(true);
    expect(sitemap.categoryUrls.has("/tours/canoeing")).toBe(false);
    expect(sitemap.categoryUrls.has("/tours/empty-activity")).toBe(false);
  }, 60_000);
});
