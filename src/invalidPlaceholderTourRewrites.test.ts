import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  getInvalidPlaceholderTourIds,
  getInvalidPlaceholderTourPaths,
} from "./utils/tours/invalidPlaceholderTours";

const vercelConfig = JSON.parse(readFileSync("vercel.json", "utf8"));

const routeSourceMatchesPath = (source: string, path: string) => {
  const sourceSegments = source.split("/").filter(Boolean);
  const pathSegments = path.split("/").filter(Boolean);
  if (sourceSegments.length !== pathSegments.length) {
    return false;
  }

  return sourceSegments.every((segment, index) => {
    if (!segment.startsWith(":")) {
      return segment === pathSegments[index];
    }

    const pattern = segment.match(/^:[^(]+\((.*)\)$/)?.[1];
    if (!pattern) {
      return true;
    }

    return new RegExp(`^${pattern}$`).test(pathSegments[index]);
  });
};

describe("invalid placeholder tour Vercel rewrites", () => {
  it("routes known invalid tour URLs to the 410 Gone endpoint before SPA fallback", () => {
    const rewrites = vercelConfig.rewrites as Array<{
      source: string;
      destination: string;
    }>;
    const fallbackIndex = rewrites.findIndex(
      rewrite =>
        rewrite.source === "/(.*)" && rewrite.destination === "/index.html"
    );

    for (const source of getInvalidPlaceholderTourPaths()) {
      const rewriteIndex = rewrites.findIndex(
        rewrite =>
          rewrite.destination === "/api/gone" &&
          (rewrite.source === source ||
            routeSourceMatchesPath(rewrite.source, source))
      );

      expect(rewriteIndex).toBeGreaterThanOrEqual(0);
      expect(rewriteIndex).toBeLessThan(fallbackIndex);
    }
  });

  it("routes SEO placeholder and placeholder slug patterns to the 410 Gone endpoint", () => {
    const goneSources = new Set(
      (vercelConfig.rewrites as Array<{ source: string; destination: string }>)
        .filter(rewrite => rewrite.destination === "/api/gone")
        .map(rewrite => rewrite.source)
    );

    expect(goneSources).toContain(
      "/destinations/:state/:city/tours/__SEO_PLACEHOLDER__"
    );
    expect(goneSources).toContain(
      "/destinations/:state/:city/tours/:slug(.*placeholder.*)"
    );

    const invalidIdPattern = getInvalidPlaceholderTourIds().join("|");
    expect(goneSources).toContain(
      `/destinations/:state/:city/tours/:slug(.*-(?:${invalidIdPattern}))`
    );
    expect(goneSources).toContain(
      `/destinations/united-states/:state/:city/tours/:slug(.*-(?:${invalidIdPattern}))`
    );
    expect(goneSources).toContain(
      `/tours/:state/:city/:slug(.*-(?:${invalidIdPattern}))`
    );
  });
});
