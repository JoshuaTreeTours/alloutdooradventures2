import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  DESTINATION_CITY_ALIASES,
  canonicalizeDestinationPath,
  getCanonicalDestinationCitySlug,
  getDestinationCitySlugGroup,
  resolveUsDestinationPath,
} from "./data/destinationAliases";
import {
  getCityTourDetailPath,
  getTourDetailPath,
  getToursByCity,
  getToursByCityUnified,
} from "./data/tours";
import { buildSitemap } from "../scripts/generate-sitemap.mjs";

const repoRoot = process.cwd();
const readRepoFile = (path: string) =>
  readFileSync(join(repoRoot, path), "utf8");

const CANONICAL_CASES = [
  ["austria", "vienna", "wien"],
  ["italy", "florence", "firenze"],
  ["italy", "rome", "roma"],
  ["germany", "munich", "mnchen"],
  ["netherlands", "the-hague", "den-haag"],
  ["portugal", "lisbon", "lisboa"],
  ["spain", "alcudia", "alcdia"],
  ["spain", "calvia", "calvi"],
  ["spain", "deia", "dei"],
  ["spain", "lestartit", "l-estartit"],
  ["spain", "pollenca", "pollena"],
  ["spain", "san-sebastian", "san-sebastin"],
  ["spain", "soller", "sller"],
  ["spain", "valencia", "valncia"],
  ["spain", "xabia", "xbia"],
] as const;

const aliasCityPaths = CANONICAL_CASES.flatMap(
  ([countrySlug, canonicalCitySlug, aliasCitySlug]) => [
    `/destinations/europe/${countrySlug}/cities/${aliasCitySlug}`,
    `/destinations/europe/${countrySlug}/cities/${aliasCitySlug}/tours`,
  ]
);

