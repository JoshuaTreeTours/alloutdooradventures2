import { describe, expect, it, vi } from "vitest";

import {
  extractEngine6ProductCodesFromCatalogDiff,
  extractEngine6ProductCodesFromChangedFiles,
  extractEngine6ProductCodesFromExactProductPath,
  parseGitNameStatusOutput,
  resolveEngine6LiveViatorValidationBaseRefCandidates,
  resolveEngine6ProductCodesChangedSinceRefSafe,
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
    ]);
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

  it("does not scope removed-only products", () => {
    const diff = `
@@ -10,4 +10,0 @@
-  {
-    productCode: "265766P9",
-    publicUrl: "https://www.viator.com/tours/Zion-National-Park/old/d5610-265766P9",
-  },
`;

    expect(extractEngine6ProductCodesFromCatalogDiff(diff)).toEqual([]);
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
