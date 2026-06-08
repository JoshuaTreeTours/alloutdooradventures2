import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  buildActivityDiscoveryPath,
  getActivityCityOptions,
  getActivityDiscoveryRouteDefinitions,
} from "./data/activityDiscovery";

const repoRoot = process.cwd();
const readRepoFile = (path: string) =>
  readFileSync(join(repoRoot, path), "utf8");

const duplicateActivityLocationPatterns = [
  /\/tours\/[^/]+\/(?:us|usa|united-states)\/[^/\s<"')`]+/,
  /\/tours\/[^/]+\/[^/\s<"')`]+\/(?:usa|united-states)(?=[\s<"')`]|$)/,
  /`\/tours\/\$\{[^}]+\}\/(?:us|usa|united-states)\/\$\{[^}]+\}`/,
  /`\/tours\/\$\{[^}]+\}\/\$\{[^}]+\}\/(?:usa|united-states)`/,
];

describe("activity taxonomy canonical routes", () => {
  it("builds only canonical activity/state/city paths", () => {
    expect(
      buildActivityDiscoveryPath({
        activitySlug: "hiking",
        stateSlug: "alaska",
      })
    ).toBe("/tours/hiking/alaska");
    expect(
      buildActivityDiscoveryPath({
        activitySlug: "hiking",
        stateSlug: "alaska",
        citySlug: "anchorage",
      })
    ).toBe("/tours/hiking/alaska/anchorage");
  });

  it("does not route country aliases as generated activity cities", () => {
    const routePaths = getActivityDiscoveryRouteDefinitions().map(
      route => route.path
    );

    expect(routePaths).toContain("/tours/hiking/alaska");
    expect(routePaths).not.toContain("/tours/hiking/us/alaska");
    expect(routePaths).not.toContain("/tours/hiking/alaska/united-states");
    expect(
      getActivityCityOptions("hiking", "alaska").map(city => city.slug)
    ).not.toContain("united-states");
  });

  it("does not emit duplicate country-qualified activity links from public internal-link builders", () => {
    const sourceFiles = [
      "scripts/generate-sitemap.mjs",
      "src/data/activityDiscovery.ts",
      "src/pages/ActivitiesIndex.tsx",
      "src/pages/tours/ActivityToursPage.tsx",
      "src/pages/tours/ToursLanding.tsx",
      "src/pages/tours/activities/CyclingTours.tsx",
      "src/pages/tours/activities/HikingTours.tsx",
      "src/pages/tours/activities/CanoeingTours.tsx",
    ];

    const offenders = sourceFiles.flatMap(file => {
      const source = readRepoFile(file);
      return duplicateActivityLocationPatterns.some(pattern =>
        pattern.test(source)
      )
        ? [file]
        : [];
    });

    expect(offenders).toEqual([]);
  });

  it("301 redirects duplicate activity/location paths to canonical routes", () => {
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
          source: "/tours/:activitySlug/us/:stateSlug",
          destination: "/tours/:activitySlug/:stateSlug",
          permanent: true,
        },
        {
          source: "/tours/:activitySlug/:stateSlug/united-states",
          destination: "/tours/:activitySlug/:stateSlug",
          permanent: true,
        },
        {
          source: "/tours/:activitySlug/:stateSlug/usa",
          destination: "/tours/:activitySlug/:stateSlug",
          permanent: true,
        },
      ])
    );
  });
});
