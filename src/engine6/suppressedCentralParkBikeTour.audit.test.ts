import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { buildSitemap } from "../../scripts/generate-sitemap.mjs";
import { getToursByActivityCategory } from "../data/activityDiscovery";
import {
  getAllRouteBackedTourEntries,
  getTourBySlugs,
  getToursByActivity,
  getToursByCity,
  getToursByCityUnified,
  tours,
} from "../data/tours";
import { engine6ListingTours } from "./listing";
import {
  getLegacyFhMigratedTourByCanonicalPath,
  legacyFhMigratedTours,
} from "./legacyFh/registry";
import {
  engine6ResolvedTours,
  getEngine6NativeTourByCanonicalPath,
} from "./registry";
import { resolveEngine6ProductCodeForPath } from "./routes";

const SUPPRESSED_PRODUCT_CODE = "fh-central-park-bike-tours-16628";
const SUPPRESSED_ROUTE =
  "/destinations/new-york/new-york/tours/central-park-bike-tours-16628";
const SUPPRESSED_SLUG = "central-park-bike-tours-16628";

const rowContainsSuppressedTour = (value: string) =>
  value.includes(SUPPRESSED_PRODUCT_CODE) || value.includes(SUPPRESSED_ROUTE);

describe("suppressed Central Park Bike Tours discovery audit", () => {
  it("excludes the suppressed product from Merchant Center feed rows", () => {
    const merchantFeed = readFileSync("data/merchantFeed.csv", "utf8");

    expect(merchantFeed).not.toContain(SUPPRESSED_PRODUCT_CODE);
    expect(merchantFeed).not.toContain(SUPPRESSED_ROUTE);
    expect(
      engine6ResolvedTours.some(
        tour => tour.productCode === SUPPRESSED_PRODUCT_CODE
      )
    ).toBe(false);
  });

  it("excludes the suppressed route from sitemap generation", async () => {
    const sitemap = await buildSitemap();

    expect([...sitemap.toursUrls].some(rowContainsSuppressedTour)).toBe(false);
    expect([...sitemap.guideUrls].some(rowContainsSuppressedTour)).toBe(false);
    expect([...sitemap.destinationUrls].some(rowContainsSuppressedTour)).toBe(
      false
    );
  }, 30_000);

  it("excludes the suppressed product from published registries and route lookup", () => {
    expect(resolveEngine6ProductCodeForPath(SUPPRESSED_ROUTE)).toBeNull();
    expect(getEngine6NativeTourByCanonicalPath(SUPPRESSED_ROUTE)).toBeNull();
    expect(getLegacyFhMigratedTourByCanonicalPath(SUPPRESSED_ROUTE)).toBeNull();

    for (const registry of [
      engine6ResolvedTours,
      engine6ListingTours,
      legacyFhMigratedTours,
    ]) {
      expect(
        registry.some(
          tour =>
            tour.productCode === SUPPRESSED_PRODUCT_CODE ||
            tour.canonicalPath === SUPPRESSED_ROUTE ||
            tour.slug === SUPPRESSED_SLUG
        )
      ).toBe(false);
    }
  });

  it("excludes the suppressed product from listing-card and internal discovery collections", () => {
    const publicCollections = [
      tours.map(tour => ({
        tour,
        href: `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`,
      })),
      getToursByCity("new-york", "new-york").map(tour => ({
        tour,
        href: `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`,
      })),
      getToursByCityUnified("new-york", "new-york"),
      getToursByActivity("cycling").map(tour => ({
        tour,
        href: `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`,
      })),
      getToursByActivityCategory("cycling").map(tour => ({
        tour,
        href: `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`,
      })),
      getAllRouteBackedTourEntries(),
    ];

    for (const collection of publicCollections) {
      expect(
        collection.some(
          entry =>
            entry.href === SUPPRESSED_ROUTE ||
            entry.tour.productCode === SUPPRESSED_PRODUCT_CODE ||
            entry.tour.slug === SUPPRESSED_SLUG
        )
      ).toBe(false);
    }

    expect(
      getTourBySlugs("new-york", "new-york", SUPPRESSED_SLUG)
    ).toBeUndefined();
  });
});
