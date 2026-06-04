import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { getInvalidPlaceholderTourPaths } from "./utils/tours/invalidPlaceholderTours";

const vercelConfig = JSON.parse(readFileSync("vercel.json", "utf8"));

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
          rewrite.source === source && rewrite.destination === "/api/gone"
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
  });
});
