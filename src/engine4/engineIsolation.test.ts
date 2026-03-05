import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ENGINE4_FILES = [
  "src/engine4/buildEngine4TourPath.ts",
  "src/engine4/components/Engine4TourPage.tsx",
  "src/engine4/listing/getEngine4ListingEntries.ts",
  "src/engine4/routing.ts",
  "src/engine4/schema/buildEngine4ViatorSchemaGraph.ts",
  "src/engine4/types.ts",
  "src/engine4/viator/addEngine4ViatorTour.ts",
  "src/engine4/viator/buildEngine4Content.ts",
  "src/engine4/viator/mapViatorToEngine4Tour.ts",
  "src/engine4/viator/resolveEngine4ViatorHero.ts",
];

describe("Engine4 isolation", () => {
  it("does not import engine3 modules", () => {
    for (const file of ENGINE4_FILES) {
      const source = readFileSync(join(process.cwd(), file), "utf8");
      expect(source).not.toMatch(/from ["'][^"']*engine3\//);
    }
  });
});
