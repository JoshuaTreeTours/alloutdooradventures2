import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const transpile = (filePath: string) => {
  const source = readFileSync(filePath, "utf8");
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: path.basename(filePath),
  }).outputText;
};

describe("engine6 api import strategy", () => {
  it("uses deploy-safe relative imports without src runtime paths", () => {
    const source = readFileSync(new URL("./viator-product.ts", import.meta.url), "utf8");
    const extractorSource = readFileSync(
      new URL("./viatorExtractors.ts", import.meta.url),
      "utf8"
    );

    expect(source.includes("../../src/")).toBe(false);
    expect(source.includes("@/api/engine6/")).toBe(false);
    expect(source.includes("api/engine6/")).toBe(false);
    expect(source.includes('from "./viatorExtractors.js"')).toBe(true);
    expect(extractorSource.includes("../../src/")).toBe(false);
    expect(extractorSource.includes('from "./rating.js"')).toBe(true);
  });

  it("stays importable after transpilation to node esm", async () => {
    const fixtureDir = mkdtempSync(path.join(tmpdir(), "engine6-api-"));

    try {
      writeFileSync(
        path.join(fixtureDir, "viator-product.js"),
        transpile(path.resolve("api/engine6/viator-product.ts"))
      );
      writeFileSync(
        path.join(fixtureDir, "viatorExtractors.js"),
        transpile(path.resolve("api/engine6/viatorExtractors.ts"))
      );
      writeFileSync(
        path.join(fixtureDir, "rating.js"),
        transpile(path.resolve("api/engine6/rating.ts"))
      );
      writeFileSync(path.join(fixtureDir, "package.json"), '{"type":"module"}');

      const imported = await import(pathToFileURL(path.join(fixtureDir, "viator-product.js")).href);

      expect(typeof imported.default).toBe("function");
    } finally {
      rmSync(fixtureDir, { recursive: true, force: true });
    }
  });
});
