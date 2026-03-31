import { describe, expect, it } from "vitest";

import {
  getLegacyTourBySlugs,
  getTourBySlugs,
  getToursByCity,
  getToursByCityUnified,
} from "./tours";
import { engine6ResolvedTours } from "../engine6/registry";
import { engine6OverlapReplacementConfigs } from "../engine6/routes";

describe("getToursByCityUnified Palm Springs dedupe", () => {
  it("dedupes viator tours by productCode and keeps Engine3 versions", () => {
    const tours = getToursByCityUnified("california", "palm-springs");

    const viator = tours.filter(
      entry => entry.tour.bookingProvider === "viator"
    );
    const byCode = new Map<string, (typeof viator)[number]>();

    for (const entry of viator) {
      const code = entry.tour.productCode;
      if (code) {
        expect(byCode.has(code)).toBe(false);
        byCode.set(code, entry);
      }
    }

    expect(byCode.get("2335P1")?.tour.engine).toBe("engine3");
    expect(byCode.get("3351P15")?.tour.engine).toBe("engine3");
    expect(byCode.get("6740JTREE")?.tour.engine).toBe("engine3");
  });

  it("does not return blank listing images for Palm Springs viator cards", () => {
    const tours = getToursByCityUnified("california", "palm-springs");
    const viator = tours.filter(
      entry => entry.tour.bookingProvider === "viator"
    );

    for (const entry of viator) {
      expect(
        (entry.tour.primaryImageUrl ?? entry.tour.heroImage).trim().length
      ).toBeGreaterThan(0);
    }
  });
});

