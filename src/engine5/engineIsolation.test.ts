import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ENGINE5_FILES = [
  "src/engine5/buildEngine5TourPath.ts",
  "src/engine5/components/Engine5TourPage.tsx",
  "src/engine5/listing/getEngine5ListingEntries.ts",
  "src/engine5/routing.ts",
  "src/engine5/schema/buildEngine5SchemaGraph.ts",
  "src/engine5/types.ts",
  "src/engine5/viator/mapViatorToEngine5Tour.ts",
  "src/engine5/viator/resolveSourceImage.ts",
  "src/engine5/viator/viatorApiProvider.ts",
];

describe("Engine5 isolation", () => {
  it("does not import engine4 modules", () => {
    for (const file of ENGINE5_FILES) {
      const source = readFileSync(join(process.cwd(), file), "utf8");
      expect(source).not.toMatch(/from ["'][^"']*engine4\//);
    }
  });
});
