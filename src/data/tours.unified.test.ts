import { describe, expect, it } from "vitest";

import {
  getLegacyTourBySlugs,
  getTourBySlugs,
  getToursByCity,
  getToursByCityUnified,
} from "./tours";
import { engine6ResolvedTours } from "../engine6/registry";
import { engine6ReplacementModeConfigs } from "../engine6/routes";

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

  it("adds one native Engine6 listing entry for 445161P1 in Palm Springs without duplicate cards", () => {
    const tours = getToursByCityUnified("california", "palm-springs").filter(
      entry => entry.tour.productCode === "445161P1"
    );

    expect(tours).toHaveLength(1);
    expect(tours[0]?.tour.engine).toBe("engine6");
    expect(tours[0]?.href).toBe(
      "/destinations/california/palm-springs/tours/professional-stargazing-tour-in-joshua-tree"
    );
  });
});

describe("engine6 canonical slug winner dedupe", () => {
  it("keeps replacement-mode public slug and /book path immutable for every legacy FH replacement", () => {
    for (const config of engine6ReplacementModeConfigs) {
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
      expect(replacement?.bookingUrl).toBe(config.bookingPath);
      expect(legacy?.bookingProvider).toBe("fareharbor");
      expect(config.bookingPath).toBe(`${config.canonicalPath}/book`);
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

  it("preserves original FareHarbor booking endpoint data for 27491 while replacing public page", () => {
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
    expect(engine6Tour?.bookingUrl).toBe(
      "/destinations/new-york/new-york/tours/1-hour-central-park-pedicab-tour-27491/book"
    );
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

  it("replacement mode upgrades render at legacy slugs and no duplicate listing card survives", () => {
    for (const config of engine6ReplacementModeConfigs) {
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
});
