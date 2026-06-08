import { renderToString } from "react-dom/server";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../../components/RouteRedirect", () => ({
  default: ({ to }: { to: string }) => (
    <div data-testid="redirect" data-to={to} />
  ),
}));

import {
  getTourBookingPath,
  getTourBySlugs,
  getToursByActivity,
  getToursByCity,
} from "../../data/tours";
import { getEngine2TourBySlug } from "../../engine2/data/loadEngine2";
import CityTourBookingRoute from "../../pages/destinations/states/tours/CityTourBookingRoute";
import CityTourDetailRoute from "../../pages/destinations/states/tours/CityTourDetailRoute";
import vercelConfig from "../../../vercel.json";
import {
  isSuppressedFareHarborBookingPage,
  RETIRED_FAREHARBOR_BOOKING_URLS,
  RETIRED_FAREHARBOR_TOUR_URLS,
  SUPPRESSED_FAREHARBOR_BOOKING_PAGES,
} from "./suppressedBookingPages";

beforeAll(() => {
  Object.defineProperty(globalThis, "location", {
    configurable: true,
    value: { pathname: "/", search: "", hash: "" },
  });
});

describe("retired FareHarbor booking inventory", () => {
  const retiredSlug =
    "byron-glacier-walk-and-wildlife-viewing-experience-402209";
  const retiredTourUrl =
    "/destinations/alaska/anchorage/tours/byron-glacier-walk-and-wildlife-viewing-experience-402209";
  const retiredBookingUrl = `${retiredTourUrl}/book`;
  const retiredRedirectUrl = "/destinations/alaska/anchorage/tours";
  const validTour = getTourBySlugs(
    "tennessee",
    "nashville",
    "nashvilles-hidden-gems-e-bike-tour-432832"
  );

  it("keeps valid non-retired booking pages rendering embedded calendars", () => {
    expect(validTour).toBeTruthy();
    expect(isSuppressedFareHarborBookingPage(validTour)).toBe(false);

    const html = renderToString(
      <CityTourBookingRoute
        params={{
          stateSlug: "tennessee",
          citySlug: "nashville",
          tourSlug: "nashvilles-hidden-gems-e-bike-tour-432832",
        }}
      />
    );

    expect(html).toContain("<iframe");
    expect(html).toContain("musiccityadventurecompany/items/432832");
  });

  it("removes retired tours from marketplace discovery lookups", () => {
    expect(getTourBySlugs("alaska", "anchorage", retiredSlug)).toBeUndefined();
    expect(getEngine2TourBySlug("alaska", "anchorage", retiredSlug)).toBeNull();
    expect(getToursByCity("alaska", "anchorage")).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ slug: retiredSlug })])
    );
    expect(getToursByActivity("hiking")).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ slug: retiredSlug })])
    );
  });

  it("redirects retired tour detail and booking URLs to the city tours page", () => {
    const detailHtml = renderToString(
      <CityTourDetailRoute
        params={{
          stateSlug: "alaska",
          citySlug: "anchorage",
          tourSlug: retiredSlug,
        }}
      />
    );
    const bookingHtml = renderToString(
      <CityTourBookingRoute
        params={{
          stateSlug: "alaska",
          citySlug: "anchorage",
          tourSlug: retiredSlug,
        }}
      />
    );

    expect(detailHtml).toContain('data-testid="redirect"');
    expect(detailHtml).toContain(`data-to="${retiredRedirectUrl}"`);
    expect(bookingHtml).toContain('data-testid="redirect"');
    expect(bookingHtml).toContain(`data-to="${retiredRedirectUrl}"`);
  });

  it("defines 301 redirects for retired tour detail and booking URLs", () => {
    expect(vercelConfig.redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: retiredTourUrl,
          destination: retiredRedirectUrl,
          permanent: true,
        }),
        expect.objectContaining({
          source: retiredBookingUrl,
          destination: retiredRedirectUrl,
          permanent: true,
        }),
      ])
    );
  });

  it("excludes retired tour and booking pages from sitemap output", async () => {
    const sitemapModulePath = "../../../scripts/generate-sitemap.mjs";
    const { buildSitemap } = await import(sitemapModulePath);
    const sitemap = await buildSitemap();
    const emittedUrls = new Set([
      ...sitemap.pages,
      ...sitemap.toursUrls,
      ...sitemap.cityUrls,
      ...sitemap.guideUrls,
      ...sitemap.destinationUrls,
      ...sitemap.categoryUrls,
    ]);

    expect(SUPPRESSED_FAREHARBOR_BOOKING_PAGES.length).toBe(152);
    expect(
      Array.from(RETIRED_FAREHARBOR_TOUR_URLS).filter(url =>
        emittedUrls.has(url)
      )
    ).toEqual([]);
    expect(
      Array.from(RETIRED_FAREHARBOR_BOOKING_URLS).filter(url =>
        emittedUrls.has(url)
      )
    ).toEqual([]);
  }, 60_000);

  it("keeps non-retired tours available with internal booking CTAs", () => {
    expect(validTour).toBeTruthy();
    const validHtml = renderToString(
      <CityTourDetailRoute
        params={{
          stateSlug: "tennessee",
          citySlug: "nashville",
          tourSlug: "nashvilles-hidden-gems-e-bike-tour-432832",
        }}
      />
    );

    expect(validHtml).toContain(getTourBookingPath(validTour!));
  });
});
