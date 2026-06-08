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
import {
  buildSitemap,
  CONFIRMED_EMPTY_ACTIVITY_CATEGORY_PATHS,
} from "../scripts/generate-sitemap.mjs";

let sitemapPromise: ReturnType<typeof buildSitemap> | null = null;

const getBuiltSitemap = () => {
  sitemapPromise ??= buildSitemap();
  return sitemapPromise;
};

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

const getDuplicateCountryQualifiedUsTourUrls = (urls: Iterable<string>) => {
  const urlList = [...urls];
  const urlSet = new Set(urlList);

  return urlList.filter(url => {
    const match = url.match(
      /^\/destinations\/united-states\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/
    );
    if (!match) {
      return false;
    }

    const [, stateSlug, citySlug, tourSlug] = match;
    return urlSet.has(
      `/destinations/${stateSlug}/${citySlug}/tours/${tourSlug}`
    );
  });
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
    const sitemap = await getBuiltSitemap();
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
  it("suppresses duplicate country-qualified US tour detail sitemap URLs", async () => {
    const sitemap = await getBuiltSitemap();

    expect(
      sitemap.toursUrls.has(
        "/destinations/alaska/denali-national-park-and-preserve/tours/private-hiking-adventure-577765"
      )
    ).toBe(true);
    expect(
      sitemap.toursUrls.has(
        "/destinations/united-states/alaska/denali-national-park-and-preserve/tours/private-hiking-adventure-577765"
      )
    ).toBe(false);
    expect(getDuplicateCountryQualifiedUsTourUrls(sitemap.toursUrls)).toEqual(
      []
    );
  }, 60_000);

  it("includes only eligible non-empty activity discovery pages without expanding the category sitemap", async () => {
    const sitemap = await getBuiltSitemap();

    expect(sitemap.categoryUrls.has("/tours/cycling")).toBe(true);
    expect(sitemap.categoryUrls.has("/tours/hiking")).toBe(true);
    expect(sitemap.categoryUrls.has("/tours/paddle-sports")).toBe(true);
    expect(sitemap.categoryUrls.has("/tours/horseback-riding")).toBe(false);
    expect(sitemap.categoryUrls.has("/tours/fishing")).toBe(false);
    expect(sitemap.categoryUrls.has("/tours/canoeing")).toBe(false);
    expect(sitemap.categoryUrls.has("/tours/empty-activity")).toBe(false);
  }, 60_000);

  it("does not emit confirmed empty activity/category URLs", async () => {
    const sitemap = await getBuiltSitemap();

    expect(CONFIRMED_EMPTY_ACTIVITY_CATEGORY_PATHS.size).toBe(70);
    expect([...CONFIRMED_EMPTY_ACTIVITY_CATEGORY_PATHS]).toEqual(
      expect.arrayContaining([
        "/tours/air-tours/switzerland",
        "/tours/air-tours/alaska/seward",
        "/tours/hiking/nevada/las-vegas",
        "/tours/sailing/france/paris",
      ])
    );
    expect(sitemap.categoryUrls).not.toEqual(
      expect.arrayContaining([...CONFIRMED_EMPTY_ACTIVITY_CATEGORY_PATHS])
    );
  }, 60_000);

  it("does not emit Class A sitemap-only legacy activity URLs", async () => {
    const sitemap = await getBuiltSitemap();

    expect(sitemap.categoryUrls).not.toEqual(
      expect.arrayContaining([
        "/tours/activities/day-adventures",
        "/tours/activities/detours",
        "/tours/activities/multi-day",
      ])
    );

    expect(sitemap.categoryUrls.has("/tours/activities/cycling")).toBe(true);
    expect(sitemap.categoryUrls.has("/tours/activities/hiking")).toBe(true);
    expect(sitemap.categoryUrls.has("/tours/activities/paddle-sports")).toBe(
      true
    );
  }, 60_000);

  it("keeps canonical activity/location pages and suppresses duplicate country-qualified variants", async () => {
    const sitemap = await getBuiltSitemap();
    const duplicateActivityLocationUrls = [...sitemap.categoryUrls].filter(
      url =>
        /^\/tours\/[^/]+\/(?:us|usa|united-states)\/[^/]+(?:\/[^/]+)?$/.test(
          url
        ) || /^\/tours\/[^/]+\/[^/]+\/(?:usa|united-states)$/.test(url)
    );

    expect(sitemap.categoryUrls.has("/tours/hiking/alaska")).toBe(true);
    expect(sitemap.categoryUrls.has("/tours/hiking/us/alaska")).toBe(false);
    expect(sitemap.categoryUrls.has("/tours/hiking/alaska/united-states")).toBe(
      false
    );
    expect(duplicateActivityLocationUrls).toEqual([]);
    expect(sitemap.categoryUrls.size).toBeLessThanOrEqual(616);
  }, 60_000);
});
