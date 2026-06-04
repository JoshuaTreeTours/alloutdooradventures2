import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const legacyCityUrlPattern =
  /\/destinations\/states\/[^/]+\/cities\/[^\s<"')`]+/;
const legacyCityTemplatePattern = /destinations\/states\/\$\{[^}]+\}\/cities/;

const readRepoFile = (path: string) =>
  readFileSync(join(repoRoot, path), "utf8");

describe("legacy state/city URL emissions", () => {
  it("keeps sitemap-cities.xml on canonical US guide and city tours URLs", () => {
    const sitemap = readRepoFile("public/sitemap-cities.xml");

    expect(sitemap.match(legacyCityUrlPattern) ?? []).toEqual([]);
    expect(sitemap).toContain("/guides/us/california/joshua-tree");
    expect(sitemap).toContain("/destinations/california/joshua-tree/tours");
  });

  it("does not emit legacy state/city builders from public internal-link sources", () => {
    const sourceFiles = [
      "scripts/generate-sitemap.mjs",
      "src/components/Footer.tsx",
      "src/components/GuideInternalLinks.tsx",
      "src/data/guideData.ts",
      "src/data/tourIndex.ts",
      "src/pages/ToursIndex.tsx",
      "src/pages/destinations/states/tours/CityToursIndexRoute.tsx",
      "src/pages/destinations/states/tours/CityTourDetailRoute.tsx",
      "src/pages/destinations/states/tours/CityTourBookingRoute.tsx",
      "src/pages/tours/FlagstaffTourDetailRoute.tsx",
      "src/pages/tours/FlagstaffTourBookingRoute.tsx",
      "src/templates/CityTemplate.tsx",
      "src/templates/StateTemplate.tsx",
      "src/utils/buildTourUrl.ts",
    ];

    const offenders = sourceFiles.flatMap(file => {
      const source = readRepoFile(file);
      return legacyCityTemplatePattern.test(source) ||
        legacyCityUrlPattern.test(source)
        ? [file]
        : [];
    });

    expect(offenders).toEqual([]);
  });
  it("301 redirects legacy city guide and city tours URLs to canonical replacements", () => {
    const vercelConfig = JSON.parse(readRepoFile("vercel.json")) as {
      redirects?: Array<{
        source: string;
        destination: string;
        permanent: boolean;
      }>;
    };

    expect(vercelConfig.redirects).toEqual(
      expect.arrayContaining([
        {
          source: "/destinations/states/:stateSlug/cities/:citySlug/tours",
          destination: "/destinations/:stateSlug/:citySlug/tours",
          permanent: true,
        },
        {
          source: "/destinations/states/:stateSlug/cities/:citySlug",
          destination: "/guides/us/:stateSlug/:citySlug",
          permanent: true,
        },
      ])
    );
  });
});