describe("destination city alias canonicalization", () => {
  it("keeps canonical city slugs and maps known duplicate aliases", () => {
    expect(DESTINATION_CITY_ALIASES).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          countrySlug: "austria",
          aliasCitySlug: "wien",
          canonicalCitySlug: "vienna",
        }),
        expect.objectContaining({
          countrySlug: "italy",
          aliasCitySlug: "firenze",
          canonicalCitySlug: "florence",
        }),
        expect.objectContaining({
          countrySlug: "italy",
          aliasCitySlug: "roma",
          canonicalCitySlug: "rome",
        }),
        expect.objectContaining({
          countrySlug: "germany",
          aliasCitySlug: "mnchen",
          canonicalCitySlug: "munich",
        }),
        expect.objectContaining({
          countrySlug: "netherlands",
          aliasCitySlug: "den-haag",
          canonicalCitySlug: "the-hague",
        }),
        expect.objectContaining({
          countrySlug: "portugal",
          aliasCitySlug: "lisboa",
          canonicalCitySlug: "lisbon",
        }),
        expect.objectContaining({
          countrySlug: "spain",
          aliasCitySlug: "alcdia",
          canonicalCitySlug: "alcudia",
        }),
        expect.objectContaining({
          countrySlug: "spain",
          aliasCitySlug: "l-estartit",
          canonicalCitySlug: "lestartit",
        }),
      ])
    );

    for (const [
      countrySlug,
      canonicalCitySlug,
      aliasCitySlug,
    ] of CANONICAL_CASES) {
      expect(
        getCanonicalDestinationCitySlug(countrySlug, canonicalCitySlug)
      ).toBe(canonicalCitySlug);
      expect(getCanonicalDestinationCitySlug(countrySlug, aliasCitySlug)).toBe(
        canonicalCitySlug
      );
      expect(
        getDestinationCitySlugGroup(countrySlug, canonicalCitySlug)
      ).toEqual(expect.arrayContaining([canonicalCitySlug, aliasCitySlug]));
    }
  });

  it("301 redirects duplicate city routes and their tours child routes", () => {
    const vercelConfig = JSON.parse(readRepoFile("vercel.json")) as {
      redirects?: Array<{
        source: string;
        destination: string;
        permanent: boolean;
      }>;
    };

    expect(vercelConfig.redirects).toEqual(
      expect.arrayContaining(
        CANONICAL_CASES.flatMap(
          ([countrySlug, canonicalCitySlug, aliasCitySlug]) => [
            {
              source: `/destinations/europe/${countrySlug}/cities/${aliasCitySlug}`,
              destination: `/destinations/europe/${countrySlug}/cities/${canonicalCitySlug}`,
              permanent: true,
            },
            {
              source: `/destinations/europe/${countrySlug}/cities/${aliasCitySlug}/tours`,
              destination: `/destinations/europe/${countrySlug}/cities/${canonicalCitySlug}/tours`,
              permanent: true,
            },
          ]
        )
      )
    );
    expect(vercelConfig.redirects).toEqual(
      expect.arrayContaining([
        {
          source: "/destinations/europe/germany/cities/münchen",
          destination: "/destinations/europe/germany/cities/munich",
          permanent: true,
        },
        {
          source: "/destinations/europe/germany/cities/münchen/tours",
          destination: "/destinations/europe/germany/cities/munich/tours",
          permanent: true,
        },
      ])
    );
  });

  it("canonicalizes generated tour links away from alias city slugs", () => {
    for (const [
      countrySlug,
      canonicalCitySlug,
      aliasCitySlug,
    ] of CANONICAL_CASES) {
      const tours = getToursByCity(countrySlug, canonicalCitySlug);
      const aliasBackedTour = tours.find(
        tour => tour.destination.citySlug === aliasCitySlug
      );

      expect(tours.length).toBeGreaterThan(0);
      if (aliasBackedTour) {
        expect(getCityTourDetailPath(aliasBackedTour)).toContain(
          `/destinations/${countrySlug}/${canonicalCitySlug}/tours/`
        );
        expect(getTourDetailPath(aliasBackedTour)).not.toContain(
          `/${aliasCitySlug}/`
        );
      }
      expect(
        getToursByCityUnified(countrySlug, canonicalCitySlug).map(
          entry => entry.href
        )
      ).not.toEqual(
        expect.arrayContaining([expect.stringContaining(`/${aliasCitySlug}/`)])
      );
    }
  });

  it("canonicalizes duplicate destination paths directly", () => {
    expect(
      canonicalizeDestinationPath("/destinations/europe/austria/cities/wien")
    ).toBe("/destinations/europe/austria/cities/vienna");
    expect(
      canonicalizeDestinationPath(
        "/destinations/europe/germany/cities/mnchen/tours"
      )
    ).toBe("/destinations/europe/germany/cities/munich/tours");
    expect(
      canonicalizeDestinationPath("/destinations/world/portugal/cities/lisboa")
    ).toBe("/destinations/world/portugal/cities/lisbon");
  });

  it("canonicalizes U.S. world-country aliases to domestic destination routes", () => {
    expect(
      canonicalizeDestinationPath("/destinations/world/usa/cities/gardnerville")
    ).toBe("/destinations/california/gardnerville");
    expect(
      canonicalizeDestinationPath(
        "/destinations/world/United%20States/cities/santa-barbara"
      )
    ).toBe("/destinations/california/santa-barbara");
    expect(
      canonicalizeDestinationPath(
        "/destinations/world/u.s./cities/santa-brbara/tours"
      )
    ).toBe("/destinations/california/santa-barbara/tours");
    expect(resolveUsDestinationPath("definitely-missing-city")).toBe(
      "/guides/us"
    );
  });

  it("keeps international world destination city paths under the world hierarchy", () => {
    expect(
      canonicalizeDestinationPath("/destinations/world/australia/cities/sydney")
    ).toBe("/destinations/world/australia/cities/sydney");
  });

  it("excludes duplicate destination aliases from sitemap XML URL sets", async () => {
    const sitemap = await buildSitemap();
    const allUrls = [
      ...sitemap.cityUrls,
      ...sitemap.destinationUrls,
      ...sitemap.toursUrls,
      ...sitemap.categoryUrls,
    ];

    for (const [countrySlug, canonicalCitySlug] of CANONICAL_CASES) {
      expect(
        sitemap.cityUrls.has(
          `/destinations/europe/${countrySlug}/cities/${canonicalCitySlug}`
        )
      ).toBe(true);
      expect(
        sitemap.cityUrls.has(
          `/destinations/europe/${countrySlug}/cities/${canonicalCitySlug}/tours`
        )
      ).toBe(true);
    }

    expect(allUrls).not.toEqual(expect.arrayContaining(aliasCityPaths));
    expect(allUrls).not.toEqual(
      expect.arrayContaining([
        expect.stringContaining("/destinations/world/usa"),
        expect.stringContaining("/destinations/world/united-states"),
        expect.stringContaining("/wien/"),
        expect.stringContaining("/firenze/"),
        expect.stringContaining("/roma/"),
        expect.stringContaining("/mnchen/"),
        expect.stringContaining("/den-haag/"),
        expect.stringContaining("/lisboa/"),
        expect.stringContaining("/alcdia/"),
        expect.stringContaining("/l-estartit/"),
      ])
    );
  }, 60_000);
});
