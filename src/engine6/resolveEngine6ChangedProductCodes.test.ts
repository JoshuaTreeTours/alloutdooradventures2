import { describe, expect, it } from "vitest";

import {
  extractEngine6ProductCodesFromCatalogDiff,
  extractEngine6ProductCodesFromChangedFiles,
  extractEngine6ProductCodesFromExactProductPath,
  parseGitNameStatusOutput,
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
});