describe("engine6 canonical slug winner dedupe", () => {
  it("keeps overlap replacement public slug immutable with Engine6 Viator CTA", () => {
    for (const config of engine6OverlapReplacementConfigs) {
      const [, stateSlug = "", citySlug = "", slug = ""] =
        /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/.exec(
          config.canonicalPath
        ) ?? [];
      const replacement = engine6ResolvedTours.find(
        tour => tour.productCode === config.productCode
      );
      const legacy = getLegacyTourBySlugs(stateSlug, citySlug, slug);

      expect(replacement).toBeDefined();
      expect(replacement?.canonicalPath).toBe(config.canonicalPath);
      expect(replacement?.bookingUrl).toContain("viator.com");
      expect(replacement?.bookingUrl.endsWith("/book")).toBe(false);
      expect(replacement?.ownership.ctaOwner).toBe("viator");
      expect(legacy?.bookingProvider).toBe("fareharbor");
    }
  });

  it("keeps only one Brooklyn Bridge and Waterfront Bike Tour listing in New York and prefers Engine6", () => {
    const unified = getToursByCityUnified("new-york", "new-york").filter(
      entry =>
        entry.href ===
        "/destinations/new-york/new-york/tours/brooklyn-bridge-and-waterfront-bike-tour-264853"
    );

    expect(unified).toHaveLength(1);
    expect(unified[0]?.tour.engine).toBe("engine6");
    expect(unified[0]?.tour.productCode).toBe("233384P2");
  });

  it("removes legacy versions with the same canonical slug from base city tour collections", () => {
    const cityTours = getToursByCity("new-york", "new-york").filter(
      tour => tour.slug === "brooklyn-bridge-and-waterfront-bike-tour-264853"
    );

    expect(cityTours).toHaveLength(1);
    expect(cityTours[0]?.engine).toBe("engine6");
    expect(cityTours[0]?.productCode).toBe("233384P2");
  });

  it("keeps only one 1 Hour Central Park Pedicab Tour listing in New York and prefers Engine6", () => {
    const unified = getToursByCityUnified("new-york", "new-york").filter(
      entry =>
        entry.href ===
        "/destinations/new-york/new-york/tours/1-hour-central-park-pedicab-tour-27491"
    );

    expect(unified).toHaveLength(1);
    expect(unified[0]?.tour.engine).toBe("engine6");
    expect(unified[0]?.tour.productCode).toBe("414460P1");
  });

  it("replaces overlapping 27491 public page with Viator CTA while leaving legacy source data intact", () => {
    const engine6Tour = getTourBySlugs(
      "new-york",
      "new-york",
      "1-hour-central-park-pedicab-tour-27491"
    );
    const legacyTour = getLegacyTourBySlugs(
      "new-york",
      "new-york",
      "1-hour-central-park-pedicab-tour-27491"
    );

    expect(engine6Tour?.engine).toBe("engine6");
    expect(engine6Tour?.bookingUrl).toContain("viator.com");
    expect(engine6Tour?.bookingUrl.endsWith("/book")).toBe(false);
    expect(engine6Tour?.bookingProvider).toBe("viator");
    expect(legacyTour?.bookingProvider).toBe("fareharbor");
    expect(legacyTour?.bookingUrl).toContain("fareharbor.com/embeds/book/peterpentours/items/27491");
  });

  it("removes legacy 1 Hour Central Park Pedicab Tour entries from base city collections", () => {
    const cityTours = getToursByCity("new-york", "new-york").filter(
      tour => tour.slug === "1-hour-central-park-pedicab-tour-27491"
    );

    expect(cityTours).toHaveLength(1);
    expect(cityTours[0]?.engine).toBe("engine6");
    expect(cityTours[0]?.productCode).toBe("414460P1");
  });

  it("replaces Fort Lauderdale eBike overlap with a single Engine6 Viator canonical listing", () => {
    const canonicalPath =
      "/destinations/florida/fort-lauderdale/tours/private-guided-ebike-tour-684831";
    const unified = getToursByCityUnified("florida", "fort-lauderdale").filter(
      entry => entry.href === canonicalPath
    );
    const pageTour = getTourBySlugs(
      "florida",
      "fort-lauderdale",
      "private-guided-ebike-tour-684831"
    );
    const legacyTour = getLegacyTourBySlugs(
      "florida",
      "fort-lauderdale",
      "private-guided-ebike-tour-684831"
    );

    expect(unified).toHaveLength(1);
    expect(unified[0]?.tour.engine).toBe("engine6");
    expect(unified[0]?.tour.productCode).toBe("383300P4");
    expect(pageTour?.bookingUrl).toContain("viator.com");
    expect(pageTour?.bookingUrl.endsWith("/book")).toBe(false);
    expect(pageTour?.bookingProvider).toBe("viator");
    expect(unified[0]?.tour.primaryImageUrl).toBe(pageTour?.heroImage);
    expect(legacyTour?.bookingProvider).toBe("fareharbor");
  });

  it("replaces San Diego whale watching overlap with a single Engine6 Viator canonical listing", () => {
    const canonicalPath =
      "/destinations/california/san-diego/tours/san-diego-whale-watching-cruise-60603";
    const unified = getToursByCityUnified("california", "san-diego").filter(
      entry => entry.href === canonicalPath
    );
    const pageTour = getTourBySlugs(
      "california",
      "san-diego",
      "san-diego-whale-watching-cruise-60603"
    );
    const legacyTour = getLegacyTourBySlugs(
      "california",
      "san-diego",
      "san-diego-whale-watching-cruise-60603"
    );

    expect(unified).toHaveLength(1);
    expect(unified[0]?.tour.engine).toBe("engine6");
    expect(unified[0]?.tour.productCode).toBe("5144WHALE");
    expect(pageTour?.bookingUrl).toContain("viator.com");
    expect(pageTour?.bookingUrl.endsWith("/book")).toBe(false);
    expect(pageTour?.bookingProvider).toBe("viator");
    expect(unified[0]?.tour.primaryImageUrl).toBe(pageTour?.heroImage);
    expect(legacyTour?.bookingProvider).toBe("fareharbor");
  });

  it("overlap replacements render at legacy slugs and no duplicate listing card survives", () => {
    for (const config of engine6OverlapReplacementConfigs) {
      const [, stateSlug = "", citySlug = "", slug = ""] =
        /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/.exec(
          config.canonicalPath
        ) ?? [];
      const unifiedMatches = getToursByCityUnified(stateSlug, citySlug).filter(
        entry => entry.href === config.canonicalPath
      );
      const cityMatches = getToursByCity(stateSlug, citySlug).filter(
        tour => tour.slug === slug
      );

      expect(unifiedMatches).toHaveLength(1);
      expect(unifiedMatches[0]?.tour.engine).toBe("engine6");
      expect(cityMatches).toHaveLength(1);
      expect(cityMatches[0]?.engine).toBe("engine6");
    }
  });

  it("keeps only one listing for migrated FH canonical slugs and upgrades card engine to Engine6", () => {
    const unified = getToursByCityUnified("new-york", "new-york").filter(
      entry =>
        entry.href ===
        "/destinations/new-york/new-york/tours/central-park-bike-tours-16628"
    );
    const city = getToursByCity("new-york", "new-york").filter(
      tour => tour.slug === "central-park-bike-tours-16628"
    );

    expect(unified).toHaveLength(1);
    expect(unified[0]?.tour.engine).toBe("engine6");
    expect(unified[0]?.tour.bookingProvider).toBe("fareharbor");
    expect(city).toHaveLength(1);
    expect(city[0]?.engine).toBe("engine6");
  });
});
