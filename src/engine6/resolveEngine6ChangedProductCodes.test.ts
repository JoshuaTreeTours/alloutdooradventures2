import { describe, expect, it, vi } from "vitest";

import {
  extractEngine6CatalogDiffLineIdentity,
  extractEngine6ProductCodesFromCatalogDiff,
  extractEngine6ProductCodesFromChangedFiles,
  extractEngine6ProductCodesFromExactProductPath,
  parseGitNameStatusOutput,
  resolveEngine6CatalogDiffProductScope,
  resolveEngine6LiveViatorValidationBaseRefCandidates,
  resolveEngine6ProductCodesChangedSinceRefSafe,
  resolveEngine6ProductScopeFromChangedFiles,
  resolveVerifiedEngine6LiveViatorValidationBaseRef,
  verifyGitRefExists,
} from "./resolveEngine6ChangedProductCodes";

describe("resolveEngine6ChangedProductCodes", () => {
  it("parses git name-status output", () => {
    expect(
      parseGitNameStatusOutput(
        "M\tsrc/engine6/validationFixtures.ts\nA\tdata/engine6/viator/199627P12.exact-product.json"
      )
    ).toEqual([
      { status: "M", path: "src/engine6/validationFixtures.ts" },
      {
        status: "A",
        path: "data/engine6/viator/199627P12.exact-product.json",
      },
    ]);
  });

  it("extracts product codes from exact-product paths", () => {
    expect(
      extractEngine6ProductCodesFromExactProductPath(
        "data/engine6/viator/199627P12.exact-product.json"
      )
    ).toEqual(["199627P12"]);
  });

  it("scopes introduced products from catalog diffs", () => {
    const diff = `
@@ -10,7 +10,7 @@
   {
-    productCode: "265766P9",
-    publicUrl: "https://www.viator.com/tours/Zion-National-Park/old/d5610-265766P9",
+    productCode: "199627P12",
+    publicUrl: "https://www.viator.com/tours/Zion-National-Park/new/d5610-199627P12",
   },
`;

    expect(extractEngine6ProductCodesFromCatalogDiff(diff)).toEqual([
      "199627P12",
      "265766P9",
    ]);
    expect(resolveEngine6CatalogDiffProductScope(diff)).toEqual({
      addedOrModified: ["199627P12"],
      removedOnly: ["265766P9"],
      deployScoped: ["199627P12", "265766P9"],
    });
  });

  it("scopes modified products when only the public URL changes", () => {
    const diff = `
@@ -10,7 +10,7 @@
   {
     productCode: "199627P12",
-    publicUrl: "https://www.viator.com/tours/Zion-National-Park/old/d5610-199627P12",
+    publicUrl: "https://www.viator.com/tours/Zion-National-Park/new/d5610-199627P12",
   },
`;

    expect(extractEngine6ProductCodesFromCatalogDiff(diff)).toEqual([
      "199627P12",
    ]);
  });

  it("scopes removed-only products for deploy verification without sibling context rows", () => {
    const diff = `
@@ -10,4 +10,0 @@
-  {
-    productCode: "265766P9",
-    publicUrl: "https://www.viator.com/tours/Zion-National-Park/old/d5610-265766P9",
-  },
`;

    expect(extractEngine6ProductCodesFromCatalogDiff(diff)).toEqual(["265766P9"]);
    expect(resolveEngine6CatalogDiffProductScope(diff)).toEqual({
      addedOrModified: [],
      removedOnly: ["265766P9"],
      deployScoped: ["265766P9"],
    });
  });

  it("does not scope unchanged sibling rows from merchant feed deletion hunks", () => {
    const diff = `
@@ -225,7 +225,6 @@ id,title,description,link,image_link,availability,price,condition,brand,average_
 7886P3,Grand Canyon Tour from Tusayan in Grand Canyon National Park,"desc",https://www.alloutdooradventures.com/destinations/arizona/grand-canyon-national-park/tours/grand-canyon-tour-from-tusayan-7886P3,https://example.com/a.jpg,in stock,249 USD,new,Outdoor Adventures,5.0,177,177
 3272GCER,Desert View Grand Canyon Jeep Tour in Grand Canyon National Park,"desc",https://www.alloutdooradventures.com/destinations/arizona/grand-canyon-national-park/tours/desert-view-jeep-tour-3272GCER,https://example.com/b.jpg,in stock,166.43 USD,new,Outdoor Adventures,4.6,298,298
-108446P2,4-Hour Biblical Creation + Sunset Tour,"desc",https://www.alloutdooradventures.com/destinations/arizona/grand-canyon-national-park/tours/biblical-creation-sunset-tour-108446P2,https://example.com/c.jpg,in stock,149 USD,new,Outdoor Adventures,5.0,825,825
 6338DISCOVERY,Grand Canyon Landmarks Tour by Airplane,"desc",https://www.alloutdooradventures.com/destinations/arizona/grand-canyon-national-park/tours/landmarks-tour-by-airplane-6338DISCOVERY,https://example.com/d.jpg,in stock,174 USD,new,Outdoor Adventures,4.6,373,373
`;

    expect(extractEngine6ProductCodesFromCatalogDiff(diff)).toEqual(["108446P2"]);
    expect(resolveEngine6CatalogDiffProductScope(diff)).toEqual({
      addedOrModified: [],
      removedOnly: ["108446P2"],
      deployScoped: ["108446P2"],
    });
  });

  it("extracts catalog diff line identity from CSV and TypeScript records", () => {
    expect(
      extractEngine6CatalogDiffLineIdentity(
        " 7886P3,Grand Canyon Tour,desc,https://example.com"
      )
    ).toBe("7886P3");
    expect(
      extractEngine6CatalogDiffLineIdentity('     productCode: "108446P2",')
    ).toBe("108446P2");
    expect(
      extractEngine6CatalogDiffLineIdentity('-  "108446P2": { rating: 5.0 },')
    ).toBe("108446P2");
  });

  it("scopes deleted exact-product fixtures as removed-only deploy scope", () => {
    expect(
      resolveEngine6ProductScopeFromChangedFiles({
        changedFiles: [
          {
            status: "D",
            path: "data/engine6/viator/108446P2.exact-product.json",
          },
          { status: "M", path: "data/merchantFeed.csv" },
        ],
        catalogDiffs: {
          "data/merchantFeed.csv": `
@@ -225,7 +225,6 @@
 7886P3,Grand Canyon Tour,"desc",https://example.com/tours/grand-canyon-tour-from-tusayan-7886P3,https://example.com/a.jpg,in stock,249 USD,new,Outdoor Adventures,5.0,177,177
-108446P2,Removed Tour,"desc",https://example.com/tours/biblical-creation-sunset-tour-108446P2,https://example.com/c.jpg,in stock,149 USD,new,Outdoor Adventures,5.0,825,825
 6338DISCOVERY,Landmarks Tour,"desc",https://example.com/tours/landmarks-tour-by-airplane-6338DISCOVERY,https://example.com/d.jpg,in stock,174 USD,new,Outdoor Adventures,4.6,373,373
`,
        },
      })
    ).toEqual({
      deployScoped: ["108446P2"],
      addedOrModified: [],
      removedOnly: ["108446P2"],
    });
  });

  it("combines exact-product and catalog changes", () => {
    expect(
      extractEngine6ProductCodesFromChangedFiles({
        changedFiles: [
          {
            status: "A",
            path: "data/engine6/viator/422797P4.exact-product.json",
          },
          { status: "M", path: "src/engine6/validationFixtures.ts" },
        ],
        catalogDiffs: {
          "src/engine6/validationFixtures.ts": `
@@ -1,2 +1,3 @@
+import specimen422797p4 from "../../data/engine6/viator/422797P4.exact-product.json";
`,
        },
      })
    ).toEqual(["422797P4"]);
  });

  it("prefers VERCEL_GIT_PREVIOUS_SHA over origin/main on Vercel", () => {
    const previousVercel = process.env.VERCEL;
    const previousSha = process.env.VERCEL_GIT_PREVIOUS_SHA;
    const previousBaseRef = process.env.ENGINE6_LIVE_VIATOR_VALIDATION_BASE_REF;

    delete process.env.ENGINE6_LIVE_VIATOR_VALIDATION_BASE_REF;
    process.env.VERCEL = "1";
    process.env.VERCEL_GIT_PREVIOUS_SHA = "abc1234";

    expect(resolveEngine6LiveViatorValidationBaseRefCandidates()).toEqual([
      "abc1234",
      "origin/main",
    ]);

    process.env.VERCEL = previousVercel ?? "";
    if (previousSha === undefined) {
      delete process.env.VERCEL_GIT_PREVIOUS_SHA;
    } else {
      process.env.VERCEL_GIT_PREVIOUS_SHA = previousSha;
    }
    if (previousBaseRef === undefined) {
      delete process.env.ENGINE6_LIVE_VIATOR_VALIDATION_BASE_REF;
    } else {
      process.env.ENGINE6_LIVE_VIATOR_VALIDATION_BASE_REF = previousBaseRef;
    }
  });

  it("returns empty scoped products when no git base ref is available", () => {
    const execFileImpl = vi.fn(() => {
      throw new Error("fatal: Needed a single revision");
    });

    const resolution = resolveVerifiedEngine6LiveViatorValidationBaseRef({
      execFileImpl: execFileImpl as never,
    });

    expect(resolution.baseRef).toBeNull();
    expect(resolution.warning).toContain("could not resolve a git base ref");
    expect(
      resolveEngine6ProductCodesChangedSinceRefSafe({
        execFileImpl: execFileImpl as never,
      })
    ).toEqual({
      baseRef: null,
      attemptedRefs: resolution.attemptedRefs,
      warning: resolution.warning,
      productCodes: [],
    });
  });

  it("uses the first verified base ref, including origin/main when present", () => {
    const execFileImpl = vi.fn((command: string, args: string[]) => {
      const ref = args[2]?.replace(/\^\{commit\}$/, "");
      if (ref === "origin/main") {
        return "813181b7498a9216b533896f2262867bb114b417";
      }
      throw new Error(`fatal: ambiguous argument '${ref}'`);
    });

    const previousBaseRef = process.env.ENGINE6_LIVE_VIATOR_VALIDATION_BASE_REF;
    delete process.env.ENGINE6_LIVE_VIATOR_VALIDATION_BASE_REF;

    expect(
      resolveVerifiedEngine6LiveViatorValidationBaseRef({
        execFileImpl: execFileImpl as never,
      }).baseRef
    ).toBe("origin/main");
    expect(verifyGitRefExists("origin/main", execFileImpl as never)).toBe(true);
    expect(verifyGitRefExists("missing-ref", execFileImpl as never)).toBe(false);

    if (previousBaseRef === undefined) {
      delete process.env.ENGINE6_LIVE_VIATOR_VALIDATION_BASE_REF;
    } else {
      process.env.ENGINE6_LIVE_VIATOR_VALIDATION_BASE_REF = previousBaseRef;
    }
  });
});
