import { renderToString } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";

import { getTourBookingPath, getTourBySlugs } from "../../data/tours";
import CityTourBookingRoute from "../../pages/destinations/states/tours/CityTourBookingRoute";
import CityTourDetailRoute from "../../pages/destinations/states/tours/CityTourDetailRoute";
import {
  isSuppressedFareHarborBookingPage,
  SUPPRESSED_FAREHARBOR_BOOKING_PAGES,
} from "./suppressedBookingPages";

beforeAll(() => {
  Object.defineProperty(globalThis, "location", {
    configurable: true,
    value: { pathname: "/", search: "", hash: "" },
  });
});

describe("suppressed FareHarbor booking pages", () => {
  const brokenTour = getTourBySlugs(
    "alaska",
    "anchorage",
    "byron-glacier-walk-and-wildlife-viewing-experience-402209"
  );
  const validTour = getTourBySlugs(
    "tennessee",
    "nashville",
    "nashvilles-hidden-gems-e-bike-tour-432832"
  );

  it("keeps valid generated booking pages rendering embedded calendars", () => {
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

  it("redirects known provider-error booking pages instead of rendering a broken embed", () => {
    expect(brokenTour).toBeTruthy();
    expect(isSuppressedFareHarborBookingPage(brokenTour)).toBe(true);

    const html = renderToString(
      <CityTourBookingRoute
        params={{
          stateSlug: "alaska",
          citySlug: "anchorage",
          tourSlug: "byron-glacier-walk-and-wildlife-viewing-experience-402209",
        }}
      />
    );

    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("intothewoods/items/402209");
  });

  it("does not internally link tour detail pages to suppressed booking pages", () => {
    expect(brokenTour).toBeTruthy();
    const suppressedBookingPath = getTourBookingPath(brokenTour!);

    const brokenHtml = renderToString(
      <CityTourDetailRoute
        params={{
          stateSlug: "alaska",
          citySlug: "anchorage",
          tourSlug: "byron-glacier-walk-and-wildlife-viewing-experience-402209",
        }}
      />
    );
    const validHtml = renderToString(
      <CityTourDetailRoute
        params={{
          stateSlug: "tennessee",
          citySlug: "nashville",
          tourSlug: "nashvilles-hidden-gems-e-bike-tour-432832",
        }}
      />
    );

    expect(brokenHtml).not.toContain(suppressedBookingPath);
    expect(validHtml).toContain(getTourBookingPath(validTour!));
  });

  it("excludes suppressed booking pages from sitemap output", async () => {
    // @ts-expect-error generate-sitemap is an ESM build script without TypeScript declarations.
    const { buildSitemap } =
      await import("../../../scripts/generate-sitemap.mjs");
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
      SUPPRESSED_FAREHARBOR_BOOKING_PAGES.filter(row =>
        emittedUrls.has(row.bookingPageUrl)
      )
    ).toEqual([]);
  }, 60_000);
});
