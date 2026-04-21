import { describe, expect, it } from "vitest";

import {
  getLegacyTourBySlugs,
  getTourBySlugs,
  getTourDetailPath,
  getToursByCity,
  getToursByCityUnified,
  tours,
} from "./tours";
import { engine6ResolvedTours } from "../engine6/registry";
import { getGuideCountryBySlug } from "./guideData";
import { countriesWithTours, toursByCountry } from "./europeIndex";
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

describe("Miami and Fort Lauderdale Engine6-only listing surfaces", () => {
  it("renders Miami city cards/listings with Engine6 tours first", () => {
    const miamiTours = getToursByCity("florida", "miami");
    expect(miamiTours.length).toBeGreaterThan(0);
    expect(miamiTours[0]?.engine).toBe("engine6");
    expect(miamiTours.some(tour => tour.productCode === "7943P1")).toBe(true);
  });

  it("renders Fort Lauderdale city cards/listings with Engine6 tours first", () => {
    const fortLauderdaleTours = getToursByCity("florida", "fort-lauderdale");
    expect(fortLauderdaleTours.length).toBeGreaterThan(0);
    expect(fortLauderdaleTours[0]?.engine).toBe("engine6");
    expect(
      fortLauderdaleTours.some(tour => tour.productCode === "6331BAHA")
    ).toBe(true);
  });

  it("renders Miami and Fort Lauderdale unified grids with Engine6 entries first", () => {
    const miamiUnified = getToursByCityUnified("florida", "miami");
    const fortLauderdaleUnified = getToursByCityUnified(
      "florida",
      "fort-lauderdale"
    );

    expect(miamiUnified.length).toBeGreaterThan(0);
    expect(fortLauderdaleUnified.length).toBeGreaterThan(0);
    expect(miamiUnified[0]?.tour.engine).toBe("engine6");
    expect(fortLauderdaleUnified[0]?.tour.engine).toBe("engine6");
  });
});

describe("Engine6-first discovery ordering", () => {
  it("keeps mixed New York City inventory while ranking Engine6 tours first in city listings", () => {
    const newYorkTours = getToursByCity("new-york", "new-york");
    const firstNonEngine6Index = newYorkTours.findIndex(
      tour => tour.engine !== "engine6"
    );

    expect(newYorkTours.length).toBeGreaterThan(0);
    expect(firstNonEngine6Index).toBeGreaterThan(-1);
    expect(
      newYorkTours.slice(0, firstNonEngine6Index).every(
        tour => tour.engine === "engine6"
      )
    ).toBe(true);
    expect(
      newYorkTours.slice(firstNonEngine6Index).some(
        tour => tour.engine !== "engine6"
      )
    ).toBe(true);
  });

  it("keeps mixed New York City inventory while ranking Engine6 tours first in unified listings", () => {
    const newYorkUnified = getToursByCityUnified("new-york", "new-york");
    const firstNonEngine6Index = newYorkUnified.findIndex(
      entry => entry.tour.engine !== "engine6"
    );

    expect(newYorkUnified.length).toBeGreaterThan(0);
    expect(firstNonEngine6Index).toBeGreaterThan(-1);
    expect(
      newYorkUnified.slice(0, firstNonEngine6Index).every(
        entry => entry.tour.engine === "engine6"
      )
    ).toBe(true);
    expect(
      newYorkUnified.slice(firstNonEngine6Index).some(
        entry => entry.tour.engine !== "engine6"
      )
    ).toBe(true);
  });
});


describe("Switzerland Engine6 discovery propagation", () => {
  it("uses destination-style canonical URLs for all Switzerland tour cards", () => {
    const switzerlandTours = tours.filter(
      tour => tour.destination.stateSlug === "switzerland"
    );

    expect(switzerlandTours.length).toBeGreaterThan(0);
    expect(
      switzerlandTours.every(tour =>
        getTourDetailPath(tour).startsWith("/destinations/switzerland/")
      )
    ).toBe(true);
  });

  it("indexes Engine6 Switzerland tours as international (non-US) inventory", () => {
    const swissEngine6Tours = tours.filter(
      tour => tour.engine === "engine6" && tour.destination.stateSlug === "switzerland"
    );

    expect(swissEngine6Tours.length).toBeGreaterThan(0);
    expect(
      swissEngine6Tours.every(tour => tour.destination.country === "Switzerland")
    ).toBe(true);
  });

  it("exposes Switzerland country/city guide discovery for both Interlaken and Zurich", () => {
    const countryGuide = getGuideCountryBySlug("switzerland");

    expect(countryGuide).toBeDefined();
    const citySlugs = new Set(countryGuide?.cities.map(city => city.slug));
    expect(citySlugs.has("interlaken")).toBe(true);
    expect(citySlugs.has("zurich")).toBe(true);
  });

  it("includes Switzerland Engine6 inventory in Europe destination discovery index", () => {
    const switzerlandSummary = countriesWithTours.find(
      country => country.slug === "switzerland"
    );
    const switzerlandTours = toursByCountry.switzerland ?? [];

    expect(switzerlandSummary).toBeDefined();
    expect(switzerlandTours.length).toBeGreaterThan(0);
    expect(
      switzerlandTours.some(
        tour => tour.engine === "engine6" && tour.destination.citySlug === "zurich"
      )
    ).toBe(true);
    expect(
      switzerlandTours.some(
        tour => tour.engine === "engine6" && tour.destination.citySlug === "interlaken"
      )
    ).toBe(true);
  });
});
